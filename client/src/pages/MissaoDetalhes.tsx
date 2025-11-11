import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { MissionHero } from "@/components/missoes/MissionHero";
import { MissionMeta } from "@/components/missoes/MissionMeta";
import { TaskProgress } from "@/components/missoes/TaskProgress";
import { WhyMattersCard } from "@/components/missoes/WhyMattersCard";
import { TestimonialsList } from "@/components/missoes/TestimonialsList";
import { MissionProducts } from "@/components/missoes/MissionProducts";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
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

  const { data, isLoading, error } = useQuery<MissionWithProducts>({
    queryKey: ["/api/missions", slug],
    enabled: !!slug,
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-green-900/10">
      <MissionHero
        title={data.title}
        description={data.understandingText}
        heroImageUrl={data.heroImageUrl}
        category={data.category}
      />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        <MissionMeta
          category={data.category}
        />
        
        <TaskProgress slug={slug!} />
        
        <WhyMattersCard text={data.bonusTip} />
        
        <TestimonialsList slug={slug!} />
        
        <MissionProducts products={data.products} />
      </div>
    </div>
  );
}
