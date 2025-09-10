import React from 'react';
import { useFlipbookCapture } from '@/hooks/useFlipbookCapture';
import { FlipbookCaptureModal } from './FlipbookCaptureModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Download, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getFlipbookTheme } from '@shared/flipbook-themes';

interface PostFlipbookCaptureProps {
  postId?: string;
  postCategory?: string;
  postTitle?: string;
  showInlineButton?: boolean;
  inlineButtonText?: string;
  className?: string;
  config?: {
    triggerDelay?: number;
    triggerScrollPercent?: number;
  };
}

export function PostFlipbookCapture({
  postId,
  postCategory,
  postTitle,
  showInlineButton = true,
  inlineButtonText,
  className = '',
  config
}: PostFlipbookCaptureProps) {
  const {
    isModalOpen,
    flipbookConfig,
    openModal,
    closeModal,
    hasTriggered,
    isAuthenticated,
    user
  } = useFlipbookCapture({
    postId,
    postCategory,
    postTitle,
    config
  });

  if (!flipbookConfig?.enabled) {
    return null;
  }

  const theme = getFlipbookTheme(flipbookConfig.themeId);
  
  return (
    <>
      {/* Botão inline desabilitado - usando InlineFlipbookButton separado */}

      {/* Modal de captura */}
      <FlipbookCaptureModal
        isOpen={isModalOpen}
        onClose={closeModal}
        flipbookTheme={flipbookConfig.themeId}
        postTitle={postTitle}
        postId={postId}
        flipbookTitle={flipbookConfig.title}
        flipbookDescription={flipbookConfig.description}
        socialProof={flipbookConfig.socialProof}
        previewPages={flipbookConfig.previewPages}
      />
    </>
  );
}

// Componente para botão flutuante
export function FloatingFlipbookButton({
  postId,
  postCategory,
  postTitle
}: PostFlipbookCaptureProps) {
  const { openModal, flipbookConfig, isAuthenticated } = useFlipbookCapture({
    postId,
    postCategory, 
    postTitle,
    config: { enabled: true, triggerDelay: undefined } // Não trigger automático
  });

  if (!flipbookConfig?.enabled) {
    return null;
  }

  const theme = getFlipbookTheme(flipbookConfig.themeId);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        onClick={openModal}
        className="shadow-2xl hover:shadow-3xl transition-all duration-300 px-4 py-3 text-white font-medium"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
        }}
      >
        {isAuthenticated ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Acessar Guia</span>
            <span className="sm:hidden">Guia</span>
          </>
        ) : (
          <>
            <BookOpen className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Guia Gratuito</span>
            <span className="sm:hidden">Guia</span>
          </>
        )}
      </Button>
    </div>
  );
}

// Componente para botão inline no final do post
export function InlineFlipbookButton({
  postId,
  postCategory,
  postTitle
}: PostFlipbookCaptureProps) {
  const { openModal, flipbookConfig, isAuthenticated, isModalOpen, closeModal } = useFlipbookCapture({
    postId,
    postCategory, 
    postTitle,
    config: { enabled: true, triggerDelay: undefined } // Não trigger automático
  });

  if (!flipbookConfig?.enabled) {
    return null;
  }

  const theme = getFlipbookTheme(flipbookConfig.themeId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mb-12"
    >
      <Card 
        className="glassmorphism border-0 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.secondary}15)`
        }}
      >
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
              }}
            >
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="font-poppins font-bold text-xl text-gray-800 mb-2">
              {flipbookConfig.title}
            </h3>
            
            <p className="text-gray-600 mb-4 max-w-md">
              {flipbookConfig.description}
            </p>
            
            {flipbookConfig.socialProof && (
              <p className="text-sm text-gray-500 mb-4">
                📥 Já baixado por <strong>{flipbookConfig.socialProof.downloads}+ mães</strong>
              </p>
            )}
            
            <Button
              onClick={() => {
                console.log('Botão inline flipbook clicado!', { 
                  flipbookConfig, 
                  isAuthenticated, 
                  openModal: typeof openModal 
                });
                openModal();
              }}
              size="lg"
              className="text-white font-semibold px-8 py-3 hover:scale-105 transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
              }}
              data-testid="button-inline-flipbook"
            >
              {isAuthenticated ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Acessar Guia Agora
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Baixar Guia Gratuito
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500 mt-3">
              ✨ Acesso imediato após cadastro
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal de captura para botão inline */}
      <FlipbookCaptureModal
        isOpen={isModalOpen}
        onClose={closeModal}
        flipbookTheme={flipbookConfig.themeId}
        postTitle={postTitle}
        postId={postId}
        flipbookTitle={flipbookConfig.title}
        flipbookDescription={flipbookConfig.description}
        socialProof={flipbookConfig.socialProof}
        previewPages={flipbookConfig.previewPages}
      />
    </motion.div>
  );
}

// Hook personalizado para usar em posts específicos
export function usePostFlipbookIntegration(postData: {
  id?: string;
  category?: string;
  title?: string;
  content?: string;
}) {
  const capture = useFlipbookCapture({
    postId: postData.id,
    postCategory: postData.category,
    postTitle: postData.title
  });

  // Função para inserir botão no meio do conteúdo
  const insertInlineButton = (content: string): string => {
    if (!capture.flipbookConfig?.enabled) return content;
    
    const paragraphs = content.split('\n\n');
    const middleIndex = Math.floor(paragraphs.length / 2);
    
    const buttonHtml = `
      <div class="flipbook-inline-capture" data-post-id="${postData.id}" data-theme="${capture.flipbookConfig.themeId}">
        <!-- Botão será renderizado aqui pelo React -->
      </div>
    `;
    
    paragraphs.splice(middleIndex, 0, buttonHtml);
    return paragraphs.join('\n\n');
  };

  return {
    ...capture,
    insertInlineButton
  };
}