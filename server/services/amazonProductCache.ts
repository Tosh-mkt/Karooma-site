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

interface CacheEntry {
  products: AmazonProduct[];
  timestamp: Date;
  ttl: number;
}

export class AmazonProductCache {
  private cache: Map<string, CacheEntry>;
  private defaultTTL: number;

  constructor(ttlHours: number = 6) {
    this.cache = new Map();
    this.defaultTTL = ttlHours * 60 * 60 * 1000;
  }

  get(key: string): AmazonProduct[] | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = new Date().getTime();
    const entryTime = entry.timestamp.getTime();
    
    if (now - entryTime > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.products;
  }

  set(key: string, products: AmazonProduct[], ttl?: number): void {
    this.cache.set(key, {
      products,
      timestamp: new Date(),
      ttl: ttl || this.defaultTTL
    });
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  size(): number {
    return this.cache.size;
  }

  cleanup(): void {
    const now = new Date().getTime();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp.getTime() > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

export const amazonProductCache = new AmazonProductCache(6);

setInterval(() => {
  amazonProductCache.cleanup();
}, 60 * 60 * 1000);
