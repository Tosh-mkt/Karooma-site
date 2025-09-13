import { db } from '../db';
import { 
  userLocationCache, 
  userRegionalPreferences, 
  regions,
  Region,
  UserLocationCache,
  UserRegionalPreferences 
} from '@shared/schema';
import { eq, and, desc, gte, sql } from 'drizzle-orm';

interface LocationDetectionResult {
  detectedRegion: string;
  confidence: number;
  source: 'geoip' | 'cloudflare' | 'browser-lang' | 'timezone' | 'cache' | 'manual' | 'fallback';
  details: {
    countryCode?: string;
    regionCode?: string;
    city?: string;
    browserLanguage?: string;
    timezone?: string;
    userAgent?: string;
  };
}

interface RegionMapping {
  countryCode: string;
  preferredRegion: string;
  fallbackRegions: string[];
  confidence: number;
}

export class UserLocalizationService {
  
  // Mapeamento de países para regiões Amazon
  private readonly COUNTRY_REGION_MAPPING: Record<string, RegionMapping> = {
    // América
    'BR': { countryCode: 'BR', preferredRegion: 'BR', fallbackRegions: ['US'], confidence: 0.95 },
    'US': { countryCode: 'US', preferredRegion: 'US', fallbackRegions: ['CA'], confidence: 0.95 },
    'CA': { countryCode: 'CA', preferredRegion: 'CA', fallbackRegions: ['US'], confidence: 0.95 },
    'MX': { countryCode: 'MX', preferredRegion: 'MX', fallbackRegions: ['US', 'ES'], confidence: 0.90 },
    'AR': { countryCode: 'AR', preferredRegion: 'BR', fallbackRegions: ['US'], confidence: 0.70 },
    'CO': { countryCode: 'CO', preferredRegion: 'US', fallbackRegions: ['MX', 'BR'], confidence: 0.75 },
    'CL': { countryCode: 'CL', preferredRegion: 'US', fallbackRegions: ['BR'], confidence: 0.75 },
    
    // Europa
    'ES': { countryCode: 'ES', preferredRegion: 'ES', fallbackRegions: ['FR', 'IT'], confidence: 0.95 },
    'FR': { countryCode: 'FR', preferredRegion: 'FR', fallbackRegions: ['ES', 'DE'], confidence: 0.95 },
    'DE': { countryCode: 'DE', preferredRegion: 'DE', fallbackRegions: ['FR', 'UK'], confidence: 0.95 },
    'IT': { countryCode: 'IT', preferredRegion: 'IT', fallbackRegions: ['ES', 'FR'], confidence: 0.95 },
    'UK': { countryCode: 'GB', preferredRegion: 'UK', fallbackRegions: ['DE', 'FR'], confidence: 0.95 },
    'GB': { countryCode: 'GB', preferredRegion: 'UK', fallbackRegions: ['DE', 'FR'], confidence: 0.95 },
    'PT': { countryCode: 'PT', preferredRegion: 'ES', fallbackRegions: ['BR', 'FR'], confidence: 0.80 },
    'NL': { countryCode: 'NL', preferredRegion: 'DE', fallbackRegions: ['UK', 'FR'], confidence: 0.85 },
    'BE': { countryCode: 'BE', preferredRegion: 'FR', fallbackRegions: ['DE', 'UK'], confidence: 0.85 },
    'CH': { countryCode: 'CH', preferredRegion: 'DE', fallbackRegions: ['FR', 'IT'], confidence: 0.85 },
    'AT': { countryCode: 'AT', preferredRegion: 'DE', fallbackRegions: ['UK'], confidence: 0.90 },
    
    // Ásia
    'JP': { countryCode: 'JP', preferredRegion: 'JP', fallbackRegions: ['US'], confidence: 0.95 },
    'AU': { countryCode: 'AU', preferredRegion: 'US', fallbackRegions: ['UK'], confidence: 0.80 },
    'IN': { countryCode: 'IN', preferredRegion: 'US', fallbackRegions: ['UK'], confidence: 0.75 },
    'SG': { countryCode: 'SG', preferredRegion: 'US', fallbackRegions: ['JP'], confidence: 0.75 },
  };

