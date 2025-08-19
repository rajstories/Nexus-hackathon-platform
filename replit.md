# Overview

"Fusion X" is a full-stack web application starter template designed for rapid development of production-ready applications. It features a React frontend, an Express.js backend, and a monorepo structure utilizing TypeScript. Key capabilities include a modern tech stack with Drizzle ORM for database operations, shadcn/ui for UI components, and TailwindCSS for styling. The application is built with comprehensive environment variable management and is ready for Azure deployment. Its vision is to provide a robust foundation for various web projects, including hackathon management systems, with features like role-based dashboards, event management, team functionalities, file submissions, multi-round evaluation, and real-time communication.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query)
- **UI Components**: shadcn/ui (built on Radix UI)
- **Styling**: TailwindCSS with CSS variables
- **Animations**: Framer Motion

## Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for PostgreSQL
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

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
- **Monorepo Layout**: `client/`, `server/`, and `shared/` directories.
- **Shared Types**: Common schema definitions in `shared/`.
- **API Design**: RESTful endpoints with standardized error handling.

## Key Features
- **Role-Based Dashboards**: Participant, Organizer, and Judge dashboards with specific functionalities.
- **Event Management**: CRUD operations for events, tracks, and judge assignments.
- **Team Management**: Team creation, joining via invite codes, and member retrieval.
- **File Submission**: Integration with Azure Blob Storage for file uploads with validation.
- **Multi-Round Evaluation**: Comprehensive judging system with weighted scoring, criteria management, and aggregate calculations.
- **Real-time Communication**: Socket.IO integration for announcements and Q&A chat, persistent with MongoDB.

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