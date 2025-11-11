# Overview
Karooma is a full-stack content and affiliate website designed to simplify family life through practical, empathetic content. It features a vibrant, animated user experience for content discovery and affiliate product promotion, leveraging automated content generation and robust affiliate product management.

# User Preferences
Preferred communication style: Simple, everyday language.
Target persona: Cláudia - 39-year-old working mom of three (ages 10, 6, 2), seeks practical solutions for daily chaos, values empathetic and solution-focused content that helps simplify family life and allows moments for self-care.
Image management: Two independent image fields per blog post - Hero (beginning) and Footer (end) images only, no third general image field needed.

# System Architecture

## Frontend
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS, Radix UI, glassmorphism effects
- **Animations**: Framer Motion
- **Design System**: Gradient-based color scheme, multiple font families (Fredoka One, Poppins, Inter), mobile-first responsive design.

## Backend
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints
- **Error Handling**: Centralized middleware

## Database
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Schema**: Zod validation
- **Migrations**: Drizzle Kit

## Key Features
- **Admin Authentication**: Dual-layer validation (email pattern or database flag) with `checkIsAdmin()` helper.
- **Session Management**: PostgreSQL-backed session store (`connect-pg-simple`) for persistence and multi-instance support.
- **Content Management**: Supports videos, blog posts, featured content. Includes admin panel, LLM integration for automated generation (ChatGPT, Claude, Gemini), 5-part template system, prompt generator, and compartmentalized LLM output. Features category organization, YouTube embedding, Unsplash integration, view tracking, real-time preview, and tooltip guidance. Blog posts support exactly two independent image fields (heroImageUrl and footerImageUrl).
- **Missões Resolvidas System**: Mission-based content feature combining empathetic problem understanding with curated product solutions. Includes CRUD operations, public and admin API routes, frontend pages, and an interactive task checklist with local storage. Features **Audio Narration System** using Web Speech API for accessibility.
- **Affiliate Product System**: Dynamic product cards with pricing, ratings, discounts, categorization, external link tracking, and featured product promotion.
- **Newsletter System**: Email capture and toast notifications.
- **Image Upload System**: Google Cloud Storage integration for direct upload, validation, automatic markdown insertion, and public ACL, specifically for blog post hero and footer images.
- **Flipbook Access Control System**: Email-based authorization with database management, middleware, API routes, frontend guard, and admin interface.
- **Marketing Automation System**: Focused on email welcome, lead magnet delivery, web push notifications, and a price alert system, using a PostgreSQL-based job queue.
- **Web Push Notifications System**: Native PWA push notifications using VAPID, `push_subscriptions` table, service worker, and a React hook for subscription management.
- **Google Sheets Import System**: Hybrid product import from Google Sheets (JSON column merged with spreadsheet columns), supporting bilingual field names.
- **Price Alert System**: Personalized alerts for product and category promotions via email and web push. Integrates with Amazon PA API for real-time price checking and uses a scheduled job (`node-cron`).
- **Blog Content Standards**: Defines target persona (Cláudia), 5-element content structure, voice/tone, visual concept (Origami Transformation), category-specific templates, quality metrics, CTAs, semantic tags, and automated content validation.
- **E-book System Standards**: Defines visual identity, structure template, and technical implementation for interactive flipbooks optimized for mobile, with a centralized color system and admin interface for theme management.

# External Dependencies

## Core Dependencies
- **UI Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS, PostCSS
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation
- **Fonts**: Google Fonts (Fredoka One, Poppins, Inter)
- **Icons**: Lucide React icons
- **Session Management**: `connect-pg-simple`
- **Push Notifications**: `web-push`

## Third-party Integrations
- **LLMs**: ChatGPT, Claude, Gemini
- **Media**: YouTube, Unsplash
- **Email Service**: SendGrid (via Replit native integration)
- **Storage**: Google Cloud Storage
- **Amazon PA API**: Product Advertising API v5 (for real-time product data)
- **Google OAuth**: Via NextAuth (@auth/express)