import { Router, type Request, type Response } from "express";
import { createChatbotService } from "../services/chatbotService";
import { LLMService } from "../services/llmService";
import { extractUserInfo } from "../middleware/flipbookAuth";
import { z } from "zod";

const router = Router();
const chatbotService = createChatbotService();

const chatRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().optional(),
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

function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function registerChatbotRoutes(app: any) {
  app.use("/api/chatbot", router);
}
