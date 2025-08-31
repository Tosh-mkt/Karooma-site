import crypto from "crypto";

// Interface para configuração da PA API
interface AmazonPAAPIConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  host: string;
  region: string;
}

// Interface para dados de produto da Amazon
interface AmazonProduct {
  asin: string;
  title: string;
  brand?: string;
  imageUrl?: string;
  currentPrice?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  isPrime?: boolean;
  availability: 'available' | 'unavailable' | 'limited';
  bestSellerRank?: number;
  categoryPath?: string;
  productUrl: string;
}

// Interface para resposta da PA API
interface PAAPIResponse {
  success: boolean;
  product?: AmazonProduct;
  error?: string;
  timestamp: Date;
}

export class AmazonPAAPIService {
  private config: AmazonPAAPIConfig;

  constructor() {
    this.config = {
      accessKey: process.env.AMAZON_ACCESS_KEY || '',
      secretKey: process.env.AMAZON_SECRET_KEY || '',
      partnerTag: process.env.AMAZON_PARTNER_TAG || '',
      host: 'webservices.amazon.com',
      region: 'us-east-1'
    };

    if (!this.config.accessKey || !this.config.secretKey || !this.config.partnerTag) {
      console.warn('Amazon PA API credentials not configured');
    }
  }

  /**
   * Verifica se as credenciais estão configuradas
   */
  isConfigured(): boolean {
    return !!(this.config.accessKey && this.config.secretKey && this.config.partnerTag);
  }

