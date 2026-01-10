import { db } from "../db";
import { missions, content, seasonalThemes } from "@shared/schema";
import { eq, ilike, or, and, desc, sql, gte, lte } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";

const UNIFIED_CATEGORIES = [
  { id: "rotina-organizacao", name: "Rotina e Organização", emoji: "🌅", keywords: ["rotina", "organização", "produtividade", "manhã", "planejamento"] },
  { id: "casa-ordem", name: "Casa em Ordem", emoji: "🏠", keywords: ["casa", "limpeza", "manutenção", "ordem", "organizar"] },
  { id: "cozinha-alimentacao", name: "Cozinha e Alimentação", emoji: "🍳", keywords: ["cozinha", "alimentação", "comida", "refeição", "comer"] },
  { id: "educacao-brincadeiras", name: "Educação e Brincadeiras", emoji: "🎨", keywords: ["educação", "brincadeira", "criança", "brincar", "aprender"] },
  { id: "bem-estar-autocuidado", name: "Bem-estar e Autocuidado", emoji: "✨", keywords: ["bem-estar", "autocuidado", "relaxamento", "sono", "descanso"] },
  { id: "passeios-viagens", name: "Passeios e Viagens", emoji: "🚗", keywords: ["passeio", "viagem", "sair", "passear", "férias"] },
  { id: "saude-seguranca", name: "Saúde e Segurança", emoji: "💊", keywords: ["saúde", "segurança", "emergência", "médico", "doença"] },
];

const PAPERCRAFT_STYLE_PROMPT = `Estilo: Papercraft Origami 3D volumétrico
- Dobras de papel realistas com sombras suaves
- Cores vibrantes e alegres (rosa, lilás, laranja, amarelo)
- Composição dinâmica com profundidade
- Texturas de papel visíveis
- Iluminação suave e acolhedora
- Fundo gradiente suave`;

const KAROO_VOICE_PROMPT = `Você é a Karoo, assistente virtual do Karooma, escrevendo para Cláudia.
Persona Cláudia: Mãe de 39 anos, 2-3 filhos (idades 2-10 anos), sobrecarregada, buscando atalhos práticos.

Tom de escrita:
- Empático e acolhedor: "Sei como é difícil dar conta de tudo..."
- Linguagem cotidiana: "é puxado", "dar conta", "um respiro", "vamos por partes"
- Frases curtas e escaneáveis
- Sem julgamentos
- Foco em soluções práticas

Estrutura do conteúdo:
- Parágrafos curtos (máximo 3 linhas)
- Bullet points para listas
- Subtítulos H2/H3 claros
- Tom conversacional, como uma amiga`;

export interface GenerateDraftInput {
  topic: string;
  category: string;
  missionId?: string;
  keywords?: string[];
  tone?: "empatico" | "pratico" | "leve";
  type?: "artigo" | "guia";
}

export interface GeneratedDraft {
  title: string;
  slug: string;
  metaDescription: string;
  content: string;
  category: string;
  type: string;
  missionId?: string;
  missionCta?: {
    title: string;
    slug: string;
    description: string;
  };
  imagePrompt: string;
  keywords: string[];
}

export interface SeasonalTheme {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  suggestedTopics: string[];
  relatedCategories: string[];
}

export interface TrendAlert {
  id: string;
  type: "seasonal" | "trending";
  title: string;
  description: string;
  suggestedMissions: { id: string; title: string; slug: string }[];
  priority: "high" | "medium" | "low";
  expiresAt?: Date;
}

