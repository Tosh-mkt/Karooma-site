# Overview
Karooma is a modern, full-stack content and affiliate website built with React, TypeScript, Express.js, and PostgreSQL. It provides a vibrant, animated user experience for content discovery and affiliate product promotion, featuring custom Karooma branding. The project aims to simplify family life through practical, empathetic content, offering automated content generation, robust affiliate product management, and a seamless user experience.

# User Preferences
Preferred communication style: Simple, everyday language.
Target persona: Cláudia - 39-year-old working mom of three (ages 10, 6, 2), seeks practical solutions for daily chaos, values empathetic and solution-focused content that helps simplify family life and allows moments for self-care.
Image management: Two independent image fields per blog post - Hero (beginning) and Footer (end) images only, no third general image field needed.

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
- **Admin Authentication System**: Dual-layer validation system that recognizes admin users by email pattern (@karooma.life domain or containing 'admin') OR database flag. Uses `checkIsAdmin()` helper function across all 8 admin endpoints. Automatically promotes qualifying emails to admin status on login.
- **Session Management System**: Production-ready PostgreSQL-backed session store using `connect-pg-simple`. Sessions are persisted in the `session` table, enabling session sharing across multiple server instances, surviving server restarts, and proper logout functionality. Configured with 24-hour session lifetime, automatic session pruning every 15 minutes, and secure/httpOnly cookies in production. Critical for multi-instance deployments and load-balanced production environments.
- **Content Management System**: Supports videos, blog posts, featured content. Includes an administrative panel, LLM integration for automated content generation (ChatGPT, Claude, Gemini), a 5-part template system for content structure, a prompt generator, and compartmentalized LLM output. Features category-based organization, YouTube embedding, Unsplash image integration, view tracking, real-time preview, and tooltip guidance. Blog posts support exactly two independent image fields (heroImageUrl and footerImageUrl).
- **Affiliate Product System**: Dynamic product cards with pricing, ratings, discounts. Organized categorization, external link tracking for affiliate commissions, and featured product promotion.
- **Newsletter System**: Email capture and toast notifications.
- **Image Upload System**: Google Cloud Storage integration with direct upload, file validation, automatic markdown insertion, and public ACL. Specifically for blog posts, it supports two independent image fields (Hero and Footer).
- **Flipbook Access Control System**: Email-based authorization system with database table `authorized_flipbook_users`, middleware authentication, API routes, a frontend guard component, and an admin interface.
- **Marketing Automation System**: An ultra-lean, MVP-first approach focusing on email welcome, lead magnet delivery (SendGrid), web push notifications (Service Worker), and a price alert system. Uses a PostgreSQL-based job queue (`automation_jobs` table) and progress tracking (`automation_progress` table).
- **Web Push Notifications System**: Native PWA push notifications for direct user engagement, focusing on price alerts, new content, abandoned cart recovery, and flash deals. Features a `push_subscriptions` table for managing user preferences and tokens.
- **Google Sheets Import System**: Hybrid product import system that merges JSON data from a dedicated column with regular spreadsheet columns (ASIN, title, image_url, price, rating, etc.). Supports both Portuguese and English field names, CSV public API method for data fetching, bilingual compatibility.
- **Price Alert System**: Personalized user alert system that monitors products and categories for promotions, sending automated notifications via email (SendGrid) and web push when discounts are detected. Features product-specific and category-based alerts, configurable discount thresholds, automated job scheduler (node-cron running every 2 hours), Amazon PA API integration for real-time price checking, user preference management (email/push notifications toggle), and dedicated MyAlerts page for alert management. Backend implements batched API requests to minimize rate limiting, frontend provides modal-based alert creation on product cards, and the system includes promotional email templates with product images and pricing details.

## Blog Content Standards
- **Target Persona**: Cláudia, a working mother seeking practical solutions.
- **Content Structure**: 5 required elements (Emotional Hook, Problem Identification, Practical Solutions, Bonus Section, Personal Reflection).
- **Voice & Tone**: 2nd person ("você"), conversational, empathetic, practical.
- **Visual Concept**: Origami Transformation - chaotic elements for problems, harmonious for solutions.
- **Category-Specific Templates**: Tailored content for Educação, Segurança, Bem-estar, Organização, Alimentação, Desenvolvimento.
- **Quality Metrics**: 1500-2500 words, 5-8 actionable tips, personal touch, 100% implementable.
- **Call-to-Action**: Newsletter, relevant affiliate products, community engagement.
- **Semantic Tags**: Categorization by Urgency, Investment, Difficulty, Age, Setting.
- **Content Validation**: Automated checks for structure, tone, category requirements, visual concept, and SEO.

