import React, { useState } from 'react';
import { useFlipbookCapture } from '@/hooks/useFlipbookCapture';
import { useAuth } from '@/hooks/useAuth';
import { FlipbookCaptureModal } from './FlipbookCaptureModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookOpen, Download, CheckCircle, Wand2, Loader2, X, Heart, Bell, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFlipbookTheme, FlipbookTheme } from '@shared/flipbook-themes';

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
  const { 
    openModal, 
    flipbookConfig, 
    isAuthenticated, 
    isModalOpen, 
    closeModal,
    generatedFlipbook,
    showGenerateButton,
    generateFlipbook,
    isGenerating
  } = useFlipbookCapture({
    postId,
    postCategory, 
    postTitle,
    config: { enabled: true, triggerDelay: undefined } // Não trigger automático
  });

  // Estado para modal de interesse
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Verificar se usuário é admin
  const { isAdmin } = useAuth();

  // Determinar se deve mostrar alguma coisa
  if (!flipbookConfig?.enabled && !showGenerateButton) {
    return null;
  }

  const theme = getFlipbookTheme(flipbookConfig?.themeId || 'organizacao');
  const hasExistingGuide = generatedFlipbook || (flipbookConfig && !showGenerateButton);

  // Handler para registrar interesse
  const handleRegisterInterest = async (email?: string) => {
    if (!postId || !postTitle) return;
    
    setIsRegistering(true);
    try {
      await fetch('/api/newsletter/register-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || (isAuthenticated ? 'authenticated_user' : ''),
          postId,
          postTitle,
          postCategory,
          interestedInGuide: true,
          source: 'post_guide_interest'
        })
      });
      
      // Mostrar confirmação
      setShowInterestModal(false);
      // Toast ou feedback de sucesso seria aqui
    } catch (error) {
      console.error('Erro ao registrar interesse:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  // Handler para admin gerar guia e notificar interessados
  const handleAdminCreateGuide = async () => {
    if (!postId || !postTitle) return;
    
    setIsRegistering(true);
    try {
      // 1. Gerar o guia
      const generateResponse = await fetch('/api/flipbooks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          force: false
        })
      });
      
      if (!generateResponse.ok) {
        throw new Error('Erro ao gerar guia');
      }
      
      const guideData = await generateResponse.json();
      
      // 2. Notificar usuários interessados
      await fetch('/api/admin/notify-interested-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          postTitle,
          postCategory,
          flipbookId: guideData.flipbookId
        })
      });
      
      // 3. Recarregar página ou atualizar estado
      window.location.reload(); // Simples - força reload da página para mostrar guia disponível
      
    } catch (error) {
      console.error('Erro ao criar guia:', error);
      alert('Erro ao criar guia. Tente novamente.');
    } finally {
      setIsRegistering(false);
    }
  };

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
            
            {/* TÍTULO E DESCRIÇÃO BASEADOS NA EXISTÊNCIA DO GUIA */}
            <h3 className="font-poppins font-bold text-xl text-gray-800 mb-2">
              {hasExistingGuide 
                ? (generatedFlipbook?.title || flipbookConfig?.title || 'Guia Prático Disponível')
                : 'Guia Prático em Preparação'
              }
            </h3>
            
            <p className="text-gray-600 mb-4 max-w-md">
              {hasExistingGuide 
                ? "Quer se aprofundar na prática da aplicação das informações deste post? Baixe o guia e vamos implementar a mudança na sua família."
                : `Que tal um guia prático sobre "${postTitle}"? Registre seu interesse e avisaremos quando estiver pronto!`
              }
            </p>
            
            {/* ESTADOS DE CARREGAMENTO */}
            {isGenerating && (
              <p className="text-sm text-blue-600 mb-4 flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando seu guia personalizado...
              </p>
            )}
            
            {isRegistering && (
              <p className="text-sm text-green-600 mb-4 flex items-center justify-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Registrando seu interesse...
              </p>
            )}
            
            {/* SOCIAL PROOF PARA GUIAS EXISTENTES */}
            {!isGenerating && !isRegistering && hasExistingGuide && flipbookConfig?.socialProof && (
              <p className="text-sm text-gray-500 mb-4">
                📥 Já baixado por <strong>{flipbookConfig.socialProof.downloads}+ mães</strong>
              </p>
            )}
            
            {/* BOTÃO PRINCIPAL */}
            <Button
              onClick={() => {
                if (hasExistingGuide) {
                  // Guia existe - abrir para download
                  if (showGenerateButton && !isGenerating) {
                    generateFlipbook();
                  } else {
                    openModal();
                  }
                } else {
                  // Guia não existe - registrar interesse
                  if (isAuthenticated) {
                    handleRegisterInterest();
                  } else {
                    setShowInterestModal(true);
                  }
                }
              }}
              size="lg"
              disabled={isGenerating || isRegistering}
              className={`text-white font-semibold px-8 py-3 transition-all duration-300 ${
                (isGenerating || isRegistering) ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'
              }`}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
              }}
              data-testid="button-inline-flipbook"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : isRegistering ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : hasExistingGuide ? (
                isAuthenticated ? (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Baixar Guia Prático
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5 mr-2" />
                    Baixar Guia Gratuito
                  </>
                )
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  {isAuthenticated ? 'Quero Este Guia!' : 'Registrar Interesse'}
                </>
              )}
            </Button>
            
            {/* BOTÃO ESPECIAL DE ADMIN */}
            {isAdmin && !hasExistingGuide && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-blue-600 mb-2 flex items-center justify-center">
                  <Settings className="w-3 h-3 mr-1" />
                  Painel Administrador
                </p>
                <Button
                  onClick={handleAdminCreateGuide}
                  size="sm"
                  variant="outline"
                  disabled={isGenerating || isRegistering}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                  data-testid="button-admin-create-guide"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Admin: Criar Guia & Notificar
                </Button>
                <p className="text-xs text-blue-500 mt-1">
                  ⚡ Cria o guia e notifica todos os interessados automaticamente
                </p>
              </div>
            )}

            {/* TEXTO DE APOIO */}
            <p className="text-xs text-gray-500 mt-3">
              {hasExistingGuide 
                ? '✨ Acesso imediato após cadastro'
                : '🔔 Você será avisada quando estiver pronto'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE CAPTURA PARA GUIAS EXISTENTES */}
      {hasExistingGuide && (
        <FlipbookCaptureModal
          isOpen={isModalOpen}
          onClose={closeModal}
          flipbookTheme={flipbookConfig?.themeId || 'organizacao'}
          postTitle={postTitle}
          postId={postId}
          flipbookTitle={flipbookConfig?.title}
          flipbookDescription={flipbookConfig?.description}
          socialProof={flipbookConfig?.socialProof}
          previewPages={flipbookConfig?.previewPages}
        />
      )}

      {/* MODAL DE INTERESSE PARA GUIAS INEXISTENTES */}
      {showInterestModal && (
        <InterestCaptureModal
          isOpen={showInterestModal}
          onClose={() => setShowInterestModal(false)}
          postTitle={postTitle}
          postCategory={postCategory}
          theme={theme}
          onRegisterInterest={handleRegisterInterest}
        />
      )}
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

