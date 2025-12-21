import { db } from "../db";
import { missions, content, products, productKits, chatKnowledgeBase } from "@shared/schema";
import { eq, ilike, or, and, sql, desc } from "drizzle-orm";
import type { RAGSource } from "@shared/schema";

interface RAGResult {
  source: RAGSource;
  type: string;
  title: string;
  content: string;
  url?: string;
  relevanceScore: number;
  metadata?: Record<string, unknown>;
}

interface RAGSearchOptions {
  sources: RAGSource[];
  maxResults: number;
  minRelevance?: number;
}

export class RAGService {
  async search(query: string, options: RAGSearchOptions): Promise<RAGResult[]> {
    const { sources, maxResults, minRelevance = 0 } = options;
    const results: RAGResult[] = [];

    const searchPromises = sources.map(async (source) => {
      switch (source) {
        case "missions":
          return this.searchMissions(query);
        case "blog":
          return this.searchBlog(query);
        case "products":
          return this.searchProducts(query);
        case "kits":
          return this.searchKits(query);
        case "custom":
          return this.searchKnowledgeBase(query);
        default:
          return [];
      }
    });

    const allResults = await Promise.all(searchPromises);
    for (const sourceResults of allResults) {
      results.push(...sourceResults);
    }

    return results
      .filter((r) => r.relevanceScore >= minRelevance)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  private async searchMissions(query: string): Promise<RAGResult[]> {
    const keywords = this.extractKeywords(query);
    const searchConditions = keywords.map((keyword) =>
      or(
        ilike(missions.title, `%${keyword}%`),
        ilike(missions.understandingText, `%${keyword}%`),
        ilike(missions.descricao, `%${keyword}%`),
        ilike(missions.category, `%${keyword}%`),
        ilike(missions.bonusTip, `%${keyword}%`)
      )
    );

    const results = await db
      .select()
      .from(missions)
      .where(and(eq(missions.isPublished, true), or(...searchConditions)))
      .limit(10);

    return results.map((mission) => ({
      source: "missions" as RAGSource,
      type: "Missão Resolvida",
      title: mission.title,
      content: this.truncateText(
        `${mission.understandingText || ""}\n${mission.descricao || ""}\n${mission.bonusTip || ""}`,
        500
      ),
      url: `/missoes/${mission.slug}`,
      relevanceScore: this.calculateRelevance(query, [
        mission.title,
        mission.understandingText || "",
        mission.category,
      ]),
      metadata: {
        category: mission.category,
        energyLevel: mission.energyLevel,
        estimatedMinutes: mission.estimatedMinutes,
      },
    }));
  }

  private async searchBlog(query: string): Promise<RAGResult[]> {
    const keywords = this.extractKeywords(query);
    const searchConditions = keywords.map((keyword) =>
      or(
        ilike(content.title, `%${keyword}%`),
        ilike(content.description, `%${keyword}%`),
        ilike(content.content, `%${keyword}%`),
        ilike(content.category, `%${keyword}%`)
      )
    );

    const results = await db
      .select()
      .from(content)
      .where(
        and(
          eq(content.isPublished, true),
          eq(content.type, "blog"),
          or(...searchConditions)
        )
      )
      .limit(10);

    return results.map((post) => ({
      source: "blog" as RAGSource,
      type: "Artigo do Blog",
      title: post.title,
      content: this.truncateText(post.description || post.content || "", 500),
      url: `/blog/${post.id}`,
      relevanceScore: this.calculateRelevance(query, [
        post.title,
        post.description || "",
        post.category || "",
      ]),
      metadata: {
        category: post.category,
        views: post.views,
      },
    }));
  }

  private async searchProducts(query: string): Promise<RAGResult[]> {
    const keywords = this.extractKeywords(query);
    const searchConditions = keywords.map((keyword) =>
      or(
        ilike(products.title, `%${keyword}%`),
        ilike(products.description, `%${keyword}%`),
        ilike(products.category, `%${keyword}%`),
        ilike(products.brand, `%${keyword}%`)
      )
    );

    const results = await db
      .select()
      .from(products)
      .where(and(eq(products.status, "active"), or(...searchConditions)))
      .limit(10);

    return results.map((product) => ({
      source: "products" as RAGSource,
      type: "Produto Recomendado",
      title: product.title,
      content: this.truncateText(product.description || "", 300),
      url: product.affiliateLink,
      relevanceScore: this.calculateRelevance(query, [
        product.title,
        product.description || "",
        product.category,
      ]),
      metadata: {
        price: product.currentPrice,
        rating: product.rating,
        brand: product.brand,
        isPrime: product.isPrime,
      },
    }));
  }

  private async searchKits(query: string): Promise<RAGResult[]> {
    const keywords = this.extractKeywords(query);
    const searchConditions = keywords.map((keyword) =>
      or(
        ilike(productKits.title, `%${keyword}%`),
        ilike(productKits.shortDescription, `%${keyword}%`),
        ilike(productKits.longDescription, `%${keyword}%`),
        ilike(productKits.category, `%${keyword}%`)
      )
    );

    const results = await db
      .select()
      .from(productKits)
      .where(and(eq(productKits.status, "ACTIVE"), or(...searchConditions)))
      .limit(10);

    return results.map((kit) => ({
      source: "kits" as RAGSource,
      type: "Kit de Produtos",
      title: kit.title,
      content: this.truncateText(
        `${kit.shortDescription}\n${kit.longDescription || ""}`,
        400
      ),
      url: `/kits/${kit.slug}`,
      relevanceScore: this.calculateRelevance(query, [
        kit.title,
        kit.shortDescription,
        kit.category || "",
      ]),
      metadata: {
        category: kit.category,
        taskIntent: kit.taskIntent,
      },
    }));
  }

  private async searchKnowledgeBase(query: string): Promise<RAGResult[]> {
    const keywords = this.extractKeywords(query);
    const searchConditions = keywords.map((keyword) =>
      or(
        ilike(chatKnowledgeBase.question, `%${keyword}%`),
        ilike(chatKnowledgeBase.answer, `%${keyword}%`),
        sql`${keyword} = ANY(${chatKnowledgeBase.keywords})`
      )
    );

    const results = await db
      .select()
      .from(chatKnowledgeBase)
      .where(and(eq(chatKnowledgeBase.isActive, true), or(...searchConditions)))
      .orderBy(desc(chatKnowledgeBase.priority))
      .limit(10);

    return results.map((entry) => ({
      source: "custom" as RAGSource,
      type: "FAQ",
      title: entry.question,
      content: entry.answer,
      relevanceScore:
        this.calculateRelevance(query, [entry.question, entry.answer]) +
        (entry.priority || 0) * 0.1,
      metadata: {
        category: entry.category,
        priority: entry.priority,
      },
    }));
  }

  private extractKeywords(query: string): string[] {
    const stopWords = new Set([
      "a", "o", "e", "de", "da", "do", "que", "em", "para", "com", "um", "uma",
      "é", "na", "no", "os", "as", "se", "por", "mais", "como", "mas", "foi",
      "ao", "ele", "das", "tem", "seu", "sua", "ou", "ser", "quando", "muito",
      "há", "nos", "já", "está", "eu", "também", "só", "pelo", "pela", "até",
      "isso", "ela", "entre", "era", "depois", "sem", "mesmo", "aos", "ter",
      "seus", "quem", "nas", "me", "esse", "eles", "estão", "você", "tinha",
      "foram", "essa", "num", "nem", "suas", "meu", "às", "minha", "têm", "numa",
      "the", "is", "are", "and", "or", "to", "in", "it", "of", "for", "on",
      "olá", "oi", "bom", "dia", "boa", "tarde", "noite", "obrigado", "obrigada",
      "preciso", "quero", "gostaria", "pode", "posso", "ajuda", "ajudar",
    ]);

    return query
      .toLowerCase()
      .replace(/[^\w\sáéíóúàèìòùâêîôûãõäëïöüç]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));
  }

