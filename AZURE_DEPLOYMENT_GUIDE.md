# Complete Azure Deployment Guide for Competition

## Step 1: Prepare Your GitHub Repository

### 1.1 Initialize Git Repository (if not already done)
```bash
# In your project directory
git init
git add .
git commit -m "Initial competition-ready platform commit"
```

### 1.2 Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and sign in
2. Click "New repository" (green button)
3. Repository name: `nexus-hackathon-platform` (or your preferred name)
4. Description: `AI-Powered Hackathon Platform - Competition Submission`
5. Set to **Public** (so judges can review your code)
6. Don't initialize with README (since you have existing code)
7. Click "Create repository"

### 1.3 Connect Local Repository to GitHub
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/nexus-hackathon-platform.git
git branch -M main
git push -u origin main
```

## Step 2: Azure Account Setup

### 2.1 Create Azure Account
1. Go to [portal.azure.com](https://portal.azure.com)
2. Sign up for free Azure account (get $200 free credits)
3. Complete verification process

### 2.2 Install Azure CLI (Optional but recommended)
```bash
# Windows (using chocolatey)
choco install azure-cli

# macOS
brew install azure-cli

# Or download from: https://aka.ms/installazurecliwindows
```

## Step 3: Create Azure Resources

### 3.1 Create Resource Group
1. In Azure Portal, click "Resource groups"
2. Click "Create"
3. **Subscription**: Your Azure subscription
4. **Resource group name**: `nexus-hackathon-rg`
5. **Region**: `East US` (or your preferred region)
6. Click "Review + create" → "Create"

### 3.2 Create Azure SQL Database
1. In Azure Portal, search "SQL databases"
2. Click "Create SQL database"
3. **Resource Group**: `nexus-hackathon-rg`
4. **Database name**: `nexus-platform-db`
5. **Server**: Click "Create new"
   - **Server name**: `nexus-hackathon-server` (must be globally unique)
   - **Server admin login**: `nexusadmin`
   - **Password**: Create a strong password (save it!)
   - **Location**: Same as resource group
6. **Compute + storage**: Basic (5 DTU, 2GB) - sufficient for competition
7. Click "Review + create" → "Create"

### 3.3 Create App Service
1. In Azure Portal, search "App Services"
2. Click "Create Web App"
3. **Resource Group**: `nexus-hackathon-rg`
4. **Name**: `nexus-hackathon-platform` (must be globally unique)
5. **Runtime stack**: Node 20 LTS
6. **Operating System**: Linux
7. **Region**: Same as resource group
8. **Pricing plan**: Basic B1 (sufficient for competition)
9. Click "Review + create" → "Create"

### 3.4 Create Azure AI Text Analytics (for plagiarism detection)
1. In Azure Portal, search "Cognitive Services"
2. Click "Create"
3. **Resource Group**: `nexus-hackathon-rg`
4. **Name**: `nexus-ai-text-analytics`
5. **Pricing tier**: Free F0 (sufficient for competition)
6. **Region**: Same as resource group
7. Click "Review + create" → "Create"

## Step 4: Configure Database Connection

### 4.1 Configure SQL Database Firewall
1. Go to your SQL Server (`nexus-hackathon-server`)
2. Click "Networking" in the left menu
3. **Allow Azure services**: ON
4. **Add current client IP address**: Click "Add current client IP"
5. Click "Save"

### 4.2 Get Connection Strings
1. Go to your SQL Database (`nexus-platform-db`)
2. Click "Connection strings"
3. Copy the **ADO.NET** connection string
4. Replace `{your_password}` with your actual password

## Step 5: Configure App Service Environment Variables

### 5.1 Set Environment Variables
1. Go to your App Service (`nexus-hackathon-platform`)
2. Click "Configuration" → "Application settings"
3. Add these settings (click "New application setting" for each):

```
NODE_ENV = production
PORT = 8080
WEBSITE_NODE_DEFAULT_VERSION = ~20

# Database Settings
DATABASE_URL = your_postgresql_connection_string_if_any
AZURE_SQL_SERVER = nexus-hackathon-server.database.windows.net
AZURE_SQL_DATABASE = nexus-platform-db
AZURE_SQL_USER = nexusadmin
AZURE_SQL_PASSWORD = your_password_here

# Firebase Settings (use your existing values)
VITE_FIREBASE_PROJECT_ID = hackathon-platform-2be53
VITE_FIREBASE_API_KEY = your_firebase_api_key
VITE_FIREBASE_APP_ID = your_firebase_app_id

