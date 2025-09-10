import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Mail, Sparkles, BookOpen, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { getFlipbookTheme } from '@shared/flipbook-themes';

interface FlipbookCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  flipbookTheme: string; // organizacao, bem-estar, financas, etc.
  postTitle?: string;
  postId?: string;
  flipbookTitle?: string;
  flipbookDescription?: string;
  previewPages?: string[]; // URLs das páginas de preview
  socialProof?: {
    downloads: number;
    testimonial?: string;
    testimonialAuthor?: string;
  };
}

interface FlipbookSubscriptionData {
  email: string;
  name?: string;
  source: string;
  leadMagnet: string;
  flipbookTheme: string;
  postId?: string;
  interests: {
    categories: string[];
    audience: string[];
    environments: string[];
    occasions: string[];
  };
  preferences: {
    flipbookRequested: string;
    conversionSource: string;
  };
}

export function FlipbookCaptureModal({
  isOpen,
  onClose,
  flipbookTheme,
  postTitle,
  postId,
  flipbookTitle,
  flipbookDescription,
  previewPages = [],
  socialProof
}: FlipbookCaptureModalProps) {
  const [step, setStep] = useState(1); // 1: capture, 2: success
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const { toast } = useToast();
  
  const theme = getFlipbookTheme(flipbookTheme);
  
  // Mapear tema para categorias do sistema de newsletter
  const getThemeCategories = (themeId: string): string[] => {
    const categoryMap: Record<string, string[]> = {
      'organizacao': ['organizacao'],
      'bem-estar': ['aprender-brincar', 'sono-relaxamento'],
      'financas': ['organizacao'], // Finanças pode usar organização como base
      'tecnologia': ['aprender-brincar'],
      'seguranca': ['saude-seguranca'],
      'produtividade': ['organizacao']
    };
    return categoryMap[themeId] || ['organizacao'];
  };

  const subscribeMutation = useMutation({
    mutationFn: async (data: FlipbookSubscriptionData) => {
      // Primeiro, inscrever na newsletter com tag do flipbook
      const subscriptionResponse = await apiRequest("POST", "/api/newsletter/subscribe-advanced", data);

      // Depois, registrar acesso ao flipbook se necessário
      if (flipbookTheme) {
        try {
          await apiRequest("POST", "/api/flipbook-access/grant-temporary", {
            email: data.email,
            flipbookId: flipbookTheme,
            source: 'lead-magnet',
            expiresInDays: 30 // Acesso temporário por 30 dias
          });
        } catch (error) {
          console.log('Flipbook access grant failed (not critical):', error);
        }
      }

      return subscriptionResponse;
    },
    onSuccess: () => {
      setStep(2);
      // Analytics tracking
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'flipbook_conversion', {
          flipbook_theme: flipbookTheme,
          post_id: postId,
          conversion_source: 'modal'
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Erro na inscrição',
        description: 'Não foi possível processar sua solicitação. Tente novamente.',
        variant: 'destructive',
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const subscriptionData: FlipbookSubscriptionData = {
      email: email.trim(),
      name: name.trim() || undefined,
      source: `post-${postId || 'unknown'}`,
      leadMagnet: `flipbook-${flipbookTheme}`,
      flipbookTheme,
      postId,
      interests: {
        categories: getThemeCategories(flipbookTheme),
        audience: ['familia'],
        environments: ['casa'],
        occasions: ['dia-dia']
      },
      preferences: {
        flipbookRequested: flipbookTheme,
        conversionSource: 'post-modal'
      }
    };

    subscribeMutation.mutate(subscriptionData);
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.lightTone}, #ffffff)`
          }}
        >
          {/* Header */}
          <div 
            className="relative px-6 py-8 text-white"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
            }}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-fredoka text-2xl">
                  {flipbookTitle || `Guia Completo: ${theme.name}`}
                </h2>
                <p className="text-white/80 text-sm">
                  {socialProof?.downloads && `+${socialProof.downloads} mães já baixaram`}
                </p>
              </div>
            </div>
            
            <p className="text-white/90 font-poppins">
              {flipbookDescription || 
               `Receba o guia completo com métodos práticos e testados para ${theme.name.toLowerCase()}`}
            </p>
          </div>

          {step === 1 ? (
            <div className="p-6">
              {/* Preview Section */}
              {previewPages.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Prévia do Conteúdo:</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {previewPages.slice(0, 3).map((page, index) => (
                      <img
                        key={index}
                        src={page}
                        alt={`Página ${index + 1}`}
                        className="w-20 h-28 rounded-lg shadow-md object-cover flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Contextual Connection to Post */}
              {postTitle && (
                <div className="mb-6 p-4 rounded-lg border-l-4 bg-blue-50" 
                     style={{ borderLeftColor: theme.colors.primary }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                         style={{ backgroundColor: `${theme.colors.primary}20` }}>
                      <Sparkles className="w-4 h-4" style={{ color: theme.colors.primary }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700 font-medium mb-1">
                        💡 Aprofunde o que você acabou de ler
                      </p>
                      <p className="text-xs text-gray-600">
                        Este guia complementa o post <strong>"{postTitle}"</strong> com um passo a passo detalhado 
                        para implementar todas as recomendações na prática, além de dicas extras exclusivas.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Proof */}
              {socialProof?.testimonial && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 italic mb-2">
                    "{socialProof.testimonial}"
                  </p>
                  <p className="text-xs text-gray-500">
                    — {socialProof.testimonialAuthor}
                  </p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Seu melhor email:
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Como podemos te chamar? (opcional)
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu primeiro nome"
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={subscribeMutation.isPending}
                  className="w-full py-3 text-lg font-medium"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                    border: 'none'
                  }}
                >
                  {subscribeMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Receber Guia Gratuito
                    </div>
                  )}
                </Button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">
                💌 Sem spam, apenas conteúdo prático. Cancele quando quiser.
              </p>
            </div>
          ) : (
            /* Success Step */
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>
              
              <h3 className="font-fredoka text-2xl text-gray-800 mb-2">
                🎉 Tudo pronto!
              </h3>
              
              <p className="text-gray-600 font-poppins mb-4">
                Enviamos o link do seu guia para <strong>{email}</strong>
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>Próximos passos:</strong><br />
                  1. Verifique sua caixa de entrada<br />
                  2. Adicione-nos aos contatos para não perder nada<br />
                  3. Comece a aplicar as dicas hoje mesmo!
                </p>
              </div>

              <Button
                onClick={handleClose}
                className="w-full"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                }}
              >
                Perfeito, obrigada!
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}