  // Mapeamento de idiomas para regiões preferenciais
  private readonly LANGUAGE_REGION_MAPPING: Record<string, string[]> = {
    'pt': ['BR'], 
    'pt-BR': ['BR'],
    'pt-PT': ['BR', 'ES'], // Portugal prefere BR mas ES como fallback
    'en': ['US', 'UK', 'CA'],
    'en-US': ['US', 'CA'],
    'en-GB': ['UK', 'US'],
    'en-CA': ['CA', 'US'],
    'es': ['ES', 'MX'],
    'es-ES': ['ES', 'MX'],
    'es-MX': ['MX', 'ES', 'US'],
    'es-AR': ['ES', 'US'],
    'fr': ['FR', 'CA'],
    'fr-FR': ['FR'],
    'fr-CA': ['CA', 'FR'],
    'de': ['DE'],
    'de-DE': ['DE'],
    'de-AT': ['DE'],
    'de-CH': ['DE'],
    'it': ['IT', 'ES'],
    'it-IT': ['IT', 'ES'],
    'ja': ['JP'],
    'ja-JP': ['JP']
  };

  // Mapeamento de timezone para regiões
  private readonly TIMEZONE_REGION_MAPPING: Record<string, string[]> = {
    'America/Sao_Paulo': ['BR'],
    'America/New_York': ['US'],
    'America/Los_Angeles': ['US'],
    'America/Chicago': ['US'],
    'America/Denver': ['US'],
    'America/Toronto': ['CA'],
    'America/Vancouver': ['CA'],
    'America/Mexico_City': ['MX'],
    'Europe/Madrid': ['ES'],
    'Europe/Paris': ['FR'],
    'Europe/Berlin': ['DE'],
    'Europe/Rome': ['IT'],
    'Europe/London': ['UK'],
    'Asia/Tokyo': ['JP'],
    'Australia/Sydney': ['US'], // Austrália usa US como fallback
  };

  constructor() {}

  // ========================================
  // 1. DETECÇÃO PRINCIPAL DE LOCALIZAÇÃO
  // ========================================

  /**
   * Detecta região do usuário usando múltiplas estratégias
   */
  async detectUserRegion(request: {
    ipAddress: string;
    userAgent?: string;
    acceptLanguage?: string;
    timezone?: string;
    sessionId?: string;
    userId?: string;
  }): Promise<LocationDetectionResult> {

    // 1. Verificar cache primeiro
    const cachedLocation = await this.getCachedLocation(request.ipAddress);
    if (cachedLocation && !this.isCacheExpired(cachedLocation)) {
      return {
        detectedRegion: cachedLocation.detectedRegion,
        confidence: parseFloat(cachedLocation.confidence?.toString() || '0.8'),
        source: 'cache',
        details: {
          countryCode: cachedLocation.countryCode || undefined,
          city: cachedLocation.city || undefined,
          browserLanguage: cachedLocation.browserLanguage || undefined,
          timezone: cachedLocation.timezone || undefined
        }
      };
    }

    // 2. Verificar preferências salvas do usuário
    if (request.sessionId || request.userId) {
      const userPrefs = await this.getUserPreferences(request.sessionId, request.userId);
      if (userPrefs && userPrefs.isManualSelection) {
        return {
          detectedRegion: userPrefs.preferredRegion,
          confidence: 1.0,
          source: 'manual',
          details: {}
        };
      }
    }

    // 3. Detecção por IP (simulado - em produção usar MaxMind, CloudFlare, etc.)
    const geoResult = await this.detectByGeoIP(request.ipAddress);
    
    // 4. Detecção por idioma do navegador
    const langResult = this.detectByLanguage(request.acceptLanguage);
    
    // 5. Detecção por timezone
    const timezoneResult = this.detectByTimezone(request.timezone);

    // 6. Combinar resultados com pesos
    const finalResult = this.combineDetectionResults([geoResult, langResult, timezoneResult]);

    // 7. Cache do resultado
    await this.cacheLocationResult(request.ipAddress, finalResult, {
      userAgent: request.userAgent,
      browserLanguage: request.acceptLanguage,
      timezone: request.timezone
    });

    return finalResult;
  }

