import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, decimal, index, uniqueIndex, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// NextAuth tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name"),
  email: varchar("email").unique(),
  emailVerified: timestamp("emailVerified"),
  image: varchar("image"),
  // Custom fields
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  passwordHash: varchar("password_hash"), // Para login com senha
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(),
  provider: varchar("provider").notNull(),
  providerAccountId: varchar("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type"),
  scope: varchar("scope"),
  id_token: text("id_token"),
  session_state: varchar("session_state"),
}, (account) => ({
  compoundKey: index().on(account.provider, account.providerAccountId),
}));

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: varchar("sessionToken").notNull().unique(),
  userId: varchar("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: varchar("identifier").notNull(),
  token: varchar("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
}, (vt) => ({
  compoundKey: index().on(vt.identifier, vt.token),
}));

// Password reset tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const content = pgTable("content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  type: text("type").notNull(), // video, blog, featured, page
  category: text("category"),
  imageUrl: text("image_url"),
  heroImageUrl: text("hero_image_url"), // Imagem no início do post
  footerImageUrl: text("footer_image_url"), // Imagem no final do post
  videoUrl: text("video_url"),
  youtubeId: text("youtube_id"),
  views: integer("views").default(0),
  featured: boolean("featured").default(false),
  isPublished: boolean("is_published").default(true), // Controle de publicação
  createdAt: timestamp("created_at").defaultNow(),
});

// Nova tabela para páginas com estrutura de blocos/seções
export const pages = pgTable("pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug").notNull().unique(), // URL da página (ex: "sobre", "contato")
  title: text("title").notNull(),
  metaDescription: text("meta_description"),
  layout: text("layout").notNull().default("default"), // Layout/template usado
  sections: text("sections").notNull().default("[]"), // JSON array de seções
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para seções reutilizáveis
export const sections = pgTable("sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Nome da seção
  type: text("type").notNull(), // hero, content, gallery, testimonials, etc.
  category: text("category"), // Para agrupar seções similares
  template: text("template").notNull(), // Estrutura HTML/componente
  defaultData: text("default_data").notNull().default("{}"), // Dados padrão em JSON
  schema: text("schema").notNull().default("{}"), // Schema de validação dos dados
  preview: text("preview"), // URL para preview da seção
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  affiliateLink: text("affiliate_link").notNull(),
  productLink: text("product_link"),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  discount: integer("discount"),
  featured: boolean("featured").default(false),
  // Campos expandidos para dados detalhados
  expertReview: text("expert_review"),
  teamEvaluation: text("team_evaluation"),
  benefits: text("benefits"),
  tags: text("tags"),
  evaluators: text("evaluators"),
  introduction: text("introduction"),
  // Novos campos baseados no formato fornecido
  nutritionistEvaluation: text("nutritionist_evaluation"),
  organizerEvaluation: text("organizer_evaluation"),
  designEvaluation: text("design_evaluation"),
  karoomaTeamEvaluation: text("karooma_team_evaluation"),
  categoryTags: text("category_tags"),
  searchTags: text("search_tags"),
  // Campos para integração PA API Amazon
  asin: varchar("asin", { length: 10 }), // Amazon Standard Identification Number
  brand: text("brand"), // Marca do produto
  reviewCount: integer("review_count"), // Número de avaliações
  isPrime: boolean("is_prime").default(false), // Elegível para Amazon Prime
  availability: varchar("availability", { length: 50 }).default("available"), // available, unavailable, limited
  bestSellerRank: integer("best_seller_rank"), // Ranking na categoria
  // Controle de atualização automática
  status: varchar("status", { length: 20 }).default("active"), // active, inactive, discontinued
  lastChecked: timestamp("last_checked"), // Última verificação PA API
  lastUpdated: timestamp("last_updated"), // Última atualização de dados
  updateFrequency: varchar("update_frequency", { length: 20 }).default("medium"), // high, medium, low
  autoCheckEnabled: boolean("auto_check_enabled").default(true),
  failedChecks: integer("failed_checks").default(0), // Contador de falhas consecutivas
  unavailableSince: timestamp("unavailable_since"), // Quando ficou indisponível
  // Cache de dados da API
  amazonData: json("amazon_data"), // Cache dos dados completos da PA API
  // Controle de edição manual e critérios originais
  isManuallyEdited: boolean("is_manually_edited").default(false), // Se foi editado manualmente (não sobrescreve em updates automáticos)
  originalCriteria: json("original_criteria"), // Critérios originais de seleção para buscar substitutos {category, priceRange, minRating, keywords}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela para produtos de vestuário (roupas Montink)
export const featuredApparel = pgTable("featured_apparel", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(), // ex: "Café antes de falar"
  description: text("description"), // ex: "Camiseta oversized"
  imageUrl: text("image_url").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  montinkUrl: text("montink_url").notNull(), // Link para produto na loja Montink
  category: varchar("category", { length: 50 }), // humor, empowerment, etc
  isFeatured: boolean("is_featured").default(false), // Aparece na página /produtos
  relatedMissionSlugs: text("related_mission_slugs").array().default(sql`ARRAY[]::text[]`), // Missões relacionadas
  sortOrder: integer("sort_order").default(0), // Ordem de exibição
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name"),
  // Preferências de interesse baseadas nas categorias dos produtos
  interests: json("interests"), // {categories: string[], audience: string[], environments: string[], occasions: string[]}
  keywords: text("keywords").array(), // palavras-chave específicas
  frequency: varchar("frequency", { length: 50 }).default("weekly"), // daily, weekly, monthly
  contentTypes: text("content_types").array(), // tipos de conteúdo preferidos
  // Metadados de captação
  source: varchar("source", { length: 100 }), // página de origem
  leadMagnet: varchar("lead_magnet", { length: 100 }), // qual oferta captou o lead
  status: varchar("status", { length: 20 }).default("active"), // active, paused, unsubscribed
  preferences: json("preferences"), // configurações adicionais personalizáveis
  // Analytics de engajamento
  lastInteraction: timestamp("last_interaction"),
  engagementScore: decimal("engagement_score", { precision: 3, scale: 1 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Favorites table for user-product relationships
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_favorites_user_id").on(table.userId),
  index("idx_favorites_product_id").on(table.productId),
]);

// Mission favorites table for user-mission relationships
export const missionFavorites = pgTable("mission_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  missionId: varchar("mission_id").notNull().references(() => missions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_mission_favorites_user_id").on(table.userId),
  index("idx_mission_favorites_mission_id").on(table.missionId),
  uniqueIndex("idx_mission_favorites_unique").on(table.userId, table.missionId),
]);

