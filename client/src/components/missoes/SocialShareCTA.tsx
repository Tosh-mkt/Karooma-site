import { Share2, MessageCircle, Mail, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SocialShareCTAProps {
  missionTitle: string;
  missionSlug: string;
}

export function SocialShareCTA({ missionTitle, missionSlug }: SocialShareCTAProps) {
  const { toast } = useToast();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  
  const shareMessage = `Olá! Estou usando o Karooma para organizar minha vida de mãe. Esta missão me ajudou muito: "${missionTitle}". Talvez ajude você também! 🌿`;

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage + '\n' + currentUrl)}`;
    window.open(whatsappUrl, '_blank');
    toast({
      title: "Compartilhar no WhatsApp",
      description: "Abrindo WhatsApp..."
    });
  };

  const handleEmailShare = () => {
    const subject = `Missão Karooma: ${missionTitle}`;
    const body = `${shareMessage}\n\nConfira aqui: ${currentUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast({
      title: "Compartilhar por Email",
      description: "Abrindo seu aplicativo de email..."
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast({
        title: "Link copiado!",
        description: "Você pode colar o link onde quiser"
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#F5F3EE] to-[#E6D8C6] dark:from-[#7A6856] dark:to-[#5A4B3F] rounded-3xl p-8 md:p-12 shadow-2xl">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-[#FFFBF5] blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[#FFF5F0] blur-3xl"></div>
      </div>
      
      <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-[#E6B8A2] dark:bg-[#D4A89A] flex items-center justify-center mx-auto shadow-lg">
          <Share2 className="w-8 h-8 text-gray-900 dark:text-gray-100" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
          Você não está sozinha
        </h2>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Compartilhe esta missão com outras mães e responsáveis que podem estar passando pela mesma situação. 
          Juntas, somos mais fortes. 💪
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleWhatsAppShare}
            size="lg"
            className="bg-[#25D366] hover:bg-[#20BD5C] text-white font-bold px-6 py-6 text-base shadow-lg hover:shadow-xl transition-all"
            data-testid="button-share-whatsapp"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Compartilhar no WhatsApp
          </Button>
          
          <Button
            onClick={handleEmailShare}
            size="lg"
            variant="outline"
            className="bg-white hover:bg-gray-50 border-2 border-[#E6B8A2] text-gray-900 font-bold px-6 py-6 text-base shadow-lg hover:shadow-xl transition-all"
            data-testid="button-share-email"
          >
            <Mail className="w-5 h-5 mr-2" />
            Enviar por Email
          </Button>

          <Button
            onClick={handleCopyLink}
            size="lg"
            variant="outline"
            className="bg-white hover:bg-gray-50 border-2 border-[#D4A89A] text-gray-900 font-bold px-6 py-6 text-base shadow-lg hover:shadow-xl transition-all"
            data-testid="button-copy-link"
          >
            <Copy className="w-5 h-5 mr-2" />
            Copiar link
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Compartilhe leveza com quem você ama 🌿
        </p>
      </div>
    </div>
  );
}
