import { AmazonPAAPIService } from './amazonApi';
import type { 
  KitConceptItem, 
  KitProductScoreBreakdown,
  KitRulesConfig,
  ProductKit,
  KitProduct
} from '@shared/schema';

// Weight configuration for the ranking algorithm
interface RankingWeights {
  rating: number;      // Weight for normalized rating (0-1)
  discount: number;    // Weight for normalized discount (0-1)
  price: number;       // Weight for normalized price (penalty, 0-1)
  reviews: number;     // Weight for review multiplier
}

// Default weights optimized for value + trust
const DEFAULT_WEIGHTS: RankingWeights = {
  rating: 0.35,   // 35% weight on product rating
  discount: 0.25, // 25% weight on discount percentage
  price: 0.20,    // 20% penalty for higher prices
  reviews: 0.20   // 20% boost from review count
};

// Amazon product candidate from PA-API search
interface ProductCandidate {
  asin: string;
  title: string;
  brand?: string;
  imageUrl?: string;
  currentPrice?: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  isPrime?: boolean;
  productUrl: string;
  categoryPath?: string;
}

// Scored product ready for ranking
interface ScoredProduct extends ProductCandidate {
  scoreBreakdown: KitProductScoreBreakdown;
}

export class KitResolverService {
  private amazonApi: AmazonPAAPIService;
  private weights: RankingWeights;
  private affiliateTag: string;

  constructor(weights?: Partial<RankingWeights>) {
    this.amazonApi = new AmazonPAAPIService();
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
    this.affiliateTag = process.env.AMAZON_PARTNER_TAG || 'karoom-20';
  }

  /**
   * Check if PA-API is available for resolution
   */
  isApiAvailable(): boolean {
    return this.amazonApi.isConfigured();
  }

