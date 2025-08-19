# Overview

This is a full-stack web application built with a React frontend and Express.js backend using TypeScript. The project follows a monorepo structure with shared type definitions and implements a modern tech stack including Drizzle ORM for database operations, shadcn/ui for the component library, and TailwindCSS for styling. The application is a production-ready starter template called "Fusion X" featuring an animated splash page, comprehensive environment variable management, and Azure deployment readiness.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: TailwindCSS with CSS variables for theming support
- **Animations**: Framer Motion for page transitions and animations

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Development**: Hot reload using tsx and custom Vite middleware integration

## Data Storage
- **Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM with Zod integration for type-safe schema validation
- **Migrations**: Drizzle Kit for database migrations and schema management
- **Connection**: Neon Database serverless driver for PostgreSQL connections

## Authentication & Authorization
- **Session Storage**: PostgreSQL-based sessions using connect-pg-simple
- **Schema**: User table with username/password fields (basic structure in place)
- **Validation**: Zod schemas for request validation via drizzle-zod integration

## Development Environment
- **Build System**: Vite for frontend, esbuild for backend bundling
- **Type Checking**: Shared TypeScript configuration across frontend/backend/shared modules
- **Hot Reload**: Vite development server with Express middleware integration
- **Path Aliases**: Configured for clean imports (@/ for client, @shared/ for shared types)

## Project Structure
- **Monorepo Layout**: Separate client/, server/, and shared/ directories
- **Shared Types**: Common schema definitions and types in shared/ directory
- **Component Organization**: Structured UI components following shadcn/ui patterns
- **API Design**: RESTful endpoints with standardized error handling and logging

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Connection**: Via @neondatabase/serverless driver for edge compatibility

## UI & Design System
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library with consistent design tokens
- **Lucide React**: Icon library for consistent iconography
- **TailwindCSS**: Utility-first CSS framework with custom design tokens

## Development Tools
- **Replit Integration**: Custom plugins for Replit development environment
- **Vite Plugins**: Runtime error overlay and cartographer for enhanced DX
- **Drizzle Kit**: Database migration and introspection tools

## Frontend Libraries
- **TanStack Query**: Server state synchronization and caching
- **React Hook Form**: Form handling with @hookform/resolvers for validation
- **Framer Motion**: Animation library for smooth transitions
- **date-fns**: Date manipulation utilities
- **Wouter**: Lightweight routing solution

## Backend Libraries
- **Express.js**: Web application framework
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL dialect
- **Zod**: Runtime type validation and schema parsing
- **connect-pg-simple**: PostgreSQL session store middleware

# Environment Configuration

## Environment Variables
The project uses a comprehensive environment variable system for configuration across development and production environments:

- **Root .env.example**: Global configuration template
- **client/.env.example**: Frontend-specific variables (prefixed with VITE_)
- **server/.env.example**: Backend-specific variables including database and service configurations

## Supported Services
- **Azure SQL Database**: Production database hosting
- **MongoDB**: Alternative database option
- **Azure Blob Storage**: File storage and uploads
- **Firebase**: Authentication and real-time features
- **JWT**: Token-based authentication

## Azure App Service Integration
- Server automatically respects `process.env.PORT` for Azure deployment
- Environment variables configured through Azure Portal Application Settings
- Production-ready configuration with proper CORS and security settings

# Recent Changes (August 19, 2025)

## Role-Based Dashboard System
✓ Built comprehensive ParticipantDashboard with profile management, team creation/joining, event timeline, and project submission
✓ Created OrganizerDashboard featuring event management, track creation, announcements, judge management, and submission oversight
✓ Implemented JudgeDashboard with submission evaluation, criteria-based scoring system, and feedback forms
✓ Added RoleRouter component with beautiful 3-card selection interface
✓ Integrated all UI components (Tabs, Cards, Dialog, Toast, Progress, Slider) using shadcn/ui
✓ Added comprehensive data-testid attributes for all interactive elements
✓ Used Lucide React icons throughout for consistent visual design

## Event Creation API with Zod Validation
✓ Created comprehensive Zod schemas for event creation, track creation, and judge assignment
✓ Implemented organizer-only RBAC endpoints with proper Firebase token verification
✓ Built EventRepository with full CRUD operations and relationship management
✓ Added proper validation error formatting with human-readable messages
✓ Created database migrations for events, tracks, and event_judges tables
✓ Implemented comprehensive API testing with validation scenarios

### API Endpoints
- **POST /api/events**: Create new events (organizer-only) with Zod validation
- **POST /api/events/:id/tracks**: Add tracks to events with organizer verification
- **POST /api/events/:id/judges**: Assign judges to events with role validation
- **GET /api/events/:id**: Retrieve events with tracks and judges

## Team Management API with PostgreSQL Integration
✓ Implemented comprehensive team management system with PostgreSQL database
✓ Created authentication upsert system for Firebase users in SQL database
✓ Built team creation with unique invite code generation (6-character alphanumeric)
✓ Implemented team joining via invite codes with validation and duplicate prevention
✓ Added team member retrieval with full relationship data and creator identification
✓ Created development-friendly authentication middleware supporting mock tokens

### Team API Endpoints
- **POST /api/auth/register**: Upsert SQL users from Firebase UID & email on first verified login
- **GET /api/auth/me**: Get current authenticated user information
- **POST /api/teams**: Create team (event_id, name) → returns invite_code
- **POST /api/teams/join**: Join team using invite_code
- **GET /api/teams/me**: Retrieve user's teams + members with event details

### Database Architecture
- **PostgreSQL**: Primary database for users, teams, team_members, events using Drizzle ORM
- **Azure SQL**: Secondary structured database (configured but unavailable in development)
- **MongoDB**: Flexible data storage for announcements, chat, similarity indexing

## Environment & Configuration Setup
✓ Added comprehensive .env.example files for root, client, and server
✓ Created detailed README.md with environment variable documentation
✓ Updated .gitignore to exclude environment files
✓ Documented Azure App Service deployment process
✓ Verified server respects PORT environment variable for Azure compatibility

## Database Layer - Azure SQL (Structured)
✓ Installed mssql package for Azure SQL Database connectivity
✓ Created pooled MSSQL client with parameterized queries (server/db/sql.ts)
✓ Built comprehensive migration system with initial schema (001_initial_schema.sql)
✓ Implemented database seeding with realistic event management data
✓ Added repository pattern with UserRepository and EventRepository
✓ Created migration and seeding scripts (scripts/migrate-sql.js, scripts/seed-sql.js)
✓ Added database connection testing utility (scripts/test-db.js)

### Database Schema
Tables: users, events, tracks, teams, team_members, submissions, judges, scores, announcements
Features: Full referential integrity, indexes for performance, comprehensive seed data for hackathon event

## Database Layer - MongoDB (Flexible)
✓ Installed mongoose package for MongoDB connectivity
✓ Created MongoDB models: Announcement, ChatMessage, SimilarityIndex
✓ Built connection manager with health checks (server/db/mongo.ts)
✓ Implemented repository pattern for flexible data operations
✓ Added MongoDB seeding with realistic chat and announcement data
✓ Updated health endpoint to show both SQL and MongoDB status
✓ Created seeding script (scripts/seed-mongo.js)

### MongoDB Collections
- **Announcements**: Event announcements with timestamps
- **ChatMessages**: Team and event chat with optional team scoping
- **SimilarityIndex**: Vector embeddings for AI-powered submission similarity