// Tabela para controlar acesso aos flipbooks
export const authorizedFlipbookUsers = pgTable("authorized_flipbook_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  flipbookId: varchar("flipbook_id").notNull(), // 'organizacao', 'bem-estar', etc.
  addedByAdmin: varchar("added_by_admin").notNull(), // ID do admin que adicionou
  notes: text("notes"), // Notas sobre o usuário
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"), // Opcional: data de expiração
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_authorized_email_flipbook").on(table.email, table.flipbookId),
]);

// Tabela de taxonomias hierárquicas para filtros de produtos
export const taxonomies = pgTable("taxonomies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // Identificador único (ex: "comer-e-preparar")
  name: text("name").notNull(), // Nome exibido (ex: "Comer e Preparar")
  parentSlug: varchar("parent_slug", { length: 100 }), // null para categorias raiz
  level: integer("level").notNull().default(1), // 1, 2, 3 para hierarquia
  sortOrder: integer("sort_order").default(0), // Ordem de exibição
  description: text("description"), // Descrição opcional
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_taxonomy_parent_slug").on(table.parentSlug),
  index("idx_taxonomy_level").on(table.level),
  index("idx_taxonomy_sort_order").on(table.sortOrder),
]);

// Tabela de relação muitos-para-muitos entre produtos e taxonomias
export const productTaxonomies = pgTable("product_taxonomies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  taxonomySlug: varchar("taxonomy_slug", { length: 100 }).notNull().references(() => taxonomies.slug, { onDelete: "cascade" }),
  isPrimary: boolean("is_primary").default(false), // Se é a taxonomia principal do produto
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_product_taxonomies_product_id").on(table.productId),
  index("idx_product_taxonomies_taxonomy_slug").on(table.taxonomySlug),
  index("idx_product_taxonomies_primary").on(table.isPrimary),
]);

// Tabela de Missões Resolvidas - conceito Vida Leve Coletiva
export const missions = pgTable("missions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(), // Ex: "Organize sua manhã em 10 minutos"
  slug: varchar("slug", { length: 200 }).notNull().unique(), // URL amigável
  category: varchar("category", { length: 100 }).notNull(), // Organização, Alimentação, Educação, etc.
  energyLevel: varchar("energy_level", { length: 20 }), // baixa, média, alta
  estimatedMinutes: integer("estimated_minutes"), // Tempo estimado em minutos
  understandingText: text("understanding_text").notNull(), // Texto empático sobre o problema
  bonusTip: text("bonus_tip"), // Dica extra prática
  inspirationalQuote: text("inspirational_quote"), // Frase emocional da marca
  fraseMarca: text("frase_marca"), // Frase de marca específica da missão
  propositoPratico: text("proposito_pratico"), // Propósito prático da missão
  descricao: text("descricao"), // Descrição geral da missão
  exemplosDeProdutos: text("exemplos_de_produtos").array(), // Exemplos de produtos que ajudam
  tarefasSimplesDeExecucao: json("tarefas_simples_de_execucao").$type<Array<{ task: string; subtext: string }>>(), // Checklist de tarefas com subtextos
  productAsins: text("product_asins").array(), // Lista de ASINs dos produtos da solução
  diagnosticAreas: text("diagnostic_areas").array(), // Áreas do diagnóstico que esta missão resolve: cargaMental, tempoDaCasa, tempoDeQualidade, alimentacao, gestaoDaCasa, logisticaInfantil
  heroImageUrl: text("hero_image_url"), // Imagem principal da missão
  audioUrl: text("audio_url").default(sql`NULL`), // URL do áudio de resumo da missão
  metaDescription: text("meta_description"), // SEO
  featured: boolean("featured").default(false), // Destaque na home
  views: integer("views").default(0), // Contador de visualizações
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_missions_category").on(table.category),
  index("idx_missions_featured").on(table.featured),
  index("idx_missions_published").on(table.isPublished),
]);

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
});

// Schema específico para registro de usuários
export const registerUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  firstName: z.string().min(1, "Nome é obrigatório").optional(),
  lastName: z.string().optional(),
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  views: true,
  createdAt: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSectionSchema = createInsertSchema(sections).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertFeaturedApparelSchema = createInsertSchema(featuredApparel).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema para taxonomias
