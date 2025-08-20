# Overview

"Fusion X" is a comprehensive hackathon management platform built with Next.js and Express.js in a hybrid architecture optimized for Azure App Service deployment. The platform features a Next.js frontend for server-side rendering and page routing, with Express.js mounted under /api for REST endpoints. Key capabilities include Firebase authentication, role-based dashboards (Participant, Organizer, Judge), event and team management, file submissions with Azure Blob Storage, multi-round evaluation system, real-time features via Socket.IO, live leaderboard, similarity detection, automated certificate generation, organizer analytics, and sponsor showcase. The architecture employs a hybrid database design using Azure SQL, MongoDB, and PostgreSQL for optimal performance and scalability.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Next.js 14 with TypeScript (Server-Side Rendering)
- **Routing**: Next.js file-based routing (pages directory)
- **State Management**: TanStack Query (React Query)
- **UI Components**: shadcn/ui (built on Radix UI)
- **Styling**: TailwindCSS with CSS variables
- **Real-time**: Socket.IO client for WebSocket communication

## Backend Architecture
- **Runtime**: Node.js with custom server.js
- **API Layer**: Express.js mounted under /api routes
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for PostgreSQL
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **WebSocket**: Socket.IO with Azure-compatible configuration

## Data Storage
- **Primary Database**: PostgreSQL (via Drizzle)
- **Secondary Database**: Azure SQL (structured data for specific features)
- **Flexible Data Storage**: MongoDB (for announcements, chat, similarity indexing)
- **ORM**: Drizzle ORM with Zod for PostgreSQL; Mongoose for MongoDB
- **Migrations**: Drizzle Kit for PostgreSQL; Custom scripts for Azure SQL

## Authentication & Authorization
- **Session Storage**: PostgreSQL-based sessions
- **Schema**: User table for basic authentication
- **Validation**: Zod schemas for request validation
- **Role-Based Access Control (RBAC)**: Implemented for specific features (e.g., organizer-only endpoints).

## Project Structure
- **Hybrid Architecture**: Next.js pages in `pages/`, Express API in `server/`, shared types in `shared/`
- **Custom Server**: `server.js` integrates Next.js and Express on single port
- **API Design**: RESTful endpoints under `/api/*` with standardized error handling
- **Deployment**: Single Azure App Service deployment with WebSocket support

## Key Features
- **Role-Based Dashboards**: Participant, Organizer, and Judge dashboards with specific functionalities.
- **Event Management**: CRUD operations for events, tracks, and judge assignments.
- **Team Management**: Team creation, joining via invite codes, and member retrieval.
- **File Submission**: Integration with Azure Blob Storage for file uploads with validation.
- **Multi-Round Evaluation**: Comprehensive judging system with weighted scoring, criteria management, and aggregate calculations.
- **Real-time Communication**: Socket.IO integration for announcements and Q&A chat, persistent with MongoDB.

# Security Implementation

## API Security Features (Implemented 2025-08-20)
- **Helmet.js**: Security headers for XSS, clickjacking, and other attacks
- **CORS**: Strict allowlist for origins (localhost, *.replit.app, *.replit.dev)
- **Rate Limiting**: 100 requests per 10 minutes per IP address
- **Firebase Authentication**: Token verification on all protected routes
- **Input Sanitization**: Automatic removal of script tags and SQL injection attempts
- **File Upload Security**: 
  - Size limits (50MB max)
  - MIME type validation
  - Blocked executable extensions (.exe, .bat, .sh, etc.)
  - Path traversal prevention
- **SQL Injection Prevention**: All queries use parameterized statements
- **Disabled Headers**: x-powered-by header removed

## Security Endpoints
- `/api/health`: Public health check endpoint (no secrets exposed)
- `/api/security/test`: Security feature verification endpoint
- Protected routes require Firebase authentication token

# Recent Changes (2025-08-20)

## Architecture Migration to Next.js
- **Converted from Vite+Express to Next.js+Express hybrid**: Custom server.js handles both Next.js pages and Express API
- **Azure Deployment Ready**: GitHub Actions workflow for continuous deployment
- **WebSocket Integration**: Socket.IO configured for Azure App Service compatibility
- **Health Checks**: Added /health and /api/health endpoints for Azure monitoring
- **Environment Configuration**: Adapted for Azure App Service with proper port binding

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting (development).
- **PostgreSQL**: Primary relational database.
- **Azure SQL Database**: Production relational database.
- **MongoDB**: NoSQL database for flexible data.
- **Azure Blob Storage**: Cloud storage for file uploads.

## UI & Design System
- **Radix UI**: Headless component primitives.
- **shadcn/ui**: Pre-built component library.
- **Lucide React**: Icon library.
- **TailwindCSS**: Utility-first CSS framework.

## Frontend Libraries
- **TanStack Query**: Server state management.
- **React Hook Form**: Form handling.
- **Framer Motion**: Animations.
- **Wouter**: Lightweight routing.

## Backend Libraries
- **Express.js**: Web application framework.
- **Drizzle ORM**: Type-safe PostgreSQL ORM.
- **Zod**: Runtime type validation.
- **connect-pg-simple**: PostgreSQL session store.
- **Socket.IO**: Real-time bidirectional communication.
- **Mongoose**: MongoDB object data modeling.
- **Multer**: Middleware for handling `multipart/form-data`.
- **mssql**: Microsoft SQL Server client for Node.js.