import { db } from '../db';
import { 
  regionApiLimits, 
  productRegionalData, 
  userLocationCache, 
  smartLinkAnalytics,
  products,
  Region,
  RegionApiLimits,
  ProductRegionalData 
} from '@shared/schema';
import { eq, and, desc, gte, lte, sql, count, sum, avg } from 'drizzle-orm';
import { AmazonPAAPIService } from './amazonApi';

interface CostAnalytics {
  currentMonthSpent: number;
  dailyAverageSpent: number;
  requestsToday: number;
  remainingBudget: number;
  projectedMonthlySpend: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface CacheStrategy {
  shouldCache: boolean;
  cacheDuration: number; // em horas
  priority: 'immediate' | 'batch' | 'defer';
  reason: string;
}

interface DemandPrediction {
  expectedRequests: number;
  peakHours: number[];
  costSavingOpportunity: number;
  recommendedBatchTime: string;
}

export class APICostOptimizer {
  private amazonService: AmazonPAAPIService;
  
  // Custos estimados por região (em USD por 1000 requests)
  private readonly REGION_COSTS = {
    'BR': 0.50,  // Brasil
    'US': 0.75,  // Estados Unidos
    'ES': 0.60,  // Espanha
    'FR': 0.65,  // França
    'DE': 0.70,  // Alemanha
    'MX': 0.55,  // México
    'CA': 0.70,  // Canadá
    'UK': 0.65,  // Reino Unido
    'IT': 0.60,  // Itália
    'JP': 0.80   // Japão
  };

  constructor() {
    this.amazonService = new AmazonPAAPIService();
  }

  // ========================================
  // 1. ANÁLISE DE CUSTOS EM TEMPO REAL
  // ========================================

  /**
   * Obtém análise completa de custos por região
   */
  async getCostAnalytics(regionId: string): Promise<CostAnalytics> {
    const limits = await this.getRegionLimits(regionId);
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Calcular estatísticas do mês
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysElapsed = today.getDate();
    const dailyAverage = (parseFloat(limits.currentMonthlySpent?.toString() || '0')) / daysElapsed;
    const projectedSpend = dailyAverage * daysInMonth;
    
    // Determinar nível de risco
    const budgetUsagePercent = (parseFloat(limits.currentMonthlySpent?.toString() || '0')) / (parseFloat(limits.monthlyBudget?.toString() || '1'));
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    
    if (budgetUsagePercent > 0.8) riskLevel = 'high';
    else if (budgetUsagePercent > 0.6) riskLevel = 'medium';

    // Gerar recomendações
    const recommendations = await this.generateCostRecommendations(regionId, limits);

    return {
      currentMonthSpent: parseFloat(limits.currentMonthlySpent?.toString() || '0'),
      dailyAverageSpent: dailyAverage,
      requestsToday: limits.currentDailyUsage || 0,
      remainingBudget: parseFloat(limits.monthlyBudget?.toString() || '0') - parseFloat(limits.currentMonthlySpent?.toString() || '0'),
      projectedMonthlySpend: projectedSpend,
      riskLevel,
      recommendations
    };
  }

  /**
   * Gera recomendações específicas para otimização de custos
   */
  private async generateCostRecommendations(regionId: string, limits: RegionApiLimits): Promise<string[]> {
    const recommendations: string[] = [];
    const budgetUsage = parseFloat(limits.currentMonthlySpent?.toString() || '0') / parseFloat(limits.monthlyBudget?.toString() || '1');

    if (budgetUsage > 0.8) {
      recommendations.push("🚨 Orçamento quase esgotado - considere throttling agressivo");
      recommendations.push("📊 Priorize apenas produtos de alta frequência e mais acessados");
    }

    if (limits.currentDailyUsage > (limits.dailyRequestLimit * 0.7)) {
      recommendations.push("⏰ Limite diário próximo - agrupar requisições em batches");
    }

    // Verificar produtos com cache expirado
    const expiredCache = await this.getExpiredCacheCount(regionId);
    if (expiredCache > 100) {
      recommendations.push(`🔄 ${expiredCache} produtos com cache expirado - processamento em lote recomendado`);
    }

    // Análise de produtos inativos
    const inactiveProducts = await this.getInactiveProductsCount(regionId);
    if (inactiveProducts > 10) {
      recommendations.push(`🗑️ ${inactiveProducts} produtos inativos consumindo API - considere desativar`);
    }

    return recommendations;
  }

  // ========================================
  // 2. CACHE INTELIGENTE E ESTRATÉGIAS
  // ========================================

