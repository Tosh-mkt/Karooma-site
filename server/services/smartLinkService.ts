import { db } from '../db';
import { 
  productRegionalData, 
  smartLinkAnalytics, 
  productMappings,
  products,
  regions,
  Product,
  ProductRegionalData,
  Region 
} from '@shared/schema';
import { eq, and, desc, isNotNull, sql } from 'drizzle-orm';
import UserLocalizationService from './userLocalizationService';
import APICostOptimizer from './apiCostOptimizer';

interface SmartLinkRequest {
  productId: string;
  userIp: string;
  userAgent?: string;
  acceptLanguage?: string;
  timezone?: string;
  sessionId?: string;
  userId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

interface SmartLinkResponse {
  redirectUrl: string;
  targetRegion: string;
  originalRegion?: string;
  fallbackUsed: boolean;
  reason: string;
  analytics: {
    productAvailable: boolean;
    priceInLocalCurrency?: string;
    estimatedShipping?: string;
    isPrime?: boolean;
  };
}

interface FallbackStrategy {
  type: 'similar-product' | 'nearby-region' | 'global-alternative';
  targetProductId?: string;
  targetRegion: string;
  confidence: number;
  reason: string;
}

export class SmartLinkService {
  private localizationService: UserLocalizationService;
  private costOptimizer: APICostOptimizer;

  constructor() {
    this.localizationService = new UserLocalizationService();
    this.costOptimizer = new APICostOptimizer();
  }

  // ========================================
  // 1. PROCESSAMENTO PRINCIPAL DE LINKS
  // ========================================

  /**
   * Processa link inteligente e retorna URL de redirecionamento
   */
  async processSmartLink(request: SmartLinkRequest): Promise<SmartLinkResponse> {
    try {
      // 1. Detectar região do usuário
      const locationResult = await this.localizationService.detectUserRegion({
        ipAddress: request.userIp,
        userAgent: request.userAgent,
        acceptLanguage: request.acceptLanguage,
        timezone: request.timezone,
        sessionId: request.sessionId,
        userId: request.userId
      });

      const userRegion = locationResult.detectedRegion;

      // 2. Buscar produto na região do usuário
      const regionalProduct = await this.getRegionalProduct(request.productId, userRegion);

      let response: SmartLinkResponse;

      if (regionalProduct && regionalProduct.isAvailable && regionalProduct.affiliateLink) {
        // Produto disponível na região do usuário
        response = {
          redirectUrl: regionalProduct.affiliateLink,
          targetRegion: userRegion,
          fallbackUsed: false,
          reason: `Produto disponível na região ${userRegion}`,
          analytics: {
            productAvailable: true,
            priceInLocalCurrency: this.formatPrice(regionalProduct.localPrice, regionalProduct.currency),
            estimatedShipping: regionalProduct.shippingInfo || undefined,
            isPrime: regionalProduct.isPrime || false
          }
        };
      } else {
        // Produto não disponível - usar estratégia de fallback
        const fallbackStrategy = await this.determineFallbackStrategy(request.productId, userRegion);
        response = await this.executeFallbackStrategy(request.productId, fallbackStrategy, userRegion);
      }

      // 3. Registrar analytics
      await this.recordAnalytics(request, response, locationResult.confidence);

      return response;

    } catch (error) {
      console.error('Erro no processamento de smart link:', error);
      
      // Fallback de emergência - região Brasil
      const emergencyProduct = await this.getRegionalProduct(request.productId, 'BR');
      return {
        redirectUrl: emergencyProduct?.affiliateLink || '#',
        targetRegion: 'BR',
        fallbackUsed: true,
        reason: 'Erro no sistema - usando fallback de emergência',
        analytics: { productAvailable: false }
      };
    }
  }

  /**
   * Gera link inteligente para produto
   */
  generateSmartLink(productId: string, baseUrl: string = ''): string {
    return `${baseUrl}/link/smart/${productId}`;
  }

  /**
   * Gera múltiplos links para diferentes contextos
   */
  async generateMultiContextLinks(productId: string, baseUrl: string = ''): Promise<{
    smart: string;
    regional: Record<string, string>;
    embeddable: string;
    withTracking: string;
  }> {
    const activeRegions = await this.localizationService.getActiveRegions();
    
    const regionalLinks: Record<string, string> = {};
    for (const region of activeRegions) {
      regionalLinks[region.id] = `${baseUrl}/link/region/${region.id}/${productId}`;
    }

    return {
      smart: this.generateSmartLink(productId, baseUrl),
      regional: regionalLinks,
      embeddable: `${baseUrl}/embed/product/${productId}`,
      withTracking: `${baseUrl}/link/smart/${productId}?track=1`
    };
  }

