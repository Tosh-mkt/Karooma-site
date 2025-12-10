import * as fs from "fs";
import * as path from "path";
import { db } from "../db";
import { chatKnowledgeBase } from "@shared/schema";
import { eq } from "drizzle-orm";

const CONFIG_DIR = path.join(process.cwd(), "server/chatbot-config");

interface ChatbotConfig {
  chatbot: {
    name: string;
    version: string;
    company: string;
    language: string;
  };
  tone: {
    style: string;
    characteristics: string[];
    vocabulary: Record<string, string[]>;
  };
  restrictions: {
    must_not: string[];
    fallback_phrases: Record<string, string>;
  };
  sales_flow: {
    steps: Array<{ name: string; description: string }>;
  };
  links: Record<string, string>;
  behavior: Record<string, unknown>;
}

interface FAQEntry {
  question: string;
  answer: string;
  category: string;
  subcategory: string;
  missionSlug?: string;
  emotionalTrigger?: string;
  keywords: string[];
  source: "file" | "database";
  filePath?: string;
}

interface LoadedConfig {
  config: ChatbotConfig | null;
  systemPrompt: string | null;
  faqEntries: FAQEntry[];
  policyEntries: FAQEntry[];
  stats: {
    faqFiles: number;
    policyFiles: number;
    totalEntries: number;
  };
}

export class ChatbotConfigLoader {
  private configCache: LoadedConfig | null = null;
  private lastLoadTime: number = 0;
  private cacheTTL: number = 60000;

  async loadConfig(): Promise<ChatbotConfig | null> {
    const configPath = path.join(CONFIG_DIR, "config.json");
    if (!fs.existsSync(configPath)) {
      console.log("[ChatbotConfigLoader] config.json not found");
      return null;
    }

    try {
      const content = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(content) as ChatbotConfig;
    } catch (error) {
      console.error("[ChatbotConfigLoader] Error loading config.json:", error);
      return null;
    }
  }

  async saveConfig(jsonContent: string): Promise<boolean> {
    const configPath = path.join(CONFIG_DIR, "config.json");
    try {
      // Validate JSON
      JSON.parse(jsonContent);
      
      // Format nicely
      const formatted = JSON.stringify(JSON.parse(jsonContent), null, 2);
      fs.writeFileSync(configPath, formatted, "utf-8");
      
      // Invalidate cache
      this.configCache = null;
      this.lastLoadTime = 0;
      
      console.log("[ChatbotConfigLoader] Config saved successfully");
      return true;
    } catch (error) {
      console.error("[ChatbotConfigLoader] Error saving config:", error);
      return false;
    }
  }

  async loadSystemPrompt(): Promise<string | null> {
    const promptPath = path.join(CONFIG_DIR, "prompts/system-base.md");
    if (!fs.existsSync(promptPath)) {
      console.log("[ChatbotConfigLoader] system-base.md not found");
      return null;
    }

    try {
      return fs.readFileSync(promptPath, "utf-8");
    } catch (error) {
      console.error("[ChatbotConfigLoader] Error loading system prompt:", error);
      return null;
    }
  }

  async loadFAQFromFiles(): Promise<FAQEntry[]> {
    const faqDir = path.join(CONFIG_DIR, "faq");
    return this.loadMDFilesFromDir(faqDir, "faq");
  }

  async loadPoliciesFromFiles(): Promise<FAQEntry[]> {
    const policiesDir = path.join(CONFIG_DIR, "policies");
    return this.loadMDFilesFromDir(policiesDir, "policy");
  }