// Modal para capturar interesse em guias não existentes
interface InterestCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  postTitle?: string;
  postCategory?: string;
  theme: FlipbookTheme;
  onRegisterInterest: (email?: string) => Promise<void>;
}

function InterestCaptureModal({
  isOpen,
  onClose,
  postTitle,
  postCategory,
  theme,
  onRegisterInterest
}: InterestCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await onRegisterInterest(email);
      setEmail('');
    } catch (error) {
      console.error('Erro ao registrar interesse:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md"
        >
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="absolute top-2 right-2 h-8 w-8 p-0"
                data-testid="button-close-interest-modal"
              >
                <X className="w-4 h-4" />
              </Button>
              
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                }}
              >
                <Bell className="w-8 h-8 text-white" />
              </div>
              
              <CardTitle className="font-fredoka text-2xl text-gray-800 mb-2">
                Queremos preparar este guia!
              </CardTitle>
              
              <p className="text-gray-600 text-sm max-w-sm mx-auto">
                Deixe seu email e avisaremos quando o guia prático sobre 
                <strong> "{postTitle}"</strong> estiver pronto para você!
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Seu melhor email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-center"
                    data-testid="input-interest-email"
                  />
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !email.trim()}
                  className={`w-full text-white font-semibold py-3 transition-all duration-300 ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.02]'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                  }}
                  data-testid="button-register-interest"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-2" />
                      Quero ser avisada!
                    </>
                  )}
                </Button>
              </form>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  🔒 Seus dados estão seguros conosco
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ✨ Você será a primeira a saber quando estiver pronto
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}