  private calculateRelevance(query: string, texts: string[]): number {
    const keywords = this.extractKeywords(query);
    if (keywords.length === 0) return 0;

    const combinedText = texts.join(" ").toLowerCase();
    let matchCount = 0;
    let exactMatches = 0;

    for (const keyword of keywords) {
      if (combinedText.includes(keyword)) {
        matchCount++;
        const regex = new RegExp(`\\b${keyword}\\b`, "gi");
        const matches = combinedText.match(regex);
        if (matches) {
          exactMatches += matches.length;
        }
      }
    }

    const keywordCoverage = matchCount / keywords.length;
    const densityBonus = Math.min(exactMatches / 10, 0.3);

    return Math.min(keywordCoverage + densityBonus, 1);
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  }

  buildContextPrompt(results: RAGResult[]): string {
    if (results.length === 0) return "";

    const contextParts = results.map((r, i) => {
      let context = `[${i + 1}] ${r.type}: "${r.title}"`;
      if (r.content) {
        context += `\n${r.content}`;
      }
      if (r.url) {
        context += `\nLink: ${r.url}`;
      }
      return context;
    });

    return `
CONTEXTO DO SITE KAROOMA (use estas informações para responder):
${contextParts.join("\n\n")}
---
`;
  }

  async buildMissionsContext(): Promise<string> {
    const publishedMissions = await db
      .select({
        title: missions.title,
        slug: missions.slug,
        category: missions.category,
        descricao: missions.descricao,
        energyLevel: missions.energyLevel,
        estimatedMinutes: missions.estimatedMinutes,
        productAsins: missions.productAsins,
        tarefas: missions.tarefasSimplesDeExecucao,
      })
      .from(missions)
      .where(eq(missions.isPublished, true))
      .orderBy(desc(missions.createdAt));

    if (publishedMissions.length === 0) {
      return "";
    }

    const missionSummaries = publishedMissions.map((m) => {
      const tarefas = m.tarefas as Array<{ task: string; subtext?: string }> | null;
      const tarefasList = tarefas && tarefas.length > 0
        ? tarefas.map((t) => t.task).join(", ")
        : "sem tarefas definidas";

      const productAsins = m.productAsins || [];
      const hasProducts = Array.isArray(productAsins) && productAsins.length > 0;
      const productInfo = hasProducts
        ? `Tem ${productAsins.length} produto(s) recomendado(s)`
        : "Sem produtos recomendados";

      return `• "${m.title}" (${m.category || "geral"})
  - ${m.descricao || "Missão prática"}
  - Energia: ${m.energyLevel || "média"} | Tempo: ${m.estimatedMinutes || "?"} min
  - Tarefas: ${tarefasList}
  - ${productInfo}
  - Link: /missoes/${m.slug}`;
    });

    return `
MISSÕES DISPONÍVEIS NO KAROOMA (use estas informações para reconhecer e sugerir missões):
${missionSummaries.join("\n\n")}
---
Quando a usuária mencionar temas relacionados a estas missões, sugira a missão correspondente com o link correto.
`;
  }
}

export function createRAGService(): RAGService {
  return new RAGService();
}
