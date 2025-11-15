import { useQuery } from "@tanstack/react-query";
import { Package, Loader2 } from "lucide-react";
import { AmazonProductCard } from "./AmazonProductCard";

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

      <div className="grid grid-cols-2 gap-4 justify-items-center">
        {data.products.map((product, index) => (
          <AmazonProductCard 
            key={product.asin} 
            product={product}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
