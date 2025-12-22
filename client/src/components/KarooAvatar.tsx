import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Home, Target, Coffee, MessageCircle } from "lucide-react";
import karooImage from "@assets/karoo_1766395905884.png";

interface KarooAvatarProps {
  onOpenChat: (initialMessage?: string) => void;
  isChatOpen: boolean;
  hasActiveConversation?: boolean;
}

type AvatarState = "hidden" | "minimized" | "waving" | "options" | "diagnostic-info";

const SNOOZE_DURATION_HOURS = 24;

export function KarooAvatar({ onOpenChat, isChatOpen, hasActiveConversation = false }: KarooAvatarProps) {
  const [state, setState] = useState<AvatarState>("minimized");
  const [showWelcome, setShowWelcome] = useState(false);
  const [showWaveHint, setShowWaveHint] = useState(false);

  // Check if we should show the welcome animation (only on first visit)
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("karoo-has-seen-welcome");
    if (!hasSeenWelcome && !isChatOpen) {
      const timer = setTimeout(() => {
        setState("waving");
        setShowWelcome(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Periodic wave hint on minimized state
  useEffect(() => {
    if (state === "minimized" && !isChatOpen) {
      const interval = setInterval(() => {
        setShowWaveHint(true);
        setTimeout(() => setShowWaveHint(false), 3000);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [state, isChatOpen]);

  // Handle chat open/close
  useEffect(() => {
    if (isChatOpen) {
      setState("hidden");
      // Mark that user has seen welcome
      localStorage.setItem("karoo-has-seen-welcome", "true");
    } else {
      // Always show minimized button when chat closes
      setState("minimized");
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (state === "waving") {
      const timer = setTimeout(() => {
        setState("options");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleDismiss = () => {
    setState("minimized");
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

  if (state === "hidden") {
    return null;
  }

  if (state === "minimized") {
    return (
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2">
        <AnimatePresence>
          {showWaveHint && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg px-3 py-2 border border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                👋 Oi! Precisa de ajuda?
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: showWaveHint ? [1, 1.1, 1] : 1,
          }}
          transition={{ 
            scale: { duration: 0.5, repeat: showWaveHint ? 2 : 0 }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => hasActiveConversation ? onOpenChat("") : setState("options")}
          className="w-14 h-14 rounded-full shadow-lg overflow-hidden border-2 border-white dark:border-gray-800"
          data-testid="karoo-minimized-button"
        >
          <img 
            src={karooImage} 
            alt="Karoo - Abrir chat" 
            className="w-full h-full object-cover"
          />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-3">
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
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gradient-to-br from-purple-100 to-orange-100 dark:from-purple-900 dark:to-orange-900">
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
