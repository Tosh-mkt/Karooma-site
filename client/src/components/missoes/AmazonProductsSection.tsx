import { useQuery } from "@tanstack/react-query";
import { Package, Loader2, ChevronRight } from "lucide-react";
import { AmazonProductCard } from "./AmazonProductCard";
import { Link } from "wouter";

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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.products.map((product, index) => (
          <AmazonProductCard 
            key={product.asin} 
            product={product}
            index={index}
          />
        ))}
      </div>

      {/* Botão Procurar Mais Produtos */}
      <div className="flex justify-center mt-8">
        <Link href="/products">
          <a 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            data-testid="button-more-products"
          >
            <Package className="w-5 h-5" />
            Procurar mais produtos
            <ChevronRight className="w-5 h-5" />
          </a>
        </Link>
      </div>
    </div>
  );
}
