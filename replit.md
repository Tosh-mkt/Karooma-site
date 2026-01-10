# Overview
Karooma is a full-stack content and affiliate website designed to simplify family life through practical, empathetic content. It features a vibrant, animated user experience for content discovery and affiliate product promotion, leveraging automated content generation and robust affiliate product management.

# User Preferences
Preferred communication style: Simple, everyday language.
Target persona: Cláudia - 39-year-old working mom of three (ages 10, 6, 2), seeks practical solutions for daily chaos, values empathetic and solution-focused content that helps simplify family life and allows moments for self-care.
Image management: Two independent image fields per blog post - Hero (beginning) and Footer (end) images only, no third general image field needed.

# Development Standards

## Template-Based Development
**REGRA PRINCIPAL**: Sempre desenvolver em templates dedicados, nunca em conteúdo real/produção.

### Nomenclatura Padrão
Todos os templates de desenvolvimento seguem o padrão: `[tipo]-template-dev`

### URLs de Desenvolvimento (Fixas)
- **Missões**: `/missoes/missao-template-dev` (slug: `missao-template-dev`)
- **Blog**: `/blog/blog-template-dev` (slug: `blog-template-dev`)
- **Produtos**: Via query param ou ID fixo quando necessário

### Workflow de Desenvolvimento (Dev → QA → Prod)
1. **Desenvolver**: Implementar features no template correspondente (`*-template-dev`)
2. **Testar Funcionalidade**: Validar no template usando URLs fixas
3. **Criar Conteúdo**: Usar painel admin para criar novo conteúdo (rascunho)
4. **Pré-visualizar**: Clicar em "Pré-visualizar" no admin (abre `/preview/missoes/:slug`)
5. **QA/UX**: Validar com QA-CHECKLIST.md antes de publicar
6. **Publicar**: Marcar `isPublished: true` no admin
7. **Verificar Produção**: Testar URL pública final

### Templates Ativos
- **Missões**: `missao-template-dev` (Title: "Missão Template - Desenvolvimento")
  - URL: https://[repl-url]/missoes/missao-template-dev
  - Usar para: Testar checklist, barra de progresso, integração Amazon API, sistema de áudio, etc.
- **Blog**: `blog-template-dev` (A ser criado quando necessário)
- **Outros**: Criar conforme necessidade seguindo padrão `-template-dev`

### Vantagens
✅ Impossível confundir desenvolvimento vs produção
✅ URLs fixas e previsíveis para testes
✅ Conteúdo real sempre limpo e profissional
✅ Fácil identificar e gerenciar templates

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
- **Missões Resolvidas System**: Mission-based content feature combining empathetic problem understanding with curated product solutions. Includes CRUD operations, public and admin API routes, frontend pages, and an interactive task checklist with local storage. Features **Audio Narration System** using Web Speech API for accessibility. **Amazon Product Integration**: ASIN-first resilient system that prioritizes specific product ASINs with affiliate links (tag: karoom-20) and attempts to enrich data via PA-API when available; gracefully degrades to basic cards with functional affiliate links when PA-API is blocked (AssociateNotEligible - requires 10 sales/30 days as of Nov 2024). System automatically upgrades to full product data when PA-API becomes available.
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
- **Content Intelligence Hub**: AI-powered content generation system with:
  - **Unified Categories**: 7 categories (Rotina, Casa, Cozinha, Educação, Bem-estar, Passeios, Saúde) replacing separate Blog/Guias taxonomies
  - **AI Draft Generation**: Gemini-powered with Karoo's voice (empathetic, practical, conversational Portuguese) and built-in SEO optimization
  - **Papercraft Origami 3D**: Default image style for all article imagery (volumetric paper art with vibrant colors)
  - **Mission Matching**: Automatic linking of articles to relevant Missões by category/topic keywords
  - **Content Refinement Chat**: Interactive refinement with AI instructions for tone, length, emphasis adjustments
  - **Seasonal Calendar** (`seasonal_themes` table): 12+ pre-populated annual themes with start/end dates, priority levels, and suggested topics
  - **Seasonal Alerts**: Active and upcoming theme notifications in Content Hub admin panel
  - **Trending Topics**: Gemini-powered trend detection for content opportunities specific to mothers' interests
  - **Unified Articles Page**: `/artigos` combines blog posts and guides in a single filterable view
  - **Admin Pages**: `/admin/content-hub` (article generation), `/admin/seasonal-calendar` (theme management)
  - **Backwards Compatibility**: `/blog` and `/guias` routes remain active alongside `/artigos`

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