  /**
   * Detecção por GeoIP (simulada - integrar com serviço real)
   */
  private async detectByGeoIP(ipAddress: string): Promise<LocationDetectionResult> {
    // Em produção, integrar com MaxMind, CloudFlare, ou similar
    // Por agora, simulando baseado no IP
    
    if (ipAddress.startsWith('127.') || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
      // IP local - usar Brasil como padrão
      return {
        detectedRegion: 'BR',
        confidence: 0.3, // Baixa confiança para IPs locais
        source: 'geoip',
        details: {
          countryCode: 'BR',
          city: 'São Paulo'
        }
      };
    }

    // Simulação: extrair "país" do IP para demonstração
    // Em produção, seria uma consulta real ao serviço de GeoIP
    const ipParts = ipAddress.split('.');
    const mockCountryCode = this.getMockCountryFromIP(ipParts);
    
    const mapping = this.COUNTRY_REGION_MAPPING[mockCountryCode];
    if (mapping) {
      return {
        detectedRegion: mapping.preferredRegion,
        confidence: mapping.confidence,
        source: 'geoip',
        details: {
          countryCode: mapping.countryCode,
          regionCode: mapping.preferredRegion
        }
      };
    }

    // Fallback padrão
    return {
      detectedRegion: 'BR',
      confidence: 0.3,
      source: 'fallback',
      details: { countryCode: 'BR' }
    };
  }

