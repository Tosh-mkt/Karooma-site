import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, decimal, index, json } from "drizzle-orm/pg-core";
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
export type User = typeof users.$inferSelect;
export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Section = typeof sections.$inferSelect;
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSchema>;
export type InsertNewsletterAdvanced = z.infer<typeof insertNewsletterAdvancedSchema>;

// Favorites types
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

// Authorized Flipbook Users types
export type AuthorizedFlipbookUser = typeof authorizedFlipbookUsers.$inferSelect;
export type InsertAuthorizedFlipbookUser = typeof authorizedFlipbookUsers.$inferInsert;

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

// Analytics types
export type FlipbookConversion = typeof flipbookConversions.$inferSelect;
export type InsertFlipbookConversion = typeof flipbookConversions.$inferInsert;
export type FlipbookModalTrigger = typeof flipbookModalTriggers.$inferSelect;
export type InsertFlipbookModalTrigger = typeof flipbookModalTriggers.$inferInsert;

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
