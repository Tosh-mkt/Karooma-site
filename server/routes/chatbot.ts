import { Router, type Request, type Response } from "express";
import { createChatbotService } from "../services/chatbotService";
import { LLMService } from "../services/llmService";
import { chatbotConfigLoader } from "../services/chatbotConfigLoader";
import { extractUserInfo } from "../middleware/flipbookAuth";
import { sendVisitorFeedbackNotification } from "../emailService";
import { db } from "../db";
import { visitorFeedback } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const router = Router();
const chatbotService = createChatbotService();

const chatRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().nullable().optional(),
});

const knowledgeEntrySchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  priority: z.number().optional(),
});

const configUpdateSchema = z.object({
  name: z.string().optional(),
  llmProvider: z.string().optional(),
  llmModel: z.string().optional(),
  systemPrompt: z.string().optional(),
  temperature: z.string().optional(),
  maxTokens: z.number().optional(),
  ragEnabled: z.boolean().optional(),
  ragSources: z.array(z.string()).optional(),
  ragMaxResults: z.number().optional(),
  welcomeMessage: z.string().optional(),
  suggestedQuestions: z.array(z.string()).optional(),
  widgetPosition: z.string().optional(),
  widgetPrimaryColor: z.string().optional(),
  widgetTitle: z.string().optional(),
  isActive: z.boolean().optional(),
});

function checkIsAdmin(user: any): boolean {
  if (!user) return false;
  const adminEmails = ["@karooma", "@karoomamail", "admin@"];
  const isAdminEmail = adminEmails.some(
    (pattern) => user.email && user.email.includes(pattern)
  );
  return isAdminEmail || user.isAdmin === true;
}

router.get("/config/public", async (_req: Request, res: Response) => {
  try {
    const config = await chatbotService.getOrCreateConfig();
    res.json({
      name: config.name,
      welcomeMessage: config.welcomeMessage,
      suggestedQuestions: config.suggestedQuestions,
      widgetPosition: config.widgetPosition,
      widgetPrimaryColor: config.widgetPrimaryColor,
      widgetTitle: config.widgetTitle,
      isActive: config.isActive,
    });
  } catch (error) {
    console.error("Error fetching chatbot config:", error);
    res.status(500).json({ error: "Failed to fetch chatbot configuration" });
  }
});

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error });
    }

    const { message, sessionId } = parsed.data;
    const actualSessionId = sessionId || generateSessionId();

    const response = await chatbotService.chat({
      sessionId: actualSessionId,
      message,
    });

    res.json({
      ...response,
      sessionId: actualSessionId,
    });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Failed to process message" });
  }
});

router.post("/chat/stream", async (req: Request, res: Response) => {
  try {
    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error });
    }

    const { message, sessionId } = parsed.data;
    const actualSessionId = sessionId || generateSessionId();

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Session-Id", actualSessionId);

    for await (const chunk of chatbotService.streamChat({
      sessionId: actualSessionId,
      message,
    })) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true, sessionId: actualSessionId })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Error in stream chat:", error);
    res.write(`data: ${JSON.stringify({ error: "Failed to process message" })}\n\n`);
    res.end();
  }
});

router.get("/admin/config", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const config = await chatbotService.getOrCreateConfig();
    res.json(config);
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({ error: "Failed to fetch configuration" });
  }
});

router.put("/admin/config", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const parsed = configUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid config", details: parsed.error });
    }

    const updated = await chatbotService.updateConfig(parsed.data);
    res.json(updated);
  } catch (error) {
    console.error("Error updating config:", error);
    res.status(500).json({ error: "Failed to update configuration" });
  }
});

router.get("/admin/providers", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const providers = LLMService.getSupportedProviders().map((provider) => ({
      id: provider,
      name: provider.charAt(0).toUpperCase() + provider.slice(1),
      defaultModel: LLMService.getDefaultModel(provider),
      hasApiKey: !!process.env[`${provider.toUpperCase()}_API_KEY`],
    }));

    res.json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

router.get("/admin/knowledge", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const entries = await chatbotService.getKnowledgeBase();
    res.json(entries);
  } catch (error) {
    console.error("Error fetching knowledge base:", error);
    res.status(500).json({ error: "Failed to fetch knowledge base" });
  }
});

router.post("/admin/knowledge", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const parsed = knowledgeEntrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid entry", details: parsed.error });
    }

    const entry = await chatbotService.addKnowledgeEntry(parsed.data);
    res.json(entry);
  } catch (error) {
    console.error("Error adding knowledge entry:", error);
    res.status(500).json({ error: "Failed to add knowledge entry" });
  }
});

router.put("/admin/knowledge/:id", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    const updated = await chatbotService.updateKnowledgeEntry(id, req.body);
    res.json(updated);
  } catch (error) {
    console.error("Error updating knowledge entry:", error);
    res.status(500).json({ error: "Failed to update knowledge entry" });
  }
});

router.delete("/admin/knowledge/:id", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    await chatbotService.deleteKnowledgeEntry(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting knowledge entry:", error);
    res.status(500).json({ error: "Failed to delete knowledge entry" });
  }
});

router.get("/admin/conversations", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const conversations = await chatbotService.getConversations();
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

router.get("/admin/conversations/:id/messages", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    const messages = await chatbotService.getConversationMessages(id);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.get("/admin/files", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const loaded = await chatbotConfigLoader.loadAll();
    const categories = await chatbotConfigLoader.getCategories();

    res.json({
      config: loaded.config,
      systemPrompt: loaded.systemPrompt,
      categories,
      stats: loaded.stats,
      entries: {
        faq: loaded.faqEntries,
        policies: loaded.policyEntries,
      },
    });
  } catch (error) {
    console.error("Error loading chatbot files:", error);
    res.status(500).json({ error: "Failed to load chatbot files" });
  }
});

