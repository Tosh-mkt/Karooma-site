import { motion } from "framer-motion";
import { Link } from "wouter";
import { Package, Star, ArrowRight, Sparkles, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ProductKit } from "@shared/schema";

const MOCK_KITS: ProductKit[] = [
  {
    id: "kit-001",
    title: "Kit Limpeza de Banheiro",
    slug: "kit-limpeza-banheiro",
    taskIntent: "BATHROOM_CLEAN",
    shortDescription: "Tudo para manter o banheiro limpo em poucos minutos, sem esforço e com praticidade.",
    coverImageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&h=400&fit=crop",
    generatedTitle: "Kit Limpeza de Banheiro — Limpeza rápida sem esforço",
    status: "ACTIVE",
    rulesConfig: {
      keywordGroups: [],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 3,
      maxItems: 7,
      mustHaveTypes: [],
      priceRange: { min: 10, max: 200 },
      ratingMin: 4.0,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: [],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      { id: "1", kitId: "kit-001", asin: "A1", title: "Escova", price: 49.9, role: "MAIN", rankScore: 0.9, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "2", kitId: "kit-001", asin: "A2", title: "Desinfetante", price: 24.9, role: "SECONDARY", rankScore: 0.8, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "3", kitId: "kit-001", asin: "A3", title: "Panos", price: 29.9, role: "COMPLEMENT", rankScore: 0.7, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "4", kitId: "kit-001", asin: "A4", title: "Esponja", price: 19.9, role: "COMPLEMENT", rankScore: 0.6, addedVia: "MANUAL", affiliateLink: "#" },
    ],
    views: 1247,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  },
  {
    id: "kit-002",
    title: "Kit Troca de Fralda para Passeio",
    slug: "kit-troca-fralda-passeio",
    taskIntent: "DIAPER_ON_THE_GO",
    shortDescription: "Tudo para trocar fralda fora de casa com praticidade e segurança.",
    coverImageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=400&fit=crop",
    generatedTitle: "Kit Troca de Fralda (Passeio) — Praticidade para sair com o bebê",
    status: "ACTIVE",
    rulesConfig: {
      keywordGroups: [],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 4,
      maxItems: 8,
      mustHaveTypes: [],
      priceRange: { min: 20, max: 150 },
      ratingMin: 4.2,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: [],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      { id: "5", kitId: "kit-002", asin: "B1", title: "Trocador", price: 89.9, role: "MAIN", rankScore: 0.94, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "6", kitId: "kit-002", asin: "B2", title: "Organizador", price: 45.9, role: "SECONDARY", rankScore: 0.82, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "7", kitId: "kit-002", asin: "B3", title: "Porta Lenços", price: 34.9, role: "COMPLEMENT", rankScore: 0.76, addedVia: "MANUAL", affiliateLink: "#" },
    ],
    views: 892,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  },
  {
    id: "kit-003",
    title: "Kit Organização da Pia da Cozinha",
    slug: "kit-organizacao-pia",
    taskIntent: "KITCHEN_PIA_ORG",
    shortDescription: "Praticidade e limpeza em um só lugar para sua pia de cozinha.",
    coverImageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop",
    generatedTitle: "Kit Organização da Pia — Resolva a bagunça da cozinha",
    status: "ACTIVE",
    rulesConfig: {
      keywordGroups: [],
      typeWeights: { MAIN: 2, SECONDARY: 1, COMPLEMENT: 0.5 },
      minItems: 3,
      maxItems: 6,
      mustHaveTypes: [],
      priceRange: { min: 15, max: 180 },
      ratingMin: 4.0,
      primeOnly: true,
      excludeAsins: [],
      allowedCategories: [],
      updateFrequency: "daily",
      fallbackStrategy: { useManualAsins: true, substituteByCategory: true }
    },
    products: [
      { id: "8", kitId: "kit-003", asin: "C1", title: "Dispenser", price: 59.9, role: "MAIN", rankScore: 0.88, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "9", kitId: "kit-003", asin: "C2", title: "Porta Esponja", price: 35.9, role: "SECONDARY", rankScore: 0.79, addedVia: "MANUAL", affiliateLink: "#" },
      { id: "10", kitId: "kit-003", asin: "C3", title: "Escorredor", price: 42.9, role: "COMPLEMENT", rankScore: 0.71, addedVia: "MANUAL", affiliateLink: "#" },
    ],
    views: 654,
    lastUpdatedAt: new Date(),
    createdAt: new Date()
  }
];

function KitCard({ kit, index }: { kit: ProductKit; index: number }) {
  const totalPrice = kit.products.reduce((sum, p) => sum + p.price, 0);
  const avgRating = 4.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/kits/${kit.slug}`}>
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
          <div className="relative h-48 overflow-hidden">
            {kit.coverImageUrl ? (
              <img
                src={kit.coverImageUrl}
                alt={kit.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-600" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className="bg-green-500 text-white">
                <Package className="w-3 h-3 mr-1" />
                Kit Curado
              </Badge>
            </div>
            
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {kit.products.length} itens
                </span>
                <span className="w-1 h-1 bg-white/50 rounded-full" />
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {avgRating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          
          <CardContent className="p-5">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {kit.generatedTitle || kit.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {kit.shortDescription}
            </p>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">A partir de</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  R$ {totalPrice.toFixed(2)}
                </p>
              </div>
              
              <div className="flex items-center text-green-600 dark:text-green-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                Ver kit <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function Kits() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-center mb-4">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Curadoria Inteligente
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Kits de Produtos por Tarefa
            </h1>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Soluções completas montadas por especialistas para resolver tarefas do dia a dia. 
              Produtos selecionados, testados e prontos para comprar.
            </p>
            
            <div className="flex items-center justify-center gap-6 mt-8 text-white/80">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>{MOCK_KITS.length} kits disponíveis</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Atualização diária</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Kits Grid */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_KITS.map((kit, index) => (
            <KitCard key={kit.id} kit={kit} index={index} />
          ))}
        </div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-dashed border-2 border-gray-300 dark:border-gray-700">
            <CardContent className="py-12">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                Mais kits em breve!
              </h3>
              <p className="text-gray-500 dark:text-gray-500 max-w-md mx-auto">
                Estamos preparando mais kits curados para facilitar sua vida. 
                Volte em breve para conferir as novidades.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
