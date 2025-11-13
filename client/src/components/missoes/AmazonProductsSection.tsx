import { useQuery } from "@tanstack/react-query";
import { Package, Loader2 } from "lucide-react";

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
  productUrl: string;
}

interface AmazonProductsSectionProps {
  slug: string;
}

export function AmazonProductsSection({ slug }: AmazonProductsSectionProps) {
  const { data, isLoading } = useQuery<{ success: boolean; products: AmazonProduct[]; cached?: boolean }>({
    queryKey: ['/api/missions', slug, 'amazon-products'],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div id="products" data-section="products" className="py-8">
        <div className="flex items-center justify-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Buscando produtos recomendados...</span>
        </div>
      </div>
    );
  }

  if (!data?.products || data.products.length === 0) {
    return null;
  }

  const calculateDiscount = (original?: number, current?: number) => {
    if (!original || !current || original <= current) return 0;
    return Math.round(((original - current) / original) * 100);
  };

  return (
    <div id="products" data-section="products">
      <div className="flex items-start gap-2 mb-6">
        <div className="p-2 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
          <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Produtos que ajudam na missão
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecionados com desconto e boas avaliações
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.products.map((product) => {
          const discount = calculateDiscount(product.originalPrice, product.currentPrice);
          
          return (
            <a
              key={product.asin}
              href={product.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all overflow-hidden"
              data-testid={`amazon-product-${product.asin}`}
            >
              <div className="flex gap-4 p-4">
                {product.imageUrl && (
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {product.title}
                  </h3>
                  
                  {product.brand && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {product.brand}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    {product.rating && (
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-yellow-500">★</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {product.rating.toFixed(1)}
                        </span>
                        {product.reviewCount && (
                          <span className="text-gray-500 dark:text-gray-400">
                            ({product.reviewCount})
                          </span>
                        )}
                      </div>
                    )}
                    
                    {product.isPrime && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">
                        Prime
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    {product.currentPrice && (
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ${product.currentPrice.toFixed(2)}
                      </span>
                    )}
                    
                    {discount > 0 && (
                      <>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                          -{discount}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
