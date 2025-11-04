import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, Lightbulb, Heart, ExternalLink, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/content/product-card";
import type { SelectMission, Product } from "@shared/schema";

interface MissionWithProducts extends SelectMission {
  products?: Product[];
}

export default function MissaoDetalhes() {
  const params = useParams();
  const slug = params.slug;

  const { data: mission, isLoading } = useQuery<MissionWithProducts>({
    queryKey: ["/api/missions", slug],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando missão...</p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Missão não encontrada
          </h2>
          <Link href="/missoes">
            <Button>Voltar para Missões</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        <Link href="/missoes">
          <Button variant="ghost" className="mb-4" data-testid="button-back-missions">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Missões
          </Button>
        </Link>
      </div>

      {/* Hero Section with Image */}
      {mission.heroImageUrl && (
        <section className="relative h-96 overflow-hidden mb-8">
          <img
            src={mission.heroImageUrl}
            alt={mission.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <Badge className="mb-4">{mission.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {mission.title}
              </h1>
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {mission.views || 0} visualizações
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Without Hero Image */}
      {!mission.heroImageUrl && (
        <section className="container mx-auto px-4 pb-8">
          <Badge className="mb-4">{mission.category}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
            {mission.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 text-sm">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {mission.views || 0} visualizações
            </span>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Understanding Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Heart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  A gente entende
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {mission.understandingText}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Products Section */}
          {mission.products && mission.products.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Solução Prática
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Produtos cuidadosamente selecionados que realmente ajudam:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mission.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </motion.section>
          )}

          {/* Bonus Tip Section */}
          {mission.bonusTip && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                  <Lightbulb className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Dica Bônus
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {mission.bonusTip}
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {/* Inspirational Quote */}
          {mission.inspirationalQuote && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <blockquote className="text-2xl md:text-3xl font-serif italic text-gray-700 dark:text-gray-300 leading-relaxed">
                "{mission.inspirationalQuote}"
              </blockquote>
              <div className="mt-6 flex justify-center">
                <div className="w-16 h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full"></div>
              </div>
            </motion.section>
          )}

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Gostou desta missão?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Explore outras soluções que podem tornar seu dia a dia mais leve
            </p>
            <Link href="/missoes">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                Ver Outras Missões
              </Button>
            </Link>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
