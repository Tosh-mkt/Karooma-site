import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Home, Target, Coffee, MessageCircle } from "lucide-react";
import karooImage from "@assets/generated_images/karoo_owl_mascot_warm_colors.png";

interface KarooAvatarProps {
  onOpenChat: (initialMessage?: string) => void;
  isChatOpen: boolean;
}

type AvatarState = "hidden" | "waving" | "options" | "diagnostic-info";

export function KarooAvatar({ onOpenChat, isChatOpen }: KarooAvatarProps) {
  const [state, setState] = useState<AvatarState>("hidden");
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("karoo-avatar-dismissed");
    if (dismissed) {
      setHasBeenDismissed(true);
      return;
    }

    const timer = setTimeout(() => {
      if (!isChatOpen) {
        setState("waving");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      setState("hidden");
    } else if (!hasBeenDismissed && state === "hidden") {
      const timer = setTimeout(() => {
        setState("waving");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isChatOpen, hasBeenDismissed]);

  useEffect(() => {
    if (state === "waving") {
      const timer = setTimeout(() => {
        setState("options");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleDismiss = () => {
    setState("hidden");
    setHasBeenDismissed(true);
    localStorage.setItem("karoo-avatar-dismissed", "true");
  };

  const handleOptionClick = (option: "explore" | "problem" | "diagnostic") => {
    if (option === "diagnostic") {
      setState("diagnostic-info");
    } else if (option === "explore") {
      onOpenChat("Quero conhecer o site e ver como a Karooma pode me ajudar");
    } else if (option === "problem") {
      onOpenChat("Tenho um problema específico e preciso de ajuda");
    }
  };

  const handleDiagnosticStart = () => {
    window.location.href = "/diagnostico";
  };

  if (hasBeenDismissed || state === "hidden") {
    return null;
  }

  return (
    <div className="fixed right-4 bottom-24 z-40 flex flex-col items-end gap-3">
      <AnimatePresence mode="wait">
        {state === "options" && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-[280px]"
            data-testid="karoo-avatar-options"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  👋 Oi! Sou a Karoo.
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  Como posso te guiar?
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                data-testid="button-dismiss-avatar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleOptionClick("explore")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors text-left"
                data-testid="button-option-explore"
              >
                <div className="w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                  <Home className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Quero conhecer o site
                </span>
              </button>

              <button
                onClick={() => handleOptionClick("problem")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors text-left"
                data-testid="button-option-problem"
              >
                <div className="w-8 h-8 rounded-full bg-orange-200 dark:bg-orange-800 flex items-center justify-center">
                  <Target className="w-4 h-4 text-orange-600 dark:text-orange-300" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Tenho um problema
                </span>
              </button>

              <button
                onClick={() => handleOptionClick("diagnostic")}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors text-left"
                data-testid="button-option-diagnostic"
              >
                <div className="w-8 h-8 rounded-full bg-teal-200 dark:bg-teal-800 flex items-center justify-center">
                  <Coffee className="w-4 h-4 text-teal-600 dark:text-teal-300" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Fazer o Primeiro Respiro
                </span>
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => onOpenChat("")}
                className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                data-testid="button-open-chat-free"
              >
                <MessageCircle className="w-3 h-3" />
                Ou me conta o que você precisa...
              </button>
            </div>

            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 rotate-45" />
          </motion.div>
        )}

        {state === "diagnostic-info" && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 max-w-[300px]"
            data-testid="karoo-diagnostic-info"
          >
            <div className="flex justify-between items-start mb-3">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                ☕ O Primeiro Respiro
              </p>
              <button
                onClick={() => setState("options")}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                data-testid="button-back-options"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-xs mb-3">
              É um diagnóstico rápido de 2 minutos que te ajuda a:
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2">
                <span className="text-sm">✨</span>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Identificar onde está sua maior sobrecarga
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm">📊</span>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Ver um gráfico visual das suas áreas de atenção
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm">📤</span>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Compartilhar com alguém de confiança
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm">🎯</span>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  Receber missões personalizadas no final
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">
              Se conhece outra mãe que também precisa de um respiro, compartilha com ela! 💜
            </p>

            <button
              onClick={handleDiagnosticStart}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-medium rounded-xl transition-all shadow-md hover:shadow-lg"
              data-testid="button-start-diagnostic"
            >
              Fazer meu Primeiro Respiro →
            </button>

            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          rotate: state === "waving" ? [0, -10, 10, -10, 10, 0] : 0
        }}
        transition={{ 
          opacity: { duration: 0.3 },
          scale: { duration: 0.3, type: "spring" },
          rotate: { duration: 1, repeat: state === "waving" ? Infinity : 0, repeatDelay: 2 }
        }}
        onClick={() => state === "waving" ? setState("options") : null}
        className="relative cursor-pointer"
        data-testid="karoo-avatar-image"
      >
        <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-gradient-to-br from-purple-100 to-orange-100 dark:from-purple-900 dark:to-orange-900">
          <img
            src={karooImage}
            alt="Karoo - Assistente Karooma"
            className="w-full h-full object-cover"
          />
        </div>
        
        {state === "waving" && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs"
          >
            👋
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