  /**
   * Calculate the composite ranking score for a product
   * Algorithm: finalScore = valueScore × reviewMultiplier
   * 
   * valueScore = (ratingNorm × ratingWeight) + (discountNorm × discountWeight) - (pricePenalty × priceWeight)
   * reviewMultiplier = 1 + log10(reviewCount + 1) × reviewWeight
   * 
   * Price penalty: Higher prices get higher penalty (0 = cheapest, 1 = most expensive)
   */
  calculateScore(product: ProductCandidate, priceRange: { min: number; max: number }): KitProductScoreBreakdown {
    const price = product.currentPrice || 0;
    const originalPrice = product.originalPrice || price;
    const rating = product.rating || 0;
    const reviewCount = product.reviewCount || 0;

    // Normalize price as penalty (0 = cheapest, 1 = most expensive)
    // Higher prices should receive higher penalties (reducing the score)
    let priceNormalized: number;
    if (priceRange.max > priceRange.min) {
      // Standard case: calculate relative position in price range
      priceNormalized = (price - priceRange.min) / (priceRange.max - priceRange.min);
    } else {
      // Edge case: all products have same price, no penalty
      priceNormalized = 0;
    }

    // Normalize rating (0-5 scale to 0-1)
    const ratingNormalized = rating / 5;

    // Calculate discount percentage and normalize (0-100% to 0-1)
    const discountPercent = originalPrice > price && originalPrice > 0
      ? ((originalPrice - price) / originalPrice) * 100
      : 0;
    const discountNormalized = Math.min(discountPercent / 100, 1);

    // Calculate value score (base score without reviews)
    // Rating and discount ADD to score, price SUBTRACTS from score
    const valueScore = 
      (ratingNormalized * this.weights.rating) +
      (discountNormalized * this.weights.discount) -
      (priceNormalized * this.weights.price);

    // Calculate review multiplier using logarithmic scale
    // log10(1) = 0, log10(10) = 1, log10(100) = 2, log10(1000) = 3
    // This means: 1 review = 1x, 10 reviews = 1.2x, 100 reviews = 1.4x, 1000 reviews = 1.6x
    const reviewMultiplier = 1 + (Math.log10(reviewCount + 1) * this.weights.reviews);

    // Final score combines value and social proof
    const finalScore = valueScore * reviewMultiplier;

    return {
      valueScore: Math.round(valueScore * 10000) / 10000,
      reviewMultiplier: Math.round(reviewMultiplier * 10000) / 10000,
      finalScore: Math.round(finalScore * 10000) / 10000,
      priceNormalized: Math.round(priceNormalized * 10000) / 10000,
      ratingNormalized: Math.round(ratingNormalized * 10000) / 10000,
      discountNormalized: Math.round(discountNormalized * 10000) / 10000,
      reviewCount,
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Rank products by finalScore, then reviewCount (tie-breaker), then price (secondary tie-breaker)
   */
  rankProducts(products: ScoredProduct[]): ScoredProduct[] {
    return products.sort((a, b) => {
      // Primary: finalScore descending
      if (b.scoreBreakdown.finalScore !== a.scoreBreakdown.finalScore) {
        return b.scoreBreakdown.finalScore - a.scoreBreakdown.finalScore;
      }
      // Secondary: reviewCount descending (more reviews = more trusted)
      if (b.scoreBreakdown.reviewCount !== a.scoreBreakdown.reviewCount) {
        return b.scoreBreakdown.reviewCount - a.scoreBreakdown.reviewCount;
      }
      // Tertiary: price ascending (cheaper is better when all else is equal)
      return (a.currentPrice || 0) - (b.currentPrice || 0);
    });
  }

  /**
   * Build Amazon affiliate link with tracking tag
   */
  buildAffiliateLink(asin: string): string {
    return `https://www.amazon.com.br/dp/${asin}?tag=${this.affiliateTag}`;
  }

  /**
   * Resolve a single concept item to the best matching product
   */
  async resolveConceptItem(
    conceptItem: KitConceptItem,
    rulesConfig?: KitRulesConfig
  ): Promise<ScoredProduct | null> {
    if (!this.isApiAvailable()) {
      console.log(`PA-API not available, skipping resolution for: ${conceptItem.name}`);
      return null;
    }

    try {
      // Build search query from concept item criteria
      const keywords = [
        ...conceptItem.criteria.mustKeywords,
        ...(conceptItem.criteria.optionalKeywords || [])
      ].join(' ');

      const searchParams = {
        keywords,
        category: conceptItem.criteria.category,
        minPrice: conceptItem.criteria.priceMin,
        maxPrice: conceptItem.criteria.priceMax,
        minRating: conceptItem.criteria.ratingMin,
        sortBy: 'Featured' as const,
        itemCount: 10 // Get top 10 candidates for scoring
      };

      const response = await this.amazonApi.searchItems(searchParams);

      if (!response.success || !response.products || response.products.length === 0) {
        console.log(`No products found for concept: ${conceptItem.name}`);
        return null;
      }

      // Filter by Prime if required
      let candidates = response.products;
      if (conceptItem.criteria.primeOnly) {
        candidates = candidates.filter(p => p.isPrime);
      }

      if (candidates.length === 0) {
        console.log(`No Prime products found for concept: ${conceptItem.name}`);
        return null;
      }

      // Determine price range from candidates for normalization
      const prices = candidates.map(p => p.currentPrice || 0).filter(p => p > 0);
      const priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };

      // Score all candidates
      const scoredProducts: ScoredProduct[] = candidates.map(product => ({
        ...product,
        scoreBreakdown: this.calculateScore(product, priceRange)
      }));

      // Rank and return the best one
      const ranked = this.rankProducts(scoredProducts);
      return ranked[0];

    } catch (error) {
      console.error(`Error resolving concept item ${conceptItem.name}:`, error);
      return null;
    }
  }

  /**
   * Resolve all concept items in a kit
   * Returns array of resolved products ready to be saved to kit_products
   */
  async resolveKit(kit: ProductKit): Promise<KitProduct[]> {
    if (!kit.conceptItems || kit.conceptItems.length === 0) {
      console.log(`Kit ${kit.id} has no concept items to resolve`);
      return [];
    }

    if (!this.isApiAvailable()) {
      console.log('PA-API not available, cannot resolve kit');
      return [];
    }

    const resolvedProducts: KitProduct[] = [];

    for (let i = 0; i < kit.conceptItems.length; i++) {
      const conceptItem = kit.conceptItems[i];
      const scoredProduct = await this.resolveConceptItem(conceptItem, kit.rulesConfig);

      if (scoredProduct) {
        // Note: ID is omitted - will be generated by database via gen_random_uuid()
        const productData: Omit<KitProduct, 'id'> & { id?: string } = {
          kitId: kit.id,
          asin: scoredProduct.asin,
          title: scoredProduct.title,
          description: conceptItem.name, // Use concept name as description
          imageUrl: scoredProduct.imageUrl,
          price: scoredProduct.currentPrice || 0,
          originalPrice: scoredProduct.originalPrice,
          rating: scoredProduct.rating,
          reviewCount: scoredProduct.reviewCount,
          isPrime: scoredProduct.isPrime,
          role: conceptItem.role,
          rankScore: scoredProduct.scoreBreakdown.finalScore,
          taskMatchScore: conceptItem.weight,
          rationale: this.generateRationale(scoredProduct, conceptItem),
          addedVia: 'API',
          affiliateLink: this.buildAffiliateLink(scoredProduct.asin),
          scoreBreakdown: scoredProduct.scoreBreakdown,
          lastCheckedAt: new Date()
        };
        resolvedProducts.push(productData as KitProduct);

        // Update concept item with resolved ASIN
        conceptItem.resolvedAsin = scoredProduct.asin;
      }

      // Small delay between API calls to avoid rate limiting
      if (i < kit.conceptItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Final sort by role priority (MAIN first, then SECONDARY, then COMPLEMENT)
    const rolePriority = { 'MAIN': 0, 'SECONDARY': 1, 'COMPLEMENT': 2 };
    resolvedProducts.sort((a, b) => {
      const priorityDiff = rolePriority[a.role] - rolePriority[b.role];
      if (priorityDiff !== 0) return priorityDiff;
      // Within same role, sort by score
      return b.rankScore - a.rankScore;
    });

    // Assign sort order
    resolvedProducts.forEach((product, index) => {
      (product as any).sortOrder = index;
    });

    return resolvedProducts;
  }

  /**
   * Generate human-readable rationale for product selection
   */
  private generateRationale(product: ScoredProduct, conceptItem: KitConceptItem): string {
    const parts: string[] = [];
    
    if (product.rating && product.rating >= 4.0) {
      parts.push(`avaliação ${product.rating}★`);
    }
    
    if (product.reviewCount && product.reviewCount > 100) {
      parts.push(`${product.reviewCount.toLocaleString('pt-BR')} avaliações`);
    }
    
    if (product.scoreBreakdown.discountNormalized > 0.1) {
      const discountPercent = Math.round(product.scoreBreakdown.discountNormalized * 100);
      parts.push(`${discountPercent}% de desconto`);
    }
    
    if (product.isPrime) {
      parts.push('Prime');
    }

    const roleLabel = {
      'MAIN': 'Produto principal',
      'SECONDARY': 'Produto secundário',
      'COMPLEMENT': 'Complemento'
    }[conceptItem.role];

    if (parts.length > 0) {
      return `${roleLabel}: Selecionado por ${parts.join(', ')}. Score: ${product.scoreBreakdown.finalScore.toFixed(3)}`;
    }

    return `${roleLabel}: Melhor match para "${conceptItem.name}". Score: ${product.scoreBreakdown.finalScore.toFixed(3)}`;
  }

  /**
   * Re-rank existing kit products (for manual products or updates)
   */
  reRankProducts(products: KitProduct[], priceRange?: { min: number; max: number }): KitProduct[] {
    // Calculate price range from products if not provided
    if (!priceRange) {
      const prices = products.map(p => p.price).filter(p => p > 0);
      priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    }

    // Convert to scored products for ranking
    const scoredProducts: ScoredProduct[] = products.map(product => ({
      asin: product.asin,
      title: product.title,
      imageUrl: product.imageUrl,
      currentPrice: product.price,
      originalPrice: product.originalPrice,
      rating: product.rating,
      reviewCount: product.reviewCount,
      isPrime: product.isPrime,
      productUrl: product.affiliateLink,
      scoreBreakdown: this.calculateScore({
        asin: product.asin,
        title: product.title,
        currentPrice: product.price,
        originalPrice: product.originalPrice,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isPrime: product.isPrime,
        productUrl: product.affiliateLink
      }, priceRange!)
    }));

    // Rank them
    const ranked = this.rankProducts(scoredProducts);

    // Map back to KitProduct with updated scores
    return ranked.map((scored, index) => {
      const original = products.find(p => p.asin === scored.asin)!;
      return {
        ...original,
        rankScore: scored.scoreBreakdown.finalScore,
        scoreBreakdown: scored.scoreBreakdown,
        sortOrder: index
      } as KitProduct;
    });
  }
}

// Singleton instance
export const kitResolver = new KitResolverService();