  // ========================================
  // 2. ESTRATÉGIAS DE FALLBACK
  // ========================================

  /**
   * Determina melhor estratégia de fallback quando produto não disponível
   */
  private async determineFallbackStrategy(productId: string, userRegion: string): Promise<FallbackStrategy> {
    
    // Estratégia 1: Produto similar na mesma região
    const similarInRegion = await this.findSimilarProductInRegion(productId, userRegion);
    if (similarInRegion) {
      return {
        type: 'similar-product',
        targetProductId: similarInRegion.equivalentProductId,
        targetRegion: userRegion,
        confidence: parseFloat(similarInRegion.similarityScore?.toString() || '0.8'),
        reason: 'Produto similar encontrado na mesma região'
      };
    }

    // Estratégia 2: Mesmo produto em região próxima
    const nearbyRegion = await this.findProductInNearbyRegion(productId, userRegion);
    if (nearbyRegion) {
      return {
        type: 'nearby-region',
        targetRegion: nearbyRegion.regionId,
        confidence: 0.7,
        reason: `Produto disponível em região próxima: ${nearbyRegion.regionId}`
      };
    }

    // Estratégia 3: Fallback global (região mais popular)
    const globalFallback = await this.getGlobalFallbackRegion(productId);
    return {
      type: 'global-alternative',
      targetRegion: globalFallback,
      confidence: 0.5,
      reason: 'Usando região de fallback global'
    };
  }

  /**
   * Executa estratégia de fallback escolhida
   */
  private async executeFallbackStrategy(
    originalProductId: string, 
    strategy: FallbackStrategy, 
    userRegion: string
  ): Promise<SmartLinkResponse> {
    
    const targetProductId = strategy.targetProductId || originalProductId;
    const regionalProduct = await this.getRegionalProduct(targetProductId, strategy.targetRegion);

    if (!regionalProduct || !regionalProduct.affiliateLink) {
      // Fallback final - produto original na região Brasil
      const emergencyProduct = await this.getRegionalProduct(originalProductId, 'BR');
      return {
        redirectUrl: emergencyProduct?.affiliateLink || '#',
        targetRegion: 'BR',
        originalRegion: userRegion,
        fallbackUsed: true,
        reason: 'Fallback de emergência - região Brasil',
        analytics: { productAvailable: false }
      };
    }

    return {
      redirectUrl: regionalProduct.affiliateLink,
      targetRegion: strategy.targetRegion,
      originalRegion: userRegion !== strategy.targetRegion ? userRegion : undefined,
      fallbackUsed: true,
      reason: strategy.reason,
      analytics: {
        productAvailable: true,
        priceInLocalCurrency: this.formatPrice(regionalProduct.localPrice, regionalProduct.currency),
        estimatedShipping: regionalProduct.shippingInfo || 'Pode variar por região',
        isPrime: regionalProduct.isPrime || false
      }
    };
  }

  // ========================================
  // 3. BUSCA E MAPEAMENTO DE PRODUTOS
  // ========================================

  /**
   * Busca dados regionais do produto
   */
  private async getRegionalProduct(productId: string, regionId: string): Promise<ProductRegionalData | null> {
    const [regionalData] = await db
      .select()
      .from(productRegionalData)
      .where(
        and(
          eq(productRegionalData.productId, productId),
          eq(productRegionalData.regionId, regionId)
        )
      );

    return regionalData || null;
  }

  /**
   * Busca produto similar na mesma região
   */
  private async findSimilarProductInRegion(productId: string, regionId: string): Promise<any> {
    const [mapping] = await db
      .select()
      .from(productMappings)
      .where(
        and(
          eq(productMappings.baseProductId, productId),
          eq(productMappings.regionId, regionId),
          eq(productMappings.isActive, true)
        )
      )
      .orderBy(desc(productMappings.similarityScore))
      .limit(1);

    if (!mapping) return null;

    // Verificar se produto mapeado está disponível
    const regionalData = await this.getRegionalProduct(mapping.equivalentProductId, regionId);
    if (!regionalData || !regionalData.isAvailable) return null;

    return mapping;
  }

