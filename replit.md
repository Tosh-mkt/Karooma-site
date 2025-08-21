# Overview
Karooma is a modern, full-stack content and affiliate website built with React, TypeScript, Express.js, and PostgreSQL. It focuses on providing a vibrant, animated user experience for content discovery and affiliate product promotion, featuring custom Karooma branding. The project aims to simplify family life through practical, empathetic content and offers automated content generation, robust affiliate product management, and a seamless user experience.

# User Preferences
Preferred communication style: Simple, everyday language.
Target persona: Cláudia - 39-year-old working mom of three (ages 10, 6, 2), seeks practical solutions for daily chaos, values empathetic and solution-focused content that helps simplify family life and allows moments for self-care.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS with custom design system, Radix UI primitives (shadcn/ui), glassmorphism effects
- **Animations**: Framer Motion for smooth micro-interactions and page transitions
- **Build Tool**: Vite
- **Design System**: Vibrant gradient-based color scheme, multiple font families (Fredoka One, Poppins, Inter), consistent animation patterns, mobile-first responsive design.

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints
- **Error Handling**: Centralized error middleware
- **Logging**: Custom request/response logging
- **Development**: Hot reload with `tsx`

## Database Architecture
- **Database**: PostgreSQL (Neon serverless hosting)
- **ORM**: Drizzle ORM
- **Schema**: Centralized schema definitions with Zod validation
- **Migrations**: Drizzle Kit

## Key Components
- **Content Management System**: Supports videos, blog posts, featured content. Includes an administrative panel, LLM integration for automated content generation (ChatGPT, Claude, Gemini), a 5-part template system for content structure, a prompt generator, and compartmentalized LLM output. Features category-based organization, YouTube embedding, Unsplash image integration, view tracking, real-time preview, and tooltip guidance.
- **Affiliate Product System**: Dynamic product cards with pricing, ratings, discounts. Organized categorization, external link tracking for affiliate commissions, and featured product promotion.
- **Newsletter System**: Email capture and toast notifications for user feedback.

# External Dependencies

## Core Dependencies
- **UI Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with Drizzle Kit
- **HTTP Client**: Native fetch with React Query
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation
- **Fonts**: Google Fonts (Fredoka One, Poppins, Inter)
- **Icons**: Lucide React icons
- **Session Management**: `connect-pg-simple` for PostgreSQL sessions

## Third-party Integrations
- **LLMs**: ChatGPT, Claude, Gemini (for content generation)
- **Media**: YouTube, Unsplash