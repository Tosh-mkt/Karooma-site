# Project Overview

This is a modern, full-stack content and affiliate website called "Karooma" built with React, TypeScript, Express.js, and PostgreSQL. The application focuses on providing a vibrant, animated user experience for content discovery and affiliate product promotion with custom Karooma branding.

## User Preferences

Preferred communication style: Simple, everyday language.
Target persona: Cláudia - 39-year-old working mom of three (ages 10, 6, 2), seeks practical solutions for daily chaos, values empathetic and solution-focused content that helps simplify family life and allows moments for self-care.

## System Architecture

### Frontend Architecture
The frontend is built with React and TypeScript using a modern component-based architecture:
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling (shadcn/ui)
- **Animations**: Framer Motion for smooth micro-interactions and page transitions
- **Build Tool**: Vite with custom configuration

### Backend Architecture
The backend follows a simple Express.js REST API pattern:
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints organized by resource type
- **Error Handling**: Centralized error middleware
- **Logging**: Custom request/response logging middleware
- **Development**: Hot reload with tsx

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Centralized schema definitions with Zod validation
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Content Management System
- **Content Types**: Videos, blog posts, and featured content
- **Categorization**: Category-based content organization
- **Media Support**: YouTube video embedding and image handling
- **View Tracking**: Content view analytics

### Affiliate Product System
- **Product Cards**: Dynamic product display with pricing, ratings, and discounts
- **Categories**: Organized product categorization (tech, design, courses, equipment)
- **Affiliate Tracking**: External link tracking for affiliate commissions
- **Featured Products**: Highlighted product promotion system

### Design System
- **Color Palette**: Vibrant gradient-based color scheme with custom CSS variables
- **Typography**: Multiple font families (Fredoka One, Poppins, Inter) for different use cases
- **Animations**: Consistent animation patterns using Framer Motion
- **Responsive Design**: Mobile-first approach with glassmorphism effects

### Newsletter System
- **Email Capture**: Newsletter subscription functionality
- **Toast Notifications**: User feedback for subscription actions

## Data Flow

### Client-Server Communication
1. **Data Fetching**: React Query handles all server state with automatic caching
2. **API Requests**: Centralized API request handling with error management
3. **Real-time Updates**: Optimistic updates for better user experience

### Content Pipeline
1. **Content Creation**: Server-side content management through REST endpoints
2. **Content Display**: Dynamic content rendering with category filtering
3. **Search Functionality**: Client-side search and filtering capabilities

### Affiliate Integration
1. **Product Data**: Ready for String.com integration via API endpoints
2. **Click Tracking**: Affiliate link tracking and analytics
3. **Dynamic Pricing**: Support for current/original pricing and discount calculations

## External Dependencies

### Core Dependencies
- **UI Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with PostCSS
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with Drizzle Kit
- **HTTP Client**: Native fetch with React Query
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation

### Development Tools
- **Build Tool**: Vite with React plugin
- **TypeScript**: Full type safety across frontend and backend
- **Development Server**: Express with Vite middleware integration
- **Error Monitoring**: Replit runtime error overlay

### Third-party Integrations
- **Fonts**: Google Fonts (Fredoka One, Poppins, Inter)
- **Icons**: Lucide React icons
- **Session Management**: connect-pg-simple for PostgreSQL sessions
- **Future Integration**: String.com for automated affiliate products

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild compiles TypeScript server to `dist/index.js`
- **Assets**: Static assets served from build directory

### Environment Configuration
- **Development**: Hot reload with Vite dev server
- **Production**: Compiled Express server serving static React build
- **Database**: Environment-based PostgreSQL connection via DATABASE_URL

### Hosting Requirements
- **Node.js**: ESM module support required
- **PostgreSQL**: Compatible with Neon serverless or traditional PostgreSQL
- **Static Assets**: CDN-ready build output structure

## Recent Changes

### 2025-07-31 - Database Migration & String.com Automation Setup
- **Migrated from MemStorage to PostgreSQL**: Replaced in-memory storage with permanent database storage using Neon serverless PostgreSQL
- **Fixed persistent storage issues**: Products and content now persist across server restarts
- **Database Configuration**: Added DatabaseStorage class implementing IStorage interface with full CRUD operations
- **Schema Push**: Successfully migrated all tables (users, content, products, newsletter_subscriptions) to PostgreSQL
- **String.com Integration Created**: Complete automation system for authentic Amazon product data extraction
- **API Endpoints Added**: `/api/automation/products/sync` and `/api/automation/products/status` for automated workflows
- **Data Validation**: Rigorous validation of product data (prices, categories, required fields) to ensure authenticity
- **Template Scripts**: Python automation scripts ready for String.com implementation
- **N8N Workflow Created**: Complete visual automation workflow for n8n with drag-and-drop interface
- **Dual Automation Options**: Both String.com (cloud) and n8n (self-hosted) solutions available
- **Visual Flow Design**: Easy-to-understand nodes for Amazon scraping, data validation, and API sync
- **Impact**: Eliminates manual data entry and ensures 100% authentic product information from Amazon

The application is designed as a modern, highly visual content and affiliate platform with emphasis on user experience, smooth animations, and modular architecture that can scale with business needs.