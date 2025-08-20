# Fusion X - Comprehensive Hackathon Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready hackathon management platform featuring role-based dashboards, real-time collaboration, multi-round evaluation, and enterprise-grade security.

![Fusion X Dashboard](/docs/img/dashboard-overview.png)

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 14+ 
- Azure SQL Database (production)
- MongoDB 5.0+ (optional for real-time features)
- Azure Blob Storage account

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fusion-x.git
cd fusion-x

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize databases
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

## 📋 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database
AZURE_SQL_SERVER=your-server.database.windows.net
AZURE_SQL_DATABASE=your-database
AZURE_SQL_USER=your-username
AZURE_SQL_PASSWORD=your-password
AZURE_SQL_PORT=1433

# MongoDB (Optional - for real-time features)
MONGODB_URI=mongodb://localhost:27017/fusion-x

# Firebase Authentication
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_APP_ID=your-app-id

# Azure Storage
AZURE_STORAGE_ACCOUNT=your-storage-account
AZURE_STORAGE_KEY=your-storage-key
AZURE_STORAGE_CONTAINER=submissions

# Application
NODE_ENV=development
PORT=5000
SESSION_SECRET=your-session-secret

# Object Storage (Replit)
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your-bucket-id
PUBLIC_OBJECT_SEARCH_PATHS=/bucket/public
PRIVATE_OBJECT_DIR=/bucket/private
```

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Frontend"
        React[React 18 + TypeScript]
        Vite[Vite Dev Server]
        TanStack[TanStack Query]
        Shadcn[shadcn/ui Components]
    end

    subgraph "API Gateway"
        Express[Express.js Server]
        Helmet[Helmet Security]
        RateLimit[Rate Limiting]
        Auth[Firebase Auth]
    end

    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL)]
        AzureSQL[(Azure SQL)]
        MongoDB[(MongoDB)]
        Drizzle[Drizzle ORM]
    end

    subgraph "Storage"
        AzureBlob[Azure Blob Storage]
        ObjectStorage[Object Storage]
    end

    subgraph "Real-time"
        SocketIO[Socket.IO]
        WebSockets[WebSocket Server]
    end

    React --> Vite
    Vite --> Express
    Express --> Helmet
    Express --> RateLimit
    Express --> Auth
    Express --> Drizzle
    Drizzle --> PostgreSQL
    Drizzle --> AzureSQL
    Express --> MongoDB
    Express --> AzureBlob
    Express --> ObjectStorage
    Express --> SocketIO
    SocketIO --> WebSockets
    TanStack --> Express
    Shadcn --> React
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login with Firebase | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Events Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/events` | List all events | No |
| POST | `/api/events` | Create new event | Yes (Organizer) |
| GET | `/api/events/:id` | Get event details | No |
| PUT | `/api/events/:id` | Update event | Yes (Organizer) |

### Team Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/teams` | Create team | Yes |
| GET | `/api/teams/:id` | Get team details | Yes |
| POST | `/api/teams/join` | Join team with code | Yes |
| GET | `/api/teams/:id/members` | Get team members | Yes |

### Submissions
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/submissions` | Submit project | Yes |
| GET | `/api/submissions/:id` | Get submission | Yes |
| PUT | `/api/submissions/:id` | Update submission | Yes |
| POST | `/api/submissions/:id/upload` | Upload files | Yes |

### Judging System
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/judging/assigned` | Get assigned submissions | Yes (Judge) |
| POST | `/api/judging/score` | Submit scores | Yes (Judge) |
| GET | `/api/judging/criteria` | Get scoring criteria | Yes (Judge) |

### Analytics & Leaderboard
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/leaderboard` | Get leaderboard | No |
| GET | `/api/analytics/overview` | Analytics overview | Yes (Organizer) |
| GET | `/api/analytics/participation` | Participation stats | Yes (Organizer) |

### Health & Monitoring
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/health` | System health check | No |
| GET | `/api/health/live` | Liveness probe | No |
| GET | `/api/health/ready` | Readiness probe | No |

## 🚢 Deploy to Azure App Service

### Prerequisites
1. Azure account with active subscription
2. GitHub repository with admin access
3. Azure CLI installed locally

### Step 1: Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name fusion-x-rg --location eastus

# Create App Service Plan
az appservice plan create \
  --name fusion-x-plan \
  --resource-group fusion-x-rg \
  --sku B2 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group fusion-x-rg \
  --plan fusion-x-plan \
  --name fusion-x-app \
  --runtime "NODE|18-lts"