# Session Secret
SESSION_SECRET = your_super_secure_random_string_here

# Azure AI Settings
AZURE_AI_ENDPOINT = https://nexus-ai-text-analytics.cognitiveservices.azure.com/
AZURE_AI_API_KEY = get_from_ai_resource_keys_section
```

### 5.2 Get Azure AI API Key
1. Go to your AI Text Analytics resource
2. Click "Keys and Endpoint"
3. Copy **Key 1** and the **Endpoint**

## Step 6: Set Up GitHub Actions Deployment

### 6.1 Download Publish Profile
1. Go to your App Service (`nexus-hackathon-platform`)
2. Click "Get publish profile" (top menu)
3. Save the downloaded file

### 6.2 Add GitHub Secrets
1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
5. **Value**: Open the downloaded publish profile file, copy ALL content, and paste it
6. Click "Add secret"

### 6.3 Update Workflow File
The workflow file is already created. Just update the app name:
1. Edit `.github/workflows/azure.yml`
2. Change `AZURE_WEBAPP_NAME` to your app name: `nexus-hackathon-platform`

## Step 7: Deploy to Azure

### 7.1 Push to GitHub (Triggers Deployment)
```bash
git add .
git commit -m "Configure Azure deployment for competition"
git push origin main
```

### 7.2 Monitor Deployment
1. Go to your GitHub repository
2. Click "Actions" tab
3. Watch the deployment progress
4. It should take 3-5 minutes

### 7.3 Verify Deployment
Once deployment completes, visit:
```
https://nexus-hackathon-platform.azurewebsites.net
```

## Step 8: Configure Domain and SSL (Automatic)

Azure App Service automatically provides:
- **HTTPS/SSL certificate** (automatic)
- **Custom domain**: `your-app-name.azurewebsites.net`
- **CDN capabilities** (optional)

## Step 9: Final Competition Setup

### 9.1 Test All Features
Visit your deployed site and test:
- ✅ User registration and login
- ✅ Event creation (as organizer)
- ✅ Team formation and management
- ✅ Project submissions
- ✅ AI plagiarism detection
- ✅ Certificate generation
- ✅ Real-time features

### 9.2 Monitor Performance
1. Go to App Service → "Application Insights"
2. Enable if not already enabled
3. Monitor performance metrics

## Troubleshooting Common Issues

### Issue: Build Fails
**Solution**: Check that all dependencies are in `package.json`
```bash
npm install --save-dev typescript @types/node
```

### Issue: Database Connection Fails
**Solution**: Check firewall settings and connection string format

### Issue: AI Features Don't Work
**Solution**: Verify Azure AI API key and endpoint are correct

### Issue: Real-time Features Fail
**Solution**: Enable WebSockets in App Service:
1. Go to Configuration → General settings
2. **Web sockets**: On
3. Save

## Competition Submission Checklist

### ✅ Technical Requirements
- [ ] Live demo hosted on Azure
- [ ] GitHub repository is public and clean
- [ ] All mandatory features working
- [ ] Azure SQL Database integrated
- [ ] MongoDB for flexible data
- [ ] AI plagiarism detection functional

### ✅ Documentation
- [ ] README.md with setup instructions
- [ ] Architecture documentation
- [ ] Feature list and tech stack
- [ ] Live demo URL provided

### 🚀 Competitive Advantages
- [ ] All bonus features implemented
- [ ] Advanced AI integration
- [ ] Scalable architecture
- [ ] Modern UI/UX design
- [ ] Production-ready code quality

## Your Competition URLs

After deployment, you'll have:
- **Live Platform**: `https://your-app-name.azurewebsites.net`
- **GitHub Repository**: `https://github.com/YOUR_USERNAME/nexus-hackathon-platform`
- **API Health Check**: `https://your-app-name.azurewebsites.net/api/health`

## Final Notes

### Cost Management
- Your current setup should cost ~$20-30/month
- Use Azure's free credits for competition
- Scale down resources after competition if needed

### Security
- All security features are already implemented
- HTTPS is automatic on Azure App Service
- Database is properly firewalled

### Performance
- App Service B1 tier handles 1000+ concurrent users
- Database is optimized for competition requirements
- CDN can be added for global performance

**You're now ready to submit your competition-winning hackathon platform!** 🏆