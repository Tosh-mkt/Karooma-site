import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Sparkles, Heart, Lightbulb, ShoppingBag, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/content/product-card";
import { SocialProof } from "@/components/missoes/SocialProof";
import { EmotionalProgress } from "@/components/missoes/EmotionalProgress";
import type { SelectMission, Product } from "@shared/schema";

interface MissionWithProducts extends SelectMission {
  products?: Product[];
}

export default function MissaoDetalhes() {
  const params = useParams();
  const slug = params.slug;
  const [currentSection, setCurrentSection] = useState(0);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  const { data: mission, isLoading } = useQuery<MissionWithProducts>({
    queryKey: ["/api/missions", slug],
  });

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const sections = 5; // Total sections in the mission
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      const section = Math.min(Math.floor((scrollPercentage / 100) * sections), sections);
      setCurrentSection(section);
      
      if (scrollPercentage > 80 && !showCompletionMessage) {
        setShowCompletionMessage(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showCompletionMessage]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Preparando sua leveza...</p>
        </motion.div>
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
            <Button>Explorar Missões</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Emotional Progress Bar */}
      <EmotionalProgress currentSection={currentSection} totalSteps={5} />

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-24 pb-4">
        <Link href="/missoes">
          <Button variant="ghost" className="group" data-testid="button-back-missions">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Voltar para Missões
          </Button>
        </Link>
      </div>

      {/* 1. TOPO: Frase empática + Imagem identificável */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 pb-8"
      >
        {mission.heroImageUrl && (
          <div className="relative h-[400px] rounded-3xl overflow-hidden mb-6 shadow-2xl">
            <img
              src={mission.heroImageUrl}
              alt={mission.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge className="mb-4 bg-white/20 backdrop-blur-sm border-white/30">
                    {mission.category}
                  </Badge>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight"
                >
                  {mission.title}
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl text-white/90 italic font-light"
                >
                  Entre o caos e o carinho — essa missão é pra você.
                </motion.p>
              </div>
            </div>
          </div>
        )}
      </motion.section>

      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* 2. RESUMO PRÁTICO: Tempo + Benefício */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-orange-200 dark:border-orange-800"
          >
            <div className="flex items-center gap-6 justify-center text-center">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  5-10 minutos
                </span>
              </div>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Para uma rotina mais leve
                </span>
              </div>
            </div>
          </motion.div>

          {/* 3. ENTENDIMENTO: Texto empático */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/30 dark:to-pink-900/30 rounded-full">
                <Heart className="w-6 h-6 text-orange-600 dark:text-orange-400 fill-orange-600 dark:fill-orange-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  A gente entende
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {mission.understandingText}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* 4. PRODUTOS: Ferramentas que tornam isso mais fácil */}
          {mission.products && mission.products.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-3">
                  <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Ferramentas que tornam isso mais fácil
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Produtos cuidadosamente selecionados para você
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mission.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </motion.section>
          )}

          {/* 5. DICA BÔNUS */}
          {mission.bonusTip && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border-2 border-green-200 dark:border-green-800 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/10 dark:bg-green-600/10 rounded-full blur-3xl" />
              <div className="relative flex items-start gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                  <Lightbulb className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Dica Bônus 💡
                  </h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {mission.bonusTip}
                  </p>
                </div>
              </div>
            </motion.section>
          )}

          {/* 6. SOCIAL PROOF: O que outras mães disseram */}
          <SocialProof />

          {/* 7. INSPIRAÇÃO: Frase emocional */}
          {mission.inspirationalQuote && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center py-12 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100/50 dark:via-purple-900/20 to-transparent rounded-3xl" />
              <div className="relative">
                <Leaf className="w-12 h-12 text-green-500 mx-auto mb-6 opacity-50" />
                <blockquote className="text-2xl md:text-3xl font-serif italic text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                  "{mission.inspirationalQuote}"
                </blockquote>
                <div className="mt-8 flex justify-center">
                  <div className="w-20 h-1 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-full"></div>
                </div>
              </div>
            </motion.section>
          )}

          {/* 8. CTA EMOCIONAL: Respira e continua */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100 dark:from-orange-900/20 dark:via-pink-900/20 dark:to-purple-900/20 rounded-2xl p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-orange-400/10 dark:bg-orange-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            
            <div className="relative">
              <AnimatePresence>
                {showCompletionMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6"
                  >
                    <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-full">
                      <Leaf className="w-4 h-4" />
                      <span className="text-sm font-medium">Missão concluída 🌿</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Respira e continua sua leveza
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Você faz parte do Círculo da Leveza. Explore outras missões que podem te ajudar ainda mais.
              </p>
              <Link href="/missoes">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 hover:from-orange-600 hover:via-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all group"
                  data-testid="button-explore-missions"
                >
                  <span>Explorar Novas Levezas</span>
                  <Sparkles className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