## E-book System Standards
- **Visual Identity**: Karooma gradient scheme, specific typography (Fredoka One, Poppins, Inter), origami papercraft aesthetic.
- **Structure Template**: Cover, Welcome, ToC, 5-7 Main Chapters, Checklists, Resource Section, Final Page.
- **Technical Implementation**: Interactive flipbook (HTML/CSS/JS) optimized for mobile, reusable React components, horizontal mobile-first design, content expandable from blog posts.
- **Flipbook System**: Mobile-first, touch gestures, consistent layout, centralized color system (`shared/flipbook-themes.ts`) for various themes (e.g., Produtividade Doméstica, Finanças Familiares), page structure (Cover → Welcome → ToC → Chapters → Checklists → Testimonials → Final), interactive elements, and admin interface for theme management.

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
- **Email Service**: SendGrid via Replit native integration (automated token management, newsletter notifications, welcome emails, password reset)
- **Storage**: Google Cloud Storage
- **Amazon PA API**: Product Advertising API v5 for real-time product data (prices, ratings, availability, images)

## Email System Implementation
- **Integration Type**: Replit native SendGrid connector (`getUncachableSendGridClient()`)
- **Token Management**: Automatic token rotation and renewal
- **Client Pattern**: Never cached - fresh client requested for each email operation
- **Sender Email**: Automatically configured via integration settings
- **Implementation Files**: `server/sendgridClient.ts`, `server/emailService.ts`
- **Email Features**: Newsletter admin notifications, user welcome emails, password reset emails
- **Fallback**: Console logging when SendGrid unavailable for development

## Google OAuth Configuration
- **Provider**: Google OAuth 2.0 via NextAuth (@auth/express)
- **Express Mount Path**: `/api/auth/*` (standard ExpressAuth middleware mounting)
- **TrustHost**: Set to `true` for Replit's reverse proxy environment
- **Secret**: Configured via `NEXTAUTH_SECRET` or `AUTH_SECRET` (auto-generated for development)
- **Available Routes**: `/api/auth/signin/google`, `/api/auth/callback/google`, `/api/auth/session`, `/api/auth/signout`
- **Required Google Cloud Console Configuration**:
  - Authorized redirect URIs: `https://karooma.life/api/auth/callback/google`
  - Authorized JavaScript origins: `https://karooma.life`
- **Environment Variables**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET` (or `AUTH_SECRET`)
- **Session Management**: NextAuth uses its own `sessions` table via Drizzle adapter (separate from Express session store)
- **Admin Auto-Promotion**: Users with @karooma.life emails are automatically promoted to admin status on login

## Amazon PA API Integration
- **API Version**: Product Advertising API v5
- **Host**: `webservices.amazon.com`
- **Region**: `us-east-1`
- **Signature**: AWS Signature Version 4 using @smithy/signature-v4
- **Environment Variables**: `AMAZON_ACCESS_KEY`, `AMAZON_SECRET_KEY`, `AMAZON_PARTNER_TAG` (karoom-20)
- **Service Implementation**: `server/services/amazonApi.ts` (AmazonPAAPIService class)
- **Key Features**:
  - Real-time product data fetching by ASIN
  - Batch processing (up to 10 ASINs per request with rate limiting)
  - Automatic affiliate link generation with partner tag
  - Price tracking (current and original pricing)
  - Availability status (available, unavailable, limited)
  - Product ratings and review counts
  - Prime eligibility detection
  - Category path extraction
- **Admin Endpoints**:
  - `/api/admin/import-by-asin`: Import products by ASIN with Karooma curator analysis (JSON format)
  - `/api/admin/sync-products-amazon`: Bulk sync all products with ASINs to update prices, availability, ratings
- **Import System**: Hybrid approach combining Amazon PA API data (title, price, image, rating) with Karooma curator analysis (nutritionist, organizer, design evaluations)
- **Duplicate Handling**: ASIN-based deduplication - updates existing products or creates new ones
- **Admin UI**: Three import tabs (CSV, Google Sheets JSON, ASIN Import) with real-time preview and "Sync with Amazon" button