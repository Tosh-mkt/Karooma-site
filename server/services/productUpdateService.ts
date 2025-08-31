import { AmazonPAAPIService } from './amazonApi';
import { db } from '../db';
import { products, Product } from '@shared/schema';
import { eq, and, lt, gte, isNull, or } from 'drizzle-orm';

interface UpdateResult {
  productId: string;
  success: boolean;
  changes?: Partial<Product>;
  error?: string;
}

interface UpdateStats {
  total: number;
  updated: number;
  failed: number;
  unchanged: number;
  results: UpdateResult[];
}

export class ProductUpdateService {
  private amazonService: AmazonPAAPIService;

  constructor() {
    this.amazonService = new AmazonPAAPIService();
  }

  /**
   * Atualiza produtos baseado na frequência configurada
   */
  async updateProductsByFrequency(frequency: 'high' | 'medium' | 'low'): Promise<UpdateStats> {
    console.log(`Iniciando atualização de produtos - frequência: ${frequency}`);
    
    try {
      // Busca produtos que precisam ser atualizados
      const productsToUpdate = await this.getProductsForUpdate(frequency);
      
      if (productsToUpdate.length === 0) {
        console.log(`Nenhum produto encontrado para atualização na frequência ${frequency}`);
        return {
          total: 0,
          updated: 0,
          failed: 0,
          unchanged: 0,
          results: []
        };
      }

      console.log(`Encontrados ${productsToUpdate.length} produtos para atualização`);
      
      // Atualiza produtos em batches para respeitar rate limits
      const results: UpdateResult[] = [];
      const batchSize = 5; // Processa 5 produtos por vez
      
      for (let i = 0; i < productsToUpdate.length; i += batchSize) {
        const batch = productsToUpdate.slice(i, i + batchSize);
        const batchResults = await this.updateProductBatch(batch);
        results.push(...batchResults);
        
        // Delay entre batches para rate limiting
        if (i + batchSize < productsToUpdate.length) {
          await this.delay(2000); // 2 segundos entre batches
        }
      }

      // Calcula estatísticas
      const stats: UpdateStats = {
        total: results.length,
        updated: results.filter(r => r.success && r.changes).length,
        failed: results.filter(r => !r.success).length,
        unchanged: results.filter(r => r.success && !r.changes).length,
        results
      };

      console.log(`Atualização concluída:`, stats);
      return stats;

    } catch (error) {
      console.error(`Erro na atualização de produtos:`, error);
      throw error;
    }
  }

