import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, FileText, Heart, CheckSquare, ShoppingBag, Share2, X, Home, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function FloatingActionButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const actions = [
    {
      icon: Home,
      label: "Início",
      color: "#9CA986",
      onClick: () => {
        const heroSection = document.querySelector('[data-section="hero"]');
        if (heroSection) {
          heroSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
        setIsExpanded(false);
        toast({
          title: "Início",
          description: "Voltar ao topo"
        });
      },
    },
    {
      icon: Quote,
      label: "Frase Inspiradora",
      color: "#D4A89A",
      onClick: () => {
        const fraseMarcaSection = document.querySelector('[data-section="frase-marca"]');
        if (fraseMarcaSection) {
          fraseMarcaSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        setIsExpanded(false);
        toast({
          title: "Frase Inspiradora",
          description: "Mensagem motivacional"
        });
      },
    },
    {
      icon: FileText,
      label: "Resumo da missão",
      color: "#9CA986",
      onClick: () => {
        const summarySection = document.querySelector('[data-section="summary"]');
        if (summarySection) {
          summarySection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        setIsExpanded(false);
        toast({
          title: "Resumo da missão",
          description: "Veja os objetivos principais"
        });
      },
    },
    {
      icon: Heart,
      label: "Por que é importante",
      color: "#D4A89A",
      onClick: () => {
        const purposeSection = document.querySelector('[data-section="purpose"]');
        if (purposeSection) {
          purposeSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        setIsExpanded(false);
        toast({
          title: "Propósito",
          description: "Entenda o propósito dessa missão"
        });
      },
    },
    {
      icon: CheckSquare,
      label: "Tarefas",
      color: "#9CA986",
      onClick: () => {
        const checklistSection = document.querySelector('[data-section="checklist"]');
        if (checklistSection) {
          checklistSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        setIsExpanded(false);
        toast({
          title: "Tarefas",
          description: "Confira suas tarefas"
        });
      },
    },
    {
      icon: ShoppingBag,
      label: "Produtos que ajudam",
      color: "#D4A89A",
      onClick: () => {
        const productsSection = document.querySelector('[data-section="products"]');
        if (productsSection) {
          productsSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        setIsExpanded(false);
        toast({
          title: "Produtos",
          description: "Veja produtos recomendados"
        });
      },
    },
    {
      icon: Heart,
      label: "Depoimentos",
      color: "#9CA986",
      onClick: () => {
        const socialProofSection = document.querySelector('[data-section="social-proof"]');
        if (socialProofSection) {
          socialProofSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        setIsExpanded(false);
        toast({
          title: "Depoimentos",
          description: "Veja quem já completou esta missão"
        });
      },
    },
    {
      icon: Share2,
      label: "Salvar e Compartilhar",
      color: "#D4A89A",
      onClick: () => {
        const socialActionsSection = document.querySelector('[data-section="social-actions"]');
        if (socialActionsSection) {
          socialActionsSection.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
        setIsExpanded(false);
        toast({
          title: "Compartilhar",
          description: "Salve ou compartilhe esta missão"
        });
      },
    },
  ];

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isExpanded && (
            <div className="absolute bottom-20 right-0 flex flex-col gap-3 mb-2 items-end">
              {actions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-full px-4 py-2 shadow-lg border border-[#E8DCC4]"
                  >
                    <span className="text-sm text-[#5A5A5A] whitespace-nowrap">
                      {action.label}
                    </span>
                  </motion.div>
                  <Button
                    onClick={action.onClick}
                    size="icon"
                    className="h-12 w-12 rounded-full shadow-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: action.color }}
                    data-testid={`fab-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <action.icon className="w-5 h-5 text-white" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="icon"
            className="h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-[#9CA986] to-[#7A9D6F] hover:from-[#8A9976] hover:to-[#6A8D5F] text-white relative z-10"
            data-testid="fab-main-button"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isExpanded ? (
                <X className="w-7 h-7" />
              ) : (
                <Plus className="w-7 h-7" />
              )}
            </motion.div>
          </Button>

          {!isExpanded && (
            <motion.div
              className="absolute inset-0 rounded-full bg-[#9CA986] -z-10"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.3, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          )}
        </motion.div>
      </div>
    </>
  );
}
