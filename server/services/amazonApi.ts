import crypto from "crypto";
import { SignatureV4 } from "@smithy/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import { HttpRequest } from "@smithy/protocol-http";

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

// Interface para parâmetros de busca (SearchItems)
interface SearchItemsParams {
  keywords?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscountPercent?: number;
  minRating?: number;
  minReviewCount?: number;
  sortBy?: 'Price:LowToHigh' | 'Price:HighToLow' | 'Featured' | 'Relevance';
  itemCount?: number;
}

// Interface para resposta de busca
interface SearchItemsResponse {
  success: boolean;
  products?: AmazonProduct[];
  totalResults?: number;
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
   * Busca produtos por palavras-chave e filtros (SearchItems)
   */
  async searchItems(params: SearchItemsParams): Promise<SearchItemsResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Amazon PA API not configured',
        timestamp: new Date()
      };
    }

    try {
      const requestPayload: any = {
        Keywords: params.keywords || '',
        Resources: [
          "Images.Primary.Medium",
          "ItemInfo.Title",
          "ItemInfo.ByLineInfo.Brand",
          "Offers.Listings.Price",
          "Offers.Listings.SavingBasis",
          "Offers.Listings.Savings",
          "Offers.Listings.DeliveryInfo.IsPrimeEligible",
          "Offers.Listings.Availability.MaxOrderQuantity",
          "Offers.Listings.Availability.Message",
          "CustomerReviews.Count",
          "CustomerReviews.StarRating",
          "BrowseNodeInfo.BrowseNodes"
        ],
        PartnerTag: this.config.partnerTag,
        PartnerType: "Associates",
        Marketplace: "www.amazon.com",
        ItemCount: params.itemCount || 10
      };

      // Adicionar categoria (SearchIndex) se fornecida
      if (params.category) {
        requestPayload.SearchIndex = this.mapCategoryToSearchIndex(params.category);
      }

      // Adicionar filtros de preço
      if (params.minPrice) {
        requestPayload.MinPrice = Math.round(params.minPrice * 100); // Converter para centavos
      }
      if (params.maxPrice) {
        requestPayload.MaxPrice = Math.round(params.maxPrice * 100);
      }

      // Adicionar ordenação
      if (params.sortBy) {
        requestPayload.SortBy = params.sortBy;
      }

      const response = await this.makeApiRequest('SearchItems', requestPayload);
      
      if (response.SearchResult && response.SearchResult.Items && response.SearchResult.Items.length > 0) {
        const products = response.SearchResult.Items.map((item: any) => {
          const asin = item.ASIN;
          return this.mapAmazonItemToProduct(item, asin);
        });

        // Filtrar por desconto mínimo se especificado
        let filteredProducts = products;
        if (params.minDiscountPercent) {
          filteredProducts = products.filter((product: AmazonProduct) => {
            if (product.currentPrice && product.originalPrice) {
              const discount = Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100);
              return discount >= (params.minDiscountPercent || 0);
            }
            return false;
          });
        }

        // Filtrar por rating mínimo
        if (params.minRating) {
          filteredProducts = filteredProducts.filter((product: AmazonProduct) => {
            return product.rating && product.rating >= (params.minRating || 0);
          });
        }

        // Filtrar por quantidade mínima de reviews
        if (params.minReviewCount) {
          filteredProducts = filteredProducts.filter((product: AmazonProduct) => {
            return product.reviewCount && product.reviewCount >= (params.minReviewCount || 0);
          });
        }
        
        return {
          success: true,
          products: filteredProducts,
          totalResults: response.SearchResult.TotalResultCount || filteredProducts.length,
          timestamp: new Date()
        };
      } else {
        return {
          success: false,
          error: 'No products found',
          timestamp: new Date()
        };
      }
    } catch (error) {
      console.error('Amazon PA API SearchItems error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown search error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Mapeia nossas categorias para SearchIndex da Amazon
   */
  private mapCategoryToSearchIndex(category: string): string {
    const categoryMap: Record<string, string> = {
      'alimentação': 'Grocery',
      'bebê': 'Baby',
      'brinquedos': 'ToysAndGames',
      'casa': 'HomeAndKitchen',
      'cozinha': 'HomeAndKitchen',
      'eletrônicos': 'Electronics',
      'beleza': 'Beauty',
      'moda': 'Fashion',
      'esportes': 'SportsAndOutdoors',
      'livros': 'Books',
      'saúde': 'HealthPersonalCare',
      'jardim': 'LawnAndGarden',
      'pet': 'PetSupplies',
      'escritório': 'OfficeProducts'
    };

    const categoryLower = category.toLowerCase();
    return categoryMap[categoryLower] || 'All';
  }

  /**
   * Mapeia item da Amazon para nossa interface de produto
   */
  private mapAmazonItemToProduct(item: any, asin: string): AmazonProduct {
    const baseUrl = `https://www.amazon.com/dp/${asin}`;
    const affiliateUrl = `${baseUrl}?tag=${this.config.partnerTag}`;

    const listing = item.Offers?.Listings?.[0];
    const currentPrice = this.extractPrice(listing?.Price);
    const savingBasis = this.extractPrice(listing?.SavingBasis);

    return {
      asin,
      title: item.ItemInfo?.Title?.DisplayValue || 'Título não disponível',
      brand: item.ItemInfo?.ByLineInfo?.Brand?.DisplayValue,
      imageUrl: item.Images?.Primary?.Medium?.URL,
      currentPrice,
      originalPrice: savingBasis || currentPrice,
      rating: item.CustomerReviews?.StarRating?.Value,
      reviewCount: item.CustomerReviews?.Count,
      isPrime: listing?.DeliveryInfo?.IsPrimeEligible || false,
      availability: this.mapAvailability(listing?.Availability),
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
   * Faz request para a PA API com assinatura AWS4
   */
  private async makeApiRequest(operation: string, payload: any): Promise<any> {
    const host = this.config.host;
    const region = this.config.region;
    
    // Determinar o path correto baseado na operação
    const pathMap: Record<string, string> = {
      'GetItems': '/paapi5/getitems',
      'SearchItems': '/paapi5/searchitems'
    };
    const path = pathMap[operation] || '/paapi5/getitems';
    const body = JSON.stringify(payload);

    // Create HttpRequest for signing
    const request = new HttpRequest({
      method: 'POST',
      protocol: 'https:',
      hostname: host,
      path: path,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Encoding': 'amz-1.0',
        'Host': host,
        'X-Amz-Target': `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`
      },
      body: body
    });

    // Sign the request with AWS Signature V4
    const signer = new SignatureV4({
      credentials: {
        accessKeyId: this.config.accessKey,
        secretAccessKey: this.config.secretKey
      },
      region: region,
      service: 'ProductAdvertisingAPI',
      sha256: Sha256
    });

    try {
      const signedRequest = await signer.sign(request);

      // Make the actual HTTP request
      const url = `https://${host}${path}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: signedRequest.headers as Record<string, string>,
        body: body
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Amazon PA API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error making Amazon PA API request:', error);
      throw error;
    }
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