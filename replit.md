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

## Environment & Configuration Setup
✓ Added comprehensive .env.example files for root, client, and server
✓ Created detailed README.md with environment variable documentation
✓ Updated .gitignore to exclude environment files
✓ Documented Azure App Service deployment process
✓ Verified server respects PORT environment variable for Azure compatibility