import { useQuery } from "@tanstack/react-query";
import { Package, Loader2, ChevronRight } from "lucide-react";
import { AmazonProductCard } from "./AmazonProductCard";
import { ApparelCard } from "./ApparelCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import type { FeaturedApparel } from "@shared/schema";

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

interface ProductsSectionProps {
  slug: string;
}

export function ProductsSection({ slug }: ProductsSectionProps) {
  const { data: amazonData, isLoading: amazonLoading } = useQuery<{ success: boolean; products: AmazonProduct[]; cached?: boolean }>({
    queryKey: ['/api/missions', slug, 'amazon-products'],
    enabled: !!slug,
  });

  const { data: apparelData, isLoading: apparelLoading } = useQuery<FeaturedApparel[]>({
    queryKey: ['/api/apparel/mission', slug],
    enabled: !!slug,
  });

  const hasAmazonProducts = amazonData?.products && amazonData.products.length > 0;
  const hasApparelProducts = apparelData && apparelData.length > 0;
  
  if (amazonLoading && apparelLoading) {
    return (
      <div id="products" data-section="products" className="py-8">
        <div className="flex items-center justify-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Buscando produtos recomendados...</span>
        </div>
      </div>
    );
  }

  if (!hasAmazonProducts && !hasApparelProducts) {
    return null;
  }

  return (
    <div id="products" data-section="products">
      <div className="flex items-start gap-2 mb-6">
        <div className="p-2 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
          <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Produtos que ajudam nesta missão</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Soluções práticas e expressões emocionais selecionadas
          </p>
        </div>
      </div>
      <Tabs defaultValue={hasAmazonProducts ? "resolvem" : "expressam"} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm p-1 rounded-full">
          <TabsTrigger 
            value="resolvem" 
            className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            data-testid="tab-mission-resolvem"
            disabled={!hasAmazonProducts}
          >
            Resolvem
          </TabsTrigger>
          <TabsTrigger 
            value="expressam" 
            className="rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            data-testid="tab-mission-expressam"
            disabled={!hasApparelProducts}
          >
            Expressam
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resolvem">
          {hasAmazonProducts && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {amazonData!.products.map((product, index) => (
                  <AmazonProductCard 
                    key={product.asin} 
                    product={product}
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="expressam">
          {hasApparelProducts && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {apparelData!.map((apparel, index) => (
                  <ApparelCard 
                    key={apparel.id} 
                    apparel={apparel}
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
      <div className="flex justify-center mt-8">
        <Link href="/products">
          <button 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
            data-testid="button-more-products"
          >
            <Package className="w-5 h-5" />
            Procurar mais produtos
            <ChevronRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
    </div>
  );
}
