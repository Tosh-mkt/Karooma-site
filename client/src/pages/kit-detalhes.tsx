import { useState } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Star, 
  StarHalf, 
  ExternalLink, 
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
import type { ProductKit, KitProduct } from "@shared/schema";

const MOCK_KITS: Record<string, ProductKit> = {
  "kit-limpeza-banheiro": {
    id: "kit-001",
    title: "Kit Limpeza de Banheiro",
    slug: "kit-limpeza-banheiro",
    theme: "Limpeza de banheiro",
    taskIntent: "BATHROOM_CLEAN",
    shortDescription: "Tudo para manter o banheiro limpo em poucos minutos, sem esforço e com praticidade.",
    longDescription: "Este kit foi cuidadosamente montado para resolver o problema de manutenção do banheiro no dia a dia. Inclui itens que facilitam a limpeza rápida, eliminam odores e mantêm o ambiente sempre fresco. Ideal para quem tem pouco tempo mas não abre mão da higiene.",
    coverImageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=400&fit=crop",
    generatedTitle: "Kit Limpeza de Banheiro — Limpeza rápida sem esforço",
    generatedDescription: "Escova sanitária + desinfetante + panos microfibra: tudo para deixar o banheiro impecável em minutos.",
    generatedBullets: [
      "Elimina 99,9% das bactérias",
      "Produtos com fragrância duradoura",
      "Fácil de usar e armazenar",
      "Ideal para limpeza diária rápida"
    ],
    status: "ACTIVE",
    rulesConfig: {
      keywordGroups: [
        { name: "escovas", keywords: ["escova sanitária silicone"], weight: 1.5 },
        { name: "desinfetantes", keywords: ["desinfetante banheiro"], weight: 1.2 },
        { name: "panos", keywords: ["pano microfibra"], weight: 0.8 }
      ],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 3,
      maxItems: 7,
      mustHaveTypes: [{ type: "MAIN", minCount: 1 }],
      priceRange: { min: 10, max: 200 },
      ratingMin: 4.0,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: ["Home & Kitchen"],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      {
        id: "prod-1",
        kitId: "kit-001",
        asin: "B0ABC12345",
        title: "Escova Sanitária de Silicone Premium com Suporte",
        description: "Escova sanitária com cerdas de silicone flexíveis que não acumulam resíduos",
        imageUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=300&h=300&fit=crop",
        price: 49.90,
        originalPrice: 69.90,
        rating: 4.7,
        reviewCount: 2847,
        isPrime: true,
        role: "MAIN",
        rankScore: 0.92,
        taskMatchScore: 0.95,
        rationale: "Item principal do kit. Escova de silicone é mais higiênica, seca rápido e não acumula bactérias como escovas tradicionais.",
        attributes: { easyCleaning: 0.9, durable: 0.85, lowMaintenance: 0.9 },
        addedVia: "MANUAL",
        affiliateLink: "https://www.amazon.com.br/dp/B0ABC12345?tag=karoom-20"
      },
      {
        id: "prod-2",
        kitId: "kit-001",
        asin: "B0DEF67890",
        title: "Desinfetante Multiuso Banheiro 500ml - Fragrância Lavanda",
        description: "Desinfetante bactericida com ação prolongada e aroma suave",
        imageUrl: "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=300&h=300&fit=crop",
        price: 24.90,
        originalPrice: 32.90,
        rating: 4.5,
        reviewCount: 1523,
        isPrime: true,
        role: "SECONDARY",
        rankScore: 0.81,
        taskMatchScore: 0.88,
        rationale: "Desinfetante específico para banheiro com ação prolongada. Elimina odores e deixa fragrância agradável por horas.",
        attributes: { easyCleaning: 0.85, lowMaintenance: 0.7 },
        addedVia: "MANUAL",
        affiliateLink: "https://www.amazon.com.br/dp/B0DEF67890?tag=karoom-20"
      },
      {
        id: "prod-3",
        kitId: "kit-001",
        asin: "B0GHI11223",
        title: "Kit 5 Panos Microfibra Ultra Absorventes",
        description: "Panos de microfibra premium para limpeza sem deixar fiapos",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
        price: 29.90,
        originalPrice: 39.90,
        rating: 4.6,
        reviewCount: 3421,
        isPrime: true,
        role: "COMPLEMENT",
        rankScore: 0.75,
        taskMatchScore: 0.72,
        rationale: "Complemento perfeito para secagem e polimento. Microfibra absorve 7x mais água e não risca superfícies.",
        attributes: { easyCleaning: 0.7, durable: 0.9, compact: 0.8 },
        addedVia: "MANUAL",
        affiliateLink: "https://www.amazon.com.br/dp/B0GHI11223?tag=karoom-20"
      },
      {
        id: "prod-4",
        kitId: "kit-001",
        asin: "B0JKL44556",
        title: "Esponja Mágica Anti-Mofo para Rejunte",
        description: "Esponja especial para limpeza de rejuntes e cantos difíceis",
        imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&h=300&fit=crop",
        price: 19.90,
        originalPrice: 24.90,
        rating: 4.4,
        reviewCount: 892,
        isPrime: true,
        role: "COMPLEMENT",
        rankScore: 0.68,
        taskMatchScore: 0.75,
        rationale: "Resolve o problema dos rejuntes escuros sem esforço. Remove manchas de mofo com água.",
        attributes: { easyCleaning: 0.95, compact: 0.9 },
        addedVia: "MANUAL",
        affiliateLink: "https://www.amazon.com.br/dp/B0JKL44556?tag=karoom-20"
      }
    ],
    views: 1247,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  },
  "kit-troca-fralda-passeio": {
    id: "kit-002",
    title: "Kit Troca de Fralda para Passeio",
    slug: "kit-troca-fralda-passeio",
    theme: "Troca de fralda para passeio",
    taskIntent: "DIAPER_ON_THE_GO",
    shortDescription: "Tudo para trocar fralda fora de casa com praticidade e segurança.",
    longDescription: "Kit completo pensado para mamães e papais que precisam trocar fralda durante passeios. Inclui trocador portátil, organizadores e acessórios que cabem na bolsa e facilitam a vida.",
    coverImageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=400&fit=crop",
    generatedTitle: "Kit Troca de Fralda (Passeio) — Praticidade para sair com o bebê",
    generatedDescription: "Trocador portátil + porta-lenços + organizador: pronto para qualquer situação fora de casa.",
    generatedBullets: [
      "Compacto e leve para levar na bolsa",
      "Materiais impermeáveis e fáceis de limpar",
      "Organização perfeita para fraldas e lenços",
      "Design discreto e elegante"
    ],
    status: "ACTIVE",
    rulesConfig: {
      keywordGroups: [
        { name: "trocador", keywords: ["trocador portátil bebê"], weight: 1.5 },
        { name: "organizador", keywords: ["porta fraldas portátil"], weight: 1.2 },
        { name: "acessórios", keywords: ["porta lenços umedecidos"], weight: 0.8 }
      ],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 4,
      maxItems: 8,
      mustHaveTypes: [{ type: "MAIN", minCount: 1 }],
      priceRange: { min: 20, max: 150 },
      ratingMin: 4.2,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: ["Baby Products"],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      {
        id: "prod-5",
        kitId: "kit-002",
        asin: "B0MNO77889",
        title: "Trocador Portátil Dobrável Impermeável com Bolsos",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop",
        price: 89.90,
        originalPrice: 119.90,
        rating: 4.8,
        reviewCount: 1856,
        isPrime: true,
        role: "MAIN",
        rankScore: 0.94,
        rationale: "Trocador principal do kit. Impermeável, acolchoado e com bolsos para guardar fraldas e lenços.",
        addedVia: "MANUAL",
        affiliateLink: "https://www.amazon.com.br/dp/B0MNO77889?tag=karoom-20"
      },
      {
        id: "prod-6",
        kitId: "kit-002",
        asin: "B0PQR99001",
        title: "Porta Fraldas Organizador Compacto",
        imageUrl: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&h=300&fit=crop",
        price: 45.90,
        originalPrice: 59.90,
        rating: 4.5,
        reviewCount: 723,
        isPrime: true,
        role: "SECONDARY",
        rankScore: 0.82,
        rationale: "Mantém fraldas organizadas e acessíveis. Cabe na bolsa e comporta até 6 fraldas.",
        addedVia: "MANUAL",
        affiliateLink: "https://www.amazon.com.br/dp/B0PQR99001?tag=karoom-20"
      },
      {
        id: "prod-7",
        kitId: "kit-002",
        asin: "B0STU22334",
        title: "Dispenser Porta Lenços Umedecidos Portátil",
        imageUrl: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300&h=300&fit=crop",
        price: 34.90,
        rating: 4.6,
        reviewCount: 1245,
        isPrime: true,
        role: "COMPLEMENT",
        rankScore: 0.76,
        rationale: "Mantém os lenços sempre úmidos e de fácil acesso. Vedação hermética.",
        addedVia: "MANUAL",
        affiliateLink: "https://www.amazon.com.br/dp/B0STU22334?tag=karoom-20"
      }
    ],
    views: 892,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  }
};

