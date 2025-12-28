CREATE TABLE "accounts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar NOT NULL,
	"type" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"providerAccountId" varchar NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar,
	"scope" varchar,
	"id_token" text,
	"session_state" varchar
);
--> statement-breakpoint
CREATE TABLE "authorized_flipbook_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar NOT NULL,
	"flipbook_id" varchar NOT NULL,
	"added_by_admin" varchar NOT NULL,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "automation_jobs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"payload" json,
	"scheduled_for" timestamp DEFAULT now(),
	"attempts" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 3,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "automation_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stage" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"evidence" json,
	"completed_at" timestamp,
	"next_stage" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_conversations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar(100) NOT NULL,
	"user_id" varchar,
	"user_email" varchar(255),
	"user_name" varchar(255),
	"status" varchar(20) DEFAULT 'active',
	"metadata" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_knowledge_base" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"category" varchar(100),
	"keywords" text[] DEFAULT ARRAY[]::text[],
	"priority" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" varchar NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"rag_context" json,
	"tokens_used" integer,
	"llm_provider" varchar(50),
	"llm_model" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chatbot_config" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) DEFAULT 'Karooma Assistant' NOT NULL,
	"is_active" boolean DEFAULT true,
	"llm_provider" varchar(50) DEFAULT 'deepseek' NOT NULL,
	"llm_model" varchar(100) DEFAULT 'deepseek-chat' NOT NULL,
	"system_prompt" text NOT NULL,
	"temperature" numeric(2, 1) DEFAULT '0.7',
	"max_tokens" integer DEFAULT 1024,
	"rag_enabled" boolean DEFAULT true,
	"rag_sources" text[] DEFAULT ARRAY['missions', 'blog', 'products']::text[],
	"rag_max_results" integer DEFAULT 5,
	"welcome_message" text DEFAULT 'Olá! Sou a assistente virtual da Karooma. Como posso ajudar você hoje?',
	"suggested_questions" text[] DEFAULT ARRAY[]::text[],
	"widget_position" varchar(20) DEFAULT 'bottom-right',
	"widget_primary_color" varchar(20) DEFAULT '#6366f1',
	"widget_title" varchar(100) DEFAULT 'Precisa de ajuda?',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"type" text NOT NULL,
	"category" text,
	"image_url" text,
	"hero_image_url" text,
	"footer_image_url" text,
	"video_url" text,
	"youtube_id" text,
	"views" integer DEFAULT 0,
	"featured" boolean DEFAULT false,
	"is_published" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cookie_consents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar,
	"user_email" varchar,
	"necessary" boolean DEFAULT true NOT NULL,
	"analytics" boolean DEFAULT false NOT NULL,
	"marketing" boolean DEFAULT false NOT NULL,
	"ip_address" varchar,
	"user_agent" text,
	"consent_date" timestamp DEFAULT now(),
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "diagnostics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"user_name" varchar,
	"carga_mental" numeric(3, 2) NOT NULL,
	"tempo_da_casa" numeric(3, 2) NOT NULL,
	"tempo_de_qualidade" numeric(3, 2) NOT NULL,
	"alimentacao" numeric(3, 2) NOT NULL,
	"gestao_da_casa" numeric(3, 2) NOT NULL,
	"logistica_infantil" numeric(3, 2) NOT NULL,
	"quiz_answers" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "featured_apparel" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"montink_url" text NOT NULL,
	"category" varchar(50),
	"is_featured" boolean DEFAULT false,
	"related_mission_slugs" text[] DEFAULT ARRAY[]::text[],
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "flipbook_conversions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" varchar,
	"flipbook_theme" varchar NOT NULL,
	"email" varchar NOT NULL,
	"source" varchar NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"user_agent" text,
	"referrer" text,
	"ip_address" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "flipbook_modal_triggers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trigger_type" varchar NOT NULL,
	"post_id" varchar,
	"theme_id" varchar NOT NULL,
	"delay_seconds" integer,
	"scroll_percent" integer,
	"timestamp" timestamp DEFAULT now(),
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "flipbooks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" varchar NOT NULL,
	"theme_id" varchar NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'generating' NOT NULL,
	"preview_images" text[] DEFAULT '{}',
	"pages" json DEFAULT '[]'::json NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "flipbooks_post_id_unique" UNIQUE("post_id")
);
--> statement-breakpoint
CREATE TABLE "guide_posts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(200) NOT NULL,
	"title" text NOT NULL,
	"category" varchar(100) NOT NULL,
	"category_emoji" varchar(10),
	"reading_time" integer DEFAULT 5,
	"section_eu_te_entendo" text NOT NULL,
	"section_ciencia" text,
	"section_problema" text,
	"section_boa_noticia" text,
	"stats" json,
	"quote" text,
	"quote_author" varchar(100),
	"audio_url" text,
	"audio_duration" integer,
	"related_mission_slugs" text[],
	"hero_image_url" text,
	"meta_description" text,
	"views" integer DEFAULT 0,
	"featured" boolean DEFAULT false,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "guide_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "kit_products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kit_id" varchar NOT NULL,
	"asin" varchar(20) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"price" numeric(10, 2) NOT NULL,
	"original_price" numeric(10, 2),
	"rating" numeric(2, 1),
	"review_count" integer,
	"is_prime" boolean DEFAULT false,
	"role" varchar(20) NOT NULL,
	"rank_score" numeric(5, 4) NOT NULL,
	"task_match_score" numeric(5, 4),
	"rationale" text,
	"attributes" json,
	"added_via" varchar(20) NOT NULL,
	"affiliate_link" text NOT NULL,
	"matched_criteria" json,
	"score_breakdown" json,
	"sort_order" integer DEFAULT 0,
	"last_checked_at" timestamp,
	"availability_status" varchar(20) DEFAULT 'active',
	"failed_checks" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"age_segment" text,
	"differential" text
);
--> statement-breakpoint
CREATE TABLE "mission_favorites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"mission_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" varchar(200) NOT NULL,
	"category" varchar(100) NOT NULL,
	"energy_level" varchar(20),
	"estimated_minutes" integer,
	"understanding_text" text NOT NULL,
	"bonus_tip" text,
	"inspirational_quote" text,
	"frase_marca" text,
	"proposito_pratico" text,
	"descricao" text,
	"exemplos_de_produtos" text[],
	"tarefas_simples_de_execucao" json,
	"product_asins" text[],
	"diagnostic_areas" text[],
	"hero_image_url" text,
	"audio_url" text DEFAULT NULL,
	"meta_description" text,
	"featured" boolean DEFAULT false,
	"views" integer DEFAULT 0,
	"is_published" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "missions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"interests" json,
	"keywords" text[],
	"frequency" varchar(50) DEFAULT 'weekly',
	"content_types" text[],
	"source" varchar(100),
	"lead_magnet" varchar(100),
	"status" varchar(20) DEFAULT 'active',
	"preferences" json,
	"last_interaction" timestamp,
	"engagement_score" numeric(3, 1) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "newsletter_subscriptions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "notification_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"email" varchar,
	"channel" varchar NOT NULL,
	"endpoint" text,
	"active" boolean DEFAULT true,
	"preferences" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar NOT NULL,
	"title" text NOT NULL,
	"meta_description" text,
	"layout" text DEFAULT 'default' NOT NULL,
	"sections" text DEFAULT '[]' NOT NULL,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "product_issues" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kit_product_id" varchar,
	"kit_id" varchar NOT NULL,
	"asin" varchar(20) NOT NULL,
	"product_title" text,
	"issue_type" varchar(30) NOT NULL,
	"issue_details" json,
	"status" varchar(20) DEFAULT 'PENDING' NOT NULL,
	"priority" integer DEFAULT 1,
	"resolved_at" timestamp,
	"resolved_by" varchar,
	"resolution_notes" text,
	"email_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_kits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" varchar NOT NULL,
	"theme" text,
	"task_intent" varchar(100) NOT NULL,
	"problem_to_solve" json,
	"short_description" text NOT NULL,
	"long_description" text,
	"cover_image_url" text,
	"category" varchar(100),
	"generated_title" text,
	"generated_description" text,
	"generated_bullets" json,
	"schema_json_ld" text,
	"status" varchar(20) DEFAULT 'CONCEPT_ONLY' NOT NULL,
	"rules_config" json,
	"concept_items" json,
	"mission_id" varchar,
	"manual_asins" json,
	"views" integer DEFAULT 0,
	"paapi_enabled" boolean DEFAULT false,
	"last_resolved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_kits_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "product_mappings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"base_product_id" varchar NOT NULL,
	"equivalent_product_id" varchar NOT NULL,
	"region_id" varchar NOT NULL,
	"similarity_score" numeric(3, 2),
	"mapping_type" varchar(50) DEFAULT 'automatic',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_regional_data" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"region_id" varchar NOT NULL,
	"asin" varchar(10),
	"local_price" numeric(10, 2),
	"original_local_price" numeric(10, 2),
	"currency" varchar(3),
	"affiliate_link" text,
	"availability" varchar(50) DEFAULT 'unknown',
	"rating" numeric(2, 1),
	"review_count" integer,
	"is_prime" boolean DEFAULT false,
	"shipping_info" text,
	"localized_title" text,
	"localized_description" text,
	"amazon_regional_data" json,
	"last_checked" timestamp,
	"last_updated" timestamp,
	"check_frequency" varchar(20) DEFAULT 'medium',
	"failed_checks" integer DEFAULT 0,
	"is_available" boolean DEFAULT true,
	"unavailable_since" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_replacement_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kit_id" varchar NOT NULL,
	"issue_id" varchar,
	"old_asin" varchar(20) NOT NULL,
	"old_product_title" text,
	"new_asin" varchar(20) NOT NULL,
	"new_product_title" text,
	"replacement_reason" varchar(50),
	"replaced_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_taxonomies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"taxonomy_slug" varchar(100) NOT NULL,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"image_url" text,
	"current_price" numeric(10, 2),
	"original_price" numeric(10, 2),
	"affiliate_link" text NOT NULL,
	"product_link" text,
	"rating" numeric(2, 1),
	"discount" integer,
	"featured" boolean DEFAULT false,
	"expert_review" text,
	"team_evaluation" text,
	"benefits" text,
	"tags" text,
	"evaluators" text,
	"introduction" text,
	"nutritionist_evaluation" text,
	"organizer_evaluation" text,
	"design_evaluation" text,
	"karooma_team_evaluation" text,
	"category_tags" text,
	"search_tags" text,
	"asin" varchar(10),
	"brand" text,
	"review_count" integer,
	"is_prime" boolean DEFAULT false,
	"availability" varchar(50) DEFAULT 'available',
	"best_seller_rank" integer,
	"status" varchar(20) DEFAULT 'active',
	"last_checked" timestamp,
	"last_updated" timestamp,
	"update_frequency" varchar(20) DEFAULT 'medium',
	"auto_check_enabled" boolean DEFAULT true,
	"failed_checks" integer DEFAULT 0,
	"unavailable_since" timestamp,
	"amazon_data" json,
	"is_manually_edited" boolean DEFAULT false,
	"original_criteria" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "region_api_limits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region_id" varchar NOT NULL,
	"daily_request_limit" integer DEFAULT 1000,
	"current_daily_usage" integer DEFAULT 0,
	"monthly_budget" numeric(10, 2),
	"current_monthly_spent" numeric(10, 2) DEFAULT '0',
	"cost_per_request" numeric(5, 4),
	"last_reset" timestamp DEFAULT now(),
	"is_throttled" boolean DEFAULT false,
	"throttle_until" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"currency" varchar(3) NOT NULL,
	"language" varchar(5) NOT NULL,
	"amazon_domain" varchar NOT NULL,
	"affiliate_tag" varchar,
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 1,
	"timezone" varchar DEFAULT 'UTC',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"category" text,
	"template" text NOT NULL,
	"default_data" text DEFAULT '{}' NOT NULL,
	"schema" text DEFAULT '{}' NOT NULL,
	"preview" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sessionToken" varchar NOT NULL,
	"userId" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "sessions_sessionToken_unique" UNIQUE("sessionToken")
);
--> statement-breakpoint
CREATE TABLE "smart_link_analytics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" varchar NOT NULL,
	"original_region" varchar NOT NULL,
	"redirected_region" varchar NOT NULL,
	"user_agent" text,
	"ip_address" varchar,
	"was_available" boolean,
	"fallback_used" boolean DEFAULT false,
	"click_timestamp" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "taxonomies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" text NOT NULL,
	"parent_slug" varchar(100),
	"level" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "taxonomies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_alerts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar(20) NOT NULL,
	"product_id" varchar,
	"category" text,
	"min_discount_percent" integer DEFAULT 20,
	"notify_email" boolean DEFAULT true,
	"notify_push" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"last_checked" timestamp,
	"last_notified" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_location_cache" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" varchar NOT NULL,
	"country_code" varchar(2),
	"region_code" varchar(10),
	"city" varchar,
	"detected_region" varchar NOT NULL,
	"confidence" numeric(3, 2),
	"source" varchar(50),
	"browser_language" varchar,
	"timezone" varchar,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_regional_preferences" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar,
	"user_id" varchar,
	"preferred_region" varchar NOT NULL,
	"detected_region" varchar,
	"is_manual_selection" boolean DEFAULT false,
	"last_used" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"email" varchar,
	"emailVerified" timestamp,
	"image" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"password_hash" varchar,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "visitor_feedback" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) NOT NULL,
	"message" text NOT NULL,
	"visitor_name" varchar(255),
	"visitor_email" varchar(255),
	"conversation_context" text,
	"page_url" varchar(500),
	"user_agent" varchar(500),
	"status" varchar(50) DEFAULT 'pending',
	"admin_notes" text,
	"email_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostics" ADD CONSTRAINT "diagnostics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flipbooks" ADD CONSTRAINT "flipbooks_post_id_content_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kit_products" ADD CONSTRAINT "kit_products_kit_id_product_kits_id_fk" FOREIGN KEY ("kit_id") REFERENCES "public"."product_kits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_favorites" ADD CONSTRAINT "mission_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_favorites" ADD CONSTRAINT "mission_favorites_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_subscriptions" ADD CONSTRAINT "notification_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_issues" ADD CONSTRAINT "product_issues_kit_product_id_kit_products_id_fk" FOREIGN KEY ("kit_product_id") REFERENCES "public"."kit_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_issues" ADD CONSTRAINT "product_issues_kit_id_product_kits_id_fk" FOREIGN KEY ("kit_id") REFERENCES "public"."product_kits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_mappings" ADD CONSTRAINT "product_mappings_base_product_id_products_id_fk" FOREIGN KEY ("base_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_mappings" ADD CONSTRAINT "product_mappings_equivalent_product_id_products_id_fk" FOREIGN KEY ("equivalent_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_mappings" ADD CONSTRAINT "product_mappings_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_regional_data" ADD CONSTRAINT "product_regional_data_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_regional_data" ADD CONSTRAINT "product_regional_data_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_replacement_log" ADD CONSTRAINT "product_replacement_log_kit_id_product_kits_id_fk" FOREIGN KEY ("kit_id") REFERENCES "public"."product_kits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_replacement_log" ADD CONSTRAINT "product_replacement_log_issue_id_product_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."product_issues"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_taxonomies" ADD CONSTRAINT "product_taxonomies_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_taxonomies" ADD CONSTRAINT "product_taxonomies_taxonomy_slug_taxonomies_slug_fk" FOREIGN KEY ("taxonomy_slug") REFERENCES "public"."taxonomies"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "region_api_limits" ADD CONSTRAINT "region_api_limits_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_link_analytics" ADD CONSTRAINT "smart_link_analytics_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_link_analytics" ADD CONSTRAINT "smart_link_analytics_original_region_regions_id_fk" FOREIGN KEY ("original_region") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_link_analytics" ADD CONSTRAINT "smart_link_analytics_redirected_region_regions_id_fk" FOREIGN KEY ("redirected_region") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_alerts" ADD CONSTRAINT "user_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_alerts" ADD CONSTRAINT "user_alerts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_location_cache" ADD CONSTRAINT "user_location_cache_detected_region_regions_id_fk" FOREIGN KEY ("detected_region") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_regional_preferences" ADD CONSTRAINT "user_regional_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_regional_preferences" ADD CONSTRAINT "user_regional_preferences_preferred_region_regions_id_fk" FOREIGN KEY ("preferred_region") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_regional_preferences" ADD CONSTRAINT "user_regional_preferences_detected_region_regions_id_fk" FOREIGN KEY ("detected_region") REFERENCES "public"."regions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_provider_providerAccountId_index" ON "accounts" USING btree ("provider","providerAccountId");--> statement-breakpoint
CREATE INDEX "idx_authorized_email_flipbook" ON "authorized_flipbook_users" USING btree ("email","flipbook_id");--> statement-breakpoint
CREATE INDEX "idx_chat_conversations_session" ON "chat_conversations" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_chat_conversations_user" ON "chat_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_chat_kb_category" ON "chat_knowledge_base" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_chat_kb_active" ON "chat_knowledge_base" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_chat_messages_conversation" ON "chat_messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "idx_chat_messages_created" ON "chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "cookie_consents_session_idx" ON "cookie_consents" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "cookie_consents_email_idx" ON "cookie_consents" USING btree ("user_email");--> statement-breakpoint
CREATE INDEX "cookie_consents_date_idx" ON "cookie_consents" USING btree ("consent_date");--> statement-breakpoint
CREATE INDEX "idx_diagnostics_user_id" ON "diagnostics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_diagnostics_created_at" ON "diagnostics" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_favorites_user_id" ON "favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_favorites_product_id" ON "favorites" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "flipbook_conversions_theme_idx" ON "flipbook_conversions" USING btree ("flipbook_theme");--> statement-breakpoint
CREATE INDEX "flipbook_conversions_post_idx" ON "flipbook_conversions" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "flipbook_conversions_date_idx" ON "flipbook_conversions" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "flipbook_triggers_theme_idx" ON "flipbook_modal_triggers" USING btree ("theme_id");--> statement-breakpoint
CREATE INDEX "flipbook_triggers_post_idx" ON "flipbook_modal_triggers" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "flipbook_triggers_date_idx" ON "flipbook_modal_triggers" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "flipbooks_post_idx" ON "flipbooks" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "flipbooks_status_idx" ON "flipbooks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_guide_posts_category" ON "guide_posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_guide_posts_featured" ON "guide_posts" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "idx_guide_posts_published" ON "guide_posts" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_guide_posts_slug" ON "guide_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_kit_products_kit_id" ON "kit_products" USING btree ("kit_id");--> statement-breakpoint
CREATE INDEX "idx_kit_products_asin" ON "kit_products" USING btree ("asin");--> statement-breakpoint
CREATE INDEX "idx_mission_favorites_user_id" ON "mission_favorites" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_mission_favorites_mission_id" ON "mission_favorites" USING btree ("mission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_mission_favorites_unique" ON "mission_favorites" USING btree ("user_id","mission_id");--> statement-breakpoint
CREATE INDEX "idx_missions_category" ON "missions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_missions_featured" ON "missions" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "idx_missions_published" ON "missions" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "idx_product_issues_status" ON "product_issues" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_product_issues_kit" ON "product_issues" USING btree ("kit_id");--> statement-breakpoint
CREATE INDEX "idx_product_issues_type" ON "product_issues" USING btree ("issue_type");--> statement-breakpoint
CREATE INDEX "idx_product_issues_created" ON "product_issues" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_product_mapping_base" ON "product_mappings" USING btree ("base_product_id");--> statement-breakpoint
CREATE INDEX "idx_product_mapping_region" ON "product_mappings" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "idx_product_regional_product" ON "product_regional_data" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_regional_region" ON "product_regional_data" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "idx_product_regional_asin" ON "product_regional_data" USING btree ("asin");--> statement-breakpoint
CREATE INDEX "idx_product_regional_availability" ON "product_regional_data" USING btree ("is_available");--> statement-breakpoint
CREATE INDEX "idx_replacement_log_kit" ON "product_replacement_log" USING btree ("kit_id");--> statement-breakpoint
CREATE INDEX "idx_replacement_log_created" ON "product_replacement_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_product_taxonomies_product_id" ON "product_taxonomies" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_taxonomies_taxonomy_slug" ON "product_taxonomies" USING btree ("taxonomy_slug");--> statement-breakpoint
CREATE INDEX "idx_product_taxonomies_primary" ON "product_taxonomies" USING btree ("is_primary");--> statement-breakpoint
CREATE INDEX "idx_push_subscriptions_user_id" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_push_subscriptions_endpoint" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "idx_region_limits_region" ON "region_api_limits" USING btree ("region_id");--> statement-breakpoint
CREATE INDEX "idx_smart_link_product" ON "smart_link_analytics" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_smart_link_date" ON "smart_link_analytics" USING btree ("click_timestamp");--> statement-breakpoint
CREATE INDEX "idx_taxonomy_parent_slug" ON "taxonomies" USING btree ("parent_slug");--> statement-breakpoint
CREATE INDEX "idx_taxonomy_level" ON "taxonomies" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_taxonomy_sort_order" ON "taxonomies" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "idx_user_alerts_user_id" ON "user_alerts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_alerts_type" ON "user_alerts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_user_alerts_active" ON "user_alerts" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_user_location_ip" ON "user_location_cache" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "idx_user_location_expires" ON "user_location_cache" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_user_prefs_session" ON "user_regional_preferences" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_user_prefs_user" ON "user_regional_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verificationToken_identifier_token_index" ON "verificationToken" USING btree ("identifier","token");--> statement-breakpoint
CREATE INDEX "idx_visitor_feedback_type" ON "visitor_feedback" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_visitor_feedback_status" ON "visitor_feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_visitor_feedback_created" ON "visitor_feedback" USING btree ("created_at");