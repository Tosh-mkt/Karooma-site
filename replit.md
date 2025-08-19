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

### 2025-08-19 - Processo Padronizado de Importação Automatizada
- **Sistema de Validação Robusto**: Endpoint `/api/products/import` com validação automática de campos obrigatórios
- **Processamento Inteligente Multi-Formato**: Suporte automático para diferentes formatos de preço, rating e categorização
- **Validação de Especialistas**: Obrigatório mínimo de 3 especialistas, detecta automaticamente até 5 especialistas diferentes
- **Funções de Extração Automática**: `extractCategory()`, `extractRating()`, `extractPrice()` com suporte a múltiplos formatos
- **Template Padronizado**: `TEMPLATE_PRODUTO_EXEMPLO.json` com estrutura completa para garantir consistência
- **Documentação Completa**: `PROCESSO_IMPORTACAO_PRODUTOS.md` com regras, formatos e checklist de qualidade
- **Script de Automação**: `SCRIPT_IMPORTACAO_AUTOMATICA.js` para importação via linha de comando sem ajustes manuais
- **Modal com Fontes Legíveis**: Aumentado tamanho de fonte (text-base para títulos, text-sm para conteúdo) para melhor experiência
- **Zero Ajustes Pós-Importação**: Sistema projetado para eliminar necessidade de correções manuais após importação
- **Validação de Links Afiliados**: Campo obrigatório com verificação automática de presença
- **Categorização Inteligente**: Detecta categoria baseada em palavras-chave no nome do produto
- **Parsing de Preços Avançado**: Suporta formatos "R$ X a R$ Y", "R$ X", "Varia em torno de R$ X"
- **Impact**: Processo completamente automatizado e padronizado para criação de cards de produtos com garantia de qualidade

### 2025-08-17 - Product Card Model Unification & Demo Cleanup
- **Karooma Card Model Update**: Modified ProductCard component to match Amazon card dimensions (264px width, 200px image height)
- **Layout Optimization**: Updated product page layout from CSS Grid to Flexbox for better card alignment with fixed dimensions
- **Visual Consistency**: Maintained Karooma's unique glassmorphism effects and gradients while adopting compact Amazon-style sizing
- **Component Integration**: Successfully integrated "Porque Indicamos?" (Why We Recommend?) modal with recommendation system
- **Demo Page Removal**: Deleted CardDemo page and removed "Demo Cards Amazon" button from homepage
- **Import Fixes**: Corrected component imports to use proper default exports for FavoriteButton and RecommendationModal
- **Type Safety**: Enhanced type handling to support null values from database schema
- **User Experience**: Streamlined navigation by removing demo elements and focusing on production features
- **Impact**: Unified card design across the platform while preserving Karooma's distinctive visual identity

### 2025-08-06 - Admin Authentication & Favorites System Implementation
- **Replit Auth Integration**: Complete OAuth integration with Replit for secure user authentication
- **Temporary Login System**: Simple session-based login for development with instant admin access
- **Admin Role System**: User role-based access control with admin/regular user permissions
- **Database Schema Update**: Added sessions table, updated users table with admin flag, and created favorites table
- **Protected Admin Routes**: Admin dashboard and management functions now require authentication and admin privileges
- **Login Page**: TempLogin component with "Login Rápido - Admin" for instant access
- **Dual Auth Strategy**: Session-based temporary login + OAuth fallback for production
- **Conditional Navigation**: Login/Admin button toggles based on authentication status, Favorites menu item added
- **User Profile Integration**: Admin dashboard shows user profile information and logout functionality
- **Route Protection**: Product edit/delete operations now require admin authentication
- **Favorites System**: Complete user favorites functionality with database storage, API endpoints, and React components
- **Favorites Page**: Dedicated `/favoritos` page showing user's saved products with management capabilities
- **Favorite Button Component**: Heart button on products allowing users to add/remove favorites with animations
- **Session Authentication**: Middleware for protecting favorites routes using session-based authentication
- **Auth Hooks**: Enhanced React hooks supporting both session and OAuth authentication
- **Documentation**: Complete login guides (COMO_FAZER_LOGIN_ADMIN.md) with step-by-step instructions
- **Impact**: Fully functional authentication with simple login process for immediate admin access + complete favorites system
- **Status**: ✅ CONCLUÍDO E TESTADO - Login funcionando, sistema de favoritos operacional via API e interface

### 2025-08-04 - Real-Time Auto Cards System Implementation  
- **Server-Sent Events (SSE) Implementation**: Replaced time-based polling with real-time event-driven updates
- **SSE Manager**: Created centralized system for managing client connections and broadcasting events
- **Real-Time Notifications**: Auto cards now appear instantly when N8N sends new product data
- **Auto Cards Page**: Dedicated page `/autocards` with live updates and visual status indicators
- **Event-Driven Architecture**: Products update immediately upon N8N webhook receipt instead of polling every 5-10 seconds
- **Visual Status Indicators**: Connection status, automation status, and new product badges
- **Auto Notifications**: Floating notifications appear for 10 seconds when new products are processed
- **Zero Polling**: Eliminated all time-based polling in favor of push-based real-time updates
- **Enhanced Logging**: Detailed console logs show SSE connections and real-time product creation
- **Impact**: Cards now appear instantly when data arrives from N8N, providing true real-time experience

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