  /**
   * Busca informações de um produto pelo ASIN
   */
  async getProductByASIN(asin: string): Promise<PAAPIResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Amazon PA API not configured',
        timestamp: new Date()
      };
    }

    try {
      const requestPayload = {
        ItemIds: [asin],
        Resources: [
          "Images.Primary.Medium",
          "ItemInfo.Title",
          "ItemInfo.ByLineInfo.Brand",
          "Offers.Listings.Price",
          "Offers.Listings.DeliveryInfo.IsPrimeEligible",
          "Offers.Listings.Availability.MaxOrderQuantity",
          "Offers.Listings.Availability.Message",
          "CustomerReviews.Count",
          "CustomerReviews.StarRating",
          "BrowseNodeInfo.BrowseNodes"
        ],
        PartnerTag: this.config.partnerTag,
        PartnerType: "Associates",
        Marketplace: "www.amazon.com"
      };

      const response = await this.makeApiRequest('GetItems', requestPayload);
      
      if (response.ItemsResult && response.ItemsResult.Items && response.ItemsResult.Items.length > 0) {
        const item = response.ItemsResult.Items[0];
        const product = this.mapAmazonItemToProduct(item, asin);
        
        return {
          success: true,
          product,
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          error: 'Product not found or unavailable',
          timestamp: new Date()
        };
      }
    } catch (error) {
      console.error('Amazon PA API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown API error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Busca múltiplos produtos por ASIN (batch)
   */
  async getProductsByASINs(asins: string[]): Promise<PAAPIResponse[]> {
    // Amazon PA API suporta até 10 ASINs por request
    const chunkSize = 10;
    const results: PAAPIResponse[] = [];

    for (let i = 0; i < asins.length; i += chunkSize) {
      const chunk = asins.slice(i, i + chunkSize);
      
      try {
        const chunkResults = await Promise.all(
          chunk.map(asin => this.getProductByASIN(asin))
        );
        results.push(...chunkResults);
      } catch (error) {
        // Se falhar o batch, adiciona erro para todos os ASINs do chunk
        chunk.forEach(asin => {
          results.push({
            success: false,
            error: `Batch request failed for ASIN ${asin}`,
            timestamp: new Date()
          });
        });
      }

      // Rate limiting - pausa entre requests
      if (i + chunkSize < asins.length) {
        await this.delay(1000); // 1 segundo entre batches
      }
    }

    return results;
  }

  /**
   * Mapeia item da Amazon para nossa interface de produto
   */
  private mapAmazonItemToProduct(item: any, asin: string): AmazonProduct {
    const baseUrl = `https://www.amazon.com/dp/${asin}`;
    const affiliateUrl = `${baseUrl}?tag=${this.config.partnerTag}`;

    return {
      asin,
      title: item.ItemInfo?.Title?.DisplayValue || 'Título não disponível',
      brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
      imageUrl: item.Images?.Primary?.Medium?.URL,
      currentPrice: this.extractPrice(item.Offers?.Listings?.[0]?.Price?.Amount),
      originalPrice: this.extractPrice(item.Offers?.Listings?.[0]?.Price?.Savings?.Amount),
      rating: item.CustomerReviews?.StarRating?.Value,
      reviewCount: item.CustomerReviews?.Count,
      isPrime: item.Offers?.Listings?.[0]?.DeliveryInfo?.IsPrimeEligible || false,
      availability: this.mapAvailability(item.Offers?.Listings?.[0]?.Availability),
      bestSellerRank: this.extractBestSellerRank(item.BrowseNodeInfo?.BrowseNodes),
      categoryPath: this.extractCategoryPath(item.BrowseNodeInfo?.BrowseNodes),
      productUrl: affiliateUrl
    };
  }

  /**
   * Extrai preço do formato da Amazon
   */
  private extractPrice(priceData: any): number | undefined {
    if (!priceData) return undefined;
    
    const amount = priceData.Amount || priceData;
    return typeof amount === 'number' ? amount / 100 : undefined; // Amazon retorna em centavos
  }

  /**
   * Mapeia disponibilidade da Amazon
   */
  private mapAvailability(availabilityData: any): 'available' | 'unavailable' | 'limited' {
    if (!availabilityData) return 'unavailable';
    
    const maxOrder = availabilityData.MaxOrderQuantity;
    const message = availabilityData.Message;

    if (maxOrder === 0 || (message && message.includes('Currently unavailable'))) {
      return 'unavailable';
    } else if (maxOrder && maxOrder < 10) {
      return 'limited';
    }
    
    return 'available';
  }

  /**
   * Extrai ranking de best seller
   */
  private extractBestSellerRank(browseNodes: any[]): number | undefined {
    if (!browseNodes || !Array.isArray(browseNodes)) return undefined;
    
    for (const node of browseNodes) {
      if (node.SalesRank) {
        return node.SalesRank;
      }
    }
    return undefined;
  }

  /**
   * Extrai caminho da categoria
   */
  private extractCategoryPath(browseNodes: any[]): string | undefined {
    if (!browseNodes || !Array.isArray(browseNodes)) return undefined;
    
    const categories = browseNodes
      .filter(node => node.DisplayName)
      .map(node => node.DisplayName)
      .join(' > ');
    
    return categories || undefined;
  }

  /**
   * Faz request para a PA API com assinatura
   */
  private async makeApiRequest(operation: string, payload: any): Promise<any> {
    const timestamp = new Date().toISOString();
    const host = this.config.host;
    const path = '/paapi5/getitems';
    
    const headers = {
      'Content-Type': 'application/json; charset=utf-8',
      'Host': host,
      'X-Amz-Date': timestamp,
      'X-Amz-Target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`
    };

    const body = JSON.stringify(payload);
    
    // Aqui você implementaria a assinatura AWS4
    // Por simplicidade, estou retornando um mock - você precisará implementar a assinatura real
    console.log('Amazon PA API Request:', { operation, payload, headers });
    
    // MOCK RESPONSE - Substitua pela implementação real
    return this.getMockResponse(payload.ItemIds[0]);
  }

  /**
   * Mock response para desenvolvimento
   */
  private getMockResponse(asin: string): any {
    return {
      ItemsResult: {
        Items: [{
          ItemInfo: {
            Title: { DisplayValue: `Produto Mock ${asin}` },
            ByLineInfo: { Brand: { DisplayValue: 'Marca Exemplo' } }
          },
          Images: {
            Primary: { Medium: { URL: 'https://via.placeholder.com/300x300' } }
          },
          Offers: {
            Listings: [{
              Price: { Amount: 5999 }, // $59.99 em centavos
              DeliveryInfo: { IsPrimeEligible: true },
              Availability: { MaxOrderQuantity: 30 }
            }]
          },
          CustomerReviews: {
            StarRating: { Value: 4.5 },
            Count: 123
          }
        }]
      }
    };
  }

  /**
   * Utilitário para delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Determina frequência de atualização baseada na categoria
   */
  static getUpdateFrequency(category: string): 'high' | 'medium' | 'low' {
    const highFreqCategories = ['electronics', 'smartphones', 'deals', 'fashion'];
    const lowFreqCategories = ['books', 'furniture', 'tools', 'home-decor'];
    
    const categoryLower = category.toLowerCase();
    
    if (highFreqCategories.some(cat => categoryLower.includes(cat))) {
      return 'high';
    } else if (lowFreqCategories.some(cat => categoryLower.includes(cat))) {
      return 'low';
    }
    
    return 'medium';
  }

  /**
   * Calcula próxima data de verificação baseada na frequência
   */
  static getNextCheckTime(frequency: 'high' | 'medium' | 'low'): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'high':
        return new Date(now.getTime() + 30 * 60 * 1000); // 30 minutos
      case 'medium':
        return new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 horas
      case 'low':
        return new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 horas
      default:
        return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    }
  }
}

export default AmazonPAAPIService;