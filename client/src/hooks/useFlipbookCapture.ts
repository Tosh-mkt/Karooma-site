import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConsent } from '@/contexts/ConsentContext';

interface FlipbookCaptureConfig {
  enabled: boolean;
  themeId: string;
  title?: string;
  description?: string;
  triggerDelay?: number; // segundos após scroll ou tempo na página
  triggerScrollPercent?: number; // porcentagem da página
  socialProof?: {
    downloads: number;
    testimonial?: string;
    testimonialAuthor?: string;
  };
  previewPages?: string[];
}

interface GeneratedFlipbook {
  id: string;
  postId: string;
  themeId: string;
  title: string;
  description: string | null;
  status: 'generating' | 'ready' | 'failed';
  createdAt: string;
  updatedAt: string;
}

interface UseFlipbookCaptureProps {
  postId?: string;
  postCategory?: string;
  postTitle?: string;
  config?: Partial<FlipbookCaptureConfig>;
}

export function useFlipbookCapture({
  postId,
  postCategory,
  postTitle,
  config = {}
}: UseFlipbookCaptureProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [flipbookConfig, setFlipbookConfig] = useState<FlipbookCaptureConfig | null>(null);
  const [generatedFlipbook, setGeneratedFlipbook] = useState<GeneratedFlipbook | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { canUseAnalytics } = useConsent();

  // Verificar se existe flipbook gerado para este post
  useEffect(() => {
    const checkGeneratedFlipbook = async () => {
      if (!postId) return;
      
      try {
        const response = await fetch(`/api/flipbooks/by-post/${postId}`);
        if (response.ok) {
          const flipbook = await response.json();
          setGeneratedFlipbook(flipbook);
          setShowGenerateButton(false);
        } else if (response.status === 404) {
          // Não existe flipbook para este post
          setGeneratedFlipbook(null);
          setShowGenerateButton(true);
        }
      } catch (error) {
        console.warn('Erro ao verificar flipbook gerado:', error);
        setShowGenerateButton(true);
      }
    };

    checkGeneratedFlipbook();
  }, [postId]);

  // Mapear categoria do post para tema do flipbook
  const mapCategoryToTheme = (category?: string): string => {
    const categoryMap: Record<string, string> = {
      'organizacao': 'organizacao',
      'bem-estar': 'bem-estar', 
      'saude': 'bem-estar',
      'alimentacao': 'alimentacao', // Alimentação tem flipbook próprio
      'alimentação': 'alimentacao', // Suporte para acentos
      'financas': 'financas',
      'educacao': 'tecnologia',
      'tecnologia': 'tecnologia',
      'seguranca': 'seguranca',
      'produtividade': 'produtividade'
    };
    
    return categoryMap[category?.toLowerCase() || ''] || 'organizacao';
  };

  // Configurações padrão por tema
  const getDefaultConfig = (themeId: string): FlipbookCaptureConfig => {
    const configs: Record<string, Partial<FlipbookCaptureConfig>> = {
      'organizacao': {
        title: 'Guia Completo: Organização da Casa',
        description: 'Sistema de 8 passos que funcionou para +500 famílias',
        socialProof: {
          downloads: 847,
          testimonial: 'Em 2 semanas minha casa estava organizada pela primeira vez em anos!',
          testimonialAuthor: 'Maria, mãe de 3'
        }
      },
      'bem-estar': {
        title: 'Guia: Bem-estar Familiar',
        description: 'Rotinas práticas para uma família mais feliz e equilibrada',
        socialProof: {
          downloads: 623,
          testimonial: 'Finalmente consegui tempo para mim sem culpa.',
          testimonialAuthor: 'Ana, mãe de 2'
        }
      },
      'alimentacao': {
        title: 'Guia: Refeições Rápidas e Nutritivas',
        description: 'Receitas práticas para mães ocupadas prepararem refeições saudáveis em menos de 20 minutos',
        socialProof: {
          downloads: 847,
          testimonial: 'As receitas salvaram meus jantares! Agora consigo fazer refeições gostosas em 15 minutos.',
          testimonialAuthor: 'Ana Paula, mãe de 2'
        }
      },
      'financas': {
        title: 'Guia: Finanças Familiares',
        description: 'Organize o orçamento familiar sem stress',
        socialProof: {
          downloads: 392,
          testimonial: 'Cortamos 30% dos gastos e ainda sobrou para viagem!',
          testimonialAuthor: 'Júlia, mãe de 1'
        }
      },
      'tecnologia': {
        title: 'Guia: Tecnologia e Educação',
        description: 'Use a tecnologia a favor da educação dos seus filhos',
        socialProof: {
          downloads: 298,
          testimonial: 'Meus filhos aprendem brincando agora.',
          testimonialAuthor: 'Carla, mãe de 2'
        }
      },
      'seguranca': {
        title: 'Guia: Segurança Infantil',
        description: 'Checklist completo para uma casa segura',
        socialProof: {
          downloads: 456,
          testimonial: 'Durmo mais tranquila sabendo que a casa está segura.',
          testimonialAuthor: 'Sofia, mãe de 3'
        }
      }
    };

    const themeConfig = configs[themeId] || configs['organizacao'];
    
    return {
      enabled: true,
      themeId,
      triggerDelay: 45, // 45 segundos
      triggerScrollPercent: 70, // 70% da página
      ...themeConfig,
      ...config
    };
  };

  useEffect(() => {
    // Determinar configuração baseada no flipbook gerado ou categoria
    if (generatedFlipbook) {
      // Se há flipbook gerado, usar suas configurações
      const customConfig: FlipbookCaptureConfig = {
        enabled: true,
        themeId: generatedFlipbook.themeId,
        title: generatedFlipbook.title,
        description: generatedFlipbook.description || undefined,
        triggerDelay: config?.triggerDelay || 45,
        triggerScrollPercent: config?.triggerScrollPercent || 70,
        socialProof: {
          downloads: 1,
          testimonial: `Guia personalizado para "${postTitle || 'este post'}"`,
          testimonialAuthor: 'Equipe Karooma'
        },
        ...config
      };
      setFlipbookConfig(customConfig);
    } else if (postCategory || config?.enabled) {
      // Fallback para configuração por categoria
      const themeId = mapCategoryToTheme(postCategory);
      const fullConfig = getDefaultConfig(themeId);
      setFlipbookConfig(fullConfig);
    }
  }, [generatedFlipbook, postCategory, postTitle, config?.enabled, config?.triggerDelay, config?.triggerScrollPercent]);

  useEffect(() => {
    if (!flipbookConfig?.enabled || hasTriggered) return;

    let timeoutId: NodeJS.Timeout;
    let hasScrollTriggered = false;

    // Trigger por tempo
    if (flipbookConfig.triggerDelay) {
      timeoutId = setTimeout(() => {
        if (!hasScrollTriggered && !hasTriggered) {
          setHasTriggered(true);
          
          // Se usuário está logado, fazer download direto
          if (isAuthenticated && user?.email) {
            handleAuthenticatedDownload();
          } else {
            // Se não está logado, mostrar modal
            setIsModalOpen(true);
          }
          
          // Analytics - só se consentimento for dado
          if (canUseAnalytics && typeof (window as any).gtag !== 'undefined') {
            (window as any).gtag('event', 'flipbook_modal_triggered', {
              trigger_type: 'time',
              post_id: postId,
              theme_id: flipbookConfig.themeId,
              delay_seconds: flipbookConfig.triggerDelay,
              user_authenticated: isAuthenticated
            });
          }
        }
      }, flipbookConfig.triggerDelay * 1000);
    }

    // Trigger por scroll
    const handleScroll = () => {
      if (hasScrollTriggered || hasTriggered) return;
      
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      if (scrollPercent >= (flipbookConfig.triggerScrollPercent || 70)) {
        hasScrollTriggered = true;
        setHasTriggered(true);
        
        if (timeoutId) clearTimeout(timeoutId);
        
        // Se usuário está logado, fazer download direto
        if (isAuthenticated && user?.email) {
          handleAuthenticatedDownload();
        } else {
          // Se não está logado, mostrar modal
          setIsModalOpen(true);
        }
        
        // Analytics - só se consentimento for dado
        if (canUseAnalytics && typeof (window as any).gtag !== 'undefined') {
          (window as any).gtag('event', 'flipbook_modal_triggered', {
            trigger_type: 'scroll',
            post_id: postId,
            theme_id: flipbookConfig.themeId,
            scroll_percent: Math.round(scrollPercent),
            user_authenticated: isAuthenticated
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [flipbookConfig?.enabled, flipbookConfig?.triggerDelay, flipbookConfig?.triggerScrollPercent, flipbookConfig?.themeId, hasTriggered, postId, isAuthenticated, user?.email]);

  const openModal = () => {
    // Se o usuário está logado, fazer download direto
    if (isAuthenticated && user?.email) {
      handleAuthenticatedDownload();
      return;
    }
    
    // Se não está logado, mostrar modal de captura
    setIsModalOpen(true);
    if (canUseAnalytics && typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'flipbook_modal_opened', {
        trigger_type: 'manual',
        post_id: postId,
        theme_id: flipbookConfig?.themeId
      });
    }
  };

  const handleAuthenticatedDownload = async () => {
    if (!isAuthenticated || !user?.email || !flipbookConfig) return;

    try {
      // Registrar acesso direto para usuário logado
      await fetch('/api/flipbook-access/grant-temporary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          flipbookId: flipbookConfig.themeId,
          source: 'authenticated-user',
          expiresInDays: 30
        })
      });

      // Analytics para usuário logado - só se consentimento for dado
      if (canUseAnalytics && typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'flipbook_download_authenticated', {
          flipbook_theme: flipbookConfig.themeId,
          post_id: postId,
          user_type: 'authenticated'
        });
      }

      // Redirecionar para o flipbook - mapeamento de tema para URL
      const flipbookUrlMap: Record<string, string> = {
        'organizacao': '/flipbook-organizacao',
        'bem-estar': '/flipbook-bem-estar', 
        'alimentacao': '/flipbook-alimentacao',
        'financas': '/flipbook-financas',
        'tecnologia': '/flipbook-tecnologia',
        'seguranca': '/flipbook-seguranca',
        'produtividade': '/flipbook-produtividade'
      };
      
      const flipbookPath = flipbookUrlMap[flipbookConfig.themeId] || '/flipbook-organizacao';
      window.open(flipbookPath, '_blank');

    } catch (error) {
      console.error('Erro ao processar download para usuário logado:', error);
      // Em caso de erro, mostrar modal mesmo assim
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Função para gerar flipbook
  const generateFlipbook = async () => {
    if (!postId || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/flipbooks/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Se o flipbook já está pronto, definir imediatamente
        if (result.status === 'ready') {
          const flipbookResponse = await fetch(`/api/flipbooks/${result.flipbookId}`);
          if (flipbookResponse.ok) {
            const flipbook = await flipbookResponse.json();
            setGeneratedFlipbook(flipbook);
            setShowGenerateButton(false);
          }
          setIsGenerating(false);
        } else if (result.status === 'generating') {
          // Iniciar polling - o polling gerencia o estado isGenerating
          pollFlipbookStatus(result.flipbookId);
          // NÃO definir isGenerating=false aqui - deixar o polling controlar
        }
      } else {
        const error = await response.json();
        console.error('Erro ao gerar flipbook:', error);
        
        if (response.status === 503) {
          alert('O gerador de flipbooks não está disponível no momento. Entre em contato com o suporte.');
        } else {
          alert('Erro ao gerar o guia personalizado. Tente novamente.');
        }
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Erro na geração do flipbook:', error);
      alert('Erro na conexão. Tente novamente.');
      setIsGenerating(false);
    }
  };

  // Polling para verificar status de geração
  const pollFlipbookStatus = async (flipbookId: string) => {
    const maxAttempts = 36; // 6 minutos máximo (36 x 10 segundos)
    let attempts = 0;
    let consecutiveErrors = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        console.warn('Timeout na geração do flipbook após 6 minutos');
        setIsGenerating(false);
        alert('A geração está demorando mais que o esperado. Recarregue a página em alguns minutos para verificar o status.');
        return;
      }

      try {
        const response = await fetch(`/api/flipbooks/${flipbookId}/status`);
        
        if (response.ok) {
          consecutiveErrors = 0; // Reset error counter on success
          const status = await response.json();
          
          if (status.status === 'ready') {
            // Buscar flipbook completo
            const flipbookResponse = await fetch(`/api/flipbooks/${flipbookId}`);
            if (flipbookResponse.ok) {
              const flipbook = await flipbookResponse.json();
              setGeneratedFlipbook(flipbook);
              setShowGenerateButton(false);
              setIsGenerating(false);
              
              // Analytics - só se consentimento for dado
              if (canUseAnalytics && typeof (window as any).gtag !== 'undefined') {
                (window as any).gtag('event', 'flipbook_generated_success', {
                  flipbook_id: flipbookId,
                  post_id: postId,
                  generation_time_seconds: attempts * 10
                });
              }
              return;
            }
          } else if (status.status === 'failed') {
            console.error('Falha na geração do flipbook');
            setIsGenerating(false);
            setShowGenerateButton(true); // Permitir tentar novamente
            alert('Falha na geração do guia. Você pode tentar novamente.');
            
            // Analytics - só se consentimento for dado
            if (canUseAnalytics && typeof (window as any).gtag !== 'undefined') {
              (window as any).gtag('event', 'flipbook_generation_failed', {
                flipbook_id: flipbookId,
                post_id: postId,
                attempts: attempts
              });
            }
            return;
          }
          // Status ainda é 'generating', continuar polling
        } else {
          consecutiveErrors++;
          console.warn(`Erro HTTP ${response.status} ao verificar status do flipbook`);
          
          // Se muitos erros consecutivos, parar
          if (consecutiveErrors >= 5) {
            console.error('Muitos erros consecutivos no polling');
            setIsGenerating(false);
            alert('Erro ao verificar o progresso da geração. Tente recarregar a página em alguns minutos.');
            return;
          }
        }
      } catch (error) {
        consecutiveErrors++;
        console.warn('Erro no polling do status:', error);
        
        // Se muitos erros consecutivos, parar
        if (consecutiveErrors >= 5) {
          console.error('Muitos erros consecutivos no polling');
          setIsGenerating(false);
          alert('Problemas de conexão ao verificar o progresso. Tente recarregar a página em alguns minutos.');
          return;
        }
      }

      attempts++;
      // Backoff exponencial limitado: começar com 3s, depois 5s, depois 10s
      const delay = Math.min(3000 + attempts * 1000, 10000);
      setTimeout(poll, delay);
    };

    // Primeira verificação em 3 segundos
    setTimeout(poll, 3000);
  };

  return {
    isModalOpen,
    flipbookConfig,
    openModal,
    closeModal,
    hasTriggered,
    isAuthenticated,
    user,
    // Novos campos para flipbooks gerados
    generatedFlipbook,
    showGenerateButton,
    generateFlipbook,
    isGenerating
  };
}

// Hook para analytics de conversão
export function useConversionTracking() {
  const { canUseAnalytics } = useConsent();
  
  const trackConversion = (data: {
    postId?: string;
    flipbookTheme: string;
    email: string;
    source: string;
    timestamp?: Date;
  }) => {
    // Google Analytics - só se consentimento for dado
    if (canUseAnalytics && typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'conversion', {
        event_category: 'flipbook',
        event_label: data.flipbookTheme,
        custom_parameters: {
          post_id: data.postId,
          conversion_source: data.source,
          user_email_hash: btoa(data.email) // Hash do email para privacidade
        }
      });
    }

    // Facebook Pixel (se disponível)
    if (typeof (window as any).fbq !== 'undefined') {
      (window as any).fbq('track', 'Lead', {
        content_category: data.flipbookTheme,
        content_ids: [data.postId || 'unknown'],
        source: data.source
      });
    }

    // Enviar para analytics interno
    fetch('/api/analytics/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        timestamp: data.timestamp || new Date(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      })
    }).catch(error => {
      console.warn('Analytics tracking failed:', error);
    });
  };

  return { trackConversion };
}