  /**
   * Busca mesmo produto em região próxima
   */
  private async findProductInNearbyRegion(productId: string, userRegion: string): Promise<ProductRegionalData | null> {
    // Definir regiões próximas baseado na localização
    const nearbyRegions = this.getNearbyRegions(userRegion);
    
    for (const regionId of nearbyRegions) {
      const regionalData = await this.getRegionalProduct(productId, regionId);
      if (regionalData && regionalData.isAvailable && regionalData.affiliateLink) {
        return regionalData;
      }
    }

    return null;
  }

  /**
   * Obtém região de fallback global (mais popular)
   */
  private async getGlobalFallbackRegion(productId: string): Promise<string> {
    // Buscar região com mais clicks para este produto
    const [mostPopular] = await db
      .select({
        region: smartLinkAnalytics.redirectedRegion,
        count: sql<number>`count(*)`
      })
      .from(smartLinkAnalytics)
      .where(eq(smartLinkAnalytics.productId, productId))
      .groupBy(smartLinkAnalytics.redirectedRegion)
      .orderBy(desc(sql`count(*)`))
      .limit(1);

    if (mostPopular) {
      return mostPopular.region;
    }

    // Fallback padrão
    return 'BR';
  }

  /**
   * Define regiões próximas baseado na localização do usuário
   */
  private getNearbyRegions(userRegion: string): string[] {
    const proximityMap: Record<string, string[]> = {
      'BR': ['US', 'ES', 'MX'],
      'US': ['CA', 'MX', 'UK'],
      'CA': ['US', 'UK'],
      'MX': ['US', 'ES', 'BR'],
      'ES': ['FR', 'IT', 'PT', 'BR'],
      'FR': ['DE', 'ES', 'IT', 'UK'],
      'DE': ['FR', 'UK', 'IT'],
      'IT': ['ES', 'FR', 'DE'],
      'UK': ['FR', 'DE', 'US'],
      'JP': ['US', 'UK']
    };

    return proximityMap[userRegion] || ['US', 'BR'];
  }

  // ========================================
  // 4. ANALYTICS E TRACKING
  // ========================================

  /**
   * Registra analytics do link processado
   */
  private async recordAnalytics(
    request: SmartLinkRequest, 
    response: SmartLinkResponse, 
    confidence: number
  ): Promise<void> {
    try {
      await db.insert(smartLinkAnalytics).values({
        productId: request.productId,
        originalRegion: response.originalRegion || response.targetRegion,
        redirectedRegion: response.targetRegion,
        userAgent: request.userAgent,
        ipAddress: request.userIp,
        wasAvailable: response.analytics.productAvailable,
        fallbackUsed: response.fallbackUsed
      });
    } catch (error) {
      console.error('Erro ao registrar analytics:', error);
    }
  }

