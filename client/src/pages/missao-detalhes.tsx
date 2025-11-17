import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { MissionHero } from "@/components/missoes/MissionHero";
import { MissionMetadataBadges } from "@/components/missoes/MissionMetadataBadges";
import { MissionProgressBar } from "@/components/missoes/MissionProgressBar";
import { WhyMattersCard } from "@/components/missoes/WhyMattersCard";
import { TestimonialsList } from "@/components/missoes/TestimonialsList";
import { MissionProducts } from "@/components/missoes/MissionProducts";
import { CategoryNavigationCards } from "@/components/missoes/CategoryNavigationCards";
import { SocialShareCTA } from "@/components/missoes/SocialShareCTA";
import { FloatingActionButton } from "@/components/missoes/FloatingActionButton";
import { MissionTaskChecklist } from "@/components/missoes/MissionTaskChecklist";
import { ProductsSection } from "@/components/missoes/ProductsSection";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAudioNarration } from "@/hooks/useAudioNarration";
import type { SelectMission } from "@shared/schema";

interface MissionWithProducts extends SelectMission {
  products?: Array<{
    id: string;
    title: string;
    description: string | null;
    category: string;
    imageUrl: string | null;
    currentPrice: string | null;
    originalPrice: string | null;
    affiliateLink: string;
    rating: string | null;
    discount: number | null;
    featured: boolean | null;
    createdAt: Date;
  }>;
}

export default function MissaoDetalhes() {
  const [match, params] = useRoute("/missoes/:slug");
  const slug = params?.slug;
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  const { data, isLoading, error } = useQuery<MissionWithProducts>({
    queryKey: ["/api/missions", slug],
    enabled: !!slug,
  });

  const { toggle, stop, isPlaying, isSupported } = useAudioNarration();

  // Initialize total tasks when data loads
  useEffect(() => {
    if (data?.tarefasSimplesDeExecucao) {
      setTotalTasks(data.tarefasSimplesDeExecucao.length);
    }
  }, [data]);

  const handleAudioToggle = () => {
    if (!data) return;
    
    // Se estiver tocando, para completamente para permitir reinício limpo
    if (isPlaying) {
      stop();
      return;
    }
    
    // Inicia nova narração
    const narrationText = `${data.title}. ${data.understandingText || ''}`;
    toggle({ 
      text: narrationText,
      rate: 0.95,
      pitch: 1,
      lang: 'pt-BR'
    });
  };

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Header offset
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando missão...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Missão não encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Não conseguimos encontrar esta missão. Ela pode ter sido removida ou o link pode estar incorreto.
          </p>
          <Link 
            href="/missoes"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow hover:shadow-lg"
          >
            Ver todas as missões
          </Link>
        </div>
      </div>
    );
  }

  const handleProgressChange = (completed: number, total: number) => {
    setCompletedTasks(completed);
    setTotalTasks(total);
  };

  const generateSummary = () => {
    const parts = [];
    if (data.propositoPratico) parts.push(data.propositoPratico);
    if (data.descricao) parts.push(data.descricao);
    
    const fullText = parts.join(' ');
    const words = fullText.split(' ');
    
    if (words.length <= 150) return fullText;
    return words.slice(0, 150).join(' ') + '...';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-gray-900 pb-24">
      {/* 1. Hero com categoria e botão favoritar */}
      <div id="hero" data-section="hero" className="relative">
        <MissionHero
          title={data.title}
          understandingText={data.understandingText}
          heroImageUrl={data.heroImageUrl}
          category={data.category}
          missionId={data.id}
          onAudioToggle={isSupported ? handleAudioToggle : undefined}
          isAudioPlaying={isPlaying}
        />
      </div>
      
      <div className="container mx-auto px-4 py-8 space-y-8 max-w-4xl">
        {/* 2. Metadados: Tempo, Energia, Categoria */}
        <div data-section="metadata">
          <MissionMetadataBadges
            estimatedMinutes={data.estimatedMinutes ?? undefined}
            energyLevel={data.energyLevel ?? undefined}
            category={data.category}
          />
        </div>

        {/* 3. Frase contextual/marca */}
        {data.fraseMarca && (
          <div id="frase-marca" data-section="frase-marca" className="bg-[#F5F3EE] dark:bg-gray-800/50 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <p className="text-lg md:text-xl text-center text-gray-700 dark:text-gray-300 leading-relaxed font-bold">
              "{data.fraseMarca}"
            </p>
          </div>
        )}

        {/* 4. Por que isso importa */}
        {(data.propositoPratico || data.bonusTip) && (
          <div id="purpose" data-section="purpose">
            <WhyMattersCard text={data.propositoPratico || data.bonusTip || ''} />
          </div>
        )}

        {/* 5. Barra de Progresso */}
        {data.tarefasSimplesDeExecucao && data.tarefasSimplesDeExecucao.length > 0 && (
          <div id="progress" data-section="progress">
            <MissionProgressBar
              completedTasks={completedTasks}
              totalTasks={totalTasks}
            />
          </div>
        )}

        {/* 6. Checklist de Tarefas */}
        {data.tarefasSimplesDeExecucao && data.tarefasSimplesDeExecucao.length > 0 && (
          <div id="checklist" data-section="checklist" className="bg-[#FFFBF5] dark:bg-gray-800/50 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
            <MissionTaskChecklist
              missionId={data.id}
              tasks={data.tarefasSimplesDeExecucao}
              onProgressChange={handleProgressChange}
            />
          </div>
        )}

        {/* 8. Produtos Recomendados */}
        <ProductsSection slug={slug!} />
      </div>

      {/* 7. Depoimentos (Prova Social) - Full Width */}
      <div id="social-proof" data-section="social-proof" className="py-12">
        <TestimonialsList slug={slug!} />
      </div>

      {/* Container para seções finais */}
      <div className="container mx-auto px-4 space-y-12 max-w-4xl">
        {/* 9. Navegação de Categorias */}
        <div id="categories" data-section="categories">
          <CategoryNavigationCards />
        </div>
      </div>

      {/* 10. Compartilhamento Social - Full Width */}
      <div id="social-actions" data-section="social-actions" className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <SocialShareCTA missionTitle={data.title} missionSlug={slug!} />
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}