  /**
   * Detecção por idioma do navegador
   */
  private detectByLanguage(acceptLanguage?: string): LocationDetectionResult {
    if (!acceptLanguage) {
      return {
        detectedRegion: 'BR',
        confidence: 0.1,
        source: 'fallback',
        details: {}
      };
    }

    // Parse do Accept-Language header
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [code, q = '1'] = lang.trim().split(';q=');
        return { code: code.toLowerCase(), quality: parseFloat(q) };
      })
      .sort((a, b) => b.quality - a.quality);

    // Tentar match com idiomas específicos primeiro
    for (const lang of languages) {
      const regions = this.LANGUAGE_REGION_MAPPING[lang.code];
      if (regions && regions.length > 0) {
        return {
          detectedRegion: regions[0],
          confidence: 0.7 * lang.quality,
          source: 'browser-lang',
          details: { browserLanguage: lang.code }
        };
      }
      
      // Tentar match com idioma base (ex: 'pt' de 'pt-BR')
      const baseLang = lang.code.split('-')[0];
      const baseRegions = this.LANGUAGE_REGION_MAPPING[baseLang];
      if (baseRegions && baseRegions.length > 0) {
        return {
          detectedRegion: baseRegions[0],
          confidence: 0.6 * lang.quality,
          source: 'browser-lang',
          details: { browserLanguage: baseLang }
        };
      }
    }

    return {
      detectedRegion: 'BR',
      confidence: 0.2,
      source: 'fallback',
      details: { browserLanguage: acceptLanguage }
    };
  }

  /**
   * Detecção por timezone
   */
  private detectByTimezone(timezone?: string): LocationDetectionResult {
    if (!timezone) {
      return {
        detectedRegion: 'BR',
        confidence: 0.1,
        source: 'fallback',
        details: {}
      };
    }

    const regions = this.TIMEZONE_REGION_MAPPING[timezone];
    if (regions && regions.length > 0) {
      return {
        detectedRegion: regions[0],
        confidence: 0.8,
        source: 'timezone',
        details: { timezone }
      };
    }

    // Fallback baseado no offset (simplificado)
    if (timezone.startsWith('America/')) {
      return {
        detectedRegion: 'BR',
        confidence: 0.4,
        source: 'timezone',
        details: { timezone }
      };
    } else if (timezone.startsWith('Europe/')) {
      return {
        detectedRegion: 'ES',
        confidence: 0.4,
        source: 'timezone',
        details: { timezone }
      };
    }

    return {
      detectedRegion: 'BR',
      confidence: 0.2,
      source: 'fallback',
      details: { timezone }
    };
  }

  // ========================================
  // 2. COMBINAÇÃO E OTIMIZAÇÃO DE RESULTADOS
  // ========================================

  /**
   * Combina resultados de múltiplas fontes com pesos inteligentes
   */
  private combineDetectionResults(results: LocationDetectionResult[]): LocationDetectionResult {
    // Pesos por fonte (quanto mais confiável, maior o peso)
    const sourceWeights = {
      'manual': 1.0,
      'cache': 0.9,
      'geoip': 0.8,
      'timezone': 0.7,
      'browser-lang': 0.6,
      'fallback': 0.3
    };

    // Calcular score ponderado para cada região
    const regionScores: Record<string, { score: number; sources: string[]; details: any }> = {};

    for (const result of results) {
      const weight = sourceWeights[result.source] || 0.3;
      const weightedScore = result.confidence * weight;
      
      if (!regionScores[result.detectedRegion]) {
        regionScores[result.detectedRegion] = {
          score: 0,
          sources: [],
          details: {}
        };
      }
      
      regionScores[result.detectedRegion].score += weightedScore;
      regionScores[result.detectedRegion].sources.push(result.source);
      regionScores[result.detectedRegion].details = { 
        ...regionScores[result.detectedRegion].details, 
        ...result.details 
      };
    }

    // Encontrar região com maior score
    let bestRegion = 'BR';
    let bestScore = 0;
    let bestSources: string[] = [];
    let bestDetails = {};

    for (const [region, data] of Object.entries(regionScores)) {
      if (data.score > bestScore) {
        bestScore = data.score;
        bestRegion = region;
        bestSources = data.sources;
        bestDetails = data.details;
      }
    }

    // Determinar fonte principal
    const primarySource = bestSources.includes('geoip') ? 'geoip' :
                         bestSources.includes('timezone') ? 'timezone' :
                         bestSources.includes('browser-lang') ? 'browser-lang' : 'fallback';

    return {
      detectedRegion: bestRegion,
      confidence: Math.min(bestScore, 1.0),
      source: primarySource as any,
      details: bestDetails
    };
  }

  // ========================================
  // 3. CACHE E PERSISTÊNCIA
  // ========================================

  /**
   * Busca localização no cache
   */
  private async getCachedLocation(ipAddress: string): Promise<UserLocationCache | null> {
    const [cached] = await db
      .select()
      .from(userLocationCache)
      .where(eq(userLocationCache.ipAddress, ipAddress))
      .orderBy(desc(userLocationCache.createdAt))
      .limit(1);

    return cached || null;
  }

  /**
   * Verifica se cache expirou (7 dias)
   */
  private isCacheExpired(cache: UserLocationCache): boolean {
    return cache.expiresAt < new Date();
  }

  /**
   * Salva resultado no cache
   */
  private async cacheLocationResult(
    ipAddress: string,
    result: LocationDetectionResult,
    metadata: { userAgent?: string; browserLanguage?: string; timezone?: string }
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Cache por 7 dias

    try {
      await db.insert(userLocationCache).values({
        ipAddress,
        countryCode: result.details.countryCode,
        regionCode: result.details.regionCode,
        city: result.details.city,
        detectedRegion: result.detectedRegion,
        confidence: result.confidence.toString(),
        source: result.source,
        browserLanguage: metadata.browserLanguage,
        timezone: metadata.timezone,
        expiresAt
      });
    } catch (error) {
      console.error('Erro ao cachear localização:', error);
    }
  }

  /**
   * Busca preferências do usuário
   */
  private async getUserPreferences(
    sessionId?: string, 
    userId?: string
  ): Promise<UserRegionalPreferences | null> {
    let query = db.select().from(userRegionalPreferences);
    
    if (userId) {
      query = query.where(eq(userRegionalPreferences.userId, userId));
    } else if (sessionId) {
      query = query.where(eq(userRegionalPreferences.sessionId, sessionId));
    } else {
      return null;
    }

    const [prefs] = await query
      .orderBy(desc(userRegionalPreferences.lastUsed))
      .limit(1);

    return prefs || null;
  }

  /**
   * Salva preferências do usuário
   */
  async saveUserPreferences(
    preferredRegion: string,
    detectedRegion: string,
    isManualSelection: boolean,
    sessionId?: string,
    userId?: string
  ): Promise<void> {
    const data = {
      preferredRegion,
      detectedRegion,
      isManualSelection,
      sessionId,
      userId,
      lastUsed: new Date()
    };

    // Upsert baseado em sessionId ou userId
    if (userId) {
      // Remover preferências antigas do usuário
      await db.delete(userRegionalPreferences)
        .where(eq(userRegionalPreferences.userId, userId));
    } else if (sessionId) {
      // Remover preferências antigas da sessão
      await db.delete(userRegionalPreferences)
        .where(eq(userRegionalPreferences.sessionId, sessionId));
    }

    await db.insert(userRegionalPreferences).values(data);
  }

  // ========================================
  // 4. UTILITÁRIOS E HELPERS
  // ========================================

  /**
   * Simula extração de país do IP (para desenvolvimento)
   * Em produção, usar serviço real de GeoIP
   */
  private getMockCountryFromIP(ipParts: string[]): string {
    // Simulação simples baseada no terceiro octeto
    const thirdOctet = parseInt(ipParts[2] || '0');
    
    if (thirdOctet < 50) return 'BR';
    else if (thirdOctet < 100) return 'US';
    else if (thirdOctet < 150) return 'ES';
    else if (thirdOctet < 200) return 'FR';
    else return 'DE';
  }

  /**
   * Obtém lista de regiões ativas
   */
  async getActiveRegions(): Promise<Region[]> {
    return await db
      .select()
      .from(regions)
      .where(eq(regions.isActive, true))
      .orderBy(regions.priority);
  }

  /**
   * Valida se região existe e está ativa
   */
  async isValidRegion(regionId: string): Promise<boolean> {
    const [region] = await db
      .select()
      .from(regions)
      .where(
        and(
          eq(regions.id, regionId),
          eq(regions.isActive, true)
        )
      );

    return !!region;
  }

  /**
   * Obtém região de fallback para uma região inválida
   */
  async getFallbackRegion(originRegion?: string): Promise<string> {
    // Se temos região de origem, usar fallbacks específicos
    if (originRegion) {
      for (const mapping of Object.values(this.COUNTRY_REGION_MAPPING)) {
        if (mapping.preferredRegion === originRegion) {
          for (const fallback of mapping.fallbackRegions) {
            if (await this.isValidRegion(fallback)) {
              return fallback;
            }
          }
        }
      }
    }

    // Fallback final - usar primeira região ativa
    const activeRegions = await this.getActiveRegions();
    return activeRegions[0]?.id || 'BR';
  }

  /**
   * Limpa cache expirado (executar periodicamente)
   */
  async cleanExpiredCache(): Promise<number> {
    const result = await db
      .delete(userLocationCache)
      .where(sql`expires_at < NOW()`);

    return result.rowCount || 0;
  }
}

export default UserLocalizationService;