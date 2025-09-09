# Overview
Karooma is a modern, full-stack content and affiliate website built with React, TypeScript, Express.js, and PostgreSQL. It focuses on providing a vibrant, animated user experience for content discovery and affiliate product promotion, featuring custom Karooma branding. The project aims to simplify family life through practical, empathetic content and offers automated content generation, robust affiliate product management, and a seamless user experience.

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
- **Content Management System**: Supports videos, blog posts, featured content. Includes an administrative panel, LLM integration for automated content generation (ChatGPT, Claude, Gemini), a 5-part template system for content structure, a prompt generator, and compartmentalized LLM output. Features category-based organization, YouTube embedding, Unsplash image integration, view tracking, real-time preview, and tooltip guidance. **UPDATED**: Two-image system for blog posts with heroImageUrl (beginning) and footerImageUrl (end) fields, each with independent upload and URL options.
- **Affiliate Product System**: Dynamic product cards with pricing, ratings, discounts. Organized categorization, external link tracking for affiliate commissions, and featured product promotion.
- **Newsletter System**: Email capture and toast notifications for user feedback.
- **Image Upload System**: Google Cloud Storage integration with direct upload functionality. Features file validation (5MB max, images only), automatic markdown insertion into blog content, and public ACL configuration for web serving. **REFINED**: Blog posts now support exactly two independent image fields - Hero image (displays at post beginning) and Footer image (displays at post end), each with separate upload/URL options for enhanced visual storytelling.

# Blog Content Standards

## Editorial Guidelines
The Karooma blog follows a strict content standard designed for the target persona (Cláudia - 39-year-old working mother) with focus on practical, empathetic content that simplifies family life.

### Content Structure (5 Required Elements)
1. **Emotional Hook (2-3 lines)**: "Você já passou por isso?" or "Aquele momento em que..."
2. **Problem Identification**: Empathetic description of the challenge
3. **Practical Solutions**: Numbered list (5-8 actionable tips)
4. **Bonus Section**: "Dica Extra" or special value-add content
5. **Personal Reflection**: Real experience that humanizes the content

### Voice & Tone Standards
- **Person**: Always 2nd person ("você") - creates intimacy and directness
- **Style**: Conversational, empathetic, practical - like an experienced friend
- **Validation**: Always acknowledge difficulties before offering solutions
- **Language**: Inclusive ("nós", "juntas") and non-judgmental
- **Phrases**: "Aqui está o que funcionou para mim", "A verdade é que...", "Está tudo bem sentir isso"

### Visual Concept: Origami Transformation
- **Hero Image**: Chaotic origami elements (problem/chaos) - children crying, messy house, stressed mom
- **Footer Image**: Harmonious origami elements (solution/peace) - happy family, organized environment
- **Style**: Papercraft aesthetic - folded, cut, and layered paper elements

### Category-Specific Templates
- **Educação**: Development activities + age-appropriate materials + progression tracking
- **Segurança**: Prevention protocols + emergency procedures + professional help guidance
- **Bem-estar**: Self-care practices + emotional validation + mental health resources  
- **Organização**: Practical systems + time-saving routines + maintenance tips
- **Alimentação**: Quick recipes + nutrition education + allergy considerations
- **Desenvolvimento**: Age milestones + stimulating activities + warning signs

### Quality Metrics
- **Length**: 1500-2500 words (8-12 min reading time)
- **Practical Tips**: Minimum 5, maximum 8 actionable items
- **Personal Touch**: At least 1 real experience or reflection required
- **Actionability**: 100% of tips must be immediately implementable
- **Empathy**: Emotional validation in every section

### Call-to-Action Sequence
1. **Newsletter**: "Assine nossa newsletter" - content subscription
2. **Products**: Recommend relevant affiliate products that solve the problem
3. **Community**: Comments, saving posts, sharing experiences

### Semantic Tags System
- **Urgency**: Solução Rápida, Projeto Fim de Semana, Planejamento
- **Investment**: Sem Custo, Baixo Investimento, Vale o Investimento  
- **Difficulty**: Fácil, Intermediário, Avançado
- **Age**: 0-2 anos, 3-6 anos, 7-10 anos, 11+ anos, Todas as idades
- **Setting**: Em Casa, Na Escola, Ao Ar Livre, Viagem

### Content Validation
All blog posts are automatically validated for:
- Required 5-element structure presence
- Appropriate voice and tone (2nd person, empathetic)
- Category-specific requirements fulfillment
- Origami visual concept compliance
- SEO optimization and readability

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

# E-book System Standards

## Visual Identity Pattern
- **Colors**: Karooma gradient scheme (purple-pink gradients: from-purple-600 to-pink-600)
- **Typography**: Fredoka One (headings), Poppins (body text), Inter (captions)
- **Style**: Origami papercraft aesthetic with chaos-to-harmony transformation
- **Layout**: Clean, modern, ample white space, mobile-first responsive

## E-book Structure Template
1. **Cover Page**: Title, subtitle, Karooma branding, origami hero image
2. **Welcome Page**: Personal message from Karooma team, empathetic tone
3. **Table of Contents**: Visual, organized sections with page numbers
4. **5-7 Main Chapters**: Following blog content structure (Hook → Problem → Solutions → Bonus → Reflection)
5. **Practical Checklists**: End of each chapter with actionable items
6. **Resource Section**: Templates, planners, quick reference guides
7. **Final Page**: Call-to-action for other products, newsletter signup

## Image Assets (Existing)
- **Hero Images**: House_organization_chaos_origami_2d1f488c.png, Wide_origami_home_organization_chaos_dbac14c5.png
- **Success Images**: Wide_origami_home_organization_peace_dd648e67.png, Organized_family_home_origami_28044657.png
- **Section Images**: Organized_playroom_origami_peace_2ade9726.png, Organized_time_management_origami_2ddfbdb0.png

## Content Standards for E-books
- **Target**: Working mothers seeking practical solutions
- **Tone**: Empathetic, supportive, conversational (2nd person)
- **Length**: 25-40 pages, 5000-8000 words
- **Validation**: Must acknowledge struggles before providing solutions
- **Actionability**: Every tip must be immediately implementable

## Technical Implementation
- **Format**: Interactive flipbook (HTML/CSS/JS) optimized for mobile
- **Template System**: Reusable React components with variable color schemes  
- **Layout**: Horizontal mobile-first design with touch gestures
- **Content Source**: Expandable from existing blog posts
- **Delivery**: Direct web links + optional PDF export

## Flipbook System Standards
- **Mobile-First**: Horizontal layout optimized for phone screens
- **Touch Gestures**: Swipe left/right navigation with visual feedback
- **Consistent Layout**: Same structure across all e-books, only colors vary
- **Color Schemes**: Variable color system for different topics
  - Organization: Purple-Pink gradient (#8b5cf6 to #ec4899)
  - Safety: Red-Orange gradient (to be defined)
  - Wellbeing: Green-Blue gradient (to be defined)
- **Page Structure**: Cover → Welcome → ToC → Chapters → Checklists → Testimonials → Final
- **Interactive Elements**: Page indicators, progress counter, navigation controls