  /**
   * Obtém estatísticas de performance dos links
   */
  async getLinkPerformanceStats(productId?: string, regionId?: string): Promise<{
    totalClicks: number;
    successRate: number;
    fallbackRate: number;
    topRegions: Array<{ region: string; clicks: number; percentage: number }>;
    conversionTrends: Array<{ date: string; clicks: number; conversions: number }>;
  }> {
    let baseQuery = db.select().from(smartLinkAnalytics);
    
    if (productId) {
      baseQuery = baseQuery.where(eq(smartLinkAnalytics.productId, productId));
    }
    if (regionId) {
      baseQuery = baseQuery.where(eq(smartLinkAnalytics.redirectedRegion, regionId));
    }

    // Total de clicks
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(smartLinkAnalytics);
    
    const totalClicks = totalResult?.count || 0;

    // Taxa de sucesso (produtos disponíveis)
    const [successResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(smartLinkAnalytics)
      .where(eq(smartLinkAnalytics.wasAvailable, true));
    
    const successRate = totalClicks > 0 ? (successResult?.count || 0) / totalClicks : 0;

    // Taxa de fallback
    const [fallbackResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(smartLinkAnalytics)
      .where(eq(smartLinkAnalytics.fallbackUsed, true));
    
    const fallbackRate = totalClicks > 0 ? (fallbackResult?.count || 0) / totalClicks : 0;

    // Top regiões
    const topRegions = await db
      .select({
        region: smartLinkAnalytics.redirectedRegion,
        clicks: sql<number>`count(*)`
      })
      .from(smartLinkAnalytics)
      .groupBy(smartLinkAnalytics.redirectedRegion)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const topRegionsWithPercentage = topRegions.map(r => ({
      region: r.region,
      clicks: r.clicks,
      percentage: totalClicks > 0 ? (r.clicks / totalClicks) * 100 : 0
    }));

    return {
      totalClicks,
      successRate: successRate * 100,
      fallbackRate: fallbackRate * 100,
      topRegions: topRegionsWithPercentage,
      conversionTrends: [] // TODO: Implementar análise temporal
    };
  }

  // ========================================
  // 5. OTIMIZAÇÕES E CACHE
  // ========================================

  /**
   * Pre-aquece cache de produtos populares
   */
  async preWarmCache(regionId: string, productIds?: string[]): Promise<void> {
    if (!productIds) {
      // Buscar produtos mais acessados se não especificado
      const popularProducts = await db
        .select({ productId: smartLinkAnalytics.productId })
        .from(smartLinkAnalytics)
        .where(eq(smartLinkAnalytics.redirectedRegion, regionId))
        .groupBy(smartLinkAnalytics.productId)
        .orderBy(desc(sql`count(*)`))
        .limit(50);
      
      productIds = popularProducts.map(p => p.productId);
    }

    // Verificar se pode fazer requisições
    const canRequest = await this.costOptimizer.canMakeRequest(regionId);
    if (!canRequest.allowed) {
      console.log(`Não é possível pre-aquecer cache para ${regionId}: ${canRequest.reason}`);
      return;
    }

    // Processar produtos em lote
    await this.costOptimizer.processBatchUpdates(regionId, Math.min(productIds.length, 25));
  }

  /**
   * Otimiza produtos baseado em padrões de acesso
   */
  async optimizeProductsByUsage(): Promise<void> {
    const regions = await this.localizationService.getActiveRegions();
    
    for (const region of regions) {
      // Analisar produtos mais acessados nos últimos 7 dias
      const recentPopular = await db
        .select({
          productId: smartLinkAnalytics.productId,
          clicks: sql<number>`count(*)`
        })
        .from(smartLinkAnalytics)
        .where(
          and(
            eq(smartLinkAnalytics.redirectedRegion, region.id),
            sql`click_timestamp > NOW() - INTERVAL '7 days'`
          )
        )
        .groupBy(smartLinkAnalytics.productId)
        .orderBy(desc(sql`count(*)`))
        .limit(20);

      // Ajustar frequência de cache para produtos populares
      for (const product of recentPopular) {
        await db
          .update(productRegionalData)
          .set({ 
            checkFrequency: product.clicks > 10 ? 'high' : 'medium' 
          })
          .where(
            and(
              eq(productRegionalData.productId, product.productId),
              eq(productRegionalData.regionId, region.id)
            )
          );
      }
    }
  }

  // ========================================
  // 6. UTILITÁRIOS
  // ========================================

  /**
   * Formata preço com moeda local
   */
  private formatPrice(price: string | null, currency: string | null): string {
    if (!price || !currency) return 'Preço não disponível';
    
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'Preço não disponível';

    const currencySymbols: Record<string, string> = {
      'BRL': 'R$',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'MXN': '$',
      'CAD': 'C$'
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol} ${numPrice.toFixed(2)}`;
  }

  /**
   * Valida configuração de região para smart links
   */
  async validateRegionConfiguration(regionId: string): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Verificar se região existe e está ativa
    const isValidRegion = await this.localizationService.isValidRegion(regionId);
    if (!isValidRegion) {
      issues.push(`Região ${regionId} não existe ou está inativa`);
    }

    // Verificar se há produtos regionais
    const [productCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(productRegionalData)
      .where(eq(productRegionalData.regionId, regionId));

    if (!productCount?.count || productCount.count < 10) {
      issues.push(`Poucos produtos configurados para região ${regionId}`);
      recommendations.push('Adicionar mais produtos regionais via PA API');
    }

    // Verificar produtos disponíveis
    const [availableCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(productRegionalData)
      .where(
        and(
          eq(productRegionalData.regionId, regionId),
          eq(productRegionalData.isAvailable, true),
          isNotNull(productRegionalData.affiliateLink)
        )
      );

    const availabilityRate = productCount?.count ? (availableCount?.count || 0) / productCount.count : 0;
    if (availabilityRate < 0.7) {
      issues.push(`Taxa de disponibilidade baixa: ${(availabilityRate * 100).toFixed(1)}%`);
      recommendations.push('Verificar e atualizar links de produtos indisponíveis');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }
}

export default SmartLinkService;