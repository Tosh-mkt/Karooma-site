import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, FileText, Heart, CheckSquare, ShoppingBag, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MenuAction {
  id: string;
  label: string;
  icon: any;
  color: string;
  hoverColor: string;
  action: () => void | Promise<void>;
}

interface FloatingActionMenuProps {
  onScrollToSection?: (sectionId: string) => void;
}

export function FloatingActionMenu({ onScrollToSection }: FloatingActionMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const { toast } = useToast();

  // Garantir que o portal só seja criado quando o elemento existir
  useEffect(() => {
    let targetElement = document.getElementById('floating-menu-root');
    
    // Se não existir, criar
    if (!targetElement) {
      targetElement = document.createElement('div');
      targetElement.id = 'floating-menu-root';
      document.body.appendChild(targetElement);
    }
    
    setPortalRoot(targetElement);
    
    return () => {
      // Cleanup: remover elemento criado dinamicamente ao desmontar
      if (targetElement && targetElement.parentNode === document.body && !document.getElementById('floating-menu-root')) {
        document.body.removeChild(targetElement);
      }
    };
  }, []);

  const menuActions: MenuAction[] = [
    {
      id: "hero",
      label: "Resumo da missão",
      icon: FileText,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700",
      action: () => {
        onScrollToSection?.("hero");
        setIsExpanded(false);
      }
    },
    {
      id: "why-matters",
      label: "Porque é importante",
      icon: Heart,
      color: "bg-gradient-to-br from-pink-400 to-rose-500",
      hoverColor: "hover:from-pink-500 hover:to-rose-600",
      action: () => {
        onScrollToSection?.("why-matters");
        setIsExpanded(false);
      }
    },
    {
      id: "tasks",
      label: "Tarefas",
      icon: CheckSquare,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700",
      action: () => {
        onScrollToSection?.("tasks");
        setIsExpanded(false);
      }
    },
    {
      id: "products",
      label: "Produtos que ajudam",
      icon: ShoppingBag,
      color: "bg-gradient-to-br from-orange-400 to-orange-500",
      hoverColor: "hover:from-orange-500 hover:to-orange-600",
      action: () => {
        onScrollToSection?.("products");
        setIsExpanded(false);
      }
    },
    {
      id: "share",
      label: "Compartilhe",
      icon: Share2,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700",
      action: async () => {
        try {
          // Try native share API first
          if (navigator.share) {
            await navigator.share({
              title: document.title,
              url: window.location.href
            });
            toast({
              title: "Compartilhado!",
              description: "Obrigada por compartilhar esta missão 💚"
            });
          } else if (navigator.clipboard?.writeText) {
            // Fallback: copy to clipboard
            await navigator.clipboard.writeText(window.location.href);
            toast({
              title: "Link copiado!",
              description: "Cole o link onde quiser compartilhar"
            });
          } else {
            // Last resort: show URL in a prompt
            toast({
              title: "Compartilhe este link:",
              description: window.location.href,
              duration: 10000
            });
          }
        } catch (err) {
          // User cancelled share or clipboard denied
          if (err instanceof Error && err.name !== 'AbortError') {
            toast({
              title: "Não foi possível compartilhar",
              description: "Copie o link da barra de endereço",
              variant: "destructive"
            });
          }
        } finally {
          setIsExpanded(false);
        }
      }
    }
  ];

  // Renderizar conteúdo do menu
  const menuContent = (
    <div 
      className="fixed bottom-6 right-4 md:bottom-10 md:right-8" 
      style={{ zIndex: 99999, pointerEvents: 'auto' }}
    >
      <div className="flex flex-col items-end gap-3">
        {/* Expanded Menu Items */}
        <AnimatePresence>
          {isExpanded && (
            <>
              {menuActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0, 
                    scale: 1,
                    transition: { 
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 400,
                      damping: 25
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    x: 20, 
                    scale: 0.8,
                    transition: { delay: (menuActions.length - index - 1) * 0.03 }
                  }}
                  className="flex items-center gap-3"
                >
                  {/* Label */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {action.label}
                    </span>
                  </motion.div>

                  {/* Icon Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.action}
                    className={`
                      h-12 w-12 rounded-full shadow-xl transition-all duration-300
                      ${action.color} ${action.hoverColor}
                      flex items-center justify-center
                    `}
                    data-testid={`button-action-${action.id}`}
                  >
                    <action.icon className="w-5 h-5 text-white" />
                  </motion.button>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="lg"
          style={{ 
            display: 'flex',
            opacity: 1,
            transform: 'scale(1)',
            visibility: 'visible'
          }}
          className={`
            h-14 w-14 md:h-16 md:w-16 rounded-full shadow-2xl transition-all duration-300
            ${isExpanded 
              ? 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rotate-45' 
              : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            }
          `}
          data-testid="button-floating-menu-toggle"
        >
          {isExpanded ? (
            <X className="w-6 h-6 md:w-7 md:h-7 text-white" />
          ) : (
            <Plus className="w-6 h-6 md:w-7 md:h-7 text-white" />
          )}
        </Button>
      </div>
    </div>
  );

  // Só renderizar quando o portal estiver pronto
  if (!portalRoot) {
    return null;
  }

  // Usar Portal para renderizar no elemento dedicado
  return createPortal(menuContent, portalRoot);
}
