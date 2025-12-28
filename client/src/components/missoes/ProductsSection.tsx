import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Loader2, ChevronRight, Info } from "lucide-react";
import { AmazonProductCard } from "./AmazonProductCard";
import { ApparelCard } from "./ApparelCard";
import { AmazonComplianceSection } from "@/components/AmazonComplianceSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  differential?: string | null;
  ageSegment?: string | null;
}

interface AmazonProductsResponse {
  success: boolean;
  products: AmazonProduct[];
  cached?: boolean;
  paapiEnabled?: boolean;
  availableSegments?: string[];
}

interface ProductsSectionProps {
  slug: string;
}

export function ProductsSection({ slug }: ProductsSectionProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  
  const { data: amazonData, isLoading: amazonLoading } = useQuery<AmazonProductsResponse>({
    queryKey: ['/api/missions', slug, 'amazon-products'],
    enabled: !!slug,
  });

  const { data: apparelData, isLoading: apparelLoading } = useQuery<FeaturedApparel[]>({
    queryKey: ['/api/apparel/mission', slug],
    enabled: !!slug,
  });

  const hasAmazonProducts = amazonData?.products && amazonData.products.length > 0;
  const hasApparelProducts = apparelData && apparelData.length > 0;
  const availableSegments = amazonData?.availableSegments || [];
  const hasSegments = availableSegments.length > 1;
  
  const segmentDescriptions = useMemo(() => {
    if (!amazonData?.products) return {};
    const descriptions: Record<string, string[]> = {};
    amazonData.products.forEach(product => {
      if (product.ageSegment && product.differential) {
        if (!descriptions[product.ageSegment]) {
          descriptions[product.ageSegment] = [];
        }
        if (!descriptions[product.ageSegment].includes(product.differential)) {
          descriptions[product.ageSegment].push(product.differential);
        }
      }
    });
    return descriptions;
  }, [amazonData?.products]);

  const filteredProducts = hasAmazonProducts 
    ? selectedSegment 
      ? amazonData!.products.filter(p => p.ageSegment === selectedSegment)
      : amazonData!.products
    : [];
  
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
              {/* Segment Filter Buttons */}
              {hasSegments && (
                <TooltipProvider delayDuration={300}>
                  <div className="flex flex-wrap gap-2 mb-6 justify-center">
                    <button
                      onClick={() => setSelectedSegment(null)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedSegment === null
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                      data-testid="filter-segment-all"
                    >
                      Todos
                    </button>
                    {availableSegments.map((segment) => {
                      const descriptions = segmentDescriptions[segment] || [];
                      const hasDescription = descriptions.length > 0;
                      
                      const buttonElement = (
                        <button
                          onClick={() => setSelectedSegment(segment)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            selectedSegment === segment
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          data-testid={`filter-segment-${segment.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {segment}
                        </button>
                      );

                      if (!hasDescription) {
                        return <span key={segment}>{buttonElement}</span>;
                      }

                      return (
                        <div key={segment} className="flex items-center gap-1">
                          {/* Desktop: Tooltip on hover */}
                          <Tooltip>
                            <TooltipTrigger asChild className="hidden md:inline-flex">
                              {buttonElement}
                            </TooltipTrigger>
                            <TooltipContent 
                              side="bottom" 
                              className="max-w-xs bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 shadow-lg p-3"
                            >
                              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">
                                Por que ajuda?
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {descriptions[0]}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {/* Mobile: Button without tooltip + Info icon with Popover */}
                          <button
                            onClick={() => setSelectedSegment(segment)}
                            className={`md:hidden px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                              selectedSegment === segment
                                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                            data-testid={`filter-segment-mobile-${segment.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            {segment}
                          </button>
                          
                          <Popover>
                            <PopoverTrigger asChild>
                              <button 
                                className="md:hidden p-1 text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                                data-testid={`info-segment-${segment.toLowerCase().replace(/\s+/g, '-')}`}
                                aria-label={`Informações sobre ${segment}`}
                              >
                                <Info className="w-4 h-4" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent 
                              side="bottom" 
                              className="max-w-xs bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 shadow-lg p-3"
                            >
                              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-1">
                                Por que ajuda?
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {descriptions[0]}
                              </p>
                            </PopoverContent>
                          </Popover>
                        </div>
                      );
                    })}
                  </div>
                </TooltipProvider>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                {filteredProducts.map((product, index) => (
                  <AmazonProductCard 
                    key={product.asin} 
                    product={product}
                    index={index}
                    paapiEnabled={amazonData?.paapiEnabled ?? false}
                  />
                ))}
              </div>
              
              <AmazonComplianceSection compact />
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