export class ContentHubService {
  private genAI: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenAI({ apiKey });
    }
  }

  getUnifiedCategories() {
    return UNIFIED_CATEGORIES;
  }

  async matchMissionsByCategory(categoryId: string): Promise<any[]> {
    const category = UNIFIED_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return [];

    const allMissions = await db.select().from(missions).where(eq(missions.isPublished, true));
    
    const matchedMissions = allMissions.filter(mission => {
      const missionCategory = mission.category?.toLowerCase() || "";
      const missionTitle = mission.title?.toLowerCase() || "";
      const missionDesc = mission.descricao?.toLowerCase() || "";
      
      return category.keywords.some(keyword => 
        missionCategory.includes(keyword) || 
        missionTitle.includes(keyword) || 
        missionDesc.includes(keyword)
      );
    });

    return matchedMissions.slice(0, 5);
  }

  async matchMissionsByTopic(topic: string): Promise<any[]> {
    const searchTerms = topic.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    const allMissions = await db.select().from(missions).where(eq(missions.isPublished, true));
    
    const scoredMissions = allMissions.map(mission => {
      let score = 0;
      const missionText = `${mission.title} ${mission.descricao} ${mission.category} ${mission.understandingText}`.toLowerCase();
      
      searchTerms.forEach(term => {
        if (missionText.includes(term)) score++;
      });
      
      return { mission, score };
    }).filter(m => m.score > 0).sort((a, b) => b.score - a.score);

    return scoredMissions.slice(0, 5).map(m => m.mission);
  }

  async generateDraft(input: GenerateDraftInput): Promise<GeneratedDraft> {
    if (!this.genAI) {
      throw new Error("Gemini API não configurada");
    }

    let missionContext = "";
    let missionCta = undefined;
    
    if (input.missionId) {
      const [mission] = await db.select().from(missions).where(eq(missions.id, input.missionId));
      if (mission) {
        missionContext = `
Missão relacionada para incluir CTA:
- Título: ${mission.title}
- Categoria: ${mission.category}
- Descrição: ${mission.descricao || mission.understandingText}
`;
        missionCta = {
          title: mission.title,
          slug: mission.slug,
          description: mission.descricao || mission.understandingText?.slice(0, 150) || "",
        };
      }
    }

    const prompt = `${KAROO_VOICE_PROMPT}

Gere um ${input.type || "artigo"} sobre: "${input.topic}"
Categoria: ${input.category}
${input.keywords?.length ? `Palavras-chave SEO: ${input.keywords.join(", ")}` : ""}
${missionContext}

IMPORTANTE: O conteúdo deve ser em HTML com tags semânticas (h2, h3, p, ul, li).

Retorne um JSON válido com esta estrutura exata:
{
  "title": "Título atrativo com até 60 caracteres",
  "slug": "url-amigavel-sem-acentos",
  "metaDescription": "Descrição SEO com até 155 caracteres",
  "content": "<p>Conteúdo HTML completo...</p>",
  "keywords": ["palavra1", "palavra2", "palavra3"]
}

${input.missionId ? `
Ao final do conteúdo HTML, inclua este CTA:
<div class="mission-cta">
  <h3>🎯 Missão Relacionada</h3>
  <p>Quer colocar isso em prática? Veja nossa missão completa com produtos selecionados!</p>
  <a href="/missoes/SLUG_DA_MISSAO">Ver Missão Completa →</a>
</div>
` : ""}

Retorne APENAS o JSON, sem markdown ou explicações.`;

    const result = await this.genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const response = result.text || "";
    
    let parsed: any;
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON não encontrado na resposta");
      }
    } catch (e) {
      console.error("[ContentHub] Erro ao parsear resposta:", response);
      throw new Error("Erro ao processar resposta da IA");
    }

    const imagePrompt = await this.generateImagePrompt(input.topic, input.category);

    return {
      title: parsed.title,
      slug: parsed.slug,
      metaDescription: parsed.metaDescription,
      content: parsed.content,
      category: input.category,
      type: input.type || "artigo",
      missionId: input.missionId,
      missionCta,
      imagePrompt,
      keywords: parsed.keywords || [],
    };
  }

  async generateImagePrompt(topic: string, category: string): Promise<string> {
    const categoryData = UNIFIED_CATEGORIES.find(c => c.id === category || c.name === category);
    const emoji = categoryData?.emoji || "✨";
    
    return `${topic}, ${PAPERCRAFT_STYLE_PROMPT}`;
  }

  async refineDraft(currentContent: string, instruction: string): Promise<string> {
    if (!this.genAI) {
      throw new Error("Gemini API não configurada");
    }

    const prompt = `${KAROO_VOICE_PROMPT}

Conteúdo atual:
${currentContent}

Instrução de ajuste: "${instruction}"

Aplique o ajuste solicitado mantendo o tom da Karoo.
Retorne APENAS o conteúdo HTML ajustado, sem explicações.`;

    const result = await this.genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return result.text || "";
  }

  async suggestThemes(): Promise<{ topic: string; category: string; relatedMissions: any[] }[]> {
    if (!this.genAI) {
      throw new Error("Gemini API não configurada");
    }
    
    const existingContent = await db.select({ title: content.title, category: content.category })
      .from(content)
      .where(eq(content.isPublished, true))
      .limit(20);
    
    const existingTitles = existingContent.map(c => c.title).join(", ");

    const prompt = `Você é especialista em conteúdo para mães ocupadas.

Conteúdos já existentes: ${existingTitles}

Sugira 3 temas novos e relevantes para o público (mães de 30-45 anos com filhos pequenos).
Considere: tendências sazonais, dores comuns, praticidade.

Categorias disponíveis:
${UNIFIED_CATEGORIES.map(c => `- ${c.id}: ${c.name}`).join("\n")}

Retorne um JSON array:
[
  {"topic": "Tema sugerido", "category": "id-da-categoria", "reason": "Por que é relevante agora"}
]

Retorne APENAS o JSON array, sem markdown.`;

    const result = await this.genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const response = result.text || "";
    
    let themes: any[] = [];
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        themes = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("[ContentHub] Erro ao parsear temas:", response);
      return [];
    }

    const themesWithMissions = await Promise.all(themes.map(async (theme: any) => {
      const relatedMissions = await this.matchMissionsByTopic(theme.topic);
      return {
        topic: theme.topic,
        category: theme.category,
        reason: theme.reason,
        relatedMissions: relatedMissions.slice(0, 3),
      };
    }));

    return themesWithMissions;
  }

  async searchByTermOrCategory(searchTerm?: string, categoryId?: string): Promise<any[]> {
    let query = db.select().from(content).where(eq(content.isPublished, true));
    
    const results = await query;
    
    let filtered = results;
    
    if (categoryId) {
      const category = UNIFIED_CATEGORIES.find(c => c.id === categoryId);
      if (category) {
        filtered = filtered.filter(item => {
          const itemCategory = item.category?.toLowerCase() || "";
          const itemTitle = item.title?.toLowerCase() || "";
          const itemDesc = item.description?.toLowerCase() || "";
          
          return category.keywords.some(keyword => 
            itemCategory.includes(keyword) || 
            itemTitle.includes(keyword) || 
            itemDesc.includes(keyword)
          );
        });
      }
    }
    
    if (searchTerm) {
      const terms = searchTerm.toLowerCase().split(/\s+/).filter(t => t.length > 2);
      filtered = filtered.filter(item => {
        const itemText = `${item.title} ${item.description} ${item.category}`.toLowerCase();
        return terms.some(term => itemText.includes(term));
      });
    }
    
    return filtered;
  }

  async getAllSeasonalThemes(): Promise<any[]> {
    return db.select().from(seasonalThemes).orderBy(seasonalThemes.startDate);
  }

  async getActiveSeasonalThemes(): Promise<any[]> {
    const now = new Date();
    return db.select()
      .from(seasonalThemes)
      .where(
        and(
          eq(seasonalThemes.isActive, true),
          lte(seasonalThemes.startDate, now),
          gte(seasonalThemes.endDate, now)
        )
      )
      .orderBy(desc(sql`CASE WHEN priority = 'high' THEN 1 WHEN priority = 'medium' THEN 2 ELSE 3 END`));
  }

  async getUpcomingSeasonalThemes(days: number = 30): Promise<any[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return db.select()
      .from(seasonalThemes)
      .where(
        and(
          eq(seasonalThemes.isActive, true),
          gte(seasonalThemes.startDate, now),
          lte(seasonalThemes.startDate, futureDate)
        )
      )
      .orderBy(seasonalThemes.startDate);
  }

  async createSeasonalTheme(data: any): Promise<any> {
    const [theme] = await db.insert(seasonalThemes).values(data).returning();
    return theme;
  }

  async updateSeasonalTheme(id: string, data: any): Promise<any> {
    const [theme] = await db.update(seasonalThemes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(seasonalThemes.id, id))
      .returning();
    return theme;
  }

  async deleteSeasonalTheme(id: string): Promise<void> {
    await db.delete(seasonalThemes).where(eq(seasonalThemes.id, id));
  }

  async getSeasonalAlerts(): Promise<TrendAlert[]> {
    const activeThemes = await this.getActiveSeasonalThemes();
    const upcomingThemes = await this.getUpcomingSeasonalThemes(14);
    
    const alerts: TrendAlert[] = [];
    
    for (const theme of activeThemes) {
      const relatedMissions = await this.matchMissionsByTopic(theme.name);
      alerts.push({
        id: `seasonal-${theme.id}`,
        type: "seasonal",
        title: `🗓️ ${theme.name}`,
        description: theme.description || `Tema sazonal ativo até ${new Date(theme.endDate).toLocaleDateString('pt-BR')}`,
        suggestedMissions: relatedMissions.slice(0, 3).map(m => ({ id: m.id, title: m.title, slug: m.slug })),
        priority: theme.priority as "high" | "medium" | "low",
        expiresAt: new Date(theme.endDate),
      });
    }
    
    for (const theme of upcomingThemes) {
      const relatedMissions = await this.matchMissionsByTopic(theme.name);
      const daysUntil = Math.ceil((new Date(theme.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `upcoming-${theme.id}`,
        type: "seasonal",
        title: `⏰ ${theme.name} em ${daysUntil} dias`,
        description: theme.description || `Prepare conteúdo para ${theme.name}`,
        suggestedMissions: relatedMissions.slice(0, 3).map(m => ({ id: m.id, title: m.title, slug: m.slug })),
        priority: daysUntil <= 7 ? "high" : "medium",
      });
    }
    
    return alerts;
  }

  async getTrendingTopics(): Promise<TrendAlert[]> {
    if (!this.genAI) {
      return [];
    }

    try {
      const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
      const prompt = `Você é um especialista em tendências de conteúdo para mães brasileiras.
      
Considerando o mês atual (${currentMonth}), liste 5 tópicos que estão em alta ou têm potencial viral para o público de mães com filhos de 2-10 anos.

Para cada tópico, forneça:
1. Título curto (máx 50 caracteres)
2. Por que está em alta (1 frase)
3. Categoria relacionada: rotina-organizacao, casa-ordem, cozinha-alimentacao, educacao-brincadeiras, bem-estar-autocuidado, passeios-viagens, ou saude-seguranca
4. Nível de urgência: alta, media, baixa

Responda APENAS em JSON válido:
{
  "trends": [
    {
      "title": "string",
      "reason": "string",
      "category": "string",
      "priority": "alta|media|baixa"
    }
  ]
}`;

      const result = await this.genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
      });

      const text = result.text || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return [];

      const parsed = JSON.parse(jsonMatch[0]);
      const alerts: TrendAlert[] = [];

      for (const trend of parsed.trends || []) {
        const relatedMissions = await this.matchMissionsByTopic(trend.title);
        alerts.push({
          id: `trend-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: "trending",
          title: `🔥 ${trend.title}`,
          description: trend.reason,
          suggestedMissions: relatedMissions.slice(0, 3).map(m => ({ id: m.id, title: m.title, slug: m.slug })),
          priority: trend.priority === "alta" ? "high" : trend.priority === "media" ? "medium" : "low",
        });
      }

      return alerts;
    } catch (error) {
      console.error("Error fetching trending topics:", error);
      return [];
    }
  }

  async getAllAlerts(): Promise<{ seasonal: TrendAlert[]; trending: TrendAlert[] }> {
    const [seasonal, trending] = await Promise.all([
      this.getSeasonalAlerts(),
      this.getTrendingTopics(),
    ]);
    return { seasonal, trending };
  }
}

export const contentHubService = new ContentHubService();
