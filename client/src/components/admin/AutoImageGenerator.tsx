import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, ImageIcon, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AutoImageGeneratorProps {
  category: string;
  title: string;
  onImagesGenerated: (heroUrl: string, footerUrl: string) => void;
  disabled?: boolean;
}

export function AutoImageGenerator({ 
  category, 
  title, 
  onImagesGenerated, 
  disabled = false 
}: AutoImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [canGenerate, setCanGenerate] = useState(false);
  const { toast } = useToast();

  // Verificar se temos dados suficientes para gerar
  useEffect(() => {
    setCanGenerate(category.trim().length > 0 && title.trim().length > 10);
  }, [category, title]);

  const generateImages = async () => {
    if (!canGenerate) {
      toast({
        title: "Dados insuficientes",
        description: "Preencha categoria e título (mín. 10 caracteres) antes de gerar imagens.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // 1. Buscar prompts específicos para a categoria/título
      const promptsResponse = await apiRequest("GET", `/api/content/image-prompts?category=${encodeURIComponent(category)}&title=${encodeURIComponent(title)}`);
      const prompts = await promptsResponse.json();

      toast({
        title: "Gerando imagens...",
        description: "Criando imagens Hero (caos) e Footer (harmonia) no estilo origami.",
      });

      // 2. Gerar Hero Image (Caos)
      const heroResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompts.heroPrompt,
          one_line_summary: prompts.heroSummary,
          aspect_ratio: "16:9"
        }),
      });

      if (!heroResponse.ok) {
        throw new Error('Erro ao gerar Hero Image');
      }

      const heroResult = await heroResponse.json();

      // 3. Gerar Footer Image (Harmonia)
      const footerResponse = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompts.footerPrompt,
          one_line_summary: prompts.footerSummary,
          aspect_ratio: "16:9"
        }),
      });

      if (!footerResponse.ok) {
        throw new Error('Erro ao gerar Footer Image');
      }

      const footerResult = await footerResponse.json();

      // 4. Converter para URLs públicas
      const heroUrl = `/${heroResult.imagePath}`;
      const footerUrl = `/${footerResult.imagePath}`;

      // 5. Notificar componente pai
      onImagesGenerated(heroUrl, footerUrl);

      toast({
        title: "✨ Imagens geradas com sucesso!",
        description: "Hero (caos) e Footer (harmonia) criadas no estilo origami Karooma.",
      });

    } catch (error) {
      console.error("Erro ao gerar imagens:", error);
      toast({
        title: "Erro na geração",
        description: "Não foi possível gerar as imagens. Tente novamente ou adicione manualmente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium">Geração Automática de Imagens</span>
        </div>
        
        <Button
          type="button"
          onClick={generateImages}
          disabled={!canGenerate || disabled || isGenerating}
          className="flex items-center gap-2"
          variant="outline"
          size="sm"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isGenerating ? "Gerando..." : "Gerar Imagens"}
        </Button>
      </div>

      <div className="text-xs text-gray-600 bg-purple-50 p-3 rounded-lg">
        <p className="font-medium text-purple-800 mb-1">🎨 Sistema Automático Karooma</p>
        <p className="mb-2">
          Gera automaticamente 2 imagens no estilo "Papercraft Origami":
        </p>
        <div className="space-y-1">
          <p><strong>Hero:</strong> Representa o problema/caos inicial</p>
          <p><strong>Footer:</strong> Representa a solução/harmonia final</p>
        </div>
        {!canGenerate && (
          <p className="text-amber-600 mt-2 font-medium">
            ⚠️ Preencha categoria e título (10+ caracteres) para habilitar
          </p>
        )}
      </div>
    </div>
  );
}