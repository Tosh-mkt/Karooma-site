import { db } from "../db";
import { userAlerts, products } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import AmazonPAAPIService from "../services/amazonApi";

interface PromotionAlert {
  alertId: string;
  userId: string;
  type: 'product' | 'category';
  productId?: number;
  category?: string;
  productDetails: {
    asin?: string;
    title: string;
    currentPrice?: number;
    originalPrice?: number;
    discountPercent: number;
    imageUrl?: string;
    productUrl: string;
  };
  notifyEmail: boolean;
  notifyPush: boolean;
}

/**
 * Verifica alertas de produtos e detecta promoções
 */
export async function checkProductAlerts(): Promise<PromotionAlert[]> {
  const amazonApi = new AmazonPAAPIService();
  const promotionsFound: PromotionAlert[] = [];

  try {
    // Buscar todos os alertas ativos de produto
    const productAlerts = await db
      .select()
      .from(userAlerts)
      .where(
        and(
          eq(userAlerts.type, 'product'),
          eq(userAlerts.isActive, true)
        )
      );

    console.log(`Verificando ${productAlerts.length} alertas de produto...`);

    // Agrupar alertas por ASIN para otimizar requests
    const alertsByAsin = new Map<string, typeof productAlerts>();
    
    for (const alert of productAlerts) {
      if (!alert.productId) continue;

      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, alert.productId))
        .limit(1);

      if (product.length > 0 && product[0].asin) {
        const asin = product[0].asin;
        if (!alertsByAsin.has(asin)) {
          alertsByAsin.set(asin, []);
        }
        alertsByAsin.get(asin)!.push(alert);
      }
    }

    // Verificar preços na Amazon PA API
    const asinsToCheck = Array.from(alertsByAsin.keys());
    
    if (asinsToCheck.length === 0) {
      console.log('Nenhum ASIN para verificar');
      return [];
    }

    console.log(`Consultando ${asinsToCheck.length} ASINs na Amazon PA API...`);
    const apiResults = await amazonApi.getProductsByASINs(asinsToCheck);

    // Processar resultados e detectar promoções
    for (let i = 0; i < asinsToCheck.length; i++) {
      const asin = asinsToCheck[i];
      const apiResult = apiResults[i];
      const alerts = alertsByAsin.get(asin) || [];

      if (!apiResult.success || !apiResult.product) {
        console.log(`Produto ${asin} não encontrado ou erro na API`);
        continue;
      }

      const amazonProduct = apiResult.product;
      const { currentPrice, originalPrice } = amazonProduct;

      // Calcular desconto
      let discountPercent = 0;
      if (currentPrice && originalPrice && originalPrice > currentPrice) {
        discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
      }

      // Verificar se algum alerta foi ativado
      for (const alert of alerts) {
        const minDiscount = alert.minDiscountPercent || 20;
        
        if (discountPercent >= minDiscount) {
          console.log(`🔔 PROMOÇÃO DETECTADA: ${amazonProduct.title} - ${discountPercent}% OFF`);
          
          promotionsFound.push({
            alertId: alert.id,
            userId: alert.userId,
            type: 'product',
            productId: alert.productId!,
            productDetails: {
              asin,
              title: amazonProduct.title,
              currentPrice,
              originalPrice,
              discountPercent,
              imageUrl: amazonProduct.imageUrl,
              productUrl: amazonProduct.productUrl
            },
            notifyEmail: alert.notifyEmail,
            notifyPush: alert.notifyPush
          });
        }
      }
    }

    return promotionsFound;
  } catch (error) {
    console.error('Erro ao verificar alertas de produto:', error);
    return [];
  }
}

/**
 * Verifica alertas de categoria e detecta promoções
 */
export async function checkCategoryAlerts(): Promise<PromotionAlert[]> {
  const amazonApi = new AmazonPAAPIService();
  const promotionsFound: PromotionAlert[] = [];

  try {
    // Buscar todos os alertas ativos de categoria
    const categoryAlerts = await db
      .select()
      .from(userAlerts)
      .where(
        and(
          eq(userAlerts.type, 'category'),
          eq(userAlerts.isActive, true)
        )
      );

    console.log(`Verificando ${categoryAlerts.length} alertas de categoria...`);

    // Agrupar por categoria para otimizar
    const alertsByCategory = new Map<string, typeof categoryAlerts>();
    
    for (const alert of categoryAlerts) {
      if (!alert.category) continue;
      
      if (!alertsByCategory.has(alert.category)) {
        alertsByCategory.set(alert.category, []);
      }
      alertsByCategory.get(alert.category)!.push(alert);
    }

    // Para cada categoria, buscar produtos em promoção
    for (const [category, alerts] of alertsByCategory.entries()) {
      const minDiscount = Math.min(...alerts.map(a => a.minDiscountPercent || 20));
      
      console.log(`Buscando produtos em promoção na categoria ${category} (mín ${minDiscount}% desconto)...`);
      
      const searchResult = await amazonApi.searchItems({
        category,
        minDiscountPercent: minDiscount,
        sortBy: 'Price:LowToHigh',
        itemCount: 5 // Limitar a 5 produtos por categoria
      });

      if (searchResult.success && searchResult.products) {
        for (const amazonProduct of searchResult.products) {
          const { currentPrice, originalPrice } = amazonProduct;
          
          let discountPercent = 0;
          if (currentPrice && originalPrice && originalPrice > currentPrice) {
            discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
          }

          // Notificar todos os usuários interessados nessa categoria
          for (const alert of alerts) {
            const minDiscount = alert.minDiscountPercent || 20;
            
            if (discountPercent >= minDiscount) {
              console.log(`🔔 PROMOÇÃO DETECTADA (categoria ${category}): ${amazonProduct.title} - ${discountPercent}% OFF`);
              
              promotionsFound.push({
                alertId: alert.id,
                userId: alert.userId,
                type: 'category',
                category: alert.category!,
                productDetails: {
                  asin: amazonProduct.asin,
                  title: amazonProduct.title,
                  currentPrice,
                  originalPrice,
                  discountPercent,
                  imageUrl: amazonProduct.imageUrl,
                  productUrl: amazonProduct.productUrl
                },
                notifyEmail: alert.notifyEmail,
                notifyPush: alert.notifyPush
              });
            }
          }
        }
      }

      // Rate limiting - pausa entre categorias
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return promotionsFound;
  } catch (error) {
    console.error('Erro ao verificar alertas de categoria:', error);
    return [];
  }
}

/**
 * Job principal que verifica todos os alertas
 */
export async function runAlertChecker(): Promise<void> {
  console.log('🔍 Iniciando verificação de alertas...');
  
  const startTime = Date.now();
  
  try {
    // Verificar alertas de produto e categoria em paralelo
    const [productPromotions, categoryPromotions] = await Promise.all([
      checkProductAlerts(),
      checkCategoryAlerts()
    ]);

    const allPromotions = [...productPromotions, ...categoryPromotions];
    
    console.log(`✅ Verificação concluída em ${Date.now() - startTime}ms`);
    console.log(`   - Promoções encontradas: ${allPromotions.length}`);
    console.log(`   - Produtos: ${productPromotions.length}`);
    console.log(`   - Categorias: ${categoryPromotions.length}`);

    // Retornar promoções para o próximo passo (envio de notificações)
    return allPromotions as any;
  } catch (error) {
    console.error('❌ Erro ao executar verificação de alertas:', error);
  }
}