  /**
   * Busca produtos que precisam ser atualizados
   */
  private async getProductsForUpdate(frequency: 'high' | 'medium' | 'low'): Promise<Product[]> {
    const now = new Date();
    const cutoffTime = this.getCutoffTime(frequency);

    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.updateFrequency, frequency),
          eq(products.autoCheckEnabled, true),
          eq(products.status, 'active'),
          or(
            isNull(products.lastChecked),
            lt(products.lastChecked, cutoffTime)
          ),
          // Produtos com muitas falhas são verificados menos frequentemente
          or(
            isNull(products.failedChecks),
            lt(products.failedChecks, 5)
          )
        )
      );
  }

  /**
   * Calcula o tempo limite para atualização baseado na frequência
   */
  private getCutoffTime(frequency: 'high' | 'medium' | 'low'): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'high':
        return new Date(now.getTime() - 30 * 60 * 1000); // 30 minutos atrás
      case 'medium':
        return new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 horas atrás
      case 'low':
        return new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 horas atrás
      default:
        return new Date(now.getTime() - 2 * 60 * 60 * 1000);
    }
  }

  /**
   * Atualiza um batch de produtos
   */
  private async updateProductBatch(productBatch: Product[]): Promise<UpdateResult[]> {
    const results: UpdateResult[] = [];

    for (const product of productBatch) {
      try {
        const result = await this.updateSingleProduct(product);
        results.push(result);
      } catch (error) {
        results.push({
          productId: product.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Atualiza um único produto
   */
  private async updateSingleProduct(product: Product): Promise<UpdateResult> {
    const now = new Date();

    // Se não tem ASIN, marca como verificado mas não atualiza
    if (!product.asin) {
      await this.updateLastChecked(product.id, now, 0);
      return {
        productId: product.id,
        success: true
      };
    }

    try {
      // Busca dados atualizados da Amazon
      const amazonResponse = await this.amazonService.getProductByASIN(product.asin);

      if (!amazonResponse.success) {
        // Incrementa contador de falhas
        const failedChecks = (product.failedChecks || 0) + 1;
        await this.updateLastChecked(product.id, now, failedChecks);

        // Se muitas falhas consecutivas, marca produto como inativo
        if (failedChecks >= 5) {
          await this.markProductAsInactive(product.id, now);
        }

        return {
          productId: product.id,
          success: false,
          error: amazonResponse.error
        };
      }

      // Compara dados e identifica mudanças
      const changes = this.detectChanges(product, amazonResponse.product!);

      // Atualiza produto no banco
      if (Object.keys(changes).length > 0) {
        await this.updateProductData(product.id, changes, now);
        
        // Reset contador de falhas em caso de sucesso
        await this.updateLastChecked(product.id, now, 0);

        return {
          productId: product.id,
          success: true,
          changes
        };
      } else {
        // Produto não teve mudanças, apenas atualiza timestamp
        await this.updateLastChecked(product.id, now, 0);
        
        return {
          productId: product.id,
          success: true
        };
      }

    } catch (error) {
      const failedChecks = (product.failedChecks || 0) + 1;
      await this.updateLastChecked(product.id, now, failedChecks);

      return {
        productId: product.id,
        success: false,
        error: error instanceof Error ? error.message : 'Update failed'
      };
    }
  }

  /**
   * Detecta mudanças entre dados atuais e novos da Amazon
   */
  private detectChanges(currentProduct: Product, amazonProduct: any): Partial<Product> {
    const changes: Partial<Product> = {};

    // Verifica mudanças de preço
    if (amazonProduct.currentPrice && 
        parseFloat(amazonProduct.currentPrice.toString()) !== parseFloat((currentProduct.currentPrice || '0').toString())) {
      changes.currentPrice = amazonProduct.currentPrice.toString();
    }

    if (amazonProduct.originalPrice && 
        parseFloat(amazonProduct.originalPrice.toString()) !== parseFloat((currentProduct.originalPrice || '0').toString())) {
      changes.originalPrice = amazonProduct.originalPrice.toString();
    }

    // Verifica mudanças de disponibilidade
    if (amazonProduct.availability !== currentProduct.availability) {
      changes.availability = amazonProduct.availability;
      
      // Se ficou indisponível, marca timestamp
      if (amazonProduct.availability === 'unavailable' && !currentProduct.unavailableSince) {
        changes.unavailableSince = new Date();
      }
      
      // Se voltou a ficar disponível, limpa timestamp
      if (amazonProduct.availability === 'available' && currentProduct.unavailableSince) {
        changes.unavailableSince = null;
      }
    }

    // Verifica outras mudanças importantes
    if (amazonProduct.title && amazonProduct.title !== currentProduct.title) {
      changes.title = amazonProduct.title;
    }

    if (amazonProduct.rating && 
        parseFloat(amazonProduct.rating.toString()) !== parseFloat((currentProduct.rating || '0').toString())) {
      changes.rating = amazonProduct.rating.toString();
    }

    if (amazonProduct.reviewCount && amazonProduct.reviewCount !== currentProduct.reviewCount) {
      changes.reviewCount = amazonProduct.reviewCount;
    }

    if (amazonProduct.isPrime !== currentProduct.isPrime) {
      changes.isPrime = amazonProduct.isPrime;
    }

    // Atualiza cache completo dos dados da Amazon
    changes.amazonData = amazonProduct;
    changes.lastUpdated = new Date();

    return changes;
  }

  /**
   * Atualiza dados do produto no banco
   */
  private async updateProductData(productId: string, changes: Partial<Product>, timestamp: Date): Promise<void> {
    await db
      .update(products)
      .set({
        ...changes,
        lastChecked: timestamp,
        failedChecks: 0,
        updatedAt: timestamp
      })
      .where(eq(products.id, productId));
  }

  /**
   * Atualiza apenas o timestamp de última verificação
   */
  private async updateLastChecked(productId: string, timestamp: Date, failedChecks: number): Promise<void> {
    await db
      .update(products)
      .set({
        lastChecked: timestamp,
        failedChecks,
        updatedAt: timestamp
      })
      .where(eq(products.id, productId));
  }

  /**
   * Marca produto como inativo por muitas falhas
   */
  private async markProductAsInactive(productId: string, timestamp: Date): Promise<void> {
    await db
      .update(products)
      .set({
        status: 'inactive',
        lastChecked: timestamp,
        updatedAt: timestamp
      })
      .where(eq(products.id, productId));

    console.log(`Produto ${productId} marcado como inativo devido a falhas consecutivas`);
  }

  /**
   * Reativa produtos que voltaram a funcionar
   */
  async reactivateProducts(): Promise<number> {
    const inactiveProducts = await db
      .select()
      .from(products)
      .where(eq(products.status, 'inactive'));

    let reactivatedCount = 0;

    for (const product of inactiveProducts) {
      if (product.asin) {
        const amazonResponse = await this.amazonService.getProductByASIN(product.asin);
        
        if (amazonResponse.success && amazonResponse.product) {
          await db
            .update(products)
            .set({
              status: 'active',
              failedChecks: 0,
              lastChecked: new Date(),
              updatedAt: new Date()
            })
            .where(eq(products.id, product.id));
          
          reactivatedCount++;
          console.log(`Produto ${product.id} reativado`);
        }
      }
      
      // Rate limiting
      await this.delay(1000);
    }

    return reactivatedCount;
  }

  /**
   * Utilitário para delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtém estatísticas dos produtos
   */
  async getProductStats(): Promise<any> {
    const total = await db.select().from(products);
    const active = await db.select().from(products).where(eq(products.status, 'active'));
    const inactive = await db.select().from(products).where(eq(products.status, 'inactive'));
    const highFreq = await db.select().from(products).where(eq(products.updateFrequency, 'high'));
    const mediumFreq = await db.select().from(products).where(eq(products.updateFrequency, 'medium'));
    const lowFreq = await db.select().from(products).where(eq(products.updateFrequency, 'low'));

    return {
      total: total.length,
      active: active.length,
      inactive: inactive.length,
      frequencies: {
        high: highFreq.length,
        medium: mediumFreq.length,
        low: lowFreq.length
      }
    };
  }
}

export default ProductUpdateService;