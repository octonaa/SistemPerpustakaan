# Library Management System (Perpustakaan-Atina)

## Overview

This is a full-stack library management system built with React, Express.js, and PostgreSQL. The application provides a complete solution for managing library operations including member registration, book inventory, loan tracking, and report generation. The system features a modern web interface with authentication and comprehensive CRUD operations for all library entities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Form Management**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with structured error handling
- **Build Process**: ESBuild for server bundling

### Authentication Strategy
- Session-based authentication using express-session
- PostgreSQL session storage with connect-pg-simple
- Protected routes with middleware-based authorization
- Automatic login redirection for unauthorized access

## Key Components

### Database Schema
Located in `shared/schema.ts`, defines the complete data model:

- **Users**: Admin user accounts with authentication details
- **Members**: Library member profiles with identity verification
- **Books**: Book inventory with categorization and stock tracking
- **Loans**: Loan records with member and book relationships
- **Reports**: System-generated reports for analytics
- **Sessions**: Authentication session storage

### API Layer
The backend provides RESTful endpoints for:

- **Member Management**: CRUD operations, search functionality
- **Book Management**: Inventory tracking, search and filtering
- **Loan Management**: Loan creation, returns, overdue tracking
- **Report Generation**: Analytics and data export
- **Authentication**: Login/logout, session management

### Frontend Pages
- **Dashboard**: Overview statistics and system health
- **Members**: Member registration and management
- **Books**: Book inventory and cataloging
- **Loans**: Loan processing and tracking
- **Reports**: Analytics and data visualization

## Data Flow

1. **Authentication Flow**: Users authenticate through session-based login, with automatic redirects for protected routes
2. **CRUD Operations**: All data operations flow through React Query for caching and optimistic updates
3. **Form Validation**: Client-side validation with Zod schemas shared between frontend and backend
4. **Error Handling**: Centralized error handling with user-friendly toast notifications
5. **Real-time Updates**: Query invalidation ensures data consistency across components

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **zod**: Schema validation
- **express**: Web server framework

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities

### Development Dependencies
- **vite**: Frontend build tool
- **tsx**: TypeScript execution
- **esbuild**: Server bundling

## Deployment Strategy

### Development Mode
- Frontend served by Vite dev server with HMR
- Backend runs with tsx for TypeScript execution
- Database migrations handled by Drizzle Kit
- Environment variables for database configuration

### Production Build
1. Frontend assets built with Vite to `dist/public`
2. Server code bundled with ESBuild to `dist/index.js`
3. Static assets served by Express in production
4. Database schema deployed using `drizzle-kit push`

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)
- Session secrets and security configurations

The application is designed for deployment on platforms supporting Node.js with PostgreSQL databases, with particular optimization for Replit's development environment.

## Changelog
```
Changelog:
- June 28, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```