  /**
   * Determina estratégia de cache baseada em múltiplos fatores
   */
  async determineCacheStrategy(productId: string, regionId: string): Promise<CacheStrategy> {
    // Obter dados do produto e região
    const productPopularity = await this.getProductPopularity(productId);
    const regionLimits = await this.getRegionLimits(regionId);
    const lastUpdate = await this.getLastUpdateTime(productId, regionId);
    
    // Verificar orçamento restante
    const budgetUsage = (regionLimits.currentMonthlySpent?.toNumber() || 0) / (regionLimits.monthlyBudget?.toNumber() || 1);
    
    // Análise de popularidade (baseado em cliques, visualizações, favoritos)
    let priority: 'immediate' | 'batch' | 'defer' = 'batch';
    let cacheDuration = 6; // horas padrão
    
    // Produtos muito populares - prioridade alta
    if (productPopularity.score > 0.8) {
      priority = 'immediate';
      cacheDuration = 2; // Cache mais frequente para produtos populares
    }
    // Produtos pouco acessados - baixa prioridade
    else if (productPopularity.score < 0.3) {
      priority = 'defer';
      cacheDuration = 24; // Cache por mais tempo
    }

    // Ajustar baseado no orçamento
    if (budgetUsage > 0.8) {
      priority = priority === 'immediate' ? 'batch' : 'defer';
      cacheDuration *= 2; // Dobrar duração do cache quando orçamento baixo
    }

    // Verificar se precisa de atualização urgente
    const hoursExpired = this.getHoursSinceUpdate(lastUpdate);
    const shouldCache = hoursExpired >= cacheDuration;

    return {
      shouldCache,
      cacheDuration,
      priority,
      reason: this.getCacheReason(productPopularity, budgetUsage, hoursExpired)
    };
  }