export const insertTaxonomySchema = createInsertSchema(taxonomies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema para relação produto-taxonomia
export const insertProductTaxonomySchema = createInsertSchema(productTaxonomies).omit({
  id: true,
  createdAt: true,
});

// Schema para newsletter básico (apenas email)
export const insertNewsletterSchema = createInsertSchema(newsletterSubscriptions, {
  email: z.string().email(),
}).pick({
  email: true,
});

// Schema para newsletter expandido com preferências
export const insertNewsletterAdvancedSchema = createInsertSchema(newsletterSubscriptions, {
  email: z.string().email(),
  interests: z.any().optional(),
  keywords: z.any().optional(),
  preferences: z.any().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastInteraction: true,
  engagementScore: true,
}).extend({
  interests: z.object({
    categories: z.array(z.string()).optional(),
    audience: z.array(z.string()).optional(),
    environments: z.array(z.string()).optional(),
    occasions: z.array(z.string()).optional(),
  }).optional(),
  keywords: z.array(z.string()).optional(),
  contentTypes: z.array(z.string()).optional(),
  preferences: z.record(z.any()).optional(),
});

export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type User = typeof users.$inferSelect;
export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Section = typeof sections.$inferSelect;
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type FeaturedApparel = typeof featuredApparel.$inferSelect;
export type InsertFeaturedApparel = z.infer<typeof insertFeaturedApparelSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSchema>;
export type InsertNewsletterAdvanced = z.infer<typeof insertNewsletterAdvancedSchema>;

// Favorites types
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

// Mission Favorites types
export type MissionFavorite = typeof missionFavorites.$inferSelect;
export type InsertMissionFavorite = typeof missionFavorites.$inferInsert;

// Authorized Flipbook Users types
export type AuthorizedFlipbookUser = typeof authorizedFlipbookUsers.$inferSelect;
export type InsertAuthorizedFlipbookUser = typeof authorizedFlipbookUsers.$inferInsert;

// Taxonomy types
export type Taxonomy = typeof taxonomies.$inferSelect;
export type InsertTaxonomy = z.infer<typeof insertTaxonomySchema>;
export type ProductTaxonomy = typeof productTaxonomies.$inferSelect;
export type InsertProductTaxonomy = z.infer<typeof insertProductTaxonomySchema>;

// Tabelas para Analytics de Conversão
export const flipbookConversions = pgTable("flipbook_conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id"),
  flipbookTheme: varchar("flipbook_theme").notNull(),
  email: varchar("email").notNull(),
  source: varchar("source").notNull(), // post-modal, inline-button, floating-button
  timestamp: timestamp("timestamp").defaultNow(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("flipbook_conversions_theme_idx").on(table.flipbookTheme),
  index("flipbook_conversions_post_idx").on(table.postId),
  index("flipbook_conversions_date_idx").on(table.timestamp),
]);

export const flipbookModalTriggers = pgTable("flipbook_modal_triggers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  triggerType: varchar("trigger_type").notNull(), // time, scroll, manual
  postId: varchar("post_id"),
  themeId: varchar("theme_id").notNull(),
  delaySeconds: integer("delay_seconds"),
  scrollPercent: integer("scroll_percent"),
  timestamp: timestamp("timestamp").defaultNow(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("flipbook_triggers_theme_idx").on(table.themeId),
  index("flipbook_triggers_post_idx").on(table.postId),
  index("flipbook_triggers_date_idx").on(table.timestamp),
]);

// Tabela para flipbooks gerados automaticamente por post
export const flipbooks = pgTable("flipbooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().unique().references(() => content.id, { onDelete: "cascade" }),
  themeId: varchar("theme_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("generating"), // generating, ready, failed
  previewImages: text("preview_images").array().default([]),
  pages: json("pages").notNull().default([]), // Array de objetos página
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("flipbooks_post_idx").on(table.postId),
  index("flipbooks_status_idx").on(table.status),
]);

export const insertFlipbookSchema = createInsertSchema(flipbooks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tabela para consentimentos de cookies
export const cookieConsents = pgTable("cookie_consents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id"), // Para visitantes anônimos
  userEmail: varchar("user_email"), // Para usuários identificados (newsletter)
  necessary: boolean("necessary").notNull().default(true),
  analytics: boolean("analytics").notNull().default(false),
  marketing: boolean("marketing").notNull().default(false),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  consentDate: timestamp("consent_date").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
}, (table) => [
  index("cookie_consents_session_idx").on(table.sessionId),
  index("cookie_consents_email_idx").on(table.userEmail),
  index("cookie_consents_date_idx").on(table.consentDate),
]);

export const insertCookieConsentSchema = createInsertSchema(cookieConsents).omit({
  id: true,
  consentDate: true,
  lastUpdated: true,
});

// Analytics types
export type FlipbookConversion = typeof flipbookConversions.$inferSelect;
export type InsertFlipbookConversion = typeof flipbookConversions.$inferInsert;
export type FlipbookModalTrigger = typeof flipbookModalTriggers.$inferSelect;
export type InsertFlipbookModalTrigger = typeof flipbookModalTriggers.$inferInsert;

// Cookie Consent types
export type CookieConsent = typeof cookieConsents.$inferSelect;
export type InsertCookieConsent = z.infer<typeof insertCookieConsentSchema>;

// Flipbook types
export type Flipbook = typeof flipbooks.$inferSelect;
export type InsertFlipbook = z.infer<typeof insertFlipbookSchema>;

// ========================================
// GLOBALIZAÇÃO - SISTEMA MULTI-REGIONAL
// ========================================

