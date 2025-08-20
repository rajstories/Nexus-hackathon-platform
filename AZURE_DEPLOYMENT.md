# Azure App Service Deployment Guide

## Prerequisites

1. Azure subscription
2. Azure CLI installed
3. GitHub repository

## Step 1: Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name fusion-x-rg --location eastus

# Create App Service Plan (Linux)
az appservice plan create \
  --name fusion-x-plan \
  --resource-group fusion-x-rg \
  --sku B2 \
  --is-linux

# Create Web App with Node.js 18
az webapp create \
  --resource-group fusion-x-rg \
  --plan fusion-x-plan \
  --name fusion-x-app \
  --runtime "NODE|18-lts"

# Enable WebSockets
az webapp config set \
  --resource-group fusion-x-rg \
  --name fusion-x-app \
  --web-sockets-enabled true

# Configure startup command
az webapp config set \
  --resource-group fusion-x-rg \
  --name fusion-x-app \
  --startup-file "node server.js"
```

## Step 2: Configure Environment Variables

### Using Azure Portal

1. Navigate to your App Service
2. Go to Configuration → Application settings
3. Add the following environment variables:

```
NODE_ENV=production
PORT=8080

# Database
DATABASE_URL=<your-postgresql-connection-string>
AZURE_SQL_SERVER=<your-server>.database.windows.net
AZURE_SQL_DATABASE=<your-database>
AZURE_SQL_USER=<your-username>
AZURE_SQL_PASSWORD=<your-password>

# MongoDB (optional)
MONGODB_URI=<your-mongodb-connection-string>

# Firebase
VITE_FIREBASE_PROJECT_ID=<your-project-id>
VITE_FIREBASE_API_KEY=<your-api-key>
VITE_FIREBASE_APP_ID=<your-app-id>

# Azure Storage
AZURE_STORAGE_ACCOUNT=<your-storage-account>
AZURE_STORAGE_KEY=<your-storage-key>
AZURE_STORAGE_CONTAINER=submissions

# Session
SESSION_SECRET=<generate-secure-secret>
```

### Using Azure CLI

```bash
az webapp config appsettings set \
  --resource-group fusion-x-rg \
  --name fusion-x-app \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DATABASE_URL="<your-connection-string>" \
    SESSION_SECRET="<your-secret>"
```

## Step 3: Setup GitHub Actions Deployment

### Option A: Using Publish Profile (Simpler)

1. Download publish profile from Azure Portal:
   - Go to your App Service
   - Click "Get publish profile"

2. Add to GitHub Secrets:
   - Go to Settings → Secrets → Actions
   - Create new secret: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Paste the entire publish profile XML

3. The workflow in `.github/workflows/azure.yml` will use this profile

### Option B: Using OIDC (More Secure)

1. Create Service Principal:
```bash
az ad sp create-for-rbac \
  --name fusion-x-sp \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/fusion-x-rg \
  --sdk-auth
```

2. Configure federated credentials:
```bash
az ad app federated-credential create \
  --id <app-id> \
  --parameters '{
    "name": "GitHub-Deploy",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:<your-github-username>/<repo-name>:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

3. Add to GitHub Secrets:
   - `AZURE_CLIENT_ID`: Application (client) ID
   - `AZURE_TENANT_ID`: Directory (tenant) ID
   - `AZURE_SUBSCRIPTION_ID`: Subscription ID

4. Update workflow to use OIDC (uncomment OIDC section)

## Step 4: Deploy

Push to main branch:
```bash
git add .
git commit -m "Deploy to Azure"
git push origin main
```

## Step 5: Verify Deployment

### Health Checks

```bash
# Main health check
curl https://fusion-x-app.azurewebsites.net/health

# API health check
curl https://fusion-x-app.azurewebsites.net/api/health

# WebSocket test
wscat -c wss://fusion-x-app.azurewebsites.net/socket.io/
```

### Logs

```bash
# Stream logs
az webapp log tail \
  --resource-group fusion-x-rg \
  --name fusion-x-app

# Download logs
az webapp log download \
  --resource-group fusion-x-rg \
  --name fusion-x-app \
  --log-file logs.zip
```

## WebSocket Configuration

Azure App Service supports WebSockets natively. The application is configured to:

1. Use WebSocket transport with polling fallback
2. Handle Azure's proxy headers
3. Maintain persistent connections with appropriate timeouts

### Testing WebSockets

```javascript
// Client-side test
const socket = io('wss://fusion-x-app.azurewebsites.net', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Connected to Azure WebSocket');
});
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check startup command: `node server.js`
   - Verify PORT environment variable is set
   - Check application logs

2. **WebSocket Connection Failed**
   - Ensure WebSockets are enabled in App Service
   - Check CORS settings
   - Verify client uses correct protocol (wss://)

3. **Slow Startup**
   - Enable Always On in App Service configuration
   - Optimize Next.js build output
   - Consider scaling up App Service Plan

### Performance Optimization

1. **Enable compression**
```bash
az webapp config set \
  --resource-group fusion-x-rg \
  --name fusion-x-app \
  --http20-enabled true
```

2. **Configure auto-scaling**
```bash
az monitor autoscale create \
  --resource-group fusion-x-rg \
  --resource fusion-x-plan \
  --resource-type Microsoft.Web/serverfarms \
  --name fusion-x-autoscale \
  --min-count 1 \
  --max-count 5 \
  --count 2
```

3. **Setup CDN**
```bash
az cdn profile create \
  --resource-group fusion-x-rg \
  --name fusion-x-cdn \
  --sku Standard_Microsoft

az cdn endpoint create \
  --resource-group fusion-x-rg \
  --profile-name fusion-x-cdn \
  --name fusion-x-endpoint \
  --origin fusion-x-app.azurewebsites.net
```

## Monitoring

### Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app fusion-x-insights \
  --location eastus \
  --resource-group fusion-x-rg

# Connect to App Service
az webapp config appsettings set \
  --resource-group fusion-x-rg \
  --name fusion-x-app \
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING=<connection-string>
```

### Alerts

```bash
# Create alert for high response time
az monitor metrics alert create \
  --name high-response-time \
  --resource-group fusion-x-rg \
  --scopes /subscriptions/<sub-id>/resourceGroups/fusion-x-rg/providers/Microsoft.Web/sites/fusion-x-app \
  --condition "avg ResponseTime > 2000" \
  --window-size 5m \
  --evaluation-frequency 1m
```

## Cost Optimization

1. **Use B-series for development** (Burstable, lower cost)
2. **Enable auto-shutdown** for non-production
3. **Use Azure Database for PostgreSQL - Flexible Server** (cheaper than Single Server)
4. **Implement caching** with Azure Cache for Redis
5. **Use Azure Front Door** for global distribution

---

For more information, see:
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Deploy Node.js to Azure](https://docs.microsoft.com/azure/app-service/quickstart-nodejs)
- [WebSockets on Azure App Service](https://docs.microsoft.com/azure/app-service/configure-language-nodejs#websockets)