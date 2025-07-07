# EduMaster - Learning Management System

## Overview

EduMaster is a comprehensive Learning Management System (LMS) built with a modern full-stack architecture. The application supports multiple user roles (admin, lecturer, student, guest) and provides features for course management, assessment tracking, quiz systems, grade reporting, and news/events management.

## System Architecture

The application follows a monorepo structure with clear separation between frontend, backend, and shared code:

- **Frontend**: React + TypeScript client with Vite build system
- **Backend**: Express.js REST API server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth with session-based authentication
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state management

## Key Components

### Frontend Architecture
- **React Router**: Wouter for client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend Architecture
- **API Layer**: Express.js with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL
- **Authentication**: Replit Auth with express-session
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error middleware

### Database Schema
- **Users**: Multi-role user system (admin/lecturer/student/guest)
- **Academic Sessions**: Semester/term management
- **Courses**: Course catalog with lecturer assignments
- **Enrollments**: Student-course relationships
- **Assessments**: Grade tracking and calculations
- **Quizzes**: Interactive quiz system with questions and attempts
- **News/Events**: Public announcements and calendar events
- **Sessions**: Authentication session storage

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **API Communication**: Frontend makes REST API calls with credentials included
3. **Data Fetching**: TanStack Query manages server state with automatic caching
4. **Form Submission**: React Hook Form validates data before API submission
5. **Real-time Updates**: Query invalidation triggers automatic re-fetching

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **express**: Web server framework
- **wouter**: Lightweight React router

### Development Tools
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **drizzle-kit**: Database migration tool

## Deployment Strategy

### Development Environment
- **Vite Dev Server**: Hot module replacement for frontend
- **tsx**: TypeScript execution for backend
- **Database Migrations**: Drizzle Kit push for schema updates

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS required
- **Session Storage**: PostgreSQL-backed sessions for scalability

### Database Considerations
- Application uses Drizzle ORM configured for PostgreSQL dialect
- Schema migrations managed through Drizzle Kit
- Connection pooling via Neon serverless driver for production scaling

## Changelog

```
Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Implemented comprehensive LMS features:
  * Admin-only dashboard with role-based access control
  * Enhanced grade calculation with pass/fail/pass with warning logic
  * Student-specific assessment and grade report pages  
  * User management with CRUD operations for admins
  * PDF generation endpoints for registration slips and grade reports
  * Course materials upload functionality
  * Enhanced quiz system with attempt tracking and randomization
  * Role-based navigation and page access restrictions
  * Fixed database schema issues and access control bugs
- July 07, 2025. Added comprehensive role-based authentication system:
  * Dual authentication methods: Replit OAuth and email/password
  * Role-based sign-up with admin, lecturer, and student options
  * Professional sign-in and sign-up pages with form validation
  * Session-based authentication with proper security
  * Landing page with both sign-in and create account options
  * Fixed authentication middleware and session management
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```