# Create Azure SQL Database
az sql server create \
  --name fusion-x-sql \
  --resource-group fusion-x-rg \
  --admin-user sqladmin \
  --admin-password <your-password>

az sql db create \
  --resource-group fusion-x-rg \
  --server fusion-x-sql \
  --name fusion-x-db \
  --service-objective S0

# Create Storage Account
az storage account create \
  --name fusionxstorage \
  --resource-group fusion-x-rg \
  --sku Standard_LRS
```

### Step 2: Configure GitHub Actions

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: fusion-x-app
  NODE_VERSION: '18.x'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production
    
    - name: Run tests
      run: npm test -- --passWithNoTests
    
    - name: Deploy to Azure
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .
```

### Step 3: Set up Deployment Credentials

1. Download publish profile from Azure Portal:
   - Navigate to your App Service
   - Click "Download publish profile"
   
2. Add to GitHub secrets:
   - Go to Settings → Secrets → Actions
   - Create new secret: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Paste the publish profile content

### Step 4: Configure App Settings

```bash
# Set environment variables in Azure
az webapp config appsettings set \
  --resource-group fusion-x-rg \
  --name fusion-x-app \
  --settings \
    NODE_ENV=production \
    DATABASE_URL="<your-connection-string>" \
    AZURE_SQL_SERVER="<your-server>.database.windows.net" \
    AZURE_SQL_DATABASE="fusion-x-db" \
    AZURE_SQL_USER="sqladmin" \
    AZURE_SQL_PASSWORD="<your-password>"
```

### Step 5: Deploy

```bash
# Push to main branch to trigger deployment
git add .
git commit -m "Deploy to Azure"
git push origin main
```

Monitor deployment progress in GitHub Actions tab.

## 🖼️ Screenshots

### Dashboard Overview
![Dashboard Overview](/docs/img/dashboard-overview.png)
*Main dashboard showing event statistics and recent activities*

### Team Management
![Team Management](/docs/img/team-management.png)
*Team creation and member management interface*

### Submission Portal
![Submission Portal](/docs/img/submission-portal.png)
*Project submission form with file upload capabilities*

### Judging Interface
![Judging Interface](/docs/img/judging-interface.png)
*Comprehensive judging dashboard with scoring criteria*

### Live Leaderboard
![Live Leaderboard](/docs/img/live-leaderboard.png)
*Real-time leaderboard with score updates and rankings*

### Analytics Dashboard
![Analytics Dashboard](/docs/img/analytics-dashboard.png)
*Detailed analytics and participation metrics for organizers*

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Error: Connection refused to PostgreSQL
# Solution: Check DATABASE_URL and ensure PostgreSQL is running
sudo systemctl start postgresql

# Error: Azure SQL connection timeout
# Solution: Add your IP to Azure SQL firewall rules
az sql server firewall-rule create \
  --resource-group fusion-x-rg \
  --server fusion-x-sql \
  --name AllowMyIP \
  --start-ip-address <your-ip> \
  --end-ip-address <your-ip>
```

#### Authentication Issues
```bash
# Error: Firebase ID token expired
# Solution: Clear browser cache and re-authenticate

# Error: CORS policy blocking requests
# Solution: Check allowed origins in server/middleware/security.ts
# Add your domain to the allowedOrigins array
```

#### File Upload Problems
```bash
# Error: File size exceeds limit
# Solution: Maximum file size is 50MB. Compress files before uploading.

# Error: MIME type not allowed
# Solution: Only ZIP, PDF, and MP4 files are supported.
```

#### Rate Limiting
```bash
# Error: Too many requests (429)
# Solution: Rate limit is 100 requests per 10 minutes per IP.
# Wait 10 minutes or contact admin to adjust limits.
```

#### Build Failures
```bash
# Error: Module not found
npm install

# Error: TypeScript compilation errors
npm run type-check

# Error: Vite build fails
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Debug Mode

Enable debug logging:
```bash
# Development
DEBUG=* npm run dev

# Production
NODE_ENV=production DEBUG=express:* node server/index.js
```

### Health Checks

Monitor system health:
```bash
# Check overall health
curl http://localhost:5000/api/health

# Check liveness
curl http://localhost:5000/api/health/live

# Check readiness
curl http://localhost:5000/api/health/ready
```

## 📚 Additional Resources

- [Architecture Documentation](ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React and Vite communities
- shadcn/ui for the component library
- Azure for cloud infrastructure
- All contributors and testers

---

Built with ❤️ by the Fusion X Team