// Tabela de regiões/marketplaces suportados
export const regions = pgTable("regions", {
  id: varchar("id").primaryKey(), // 'BR', 'US', 'ES', 'FR', 'DE', 'MX', etc.
  name: text("name").notNull(), // "Brasil", "Estados Unidos", etc.
  currency: varchar("currency", { length: 3 }).notNull(), // 'BRL', 'USD', 'EUR'
  language: varchar("language", { length: 5 }).notNull(), // 'pt-BR', 'en-US', 'es-ES'
  amazonDomain: varchar("amazon_domain").notNull(), // 'amazon.com.br', 'amazon.com'
  affiliateTag: varchar("affiliate_tag"), // Tag de afiliado para esta região
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(1), // Prioridade para fallback
  timezone: varchar("timezone").default("UTC"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dados regionais dos produtos (cache inteligente)
export const productRegionalData = pgTable("product_regional_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  regionId: varchar("region_id").notNull().references(() => regions.id, { onDelete: "cascade" }),
  asin: varchar("asin", { length: 10 }), // ASIN específico da região
  localPrice: decimal("local_price", { precision: 10, scale: 2 }),
  originalLocalPrice: decimal("original_local_price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }),
  affiliateLink: text("affiliate_link"), // Link de afiliado regionalizado
  availability: varchar("availability", { length: 50 }).default("unknown"),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  reviewCount: integer("review_count"),
  isPrime: boolean("is_prime").default(false),
  shippingInfo: text("shipping_info"),
  localizedTitle: text("localized_title"), // Título traduzido/adaptado
  localizedDescription: text("localized_description"),
  // Cache da PA API para esta região
  amazonRegionalData: json("amazon_regional_data"),
  // Controle de atualização
  lastChecked: timestamp("last_checked"),
  lastUpdated: timestamp("last_updated"),
  checkFrequency: varchar("check_frequency", { length: 20 }).default("medium"),
  failedChecks: integer("failed_checks").default(0),
  isAvailable: boolean("is_available").default(true),
  unavailableSince: timestamp("unavailable_since"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_product_regional_product").on(table.productId),
  index("idx_product_regional_region").on(table.regionId),
  index("idx_product_regional_asin").on(table.asin),
  index("idx_product_regional_availability").on(table.isAvailable),
]);

// Cache de consultas de localização de usuários
export const userLocationCache = pgTable("user_location_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: varchar("ip_address").notNull(),
  countryCode: varchar("country_code", { length: 2 }),
  regionCode: varchar("region_code", { length: 10 }),
  city: varchar("city"),
  detectedRegion: varchar("detected_region").notNull().references(() => regions.id),
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00 a 1.00
  source: varchar("source", { length: 50 }), // 'geoip', 'cloudflare', 'manual'
  browserLanguage: varchar("browser_language"),
  timezone: varchar("timezone"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(), // Cache expira em 7 dias
}, (table) => [
  index("idx_user_location_ip").on(table.ipAddress),
  index("idx_user_location_expires").on(table.expiresAt),
]);

// Preferências regionais do usuário (localStorage + banco)
export const userRegionalPreferences = pgTable("user_regional_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id"), // Para usuários não logados
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }), // Para usuários logados
  preferredRegion: varchar("preferred_region").notNull().references(() => regions.id),
  detectedRegion: varchar("detected_region").references(() => regions.id),
  isManualSelection: boolean("is_manual_selection").default(false),
  lastUsed: timestamp("last_used").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_user_prefs_session").on(table.sessionId),
  index("idx_user_prefs_user").on(table.userId),
]);

// Analytics de links inteligentes (para otimização)
export const smartLinkAnalytics = pgTable("smart_link_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  originalRegion: varchar("original_region").notNull().references(() => regions.id),
  redirectedRegion: varchar("redirected_region").notNull().references(() => regions.id),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  wasAvailable: boolean("was_available"),
  fallbackUsed: boolean("fallback_used").default(false),
  clickTimestamp: timestamp("click_timestamp").defaultNow(),
}, (table) => [
  index("idx_smart_link_product").on(table.productId),
  index("idx_smart_link_date").on(table.clickTimestamp),
]);

// Configurações de custo e orçamento da PA API por região
export const regionApiLimits = pgTable("region_api_limits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  regionId: varchar("region_id").notNull().references(() => regions.id, { onDelete: "cascade" }),
  dailyRequestLimit: integer("daily_request_limit").default(1000),
  currentDailyUsage: integer("current_daily_usage").default(0),
  monthlyBudget: decimal("monthly_budget", { precision: 10, scale: 2 }),
  currentMonthlySpent: decimal("current_monthly_spent", { precision: 10, scale: 2 }).default("0"),
  costPerRequest: decimal("cost_per_request", { precision: 5, scale: 4 }), // Em USD
  lastReset: timestamp("last_reset").defaultNow(),
  isThrottled: boolean("is_throttled").default(false),
  throttleUntil: timestamp("throttle_until"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_region_limits_region").on(table.regionId),
]);

// Tabela de produtos similares/equivalentes entre regiões
export const productMappings = pgTable("product_mappings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  baseProductId: varchar("base_product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  equivalentProductId: varchar("equivalent_product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  regionId: varchar("region_id").notNull().references(() => regions.id),
  similarityScore: decimal("similarity_score", { precision: 3, scale: 2 }), // 0.00 a 1.00
  mappingType: varchar("mapping_type", { length: 50 }).default("automatic"), // 'automatic', 'manual', 'ai-generated'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_product_mapping_base").on(table.baseProductId),
  index("idx_product_mapping_region").on(table.regionId),
]);

// Insert schemas para as novas tabelas
export const insertRegionSchema = createInsertSchema(regions).omit({
  createdAt: true,
});

