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
import { CommunityCTA } from "@/components/missoes/CommunityCTA";
import { FloatingActionButton } from "@/components/missoes/FloatingActionButton";
import { MissionTaskChecklist } from "@/components/missoes/MissionTaskChecklist";
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-green-900/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando missão...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-green-900/10 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Missão não encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Não conseguimos encontrar esta missão. Ela pode ter sido removida ou o link pode estar incorreto.
          </p>
          <Link href="/missoes">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
              Ver todas as missões
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Initialize total tasks when data loads
  useEffect(() => {
    if (data?.tarefasSimplesDeExecucao) {
      setTotalTasks(data.tarefasSimplesDeExecucao.length);
    }
  }, [data]);

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-green-900/10 pb-24">
      {/* 1. Hero com categoria */}
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
        <div className="absolute top-24 left-4 md:left-8">
          <Badge className="bg-green-500/90 hover:bg-green-600 text-white px-6 py-2 text-sm font-semibold shadow-lg">
            {data.category}
          </Badge>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 space-y-12 max-w-4xl">
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
          <div id="frase-marca" data-section="frase-marca" className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-400 italic leading-relaxed">
              "{data.fraseMarca}"
            </p>
          </div>
        )}

        {/* 4. Barra de Progresso */}
        {data.tarefasSimplesDeExecucao && data.tarefasSimplesDeExecucao.length > 0 && (
          <div id="progress" data-section="progress">
            <MissionProgressBar
              completedTasks={completedTasks}
              totalTasks={totalTasks}
            />
          </div>
        )}

        {/* 5. Checklist de Tarefas */}
        {data.tarefasSimplesDeExecucao && data.tarefasSimplesDeExecucao.length > 0 && (
          <div id="checklist" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-green-200 dark:border-green-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Tarefas para completar
            </h2>
            <MissionTaskChecklist
              missionId={data.id}
              tasks={data.tarefasSimplesDeExecucao}
              onProgressChange={handleProgressChange}
            />
          </div>
        )}

        {/* 6. Por que isso importa */}
        {(data.propositoPratico || data.bonusTip) && (
          <div id="purpose" data-section="purpose">
            <WhyMattersCard text={data.propositoPratico || data.bonusTip || ''} />
          </div>
        )}

        {/* 7. Depoimentos (Prova Social) */}
        <div id="social-proof" data-section="social-proof">
          <TestimonialsList slug={slug!} />
        </div>

        {/* 8. Produtos Recomendados */}
        {(data.products && data.products.length > 0) || (data.exemplosDeProdutos && data.exemplosDeProdutos.length > 0) ? (
          <div id="products" data-section="products">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Ferramentas que tornam isso mais fácil
            </h2>
            {data.exemplosDeProdutos && data.exemplosDeProdutos.length > 0 && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Exemplos sugeridos:
                </h3>
                <ul className="space-y-2">
                  {data.exemplosDeProdutos.map((example, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.products && data.products.length > 0 && (
              <MissionProducts products={data.products} />
            )}
          </div>
        ) : null}

        {/* 9. Navegação de Categorias */}
        <div id="categories" data-section="categories">
          <CategoryNavigationCards />
        </div>

        {/* 10. CTA Comunidade */}
        <div id="community" data-section="community">
          <CommunityCTA />
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}
