import { db } from "../db";
import {
  chatbotConfig,
  chatConversations,
  chatMessages,
  chatKnowledgeBase,
  type ChatbotConfig,
  type ChatMessage,
  type InsertChatMessage,
  type RAGSource,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { LLMService, createLLMService } from "./llmService";
import { RAGService, createRAGService } from "./ragService";

interface ChatRequest {
  sessionId: string;
  message: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
}

interface ChatResponse {
  message: string;
  conversationId: string;
  ragContext?: Array<{
    source: string;
    title: string;
    url?: string;
  }>;
  tokensUsed?: number;
}

const DEFAULT_SYSTEM_PROMPT = `Você é a assistente virtual do site Karooma, um portal brasileiro dedicado a simplificar a vida de mães que trabalham.

SOBRE O KAROOMA:
- Ajudamos mães ocupadas a encontrar soluções práticas para o dia a dia
- Oferecemos missões (guias práticos), artigos de blog e produtos recomendados
- Nosso foco é organização, alimentação, bem-estar e gestão da casa

PERSONALIDADE:
- Tom empático e acolhedor
- Linguagem simples e direta
- Sempre prática e orientada a soluções
- Evite jargões técnicos

REGRAS:
1. Responda sempre em português brasileiro
2. Seja concisa mas completa
3. Quando relevante, sugira missões ou produtos do site
4. Se não souber algo, seja honesta e ofereça buscar mais informações
5. Nunca invente informações sobre produtos ou preços
6. Para questões complexas ou compras, sugira contato direto

CONTEXTO ADICIONAL:
Se informações do site forem fornecidas abaixo, use-as para enriquecer sua resposta.`;

export class ChatbotService {
  private ragService: RAGService;

  constructor() {
    this.ragService = createRAGService();
  }

  async getConfig(): Promise<ChatbotConfig | null> {
    const configs = await db
      .select()
      .from(chatbotConfig)
      .where(eq(chatbotConfig.isActive, true))
      .limit(1);
    return configs[0] || null;
  }

  async getOrCreateConfig(): Promise<ChatbotConfig> {
    let config = await this.getConfig();
    if (!config) {
      const [newConfig] = await db
        .insert(chatbotConfig)
        .values({
          name: "Karooma Assistant",
          systemPrompt: DEFAULT_SYSTEM_PROMPT,
          isActive: true,
        })
        .returning();
      config = newConfig;
    }
    return config;
  }

  async updateConfig(updates: Partial<ChatbotConfig>): Promise<ChatbotConfig> {
    const config = await this.getOrCreateConfig();
    const [updated] = await db
      .update(chatbotConfig)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatbotConfig.id, config.id))
      .returning();
    return updated;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const config = await this.getOrCreateConfig();
    const llmService = createLLMService(config);

    const conversation = await this.getOrCreateConversation(
      request.sessionId,
      request.userId,
      request.userEmail,
      request.userName
    );

    const history = await this.getConversationHistory(conversation.id, 10);

    let ragContext: Array<{ source: string; title: string; url?: string }> = [];
    let contextPrompt = "";

    if (config.ragEnabled) {
      const ragResults = await this.ragService.search(request.message, {
        sources: (config.ragSources || ["missions", "blog", "products"]) as RAGSource[],
        maxResults: config.ragMaxResults || 5,
      });

      if (ragResults.length > 0) {
        contextPrompt = this.ragService.buildContextPrompt(ragResults);
        ragContext = ragResults.map((r) => ({
          source: r.source,
          title: r.title,
          url: r.url,
        }));
      }
    }

    const systemPrompt = contextPrompt
      ? `${config.systemPrompt}\n\n${contextPrompt}`
      : config.systemPrompt;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: request.message },
    ];

    await this.saveMessage({
      conversationId: conversation.id,
      role: "user",
      content: request.message,
    });

    const response = await llmService.chat(messages);

    await this.saveMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: response.content,
      ragContext: ragContext.length > 0 ? ragContext : undefined,
      tokensUsed: response.tokensUsed,
      llmProvider: response.provider,
      llmModel: response.model,
    });

    return {
      message: response.content,
      conversationId: conversation.id,
      ragContext: ragContext.length > 0 ? ragContext : undefined,
      tokensUsed: response.tokensUsed,
    };
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<string> {
    const config = await this.getOrCreateConfig();
    const llmService = createLLMService(config);

    const conversation = await this.getOrCreateConversation(
      request.sessionId,
      request.userId,
      request.userEmail,
      request.userName
    );

    const history = await this.getConversationHistory(conversation.id, 10);

    let contextPrompt = "";
    let ragContext: unknown[] = [];

    if (config.ragEnabled) {
      const ragResults = await this.ragService.search(request.message, {
        sources: (config.ragSources || ["missions", "blog", "products"]) as RAGSource[],
        maxResults: config.ragMaxResults || 5,
      });

      if (ragResults.length > 0) {
        contextPrompt = this.ragService.buildContextPrompt(ragResults);
        ragContext = ragResults.map((r) => ({
          source: r.source,
          title: r.title,
          url: r.url,
        }));
      }
    }

    const systemPrompt = contextPrompt
      ? `${config.systemPrompt}\n\n${contextPrompt}`
      : config.systemPrompt;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: request.message },
    ];

    await this.saveMessage({
      conversationId: conversation.id,
      role: "user",
      content: request.message,
    });

    let fullResponse = "";

    for await (const chunk of llmService.streamChat(messages)) {
      fullResponse += chunk.content;
      yield chunk.content;
    }

    await this.saveMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: fullResponse,
      ragContext: ragContext.length > 0 ? ragContext : undefined,
      llmProvider: config.llmProvider,
      llmModel: config.llmModel,
    });
  }

  private async getOrCreateConversation(
    sessionId: string,
    userId?: string,
    userEmail?: string,
    userName?: string
  ) {
    const existing = await db
      .select()
      .from(chatConversations)
      .where(
        and(
          eq(chatConversations.sessionId, sessionId),
          eq(chatConversations.status, "active")
        )
      )
      .limit(1);

    if (existing[0]) {
      return existing[0];
    }

    const [conversation] = await db
      .insert(chatConversations)
      .values({
        sessionId,
        userId,
        userEmail,
        userName,
        status: "active",
      })
      .returning();

    return conversation;
  }

  private async getConversationHistory(
    conversationId: string,
    limit: number
  ): Promise<ChatMessage[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);

    return messages.reverse();
  }

  private async saveMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [saved] = await db.insert(chatMessages).values(message).returning();
    return saved;
  }

  async getKnowledgeBase() {
    return db
      .select()
      .from(chatKnowledgeBase)
      .where(eq(chatKnowledgeBase.isActive, true))
      .orderBy(desc(chatKnowledgeBase.priority));
  }

  async addKnowledgeEntry(entry: {
    question: string;
    answer: string;
    category?: string;
    keywords?: string[];
    priority?: number;
  }) {
    const [created] = await db
      .insert(chatKnowledgeBase)
      .values({
        ...entry,
        isActive: true,
      })
      .returning();
    return created;
  }

  async updateKnowledgeEntry(
    id: string,
    updates: Partial<{
      question: string;
      answer: string;
      category: string;
      keywords: string[];
      priority: number;
      isActive: boolean;
    }>
  ) {
    const [updated] = await db
      .update(chatKnowledgeBase)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatKnowledgeBase.id, id))
      .returning();
    return updated;
  }

  async deleteKnowledgeEntry(id: string) {
    await db.delete(chatKnowledgeBase).where(eq(chatKnowledgeBase.id, id));
  }

  async getConversations(limit = 50) {
    return db
      .select()
      .from(chatConversations)
      .orderBy(desc(chatConversations.updatedAt))
      .limit(limit);
  }

  async getConversationMessages(conversationId: string) {
    return db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt);
  }
}

export function createChatbotService(): ChatbotService {
  return new ChatbotService();
}
