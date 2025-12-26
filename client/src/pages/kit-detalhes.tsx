import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  Star, 
  StarHalf, 
  Package, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Crown,
  Zap,
  Heart,
  ChevronRight,
  ShoppingCart,
  BadgeCheck,
  Loader2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SelectProductKit, SelectKitProduct } from "@shared/schema";

type KitWithProducts = SelectProductKit & { products: SelectKitProduct[] };

const roleConfig: Record<string, {
  label: string;
  icon: typeof Crown;
  bgColor: string;
  textColor: string;
  borderColor: string;
  ringColor: string;
  gradient: string;
}> = {
  MAIN: {
    label: "Principal",
    icon: Crown,
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    textColor: "text-amber-700 dark:text-amber-300",
    borderColor: "border-amber-300 dark:border-amber-600",
    ringColor: "ring-amber-400",
    gradient: "from-amber-500 to-yellow-500"
  },
  SECONDARY: {
    label: "Secundário",
    icon: Zap,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-300 dark:border-blue-600",
    ringColor: "ring-blue-400",
    gradient: "from-blue-500 to-cyan-500"
  },
  COMPLEMENT: {
    label: "Complemento",
    icon: Heart,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-700 dark:text-green-300",
    borderColor: "border-green-300 dark:border-green-600",
    ringColor: "ring-green-400",
    gradient: "from-green-500 to-emerald-500"
  }
};

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalf && <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
      {[...Array(5 - fullStars - (hasHalf ? 1 : 0))].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
    </div>
  );
}

function KitProductCard({ product, index }: { product: SelectKitProduct; index: number }) {
  const config = roleConfig[product.role || 'COMPLEMENT'];
  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;
  const discount = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${product.role === 'MAIN' ? 'ring-2 ' + config.ringColor : ''}`}>
        {product.role === 'MAIN' && (
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
        )}
        
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title || 'Produto'}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              {discount > 0 && (
                <Badge className="absolute -top-2 -left-2 bg-red-500 text-white text-xs">
                  -{discount}%
                </Badge>
              )}
              
              {product.isPrime && (
                <Badge className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs">
                  Prime
                </Badge>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge className={`${config.bgColor} ${config.textColor} border ${config.borderColor} flex items-center gap-1`}>
                  <config.icon className="w-3 h-3" />
                  {config.label}
                </Badge>
                
                {product.rankScore && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Score: {(Number(product.rankScore) * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                {product.title || 'Produto sem título'}
              </h3>
              
              <div className="flex items-center gap-2 mb-2">
                {product.rating && (
                  <>
                    <RatingStars rating={Number(product.rating)} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      ({product.reviewCount?.toLocaleString()})
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    R$ {price.toFixed(2)}
                  </span>
                  {originalPrice > price && (
                    <span className="text-sm text-gray-400 line-through ml-2">
                      R$ {originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                {product.affiliateLink && (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                    onClick={() => window.open(product.affiliateLink!, '_blank')}
                    data-testid={`btn-buy-${product.asin}`}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Ver na Amazon
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {product.rationale && (
            <div className={`mt-4 p-3 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
              <div className="flex items-start gap-2">
                <BadgeCheck className={`w-4 h-4 ${config.textColor} flex-shrink-0 mt-0.5`} />
                <p className={`text-sm ${config.textColor}`}>
                  <strong>Por que está no kit:</strong> {product.rationale}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function KitChecklist({ bullets }: { bullets?: string[] | null }) {
  if (!bullets || bullets.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
      <CardContent className="p-6">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-600" />
          Benefícios deste Kit
        </h3>
        <ul className="space-y-3">
          {bullets.map((bullet, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
            >
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>{bullet}</span>
            </motion.li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function RelatedKits({ currentSlug }: { currentSlug: string }) {
  const { data: allKits } = useQuery<SelectProductKit[]>({
    queryKey: ["/api/kits"],
  });

  const otherKits = allKits?.filter(kit => kit.slug !== currentSlug) || [];

  if (otherKits.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Outros Kits que Você Pode Gostar
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {otherKits.map((kit) => (
          <Link key={kit.id} href={`/kits/${kit.slug}`}>
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
              <div className="flex">
                {kit.coverImageUrl && (
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={kit.coverImageUrl}
                      alt={kit.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-4 flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {kit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                    {kit.shortDescription}
                  </p>
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                    Ver kit <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function KitDetalhes() {
  const [, params] = useRoute("/kits/:slug");
  const slug = params?.slug;
  
  const { data: kit, isLoading, error } = useQuery<KitWithProducts>({
    queryKey: ["/api/kits", slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando kit...</p>
        </div>
      </div>
    );
  }

  if (error || !kit) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Kit não encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Não conseguimos encontrar este kit. Ele pode ter sido removido ou o link pode estar incorreto.
          </p>
          <Link href="/kits">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
              Ver todos os kits
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const products = kit.products || [];
  const mainProducts = products.filter(p => p.role === 'MAIN');
  const secondaryProducts = products.filter(p => p.role === 'SECONDARY');
  const complementProducts = products.filter(p => p.role === 'COMPLEMENT');

  const totalPrice = products.reduce((sum, p) => sum + (parseFloat(String(p.price)) || 0), 0);
  const totalOriginalPrice = products.reduce((sum, p) => sum + (parseFloat(String(p.originalPrice || p.price)) || 0), 0);
  const totalSavings = totalOriginalPrice - totalPrice;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-gray-900 pb-12">
      {/* Hero Section */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        {kit.coverImageUrl ? (
          <img
            src={kit.coverImageUrl}
            alt={kit.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="container mx-auto max-w-4xl">
            <Link href="/kits" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para kits
            </Link>
            
            <div className="flex items-center gap-3 mb-3">
              <Badge className="bg-green-500 text-white">
                <Package className="w-3 h-3 mr-1" />
                Kit Curado
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                {products.length} itens
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {kit.generatedTitle || kit.title}
            </h1>
            <p className="text-white/90 text-lg max-w-2xl">
              {kit.shortDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Summary Card */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Valor total do kit</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                    R$ {totalPrice.toFixed(2)}
                  </span>
                  {totalSavings > 0 && (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                      Economia de R$ {totalSavings.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Atualizado recentemente</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Checklist */}
        <div className="mb-8">
          <KitChecklist bullets={kit.generatedBullets} />
        </div>

        {/* Products by Role */}
        <div className="space-y-8">
          {/* Main Products */}
          {mainProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Itens Principais
              </h2>
              <div className="space-y-4">
                {mainProducts.map((product, i) => (
                  <KitProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Secondary Products */}
          {secondaryProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Itens Secundários
              </h2>
              <div className="space-y-4">
                {secondaryProducts.map((product, i) => (
                  <KitProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Complement Products */}
          {complementProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-500" />
                Complementos
              </h2>
              <div className="space-y-4">
                {complementProducts.map((product, i) => (
                  <KitProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Long Description */}
        {kit.longDescription && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Sobre este Kit
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {kit.longDescription}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Related Kits */}
        <RelatedKits currentSlug={kit.slug} />
      </div>
    </div>
  );
}
