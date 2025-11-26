import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, Eye, ArrowLeft } from "lucide-react";
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

export default function MissaoPreview() {
  const [match, params] = useRoute("/preview/missoes/:slug");
  const slug = params?.slug;
  const [completedTasks, setCompletedTasks] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);

  // Use preview endpoint instead of public endpoint
  const { data, isLoading, error } = useQuery<MissionWithProducts>({
    queryKey: ["/api/preview/missions", slug],
    enabled: !!slug,
  });

  const { toggle, stop, isPlaying, isSupported } = useAudioNarration();

  useEffect(() => {
    if (data?.tarefasSimplesDeExecucao) {
      setTotalTasks(data.tarefasSimplesDeExecucao.length);
    }
  }, [data]);

  const handleAudioToggle = () => {
    if (!data) return;
    
    if (isPlaying) {
      stop();
      return;
    }
    
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
      const offset = 80;
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
          <p className="text-gray-600 dark:text-gray-400">Carregando prévia...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Erro ao carregar prévia
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error ? 'Você precisa estar logado como admin para visualizar prévias.' : 'Missão não encontrada'}
          </p>
          <Link href="/admin/missions">
            <Button className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Painel
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-gray-900">
      {/* Preview Banner */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 sticky top-16 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5" />
            <div>
              <p className="font-semibold">Modo Prévia</p>
              <p className="text-xs opacity-90">
                {data.isPublished ? 'Esta missão está publicada' : 'Esta missão ainda não está publicada'}
              </p>
            </div>
          </div>
          <Link href="/admin/missions">
            <Button variant="outline" size="sm" className="bg-white text-orange-600 hover:bg-gray-100 border-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Editor
            </Button>
          </Link>
        </div>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <MissionProgressBar completed={completedTasks} total={totalTasks} />
      )}

      {/* Hero Section */}
      <MissionHero
        title={data.title}
        description={data.descricao}
        understandingText={data.understandingText}
        heroImageUrl={data.heroImageUrl}
        category={data.category}
        missionId={data.id}
        onAudioToggle={isSupported ? handleAudioToggle : undefined}
        isAudioPlaying={isPlaying}
      />

      {/* Metadata Badges */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <MissionMetadataBadges
          energyLevel={data.energyLevel}
          estimatedMinutes={data.estimatedMinutes}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Why This Matters */}
        {data.propositoPratico && (
          <div id="entenda" className="scroll-mt-20">
            <WhyMattersCard
              propositoPratico={data.propositoPratico}
              inspirationalQuote={data.inspirationalQuote}
            />
          </div>
        )}

        {/* Checklist */}
        {data.tarefasSimplesDeExecucao && data.tarefasSimplesDeExecucao.length > 0 && (
          <div id="tarefas" className="mt-12 scroll-mt-20">
            <MissionTaskChecklist
              tasks={data.tarefasSimplesDeExecucao}
              missionId={data.id}
              onProgressChange={(completed, total) => {
                setCompletedTasks(completed);
                setTotalTasks(total);
              }}
            />
          </div>
        )}

        {/* Products Section */}
        {data.products && data.products.length > 0 && (
          <div id="produtos" className="mt-12 scroll-mt-20">
            <ProductsSection products={data.products} />
          </div>
        )}

        {/* Amazon Products - using mission's productAsins */}
        {data.productAsins && data.productAsins.length > 0 && (
          <div id="produtos-amazon" className="mt-12 scroll-mt-20">
            <MissionProducts missionSlug={data.slug} />
          </div>
        )}

        {/* Bonus Tip */}
        {data.bonusTip && (
          <div className="mt-12 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-8 border border-green-100 dark:border-green-800">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Dica Extra
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {data.bonusTip}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Testimonials */}
        <div className="mt-12">
          <TestimonialsList />
        </div>

        {/* Category Navigation */}
        <div className="mt-12">
          <CategoryNavigationCards currentCategory={data.category} />
        </div>

        {/* Social Share */}
        <div className="mt-12">
          <SocialShareCTA missionTitle={data.title} />
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton slug={slug} />
    </div>
  );
}
