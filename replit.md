# Mattermost Chat Integration

## Overview

This is a React-based chat application that integrates with Mattermost servers. The application allows users to authenticate with their Mattermost credentials and engage in direct message conversations through a modern web interface. It serves as a bridge between users and their Mattermost instances, providing a streamlined chat experience with real-time message polling and user management features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Wouter** for client-side routing instead of React Router
- **TanStack Query** for server state management and API data fetching
- **Tailwind CSS** with shadcn/ui components for styling and UI primitives
- **React Hook Form** with Zod validation for form handling
- **Vite** as the build tool and development server

### Backend Architecture
- **Express.js** server with TypeScript for the REST API
- **Drizzle ORM** with PostgreSQL for database operations
- **Neon Database** (@neondatabase/serverless) as the PostgreSQL provider
- **In-memory storage fallback** for development/testing scenarios
- **Session-based authentication** with token management
- **Mattermost API integration** for external chat service communication

### Data Storage Solutions
- **PostgreSQL database** with Drizzle ORM for data persistence
- **Database schema** includes users, direct messages, messages, and Mattermost configuration tables
- **UUID primary keys** generated via PostgreSQL's gen_random_uuid()
- **Timestamp tracking** for message ordering and user activity
- **JSON metadata storage** for flexible message attributes

### Authentication and Authorization
- **Mattermost credential-based authentication** - users login with their existing Mattermost server credentials
- **Session token management** - tokens stored and managed for persistent authentication
- **Server URL configuration** - supports multiple Mattermost server instances
- **User profile synchronization** - automatically syncs user data from Mattermost servers

### API Architecture
- **RESTful API design** with Express.js routes
- **Structured error handling** with standardized HTTP status codes
- **Request/response logging** middleware for debugging and monitoring
- **Zod schema validation** for type-safe API contracts
- **Polling-based real-time updates** - messages refresh every 3 seconds

## External Dependencies

### Third-Party Services
- **Mattermost Server API** - Primary integration for chat functionality, user authentication, and message synchronization
- **Neon Database** - Serverless PostgreSQL hosting for production data storage

### Key Libraries and Frameworks
- **@radix-ui components** - Comprehensive set of accessible UI primitives
- **Drizzle Kit** - Database migration and schema management tools  
- **shadcn/ui** - Pre-built component library built on Radix UI
- **TanStack Query** - Server state management with caching and synchronization
- **React Hook Form** - Form state management with performance optimization
- **Zod** - Runtime type validation and schema definition
- **Tailwind CSS** - Utility-first CSS framework for styling
- **TypeScript** - Static type checking across the entire application stack

### Development Tools
- **Vite** - Fast build tool and development server with HMR
- **ESBuild** - Fast JavaScript bundler for production builds
- **PostCSS** - CSS processing with Tailwind integration
- **Replit integration** - Development environment optimizations and error handling