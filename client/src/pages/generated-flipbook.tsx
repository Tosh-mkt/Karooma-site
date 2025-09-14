import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { GeneratedFlipbook } from '@/components/flipbook/GeneratedFlipbook';
import { FlipbookAccessGuard } from '@/components/flipbook/FlipbookAccessGuard';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { useConsent } from '@/contexts/ConsentContext';

interface FlipbookPageData {
  id: string;
  type: 'cover' | 'toc' | 'chapter' | 'checklist' | 'testimonial' | 'final';
  title?: string;
  icon?: string;
  content?: string;
  image?: string;
  items?: {
    text: string;
    time: string;
    category: 'easy' | 'medium' | 'hard';
  }[];
}

interface FlipbookData {
  id: string;
  postId: string;
  themeId: string;
  title: string;
  description: string | null;
  status: 'generating' | 'ready' | 'failed';
  pages: FlipbookPageData[];
  createdAt: string;
  updatedAt?: string;
}

export default function GeneratedFlipbookPage() {
  const [match, params] = useRoute('/generated-flipbook/:flipbookId');
  const [flipbook, setFlipbook] = useState<FlipbookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canUseAnalytics } = useConsent();
  
  const flipbookId = params?.flipbookId;

  useEffect(() => {
    const fetchFlipbook = async () => {
      if (!flipbookId) {
        setError('ID do flipbook não fornecido');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/flipbooks/${flipbookId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Flipbook não encontrado');
          } else {
            setError('Erro ao carregar o flipbook');
          }
          setIsLoading(false);
          return;
        }
        
        const data = await response.json();
        setFlipbook(data);
        
        // Se ainda está gerando, fazer polling
        if (data.status === 'generating') {
          pollFlipbookStatus(flipbookId);
        }
        
      } catch (err) {
        console.error('Erro ao buscar flipbook:', err);
        setError('Erro de conexão ao carregar flipbook');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlipbook();
  }, [flipbookId]);

  // Polling para flipbooks em geração
  const pollFlipbookStatus = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 36; // 6 minutos

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setError('Timeout na geração do flipbook. Tente recarregar a página.');
        return;
      }

      try {
        const response = await fetch(`/api/flipbooks/${id}/status`);
        if (response.ok) {
          const status = await response.json();
          
          if (status.status === 'ready') {
            // Buscar flipbook completo
            const flipbookResponse = await fetch(`/api/flipbooks/${id}`);
            if (flipbookResponse.ok) {
              const updatedFlipbook = await flipbookResponse.json();
              setFlipbook(updatedFlipbook);
              return;
            }
          } else if (status.status === 'failed') {
            setError('Falha na geração do flipbook');
            return;
          }
        }
      } catch (error) {
        console.warn('Erro no polling:', error);
      }

      attempts++;
      setTimeout(poll, 10000); // 10 segundos
    };

    setTimeout(poll, 5000); // Primeira verificação em 5 segundos
  };

  if (!match) {
    return <div>Página não encontrada</div>;
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-poppins">Carregando flipbook...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="font-fredoka text-2xl text-gray-800 mb-4">
            Oops! Algo deu errado
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Tentar Novamente
            </button>
            <Link href="/" className="block">
              <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!flipbook) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p>Flipbook não encontrado</p>
      </div>
    );
  }

  // Se o flipbook ainda está sendo gerado
  if (flipbook.status === 'generating') {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg mx-auto p-8"
        >
          <div className="w-20 h-20 mx-auto mb-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="font-fredoka text-3xl text-gray-800 mb-4">
            Gerando seu guia personalizado...
          </h2>
          <p className="text-gray-600 mb-4">
            Nosso sistema de IA está criando um conteúdo exclusivo para você baseado no post.
          </p>
          <div className="bg-blue-100 rounded-lg p-4 text-sm text-blue-800">
            <BookOpen className="w-5 h-5 mx-auto mb-2" />
            Isso pode levar até 2 minutos. Por favor, aguarde...
          </div>
        </motion.div>
      </div>
    );
  }

  // Usar FlipbookAccessGuard para flipbooks gerados também
  // Usar o flipbookId como identificador de acesso
  return (
    <FlipbookAccessGuard flipbookId={flipbook.id}>
      <div className="w-full h-screen overflow-hidden bg-black">
        <GeneratedFlipbook 
          flipbook={flipbook}
          onPageChange={(pageIndex) => {
            // Analytics opcional - só se consentimento for dado
            if (canUseAnalytics && typeof (window as any).gtag !== 'undefined') {
              (window as any).gtag('event', 'flipbook_page_view', {
                flipbook_id: flipbook.id,
                post_id: flipbook.postId,
                page_number: pageIndex + 1,
                flipbook_type: 'generated'
              });
            }
          }}
        />
      </div>
    </FlipbookAccessGuard>
  );
}