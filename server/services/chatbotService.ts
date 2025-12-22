import { db } from "../db";
import {
  chatbotConfig,
  chatConversations,
  chatMessages,
  chatKnowledgeBase,
  visitorFeedback,
  type ChatbotConfig,
  type ChatMessage,
  type InsertChatMessage,
  type RAGSource,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { LLMService, createLLMService } from "./llmService";
import { RAGService, createRAGService } from "./ragService";
import { sendVisitorFeedbackNotification } from "../emailService";
import * as fs from "fs";
import * as path from "path";

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

// Load Karoo tutor prompt from file
function getKarooTutorPrompt(): string {
  try {
    const promptPath = path.join(process.cwd(), "server/chatbot-config/prompts/karoo-tutor.md");
    if (fs.existsSync(promptPath)) {
      return fs.readFileSync(promptPath, "utf-8");
    }
  } catch (error) {
    console.error("[Chatbot] Error loading karoo-tutor.md:", error);
  }
  
  // Fallback prompt if file not found
  return `Você é a Karoo, guia do site Karooma.life.
Ajude mães ocupadas a encontrar soluções práticas.
Seja empática, concisa e direta. Use português brasileiro.`;
}

const DEFAULT_SYSTEM_PROMPT = getKarooTutorPrompt();

// Helper function to extract and process feedback from AI response
interface FeedbackMetadata {
  conversationContext?: string;
  visitorName?: string | null;
  visitorEmail?: string | null;
  pageUrl?: string | null;
  userAgent?: string | null;
}

async function extractAndProcessFeedback(
  responseContent: string,
  metadata: FeedbackMetadata = {}
): Promise<{ cleanedContent: string; feedbackExtracted: boolean }> {
  const feedbackPattern = /\[FEEDBACK:(suggestion|complaint|request):([^\]]+)\]/gi;
  const matches = Array.from(responseContent.matchAll(feedbackPattern));

  if (matches.length === 0) {
    return { cleanedContent: responseContent, feedbackExtracted: false };
  }

  // Process each feedback match
  for (const match of matches) {
    const [, type, message] = match;
    
    try {
      // Insert feedback into database with all available metadata
      const [feedback] = await db.insert(visitorFeedback).values({
        type: type.toLowerCase() as "suggestion" | "complaint" | "request",
        message: message.trim(),
        conversationContext: metadata.conversationContext || null,
        visitorName: metadata.visitorName || null,
        visitorEmail: metadata.visitorEmail || null,
        pageUrl: metadata.pageUrl || null,
        userAgent: metadata.userAgent || null,
        status: "pending",
      }).returning();

      // Send email notification with all metadata
      const emailSent = await sendVisitorFeedbackNotification({
        type: type.toLowerCase() as "suggestion" | "complaint" | "request",
        message: message.trim(),
        visitorName: metadata.visitorName,
        visitorEmail: metadata.visitorEmail,
        pageUrl: metadata.pageUrl,
        conversationContext: metadata.conversationContext,
        timestamp: new Date().toISOString(),
      });

      // Update email_sent status
      if (emailSent && feedback) {
        await db.update(visitorFeedback)
          .set({ emailSent: true })
          .where(eq(visitorFeedback.id, feedback.id));
      }

      console.log(`[Chatbot] Feedback captured: ${type} - ${message.substring(0, 50)}...`);
    } catch (error) {
      console.error("[Chatbot] Error processing feedback:", error);
    }
  }

  // Remove feedback tags from the response
  const cleanedContent = responseContent.replace(feedbackPattern, "").trim();
  return { cleanedContent, feedbackExtracted: true };
}

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

    const missionsContext = await this.ragService.buildMissionsContext();

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

    // Always use the Karoo tutor prompt from file (overrides database config)
    let systemPrompt = getKarooTutorPrompt();
    if (missionsContext) {
      systemPrompt += `\n\n${missionsContext}`;
    }
    if (contextPrompt) {
      systemPrompt += `\n\n${contextPrompt}`;
    }

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

    // Extract and process any feedback tags from the response
    const conversationContextSummary = history.length > 0 
      ? history.slice(-3).map(m => `${m.role}: ${m.content.substring(0, 100)}`).join("\n")
      : `user: ${request.message}`;
    
    const { cleanedContent } = await extractAndProcessFeedback(
      response.content,
      {
        conversationContext: conversationContextSummary,
        visitorName: request.userName || null,
        visitorEmail: request.userEmail || null,
      }
    );

    await this.saveMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: cleanedContent,
      ragContext: ragContext.length > 0 ? ragContext : undefined,
      tokensUsed: response.tokensUsed,
      llmProvider: response.provider,
      llmModel: response.model,
    });

    return {
      message: cleanedContent,
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

    const missionsContext = await this.ragService.buildMissionsContext();

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

    // Always use the Karoo tutor prompt from file (overrides database config)
    let systemPrompt = getKarooTutorPrompt();
    if (missionsContext) {
      systemPrompt += `\n\n${missionsContext}`;
    }
    if (contextPrompt) {
      systemPrompt += `\n\n${contextPrompt}`;
    }

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

    // Extract and process any feedback tags from the response (async, after streaming)
    const conversationContextSummary = history.length > 0 
      ? history.slice(-3).map(m => `${m.role}: ${m.content.substring(0, 100)}`).join("\n")
      : `user: ${request.message}`;
    
    const { cleanedContent } = await extractAndProcessFeedback(
      fullResponse,
      {
        conversationContext: conversationContextSummary,
        visitorName: request.userName || null,
        visitorEmail: request.userEmail || null,
      }
    );

    await this.saveMessage({
      conversationId: conversation.id,
      role: "assistant",
      content: cleanedContent,
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