  private loadMDFilesFromDir(dirPath: string, type: string): FAQEntry[] {
    if (!fs.existsSync(dirPath)) {
      console.log(`[ChatbotConfigLoader] Directory not found: ${dirPath}`);
      return [];
    }

    const entries: FAQEntry[] = [];
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith(".md"));

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const category = file.replace(".md", "");
      
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        const parsedEntries = this.parseMDFile(content, category, type, filePath);
        entries.push(...parsedEntries);
      } catch (error) {
        console.error(`[ChatbotConfigLoader] Error parsing ${file}:`, error);
      }
    }

    return entries;
  }

  private parseMDFile(content: string, category: string, type: string, filePath: string): FAQEntry[] {
    const entries: FAQEntry[] = [];
    const sections = content.split(/^## /m).filter(s => s.trim());

    for (const section of sections) {
      const lines = section.split("\n");
      const title = lines[0]?.trim();
      if (!title || title.startsWith("#")) continue;

      let question = "";
      let answer = "";
      let missionSlug = "";
      let emotionalTrigger = "";
      let keywords: string[] = [];

      for (const line of lines.slice(1)) {
        if (line.startsWith("**Pergunta**:")) {
          question = line.replace("**Pergunta**:", "").trim();
        } else if (line.startsWith("**Resposta**:")) {
          answer = line.replace("**Resposta**:", "").trim();
        } else if (line.startsWith("**Missão relacionada**:")) {
          missionSlug = line.replace("**Missão relacionada**:", "").trim();
        } else if (line.startsWith("**Gatilho emocional**:")) {
          emotionalTrigger = line.replace("**Gatilho emocional**:", "").trim();
        } else if (line.startsWith("**Palavras-chave**:")) {
          keywords = line.replace("**Palavras-chave**:", "").trim().split(",").map(k => k.trim());
        }
      }

      if (question && answer) {
        entries.push({
          question,
          answer,
          category: this.formatCategory(category),
          subcategory: title,
          missionSlug: missionSlug || undefined,
          emotionalTrigger: emotionalTrigger || undefined,
          keywords: keywords.length > 0 ? keywords : this.extractKeywordsFromText(question + " " + answer),
          source: "file",
          filePath,
        });
      }
    }

    return entries;
  }

  private formatCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      "rotina": "Rotina",
      "alimentacao": "Alimentação",
      "comportamento": "Comportamento",
      "autocuidado": "Autocuidado",
      "sobre-nos": "Sobre Nós",
      "lgpd": "Privacidade",
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }

  private extractKeywordsFromText(text: string): string[] {
    const stopWords = new Set([
      "a", "o", "e", "de", "da", "do", "que", "em", "para", "com", "um", "uma",
      "é", "na", "no", "os", "as", "se", "por", "mais", "como", "mas", "foi"
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\sáéíóúàèìòùâêîôûãõ]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10);
  }

  async loadAll(forceReload = false): Promise<LoadedConfig> {
    const now = Date.now();
    if (!forceReload && this.configCache && (now - this.lastLoadTime) < this.cacheTTL) {
      return this.configCache;
    }

    console.log("[ChatbotConfigLoader] Loading all configuration files...");

    const [config, systemPrompt, faqEntries, policyEntries] = await Promise.all([
      this.loadConfig(),
      this.loadSystemPrompt(),
      this.loadFAQFromFiles(),
      this.loadPoliciesFromFiles(),
    ]);

    this.configCache = {
      config,
      systemPrompt,
      faqEntries,
      policyEntries,
      stats: {
        faqFiles: new Set(faqEntries.map(e => e.filePath)).size,
        policyFiles: new Set(policyEntries.map(e => e.filePath)).size,
        totalEntries: faqEntries.length + policyEntries.length,
      },
    };

    this.lastLoadTime = now;
    console.log(`[ChatbotConfigLoader] Loaded ${this.configCache.stats.totalEntries} entries from ${this.configCache.stats.faqFiles + this.configCache.stats.policyFiles} files`);

    return this.configCache;
  }

  async syncToDatabase(): Promise<{ added: number; updated: number; skipped: number }> {
    const loaded = await this.loadAll(true);
    const allEntries = [...loaded.faqEntries, ...loaded.policyEntries];
    
    let added = 0;
    let updated = 0;
    let skipped = 0;

    for (const entry of allEntries) {
      const existing = await db
        .select()
        .from(chatKnowledgeBase)
        .where(eq(chatKnowledgeBase.question, entry.question))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(chatKnowledgeBase).values({
          question: entry.question,
          answer: entry.answer,
          category: entry.category,
          keywords: entry.keywords,
          priority: 5,
          isActive: true,
        });
        added++;
      } else {
        skipped++;
      }
    }

    console.log(`[ChatbotConfigLoader] Sync complete: ${added} added, ${updated} updated, ${skipped} skipped`);
    return { added, updated, skipped };
  }

  async getCategories(): Promise<string[]> {
    const faqDir = path.join(CONFIG_DIR, "faq");
    const policiesDir = path.join(CONFIG_DIR, "policies");
    const categories: string[] = [];

    if (fs.existsSync(faqDir)) {
      const faqFiles = fs.readdirSync(faqDir).filter(f => f.endsWith(".md"));
      categories.push(...faqFiles.map(f => f.replace(".md", "")));
    }

    if (fs.existsSync(policiesDir)) {
      const policyFiles = fs.readdirSync(policiesDir).filter(f => f.endsWith(".md"));
      categories.push(...policyFiles.map(f => `policies/${f.replace(".md", "")}`));
    }

    return categories;
  }

  async getFileContent(category: string): Promise<string | null> {
    let filePath: string;
    
    if (category.startsWith("policies/")) {
      filePath = path.join(CONFIG_DIR, "policies", `${category.replace("policies/", "")}.md`);
    } else {
      filePath = path.join(CONFIG_DIR, "faq", `${category}.md`);
    }

    if (!fs.existsSync(filePath)) {
      return null;
    }

    return fs.readFileSync(filePath, "utf-8");
  }

  async saveFileContent(category: string, content: string): Promise<boolean> {
    let filePath: string;
    
    if (category.startsWith("policies/")) {
      filePath = path.join(CONFIG_DIR, "policies", `${category.replace("policies/", "")}.md`);
    } else {
      filePath = path.join(CONFIG_DIR, "faq", `${category}.md`);
    }

    try {
      fs.writeFileSync(filePath, content, "utf-8");
      this.configCache = null;
      return true;
    } catch (error) {
      console.error(`[ChatbotConfigLoader] Error saving file:`, error);
      return false;
    }
  }

  async createCategory(name: string, type: "faq" | "policy" = "faq"): Promise<boolean> {
    const dir = type === "faq" ? "faq" : "policies";
    const filePath = path.join(CONFIG_DIR, dir, `${name}.md`);

    if (fs.existsSync(filePath)) {
      return false;
    }

    const template = `# FAQ: ${this.formatCategory(name)}

## Exemplo de pergunta
**Pergunta**: Qual é a pergunta?
**Resposta**: Esta é a resposta para a pergunta.
**Gatilho emocional**: Sentimento relacionado
**Palavras-chave**: palavra1, palavra2, palavra3
`;

    try {
      fs.writeFileSync(filePath, template, "utf-8");
      this.configCache = null;
      return true;
    } catch (error) {
      console.error(`[ChatbotConfigLoader] Error creating category:`, error);
      return false;
    }
  }

  async deleteCategory(category: string): Promise<boolean> {
    let filePath: string;
    
    if (category.startsWith("policies/")) {
      filePath = path.join(CONFIG_DIR, "policies", `${category.replace("policies/", "")}.md`);
    } else {
      filePath = path.join(CONFIG_DIR, "faq", `${category}.md`);
    }

    if (!fs.existsSync(filePath)) {
      return false;
    }

    try {
      fs.unlinkSync(filePath);
      this.configCache = null;
      return true;
    } catch (error) {
      console.error(`[ChatbotConfigLoader] Error deleting category:`, error);
      return false;
    }
  }
}

export const chatbotConfigLoader = new ChatbotConfigLoader();