router.get("/admin/files/category/:category", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { category } = req.params;
    const content = await chatbotConfigLoader.getFileContent(category);

    if (content === null) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ category, content });
  } catch (error) {
    console.error("Error loading category:", error);
    res.status(500).json({ error: "Failed to load category" });
  }
});

router.put("/admin/files/category/:category", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { category } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string") {
      return res.status(400).json({ error: "Content is required" });
    }

    const success = await chatbotConfigLoader.saveFileContent(category, content);

    if (!success) {
      return res.status(500).json({ error: "Failed to save category" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving category:", error);
    res.status(500).json({ error: "Failed to save category" });
  }
});

router.post("/admin/files/category", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { name, type } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Category name is required" });
    }

    const success = await chatbotConfigLoader.createCategory(name, type || "faq");

    if (!success) {
      return res.status(400).json({ error: "Category already exists" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.delete("/admin/files/category/:category", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { category } = req.params;
    const success = await chatbotConfigLoader.deleteCategory(category);

    if (!success) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

router.post("/admin/files/sync", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const result = await chatbotConfigLoader.syncToDatabase();
    res.json(result);
  } catch (error) {
    console.error("Error syncing to database:", error);
    res.status(500).json({ error: "Failed to sync to database" });
  }
});

router.get("/admin/files/config", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const config = await chatbotConfigLoader.loadConfig();
    res.json(config || {});
  } catch (error) {
    console.error("Error loading config:", error);
    res.status(500).json({ error: "Failed to load config" });
  }
});

router.put("/admin/files/config", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    // Validate JSON
    try {
      JSON.parse(content);
    } catch {
      return res.status(400).json({ error: "Invalid JSON format" });
    }

    const success = await chatbotConfigLoader.saveConfig(content);
    if (!success) {
      return res.status(500).json({ error: "Failed to save config" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving config:", error);
    res.status(500).json({ error: "Failed to save config" });
  }
});

router.get("/admin/files/prompt", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const content = await chatbotConfigLoader.loadKarooTutorPrompt();
    res.json({ content: content || "" });
  } catch (error) {
    console.error("Error loading prompt:", error);
    res.status(500).json({ error: "Failed to load prompt" });
  }
});

router.put("/admin/files/prompt", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { content } = req.body;
    if (content === undefined || typeof content !== "string") {
      return res.status(400).json({ error: "Content must be a string" });
    }

    const success = await chatbotConfigLoader.saveKarooTutorPrompt(content);
    if (!success) {
      return res.status(500).json({ error: "Failed to save prompt" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving prompt:", error);
    res.status(500).json({ error: "Failed to save prompt" });
  }
});

function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============== VISITOR FEEDBACK ROUTES ==============

const feedbackSchema = z.object({
  type: z.enum(["suggestion", "complaint", "request"]),
  message: z.string().min(1),
  visitorName: z.string().optional(),
  visitorEmail: z.string().email().optional().or(z.literal("")),
  pageUrl: z.string().optional(),
  conversationContext: z.string().optional(),
});

const feedbackUpdateSchema = z.object({
  status: z.enum(["pending", "reviewed", "resolved"]).optional(),
  adminNotes: z.string().optional(),
});

// Public endpoint to submit feedback
router.post("/feedback", async (req: Request, res: Response) => {
  try {
    const parsed = feedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
    }

    const data = parsed.data;
    const userAgent = req.headers["user-agent"] || null;

    // Insert feedback into database
    const [feedback] = await db.insert(visitorFeedback).values({
      type: data.type,
      message: data.message,
      visitorName: data.visitorName || null,
      visitorEmail: data.visitorEmail || null,
      pageUrl: data.pageUrl || null,
      conversationContext: data.conversationContext || null,
      userAgent: userAgent,
    }).returning();

    // Send email notification
    const emailSent = await sendVisitorFeedbackNotification({
      type: data.type,
      message: data.message,
      visitorName: data.visitorName,
      visitorEmail: data.visitorEmail,
      pageUrl: data.pageUrl,
      conversationContext: data.conversationContext,
      timestamp: new Date().toISOString(),
    });

    // Update email_sent status
    if (emailSent) {
      await db.update(visitorFeedback)
        .set({ emailSent: true })
        .where(eq(visitorFeedback.id, feedback.id));
    }

    res.json({ 
      success: true, 
      message: "Feedback recebido com sucesso! Obrigada por compartilhar.",
      id: feedback.id 
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
});

// Admin: List all feedback
router.get("/admin/feedback", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const feedbackList = await db
      .select()
      .from(visitorFeedback)
      .orderBy(desc(visitorFeedback.createdAt));

    res.json(feedbackList);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

// Admin: Update feedback status/notes
router.put("/admin/feedback/:id", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    const parsed = feedbackUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
    }

    const [updated] = await db
      .update(visitorFeedback)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(visitorFeedback.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ error: "Failed to update feedback" });
  }
});

// Admin: Delete feedback
router.delete("/admin/feedback/:id", extractUserInfo, async (req: any, res: Response) => {
  try {
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { id } = req.params;
    const [deleted] = await db
      .delete(visitorFeedback)
      .where(eq(visitorFeedback.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ error: "Failed to delete feedback" });
  }
});

export function registerChatbotRoutes(app: any) {
  app.use("/api/chatbot", router);
}
