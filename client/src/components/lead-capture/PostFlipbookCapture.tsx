import React from 'react';
import { useFlipbookCapture } from '@/hooks/useFlipbookCapture';
import { FlipbookCaptureModal } from './FlipbookCaptureModal';
import { Button } from '@/components/ui/button';
import { BookOpen, Download } from 'lucide-react';
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
    hasTriggered
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
      {/* Botão inline opcional */}
      {showInlineButton && (
        <div className={`my-8 text-center ${className}`}>
          <div 
            className="relative p-6 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${theme.colors.lightTone}, #ffffff)`,
              border: `2px solid ${theme.colors.primary}20`
            }}
          >
            <div className="mb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${theme.colors.primary}20` }}>
                <BookOpen className="w-8 h-8" style={{ color: theme.colors.primary }} />
              </div>
              
              <h3 className="font-fredoka text-xl text-gray-800 mb-2">
                {flipbookConfig.title}
              </h3>
              
              <p className="text-gray-600 font-poppins text-sm mb-4">
                {flipbookConfig.description}
              </p>
              
              {flipbookConfig.socialProof && (
                <p className="text-xs text-gray-500 mb-4">
                  ✨ +{flipbookConfig.socialProof.downloads} downloads
                </p>
              )}
            </div>
            
            <Button
              onClick={openModal}
              className="w-full sm:w-auto px-8 py-3 text-white font-medium"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              {inlineButtonText || 'Baixar Guia Gratuito'}
            </Button>
          </div>
        </div>
      )}

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
  const { openModal, flipbookConfig } = useFlipbookCapture({
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
        <BookOpen className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Guia Gratuito</span>
        <span className="sm:hidden">Guia</span>
      </Button>
    </div>
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