  /**
   * Calcula popularidade do produto baseada em múltiplas métricas
   */
  private async getProductPopularity(productId: string): Promise<{ score: number; metrics: any }> {
    const [clicksResult, favoritesResult, viewsResult] = await Promise.all([
      // Cliques nos últimos 30 dias
      db.select({ count: sql<number>`count(*)` })
        .from(smartLinkAnalytics)
        .where(
          and(
            eq(smartLinkAnalytics.productId, productId),
            gte(smartLinkAnalytics.clickTimestamp, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          )
        ),
      
      // Número de favoritos
      db.select({ count: sql<number>`count(*)` })
        .from(sql`favorites`)
        .where(eq(sql`product_id`, productId)),
        
      // Views do produto (assumindo que temos isso rastreado)
      db.select()
        .from(products)
        .where(eq(products.id, productId))
    ]);

    const clicks = clicksResult[0]?.count || 0;
    const favorites = favoritesResult[0]?.count || 0;
    const views = 0; // TODO: Implementar tracking de views

    // Fórmula ponderada para score de popularidade (0-1)
    const normalizedClicks = Math.min(clicks / 100, 1); // Max 100 cliques = score 1
    const normalizedFavorites = Math.min(favorites / 50, 1); // Max 50 favoritos = score 1
    const normalizedViews = Math.min(views / 1000, 1); // Max 1000 views = score 1

    const score = (normalizedClicks * 0.4) + (normalizedFavorites * 0.3) + (normalizedViews * 0.3);

    return {
      score,
      metrics: { clicks, favorites, views }
    };
  }

  /**
   * Processamento em lote para otimizar custos
   */
  async processBatchUpdates(regionId: string, maxRequests: number = 50): Promise<number> {
    // Buscar produtos que precisam de atualização, priorizados por estratégia
    const candidateProducts = await db
      .select()
      .from(productRegionalData)
      .where(
        and(
          eq(productRegionalData.regionId, regionId),
          eq(productRegionalData.isAvailable, true)
        )
      )
      .orderBy(desc(productRegionalData.lastChecked))
      .limit(maxRequests * 2); // Buscar mais para filtrar depois

    let processed = 0;
    const promises: Promise<void>[] = [];

    for (const product of candidateProducts) {
      if (processed >= maxRequests) break;

      const strategy = await this.determineCacheStrategy(product.productId, regionId);
      
      if (strategy.shouldCache && strategy.priority !== 'defer') {
        promises.push(this.updateProductData(product.productId, regionId));
        processed++;
      }
    }

    // Executar atualizações em paralelo (com rate limiting)
    await this.executeWithRateLimit(promises, 5); // Max 5 simultâneas

    // Atualizar contador de uso
    await this.incrementApiUsage(regionId, processed);

    return processed;
  }

  // ========================================
  // 3. PREDIÇÃO DE DEMANDA E AGENDAMENTO
  // ========================================

  /**
   * Prediz demanda baseada em padrões históricos
   */
  async predictDemand(regionId: string): Promise<DemandPrediction> {
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Analisar padrões de cliques por hora
    const hourlyPattern = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM click_timestamp)`,
        count: sql<number>`count(*)`
      })
      .from(smartLinkAnalytics)
      .where(
        and(
          eq(smartLinkAnalytics.redirectedRegion, regionId),
          gte(smartLinkAnalytics.clickTimestamp, last30Days)
        )
      )
      .groupBy(sql`EXTRACT(HOUR FROM click_timestamp)`)
      .orderBy(desc(sql`count(*)`));

    // Identificar horários de pico (top 25%)
    const totalClicks = hourlyPattern.reduce((sum, h) => sum + h.count, 0);
    const averagePerHour = totalClicks / 24;
    const peakHours = hourlyPattern
      .filter(h => h.count > averagePerHour * 1.25)
      .map(h => h.hour);

    // Estimar demanda com base no crescimento
    const weeklyGrowth = await this.calculateWeeklyGrowth(regionId);
    const expectedRequests = Math.ceil(totalClicks * (1 + weeklyGrowth) / 30);

    // Calcular economia potencial com batching
    const currentCost = expectedRequests * (this.REGION_COSTS[regionId as keyof typeof this.REGION_COSTS] || 0.60) / 1000;
    const batchedCost = currentCost * 0.7; // 30% de economia com batch processing
    const costSavingOpportunity = currentCost - batchedCost;

    // Recomendar melhor horário para batch (menor atividade)
    const offPeakHours = hourlyPattern
      .filter(h => !peakHours.includes(h.hour))
      .sort((a, b) => a.count - b.count)
      .slice(0, 3);
    
    const recommendedBatchTime = offPeakHours.length > 0 
      ? `${offPeakHours[0].hour}:00` 
      : "03:00";

    return {
      expectedRequests,
      peakHours,
      costSavingOpportunity,
      recommendedBatchTime
    };
  }

  /**
   * Agenda atualizações inteligentes baseadas na demanda
   */
  async scheduleIntelligentUpdates(regionId: string): Promise<void> {
    const prediction = await this.predictDemand(regionId);
    const currentHour = new Date().getHours();

    // Se estamos em horário de pico, priorizar produtos populares apenas
    if (prediction.peakHours.includes(currentHour)) {
      await this.processPriorityUpdates(regionId, 20);
    } else {
      // Horário off-peak - processar lote maior
      await this.processBatchUpdates(regionId, 100);
    }
  }

  /**
   * Processa apenas produtos de alta prioridade (horários de pico)
   */
  private async processPriorityUpdates(regionId: string, maxRequests: number): Promise<void> {
    const highPriorityProducts = await this.getHighPriorityProducts(regionId, maxRequests);
    
    for (const product of highPriorityProducts) {
      await this.updateProductData(product.productId, regionId);
    }
    
    await this.incrementApiUsage(regionId, highPriorityProducts.length);
  }

  // ========================================
  // 4. CONTROLE DE ORÇAMENTO E THROTTLING
  // ========================================

  /**
   * Verifica se região pode fazer requisições (throttling inteligente)
   */
  async canMakeRequest(regionId: string): Promise<{ allowed: boolean; reason?: string }> {
    const limits = await this.getRegionLimits(regionId);
    
    // Verificar se região está em throttling manual
    if (limits.isThrottled && limits.throttleUntil && limits.throttleUntil > new Date()) {
      return { 
        allowed: false, 
        reason: `Região em throttling até ${limits.throttleUntil.toISOString()}` 
      };
    }

    // Verificar limite diário
    if (limits.currentDailyUsage >= limits.dailyRequestLimit) {
      return { 
        allowed: false, 
        reason: "Limite diário de requisições atingido" 
      };
    }

    // Verificar orçamento mensal
    const budgetUsage = parseFloat(limits.currentMonthlySpent?.toString() || '0') / parseFloat(limits.monthlyBudget?.toString() || '1');
    if (budgetUsage >= 0.95) {
      return { 
        allowed: false, 
        reason: "95% do orçamento mensal usado" 
      };
    }

    return { allowed: true };
  }

  /**
   * Implementa throttling dinâmico baseado no orçamento
   */
  async implementDynamicThrottling(regionId: string): Promise<void> {
    const limits = await this.getRegionLimits(regionId);
    const budgetUsage = parseFloat(limits.currentMonthlySpent?.toString() || '0') / parseFloat(limits.monthlyBudget?.toString() || '1');
    
    // Throttling agressivo se orçamento > 80%
    if (budgetUsage > 0.8) {
      const today = new Date();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const daysRemaining = Math.ceil((endOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Reduzir limite diário baseado nos dias restantes
      const adjustedDailyLimit = Math.floor(limits.dailyRequestLimit * 0.3); // 70% de redução
      
      await db
        .update(regionApiLimits)
        .set({
          dailyRequestLimit: adjustedDailyLimit,
          isThrottled: true,
          throttleUntil: endOfMonth,
          updatedAt: new Date()
        })
        .where(eq(regionApiLimits.regionId, regionId));
    }
  }

  // ========================================
  // 5. UTILITÁRIOS E HELPERS
  // ========================================

  private async getRegionLimits(regionId: string): Promise<RegionApiLimits> {
    const [limits] = await db
      .select()
      .from(regionApiLimits)
      .where(eq(regionApiLimits.regionId, regionId));

    if (!limits) {
      // Criar limites padrão se não existir
      return await this.createDefaultLimits(regionId);
    }

    return limits;
  }

  private async createDefaultLimits(regionId: string): Promise<RegionApiLimits> {
    const defaultLimits = {
      regionId,
      dailyRequestLimit: 1000,
      currentDailyUsage: 0,
      monthlyBudget: "100.00",
      currentMonthlySpent: "0.00",
      costPerRequest: (this.REGION_COSTS[regionId as keyof typeof this.REGION_COSTS] || 0.60) / 1000,
      lastReset: new Date(),
      isThrottled: false
    };

    const [created] = await db
      .insert(regionApiLimits)
      .values([defaultLimits])
      .returning();

    return created;
  }

  private async getExpiredCacheCount(regionId: string): Promise<number> {
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(productRegionalData)
      .where(
        and(
          eq(productRegionalData.regionId, regionId),
          lte(productRegionalData.lastChecked, sixHoursAgo)
        )
      );

    return result?.count || 0;
  }

  private async getInactiveProductsCount(regionId: string): Promise<number> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(productRegionalData)
      .where(
        and(
          eq(productRegionalData.regionId, regionId),
          eq(productRegionalData.isAvailable, false),
          lte(productRegionalData.unavailableSince, thirtyDaysAgo)
        )
      );

    return result?.count || 0;
  }

  private async getLastUpdateTime(productId: string, regionId: string): Promise<Date | null> {
    const [result] = await db
      .select()
      .from(productRegionalData)
      .where(
        and(
          eq(productRegionalData.productId, productId),
          eq(productRegionalData.regionId, regionId)
        )
      );

    return result?.lastChecked || null;
  }

  private getHoursSinceUpdate(lastUpdate: Date | null): number {
    if (!lastUpdate) return 999; // Força atualização se nunca foi atualizado
    return (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
  }

  private getCacheReason(popularity: any, budgetUsage: number, hoursExpired: number): string {
    if (budgetUsage > 0.8) return "Orçamento limitado - cache estendido";
    if (popularity.score > 0.8) return "Produto popular - cache frequente";
    if (hoursExpired > 24) return "Cache muito antigo - atualização necessária";
    return "Cache dentro da estratégia normal";
  }

  private async calculateWeeklyGrowth(regionId: string): Promise<number> {
    // Implementar cálculo de crescimento semanal baseado em dados históricos
    return 0.05; // 5% de crescimento padrão
  }

  private async getHighPriorityProducts(regionId: string, limit: number): Promise<ProductRegionalData[]> {
    // Buscar produtos mais populares que precisam de atualização
    return await db
      .select()
      .from(productRegionalData)
      .where(eq(productRegionalData.regionId, regionId))
      .limit(limit);
  }

  private async updateProductData(productId: string, regionId: string): Promise<void> {
    // Implementar atualização específica do produto para região
    // (integrar com ProductUpdateService existente)
  }

  private async executeWithRateLimit(promises: Promise<void>[], concurrent: number): Promise<void> {
    for (let i = 0; i < promises.length; i += concurrent) {
      const batch = promises.slice(i, i + concurrent);
      await Promise.all(batch);
      
      // Delay entre batches para rate limiting
      if (i + concurrent < promises.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private async incrementApiUsage(regionId: string, requestCount: number): Promise<void> {
    const cost = requestCount * (this.REGION_COSTS[regionId as keyof typeof this.REGION_COSTS] || 0.60) / 1000;
    
    await db
      .update(regionApiLimits)
      .set({
        currentDailyUsage: sql`current_daily_usage + ${requestCount}`,
        currentMonthlySpent: sql`current_monthly_spent + ${cost}`,
        updatedAt: new Date()
      })
      .where(eq(regionApiLimits.regionId, regionId));
  }
}

export default APICostOptimizer;