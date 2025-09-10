import { useState, useEffect } from 'react';

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

  // Mapear categoria do post para tema do flipbook
  const mapCategoryToTheme = (category?: string): string => {
    const categoryMap: Record<string, string> = {
      'organizacao': 'organizacao',
      'bem-estar': 'bem-estar', 
      'saude': 'bem-estar',
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
    // Determinar se deve mostrar captura baseado na categoria
    if (!postCategory && !config.enabled) return;
    
    const themeId = mapCategoryToTheme(postCategory);
    const fullConfig = getDefaultConfig(themeId);
    
    setFlipbookConfig(fullConfig);
  }, [postCategory, config]);

  useEffect(() => {
    if (!flipbookConfig?.enabled || hasTriggered) return;

    let timeoutId: NodeJS.Timeout;
    let hasScrollTriggered = false;

    // Trigger por tempo
    if (flipbookConfig.triggerDelay) {
      timeoutId = setTimeout(() => {
        if (!hasScrollTriggered && !hasTriggered) {
          setHasTriggered(true);
          setIsModalOpen(true);
          
          // Analytics
          if (typeof gtag !== 'undefined') {
            gtag('event', 'flipbook_modal_triggered', {
              trigger_type: 'time',
              post_id: postId,
              theme_id: flipbookConfig.themeId,
              delay_seconds: flipbookConfig.triggerDelay
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
        setIsModalOpen(true);
        
        if (timeoutId) clearTimeout(timeoutId);
        
        // Analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'flipbook_modal_triggered', {
            trigger_type: 'scroll',
            post_id: postId,
            theme_id: flipbookConfig.themeId,
            scroll_percent: Math.round(scrollPercent)
          });
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [flipbookConfig, hasTriggered, postId]);

  const openModal = () => {
    setIsModalOpen(true);
    if (typeof gtag !== 'undefined') {
      gtag('event', 'flipbook_modal_opened', {
        trigger_type: 'manual',
        post_id: postId,
        theme_id: flipbookConfig?.themeId
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    flipbookConfig,
    openModal,
    closeModal,
    hasTriggered
  };
}

// Hook para analytics de conversão
export function useConversionTracking() {
  const trackConversion = (data: {
    postId?: string;
    flipbookTheme: string;
    email: string;
    source: string;
    timestamp?: Date;
  }) => {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
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
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead', {
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