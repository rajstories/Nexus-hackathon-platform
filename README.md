# Fusion X - Modern JavaScript Monorepo

A production-ready monorepo scaffolding with React frontend, Express API, shared TypeScript types, and seamless development workflow. Built for modern teams who value developer experience.

## 🚀 Quick Start

```bash
# Clone and install dependencies
npm install

# Start development servers (React on :5000, API on :8000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
fusion-x/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/     # UI components (shadcn/ui)
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
│   └── .env.example       # Frontend environment variables
├── server/                # Express API (TypeScript)
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data storage interface
│   └── .env.example       # Backend environment variables
├── shared/                # Shared types and schemas
│   └── schema.ts          # Zod schemas and TypeScript types
├── .env.example           # Root environment variables
└── package.json           # Root package.json with workspaces
```

## 🛠 Tech Stack

### Frontend (client/)
- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Wouter** for lightweight routing
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **Framer Motion** for animations
- **TanStack Query** for server state management

### Backend (server/)
- **Express.js** with TypeScript
- **Drizzle ORM** for database operations
- **Zod** for runtime validation
- **PostgreSQL** via Neon Database

### Shared (shared/)
- **TypeScript** types and interfaces
- **Zod** schemas for validation
- **drizzle-zod** integration

## 🔧 Environment Variables

### Local vs Azure Deployment

**Local Development:**
- Environment variables are loaded from `.env` files
- Use `.env.example` files as templates
- Copy and rename to `.env` in each directory

**Azure App Service:**
- Environment variables are set in Azure Portal → App Service → Configuration → Application Settings
- Azure automatically exposes these as `process.env` variables
- No `.env` files needed in production

### Environment Variable Reference

| Variable | Location | Usage | Required |
|----------|----------|-------|----------|
| `PORT` | server | Express server port (Azure sets automatically) | Yes |
| `NODE_ENV` | server | Environment mode (development/production) | Yes |
| `AZURE_SQL_SERVER` | server | Azure SQL Database server hostname | Optional |
| `AZURE_SQL_DB` | server | Azure SQL Database name | Optional |
| `AZURE_SQL_USER` | server | Azure SQL Database username | Optional |
| `AZURE_SQL_PASSWORD` | server | Azure SQL Database password | Optional |
| `MONGODB_URI` | server | MongoDB connection string | Optional |
| `AZURE_STORAGE_CONNECTION_STRING` | server | Azure Blob Storage connection | Optional |
| `AZURE_STORAGE_CONTAINER` | server | Azure Blob Storage container name | Optional |
| `FIREBASE_API_KEY` | server | Firebase Admin API key | Optional |
| `FIREBASE_AUTH_DOMAIN` | server | Firebase Auth domain | Optional |
| `FIREBASE_PROJECT_ID` | server | Firebase project identifier | Optional |
| `JWT_SECRET` | server | JWT token signing secret (min 32 chars) | Optional |
| `CORS_ORIGIN` | server | Allowed CORS origins | Optional |
| `VITE_FIREBASE_API_KEY` | client | Firebase client API key | Optional |
| `VITE_FIREBASE_AUTH_DOMAIN` | client | Firebase Auth domain (client) | Optional |
| `VITE_FIREBASE_PROJECT_ID` | client | Firebase project ID (client) | Optional |
| `VITE_API_URL` | client | Backend API base URL | Optional |
| `VITE_NODE_ENV` | client | Frontend environment mode | Optional |

### Setting Up Environment Variables

1. **Local Development:**
   ```bash
   # Copy example files
   cp .env.example .env
   cp client/.env.example client/.env
   cp server/.env.example server/.env
   
   # Edit with your actual values
   nano .env
   ```

2. **Azure App Service:**
   - Navigate to Azure Portal → Your App Service
   - Go to Configuration → Application Settings
   - Add each environment variable as a new application setting
   - Azure will automatically restart your app when settings change

## 📜 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | Starts both frontend and backend in development mode | Frontend: http://localhost:5000, Backend: http://localhost:8000 |
| `npm run build` | Builds both frontend and backend for production | Outputs to `client/dist` and `server/dist` |
| `npm start` | Starts production server | Serves built frontend and API |
| `npm run type-check` | Type checks all TypeScript files | Validates types across the monorepo |
| `npm run lint` | Lints all code files | ESLint + Prettier formatting |
| `node scripts/migrate-sql.js` | Runs Azure SQL database migrations | Creates tables and indexes |
| `node scripts/seed-sql.js` | Seeds Azure SQL database with sample data | Adds sample event, users, teams, and submissions |
| `node scripts/test-db.js` | Tests Azure SQL database connection | Verifies connection and shows table statistics |