const roleConfig = {
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

function KitProductCard({ product, index }: { product: KitProduct; index: number }) {
  const config = roleConfig[product.role];
  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
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
                  alt={product.title}
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
                
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Score: {(product.rankScore * 100).toFixed(0)}%
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                {product.title}
              </h3>
              
              <div className="flex items-center gap-2 mb-2">
                {product.rating && (
                  <>
                    <RatingStars rating={product.rating} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      ({product.reviewCount?.toLocaleString()})
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    R$ {product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through ml-2">
                      R$ {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  onClick={() => window.open(product.affiliateLink, '_blank')}
                  data-testid={`btn-buy-${product.asin}`}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Ver na Amazon
                </Button>
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

function KitChecklist({ bullets }: { bullets?: string[] }) {
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
  const otherKits = Object.values(MOCK_KITS).filter(kit => kit.slug !== currentSlug);

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
  
  const kit = slug ? MOCK_KITS[slug] : null;
  const isLoading = false;

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

  if (!kit) {
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

  const mainProducts = kit.products.filter(p => p.role === 'MAIN');
  const secondaryProducts = kit.products.filter(p => p.role === 'SECONDARY');
  const complementProducts = kit.products.filter(p => p.role === 'COMPLEMENT');

  const totalPrice = kit.products.reduce((sum, p) => sum + p.price, 0);
  const totalOriginalPrice = kit.products.reduce((sum, p) => sum + (p.originalPrice || p.price), 0);
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
                {kit.products.length} itens
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
                  <span>Atualizado {kit.lastUpdatedAt ? 'hoje' : 'recentemente'}</span>
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
