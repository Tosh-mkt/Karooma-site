import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, Share2 } from "lucide-react";
import { MissionHero } from "@/components/missoes/MissionHero";
import { WhyMattersCard } from "@/components/missoes/WhyMattersCard";
import { TestimonialsList } from "@/components/missoes/TestimonialsList";
import { MissionProducts } from "@/components/missoes/MissionProducts";
import { FloatingActionButton } from "@/components/missoes/FloatingActionButton";
import { MissionTaskChecklist } from "@/components/missoes/MissionTaskChecklist";
import MissionFavoriteButton from "@/components/missoes/MissionFavoriteButton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAudioNarration } from "@/hooks/useAudioNarration";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<MissionWithProducts>({
    queryKey: ["/api/missions", slug],
    enabled: !!slug,
  });

  const { toggle, stop, isPlaying, isPaused, isSupported } = useAudioNarration();

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
        {/* 2. Título (já está no hero) */}
        
        {/* 3. Frase marca */}
        {data.fraseMarca && (
          <div data-section="frase-marca" className="text-center">
            <p className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-400 italic leading-relaxed">
              "{data.fraseMarca}"
            </p>
          </div>
        )}
        
        {/* 4. Resumo de 150 palavras */}
        <div data-section="summary" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-green-200 dark:border-green-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sobre esta missão
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {generateSummary()}
          </p>
        </div>

        {/* 5 & 6. Checklist de tarefas + Progress bar */}
        {data.tarefasSimplesDeExecucao && data.tarefasSimplesDeExecucao.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-green-200 dark:border-green-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Tarefas para completar
            </h2>
            <MissionTaskChecklist 
              missionId={data.id} 
              tasks={data.tarefasSimplesDeExecucao} 
            />
          </div>
        )}

        {/* 7. Produtos recomendados */}
        {(data.products && data.products.length > 0) || (data.exemplosDeProdutos && data.exemplosDeProdutos.length > 0) ? (
          <div data-section="products">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Produtos que podem ajudar
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

        {/* Por que é importante (usando propositoPratico ou bonusTip) */}
        {(data.propositoPratico || data.bonusTip) && (
          <div data-section="purpose">
            <WhyMattersCard text={data.propositoPratico || data.bonusTip || ''} />
          </div>
        )}

        {/* 8. Prova social */}
        <div data-section="social-proof">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Outras mães que já completaram
          </h2>
          <TestimonialsList slug={slug!} />
        </div>
        
        {/* 9. Ações sociais - compartilhamento e favoritagem */}
        <div data-section="social-actions" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-lg border border-green-200 dark:border-green-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Gostou desta missão?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Salve nos favoritos ou compartilhe com outras mães
          </p>
          <div className="flex gap-4 justify-center items-center flex-wrap">
            <MissionFavoriteButton missionId={data.id} />
            <Button
              onClick={async () => {
                try {
                  const url = window.location.href;
                  if (navigator.share) {
                    await navigator.share({
                      title: data.title,
                      text: data.fraseMarca || data.understandingText,
                      url: url,
                    });
                  } else {
                    await navigator.clipboard.writeText(url);
                    toast({
                      title: "Link copiado!",
                      description: "Compartilhe esta missão com suas amigas"
                    });
                  }
                } catch (error) {
                  console.error("Erro ao compartilhar:", error);
                }
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
              data-testid="button-share"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </div>

      {/* 10. Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
}