## 🔌 API Endpoints

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/api/health` | GET | Health check | `{ status: "healthy", timestamp: "...", version: "1.0.0" }` |
| `/api/info` | GET | API information | `{ name: "Fusion X API", description: "...", endpoints: [...] }` |

## 🗄️ Database Schema

### Azure SQL Database Tables

**Users**
- `id` (UNIQUEIDENTIFIER, PK)
- `email` (NVARCHAR(255), UNIQUE)
- `name` (NVARCHAR(255))
- `role` (NVARCHAR(50)) - participant, judge, admin
- `created_at`, `updated_at` (DATETIME2)

**Events**
- `id` (UNIQUEIDENTIFIER, PK)
- `title` (NVARCHAR(255))
- `description` (NTEXT)
- `mode` (NVARCHAR(50)) - hybrid, online, in-person
- `start_at`, `end_at` (DATETIME2)
- `created_at`, `updated_at` (DATETIME2)

**Teams**
- `id` (UNIQUEIDENTIFIER, PK)
- `event_id` (FK → events.id)
- `name` (NVARCHAR(255))
- `invite_code` (NVARCHAR(10), UNIQUE)
- `created_at` (DATETIME2)

**Submissions**
- `id` (UNIQUEIDENTIFIER, PK)
- `team_id` (FK → teams.id)
- `event_id` (FK → events.id)
- `title` (NVARCHAR(255))
- `repo_url`, `demo_url`, `blob_path` (NVARCHAR(500))
- `round` (INT)
- `created_at`, `updated_at` (DATETIME2)

**Scores**
- `id` (UNIQUEIDENTIFIER, PK)
- `submission_id` (FK → submissions.id)
- `judge_id` (FK → judges.id)
- `criteria` (NVARCHAR(100)) - innovation, technical_implementation, design, impact
- `score` (INT, 0-100)
- `feedback` (NTEXT)
- `round` (INT)

### Database Operations

```bash
# Test database connection
node scripts/test-db.js

# Run migrations (creates tables)
node scripts/migrate-sql.js

# Seed with sample data
node scripts/seed-sql.js

# Verify data
node scripts/test-db.js
```

## 🚢 Deployment

### Azure App Service Deployment

1. **Prepare your app:**
   ```bash
   npm run build
   ```

2. **Azure CLI Deployment:**
   ```bash
   # Login to Azure
   az login
   
   # Create resource group
   az group create --name fusion-x-rg --location "East US"
   
   # Create App Service plan
   az appservice plan create --name fusion-x-plan --resource-group fusion-x-rg --sku B1 --is-linux
   
   # Create web app
   az webapp create --resource-group fusion-x-rg --plan fusion-x-plan --name fusion-x-app --runtime "NODE|18-lts"
   
   # Deploy code
   az webapp deployment source config-zip --resource-group fusion-x-rg --name fusion-x-app --src fusion-x.zip
   ```

3. **Set Environment Variables in Azure:**
   ```bash
   az webapp config appsettings set --resource-group fusion-x-rg --name fusion-x-app --settings \
     NODE_ENV=production \
     AZURE_SQL_SERVER=your-server.database.windows.net \
     AZURE_SQL_DB=your-database \
     JWT_SECRET=your-jwt-secret
   ```

### Important Azure Notes

- **PORT Variable:** Azure automatically sets the `PORT` environment variable. Your app must listen on `process.env.PORT`
- **Environment Variables:** Set in Azure Portal under App Service → Configuration → Application Settings
- **Build Process:** Azure can run `npm run build` automatically if configured in deployment settings
- **File System:** Azure App Service uses an ephemeral file system. Use Azure Storage for persistent files

## 🔒 Security Considerations

- **JWT_SECRET:** Use a strong, randomly generated secret (minimum 32 characters)
- **Database Credentials:** Store in Azure Key Vault for production
- **API Keys:** Never commit real API keys to version control
- **CORS:** Configure appropriate origins for your domains
- **Environment Files:** Add `.env` to `.gitignore` (already included)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill processes on port 5000 and 8000
lsof -ti:5000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

**Environment Variables Not Loading:**
- Ensure `.env` files exist and are properly formatted
- Check that variables are not commented out
- Restart development servers after changing environment variables

**Build Errors:**
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check TypeScript errors: `npm run type-check`

### Azure Deployment Issues

**App Won't Start:**
- Check Application Logs in Azure Portal
- Verify `PORT` environment variable is being used
- Ensure all required environment variables are set

**Database Connection Errors:**
- Verify Azure SQL firewall rules allow your App Service
- Check connection string format and credentials
- Test connection locally first

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the [documentation](docs/)
- Review Azure App Service [troubleshooting guide](https://docs.microsoft.com/en-us/azure/app-service/troubleshoot-dotnet-visual-studio)