export const insertProductRegionalDataSchema = createInsertSchema(productRegionalData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserLocationCacheSchema = createInsertSchema(userLocationCache).omit({
  id: true,
  createdAt: true,
});

export const insertUserRegionalPreferencesSchema = createInsertSchema(userRegionalPreferences).omit({
  id: true,
  createdAt: true,
});

export const insertSmartLinkAnalyticsSchema = createInsertSchema(smartLinkAnalytics).omit({
  id: true,
  clickTimestamp: true,
});

export const insertRegionApiLimitsSchema = createInsertSchema(regionApiLimits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductMappingsSchema = createInsertSchema(productMappings).omit({
  id: true,
  createdAt: true,
});

// Types para as novas tabelas
export type Region = typeof regions.$inferSelect;
export type InsertRegion = z.infer<typeof insertRegionSchema>;
export type ProductRegionalData = typeof productRegionalData.$inferSelect;
export type InsertProductRegionalData = z.infer<typeof insertProductRegionalDataSchema>;
export type UserLocationCache = typeof userLocationCache.$inferSelect;
export type InsertUserLocationCache = z.infer<typeof insertUserLocationCacheSchema>;
export type UserRegionalPreferences = typeof userRegionalPreferences.$inferSelect;
export type InsertUserRegionalPreferences = z.infer<typeof insertUserRegionalPreferencesSchema>;
export type SmartLinkAnalytics = typeof smartLinkAnalytics.$inferSelect;
export type InsertSmartLinkAnalytics = z.infer<typeof insertSmartLinkAnalyticsSchema>;
export type RegionApiLimits = typeof regionApiLimits.$inferSelect;
export type InsertRegionApiLimits = z.infer<typeof insertRegionApiLimitsSchema>;
export type ProductMappings = typeof productMappings.$inferSelect;
export type InsertProductMappings = z.infer<typeof insertProductMappingsSchema>;

// Marketing Automation System Tables
export const automationJobs = pgTable("automation_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // 'send_email', 'push_notification', 'price_alert', etc.
  status: varchar("status").default("pending"), // 'pending', 'processing', 'completed', 'failed'
  payload: json("payload"), // Job data as JSON
  scheduledFor: timestamp("scheduled_for").defaultNow(),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(3),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const automationProgress = pgTable("automation_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stage: varchar("stage").notNull(), // 'day_1', 'day_2', 'day_3', etc.
  status: varchar("status").default("pending"), // 'pending', 'in_progress', 'completed'
  evidence: json("evidence"), // Proof of completion
  completedAt: timestamp("completed_at"),
  nextStage: varchar("next_stage"), // Next recommended stage
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const notificationSubscriptions = pgTable("notification_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  email: varchar("email"), // For non-registered users
  channel: varchar("channel").notNull(), // 'email', 'push', 'whatsapp', 'telegram'
  endpoint: text("endpoint"), // Push endpoint or phone number
  active: boolean("active").default(true),
  preferences: json("preferences"), // Channel-specific preferences
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User alerts for price drops and promotions
export const userAlerts = pgTable("user_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // 'product' or 'category'
  productId: varchar("product_id").references(() => products.id, { onDelete: "cascade" }),
  category: text("category"), // Category name for category-based alerts
  minDiscountPercent: integer("min_discount_percent").default(20), // Minimum discount % to trigger
  notifyEmail: boolean("notify_email").default(true),
  notifyPush: boolean("notify_push").default(true),
  isActive: boolean("is_active").default(true),
  lastChecked: timestamp("last_checked"),
  lastNotified: timestamp("last_notified"), // When last notification was sent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_alerts_user_id").on(table.userId),
  index("idx_user_alerts_type").on(table.type),
  index("idx_user_alerts_active").on(table.isActive),
]);

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_push_subscriptions_user_id").on(table.userId),
  index("idx_push_subscriptions_endpoint").on(table.endpoint),
]);

// Diagnostic results for mom routine assessment (radar chart)
export const diagnostics = pgTable("diagnostics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  userName: varchar("user_name"), // Nome para personalização "Seu panorama está pronto, Ana!"
  // Scores das 6 áreas da vida materna (0-5)
  cargaMental: decimal("carga_mental", { precision: 3, scale: 2 }).notNull(), // Mental Load
  tempoDaCasa: decimal("tempo_da_casa", { precision: 3, scale: 2 }).notNull(), // House Time
  tempoDeQualidade: decimal("tempo_de_qualidade", { precision: 3, scale: 2 }).notNull(), // Quality Time
  alimentacao: decimal("alimentacao", { precision: 3, scale: 2 }).notNull(), // Nutrition
  gestaoDaCasa: decimal("gestao_da_casa", { precision: 3, scale: 2 }).notNull(), // House Management
  logisticaInfantil: decimal("logistica_infantil", { precision: 3, scale: 2 }).notNull(), // Child Logistics
  // Metadata
  quizAnswers: text("quiz_answers"), // JSON com respostas do quiz
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_diagnostics_user_id").on(table.userId),
  index("idx_diagnostics_created_at").on(table.createdAt),
]);

// Zod schemas for automation system
export const insertAutomationJobSchema = createInsertSchema(automationJobs).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertAutomationProgressSchema = createInsertSchema(automationProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSubscriptionSchema = createInsertSchema(notificationSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserAlertSchema = createInsertSchema(userAlerts).omit({
  id: true,
  lastChecked: true,
  lastNotified: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiagnosticSchema = createInsertSchema(diagnostics).omit({
  id: true,
  createdAt: true,
});

export const insertMissionSchema = createInsertSchema(missions).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  energyLevel: z.enum(["baixa", "média", "alta"]).nullable().optional(),
  estimatedMinutes: z.coerce.number().int().min(0).nullable().optional(),
  bonusTip: z.string().nullable().optional(),
  inspirationalQuote: z.string().nullable().optional(),
  fraseMarca: z.string().nullable().optional(),
  propositoPratico: z.string().nullable().optional(),
  descricao: z.string().nullable().optional(),
  exemplosDeProdutos: z.array(z.string()).nullable().optional(),
  tarefasSimplesDeExecucao: z.array(z.object({ task: z.string(), subtext: z.string() })).nullable().optional(),
  productAsins: z.array(z.string()).nullable().optional(),
  diagnosticAreas: z.array(z.string()).nullable().optional(),
  heroImageUrl: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export type InsertMission = z.infer<typeof insertMissionSchema>;
export type SelectMission = typeof missions.$inferSelect;
export type InsertDiagnostic = z.infer<typeof insertDiagnosticSchema>;
export type SelectDiagnostic = typeof diagnostics.$inferSelect;

// ========================================
// Posts de Guia - Bridge entre teoria e prática
// ========================================

export const guidePosts = pgTable("guide_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: text("title").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Rotina Matinal, Casa em Ordem, etc.
  categoryEmoji: varchar("category_emoji", { length: 10 }), // ☀️, 🏠, 🍳, etc.
  readingTime: integer("reading_time").default(5), // Tempo de leitura em minutos
  
  // Seções de conteúdo
  sectionEuTeEntendo: text("section_eu_te_entendo").notNull(), // Validação empática
  sectionCiencia: text("section_ciencia"), // O que a ciência diz
  sectionProblema: text("section_problema"), // Por que o problema existe
  sectionBoaNoticia: text("section_boa_noticia"), // A boa notícia / solução
  
  // Estatísticas para a seção de ciência
  stats: json("stats").$type<Array<{ value: string; label: string; color?: string }>>(),
  
  // Citação inspiracional
  quote: text("quote"),
  quoteAuthor: varchar("quote_author", { length: 100 }),
  
  // Áudio
  audioUrl: text("audio_url"),
  audioDuration: integer("audio_duration"), // Duração em segundos
  
  // Missões relacionadas (slugs das missões)
  relatedMissionSlugs: text("related_mission_slugs").array(),
  
  // SEO e imagem
  heroImageUrl: text("hero_image_url"),
  metaDescription: text("meta_description"),
  
  // Controle
  views: integer("views").default(0),
  featured: boolean("featured").default(false),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_guide_posts_category").on(table.category),
  index("idx_guide_posts_featured").on(table.featured),
  index("idx_guide_posts_published").on(table.isPublished),
  index("idx_guide_posts_slug").on(table.slug),
]);

export const insertGuidePostSchema = createInsertSchema(guidePosts).omit({
  id: true,
  views: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  readingTime: z.coerce.number().int().min(1).optional(),
  stats: z.array(z.object({ 
    value: z.string(), 
    label: z.string(), 
    color: z.string().optional() 
  })).nullable().optional(),
  relatedMissionSlugs: z.array(z.string()).nullable().optional(),
  audioDuration: z.coerce.number().int().min(0).nullable().optional(),
  featured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export type InsertGuidePost = z.infer<typeof insertGuidePostSchema>;
export type SelectGuidePost = typeof guidePosts.$inferSelect;

export type InsertAutomationJob = z.infer<typeof insertAutomationJobSchema>;
export type SelectAutomationJob = typeof automationJobs.$inferSelect;
export type InsertAutomationProgress = z.infer<typeof insertAutomationProgressSchema>;
export type SelectAutomationProgress = typeof automationProgress.$inferSelect;
export type InsertNotificationSubscription = z.infer<typeof insertNotificationSubscriptionSchema>;
export type SelectNotificationSubscription = typeof notificationSubscriptions.$inferSelect;
export type InsertUserAlert = z.infer<typeof insertUserAlertSchema>;
export type SelectUserAlert = typeof userAlerts.$inferSelect;
export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type SelectPushSubscription = typeof pushSubscriptions.$inferSelect;

// Password reset token schemas
export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type SelectPasswordResetToken = typeof passwordResetTokens.$inferSelect;

// Automation API validation schemas
export const startStageSchema = z.object({
  stageId: z.enum(['day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7'])
});

export const completeStageSchema = z.object({
  stageId: z.enum(['day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7']),
  evidence: z.record(z.any()).optional()
});

export type StartStageRequest = z.infer<typeof startStageSchema>;
export type CompleteStageRequest = z.infer<typeof completeStageSchema>;

// Password reset API validation schemas
export const requestPasswordResetSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
});

export type RequestPasswordReset = z.infer<typeof requestPasswordResetSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;

// ========================================
// PRODUCT KITS SYSTEM - Automated Affiliate Kits
// ========================================

// Enum types for ProductKit system
export const KitProductRole = {
  MAIN: 'MAIN',
  SECONDARY: 'SECONDARY',
  COMPLEMENT: 'COMPLEMENT'
} as const;

export const KitStatus = {
  CONCEPT_ONLY: 'CONCEPT_ONLY',
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  ERROR: 'ERROR'
} as const;

export const KitProductSource = {
  API: 'API',
  MANUAL: 'MANUAL',
  SUBSTITUTE: 'SUBSTITUTE'
} as const;

// Database Tables for Product Kits System
export const productKits = pgTable("product_kits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  theme: text("theme"),
  taskIntent: varchar("task_intent", { length: 100 }).notNull(),
  problemToSolve: json("problem_to_solve").$type<string[]>(),
  shortDescription: text("short_description").notNull(),
  longDescription: text("long_description"),
  coverImageUrl: text("cover_image_url"),
  category: varchar("category", { length: 100 }),
  generatedTitle: text("generated_title"),
  generatedDescription: text("generated_description"),
  generatedBullets: json("generated_bullets").$type<string[]>(),
  schemaJsonLd: text("schema_json_ld"),
  status: varchar("status", { length: 20 }).notNull().default('CONCEPT_ONLY'),
  rulesConfig: json("rules_config").$type<KitRulesConfig>(),
  conceptItems: json("concept_items").$type<KitConceptItem[]>(),
  missionId: varchar("mission_id"),
  views: integer("views").default(0),
  paapiEnabled: boolean("paapi_enabled").default(false),
  lastResolvedAt: timestamp("last_resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const kitProducts = pgTable("kit_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  kitId: varchar("kit_id").notNull().references(() => productKits.id, { onDelete: "cascade" }),
  asin: varchar("asin", { length: 20 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  reviewCount: integer("review_count"),
  isPrime: boolean("is_prime").default(false),
  role: varchar("role", { length: 20 }).notNull(),
  rankScore: decimal("rank_score", { precision: 5, scale: 4 }).notNull(),
  taskMatchScore: decimal("task_match_score", { precision: 5, scale: 4 }),
  rationale: text("rationale"),
  attributes: json("attributes").$type<KitProductAttributes>(),
  addedVia: varchar("added_via", { length: 20 }).notNull(),
  affiliateLink: text("affiliate_link").notNull(),
  matchedCriteria: json("matched_criteria"),
  scoreBreakdown: json("score_breakdown").$type<KitProductScoreBreakdown>(),
  sortOrder: integer("sort_order").default(0),
  lastCheckedAt: timestamp("last_checked_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_kit_products_kit_id").on(table.kitId),
  index("idx_kit_products_asin").on(table.asin),
]);

// Conceptual Item structure (from PreASIN documentation)
export interface KitConceptItemCriteria {
  mustKeywords: string[];
  optionalKeywords?: string[];
  category?: string;
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  primeOnly?: boolean;
  featureFlags?: string[];
}

export interface KitConceptItem {
  name: string;
  role: typeof KitProductRole[keyof typeof KitProductRole];
  weight?: number;
  criteria: KitConceptItemCriteria;
  resolvedAsin?: string;
}

// TypeScript types for ProductKit system (MVP - frontend types only)
export interface KitKeywordGroup {
  name: string;
  keywords: string[];
  weight: number;
}

export interface KitMustHaveType {
  type: typeof KitProductRole[keyof typeof KitProductRole];
  minCount: number;
}

export interface KitFallbackStrategy {
  useManualAsins: boolean;
  substituteByCategory: boolean;
}

export interface KitPriceRange {
  min: number;
  max: number;
}

export interface KitTypeWeights {
  MAIN: number;
  SECONDARY: number;
  COMPLEMENT: number;
}

export interface KitAttributeWeights {
  easyCleaning?: number;
  compact?: number;
  lowMaintenance?: number;
  durable?: number;
  portable?: number;
}

export interface KitRulesConfig {
  keywordGroups: KitKeywordGroup[];
  typeWeights: KitTypeWeights;
  minItems: number;
  maxItems: number;
  mustHaveTypes: KitMustHaveType[];
  priceRange: KitPriceRange;
  ratingMin: number;
  primeOnly: boolean;
  excludeAsins: string[];
  allowedCategories: string[];
  attributeWeights?: KitAttributeWeights;
  updateFrequency: 'hourly' | 'daily' | 'weekly';
  fallbackStrategy: KitFallbackStrategy;
}

export interface KitProductAttributes {
  easyCleaning?: number;
  compact?: number;
  lowMaintenance?: number;
  durable?: number;
  portable?: number;
}

// Score breakdown for transparency and debugging
export interface KitProductScoreBreakdown {
  valueScore: number;           // Base value score (rating × weight + discount × weight - price × weight)
  reviewMultiplier: number;     // 1 + log10(reviewCount + 1) × weight
  finalScore: number;           // valueScore × reviewMultiplier
  priceNormalized: number;      // Normalized price (0-1)
  ratingNormalized: number;     // Normalized rating (0-1)
  discountNormalized: number;   // Normalized discount (0-1)
  reviewCount: number;          // Raw review count for tie-breaking
  calculatedAt: string;         // ISO timestamp
}

export interface KitProduct {
  id: string;
  kitId: string;
  asin: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  isPrime?: boolean;
  role: typeof KitProductRole[keyof typeof KitProductRole];
  rankScore: number;
  taskMatchScore?: number;
  rationale?: string;
  attributes?: KitProductAttributes;
  addedVia: typeof KitProductSource[keyof typeof KitProductSource];
  affiliateLink: string;
  scoreBreakdown?: KitProductScoreBreakdown;
  lastCheckedAt?: Date;
}

export interface ProductKit {
  id: string;
  title: string;
  slug: string;
  theme?: string;
  taskIntent: string;
  problemToSolve?: string[];
  shortDescription: string;
  longDescription?: string;
  coverImageUrl?: string;
  category?: string;
  generatedTitle?: string;
  generatedDescription?: string;
  generatedBullets?: string[];
  schemaJsonLd?: string;
  status: typeof KitStatus[keyof typeof KitStatus];
  rulesConfig?: KitRulesConfig;
  conceptItems?: KitConceptItem[];
  products: KitProduct[];
  missionId?: string;
  views?: number;
  paapiEnabled?: boolean;
  lastResolvedAt?: Date;
  updatedAt?: Date;
  createdAt?: Date;
}

// Insert schemas for future database integration
export const insertKitProductSchema = z.object({
  kitId: z.string(),
  asin: z.string(),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  price: z.number(),
  originalPrice: z.number().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  isPrime: z.boolean().optional(),
  role: z.enum(['MAIN', 'SECONDARY', 'COMPLEMENT', 'SUPPORT', 'OPTIONAL']),
  rankScore: z.number(),
  taskMatchScore: z.number().optional(),
  rationale: z.string().optional(),
  attributes: z.record(z.number()).optional(),
  addedVia: z.enum(['API', 'MANUAL', 'SUBSTITUTE']),
  affiliateLink: z.string(),
});

export const kitRulesConfigSchema = z.object({
  keywordGroups: z.array(z.object({
    name: z.string(),
    keywords: z.array(z.string()),
    weight: z.number()
  })),
  typeWeights: z.object({
    MAIN: z.number(),
    SECONDARY: z.number(),
    COMPLEMENT: z.number()
  }),
  minItems: z.number().min(1).max(20),
  maxItems: z.number().min(1).max(20),
  mustHaveTypes: z.array(z.object({
    type: z.enum(['MAIN', 'SECONDARY', 'COMPLEMENT']),
    minCount: z.number()
  })),
  priceRange: z.object({
    min: z.number(),
    max: z.number()
  }),
  ratingMin: z.number().min(0).max(5),
  primeOnly: z.boolean(),
  excludeAsins: z.array(z.string()),
  allowedCategories: z.array(z.string()),
  attributeWeights: z.object({
    easyCleaning: z.number().optional(),
    compact: z.number().optional(),
    lowMaintenance: z.number().optional(),
    durable: z.number().optional(),
    portable: z.number().optional()
  }).optional(),
  updateFrequency: z.enum(['hourly', 'daily', 'weekly']),
  fallbackStrategy: z.object({
    useManualAsins: z.boolean(),
    substituteByCategory: z.boolean()
  })
});

// Concept item criteria schema (for PA-API search)
export const kitConceptItemCriteriaSchema = z.object({
  mustKeywords: z.array(z.string()),
  optionalKeywords: z.array(z.string()).optional(),
  category: z.string().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  ratingMin: z.number().optional(),
  primeOnly: z.boolean().optional(),
  featureFlags: z.array(z.string()).optional(),
});

const roleEnumWithSynonyms = z.string().transform((val) => {
  const normalized = val.toUpperCase();
  if (normalized === 'SUPPORT') return 'SECONDARY' as const;
  if (normalized === 'OPTIONAL') return 'COMPLEMENT' as const;
  return normalized as 'MAIN' | 'SECONDARY' | 'COMPLEMENT';
}).pipe(z.enum(['MAIN', 'SECONDARY', 'COMPLEMENT']));

export const kitConceptItemSchema = z.object({
  name: z.string(),
  role: roleEnumWithSynonyms,
  weight: z.number().optional(),
  description: z.string().optional(),
  criteria: kitConceptItemCriteriaSchema,
  resolvedAsin: z.string().optional(),
});

export const insertProductKitSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  theme: z.string().optional(),
  taskIntent: z.string(),
  problemToSolve: z.array(z.string()).optional(),
  shortDescription: z.string(),
  longDescription: z.string().optional(),
  coverImageUrl: z.string().optional(),
  category: z.string().optional(),
  generatedTitle: z.string().optional(),
  generatedDescription: z.string().optional(),
  generatedBullets: z.array(z.string()).optional(),
  schemaJsonLd: z.string().optional(),
  status: z.enum(['CONCEPT_ONLY', 'DRAFT', 'ACTIVE', 'NEEDS_REVIEW', 'ERROR']).default('CONCEPT_ONLY'),
  rulesConfig: kitRulesConfigSchema.optional(),
  conceptItems: z.array(kitConceptItemSchema).optional(),
  missionId: z.string().optional(),
  paapiEnabled: z.boolean().optional(),
});

export type InsertKitProduct = z.infer<typeof insertKitProductSchema>;
export type InsertProductKit = z.infer<typeof insertProductKitSchema>;
export type SelectProductKit = typeof productKits.$inferSelect;
export type SelectKitProduct = typeof kitProducts.$inferSelect;

// ========================================
// AI CHATBOT SYSTEM - DeepSeek + RAG
// ========================================

// Supported LLM providers
export const LLMProviders = {
  DEEPSEEK: 'deepseek',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GEMINI: 'gemini',
} as const;

// RAG content sources
export const RAGSources = {
  MISSIONS: 'missions',
  BLOG: 'blog',
  PRODUCTS: 'products',
  KITS: 'kits',
  CUSTOM: 'custom',
} as const;

// Chatbot configuration table - admin configurable
export const chatbotConfig = pgTable("chatbot_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().default("Karooma Assistant"),
  isActive: boolean("is_active").default(true),
  llmProvider: varchar("llm_provider", { length: 50 }).notNull().default("deepseek"),
  llmModel: varchar("llm_model", { length: 100 }).notNull().default("deepseek-chat"),
  systemPrompt: text("system_prompt").notNull(),
  temperature: decimal("temperature", { precision: 2, scale: 1 }).default("0.7"),
  maxTokens: integer("max_tokens").default(1024),
  ragEnabled: boolean("rag_enabled").default(true),
  ragSources: text("rag_sources").array().default(sql`ARRAY['missions', 'blog', 'products']::text[]`),
  ragMaxResults: integer("rag_max_results").default(5),
  welcomeMessage: text("welcome_message").default("Olá! Sou a assistente virtual da Karooma. Como posso ajudar você hoje?"),
  suggestedQuestions: text("suggested_questions").array().default(sql`ARRAY[]::text[]`),
  widgetPosition: varchar("widget_position", { length: 20 }).default("bottom-right"),
  widgetPrimaryColor: varchar("widget_primary_color", { length: 20 }).default("#6366f1"),
  widgetTitle: varchar("widget_title", { length: 100 }).default("Precisa de ajuda?"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat conversations
export const chatConversations = pgTable("chat_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: varchar("user_email", { length: 255 }),
  userName: varchar("user_name", { length: 255 }),
  status: varchar("status", { length: 20 }).default("active"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_chat_conversations_session").on(table.sessionId),
  index("idx_chat_conversations_user").on(table.userId),
]);

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => chatConversations.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  ragContext: json("rag_context"),
  tokensUsed: integer("tokens_used"),
  llmProvider: varchar("llm_provider", { length: 50 }),
  llmModel: varchar("llm_model", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_chat_messages_conversation").on(table.conversationId),
  index("idx_chat_messages_created").on(table.createdAt),
]);

// Custom RAG knowledge base entries (for adding custom Q&A)
export const chatKnowledgeBase = pgTable("chat_knowledge_base", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }),
  keywords: text("keywords").array().default(sql`ARRAY[]::text[]`),
  priority: integer("priority").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_chat_kb_category").on(table.category),
  index("idx_chat_kb_active").on(table.isActive),
]);

// Visitor feedback (sugestões, reclamações, pedidos)
export const visitorFeedback = pgTable("visitor_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 50 }).notNull(), // suggestion, complaint, request
  message: text("message").notNull(),
  visitorName: varchar("visitor_name", { length: 255 }),
  visitorEmail: varchar("visitor_email", { length: 255 }),
  conversationContext: text("conversation_context"), // Contexto da conversa
  pageUrl: varchar("page_url", { length: 500 }), // Página onde estava
  userAgent: varchar("user_agent", { length: 500 }),
  status: varchar("status", { length: 50 }).default("pending"), // pending, reviewed, resolved
  adminNotes: text("admin_notes"),
  emailSent: boolean("email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_visitor_feedback_type").on(table.type),
  index("idx_visitor_feedback_status").on(table.status),
  index("idx_visitor_feedback_created").on(table.createdAt),
]);

// Schemas
export const insertVisitorFeedbackSchema = createInsertSchema(visitorFeedback).omit({
  id: true,
  emailSent: true,
  status: true,
  adminNotes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatbotConfigSchema = createInsertSchema(chatbotConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertChatKnowledgeBaseSchema = createInsertSchema(chatKnowledgeBase).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type ChatbotConfig = typeof chatbotConfig.$inferSelect;
export type InsertChatbotConfig = z.infer<typeof insertChatbotConfigSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatKnowledgeBase = typeof chatKnowledgeBase.$inferSelect;
export type InsertChatKnowledgeBase = z.infer<typeof insertChatKnowledgeBaseSchema>;

// LLM Provider type
export type LLMProvider = typeof LLMProviders[keyof typeof LLMProviders];
export type RAGSource = typeof RAGSources[keyof typeof RAGSources];

// Visitor feedback types
export type VisitorFeedback = typeof visitorFeedback.$inferSelect;
export type InsertVisitorFeedback = z.infer<typeof insertVisitorFeedbackSchema>;
