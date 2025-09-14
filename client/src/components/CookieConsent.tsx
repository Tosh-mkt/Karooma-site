import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Link } from "wouter";
import { Cookie, Heart, Settings2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Gera ou recupera sessionId único
function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem("karooma-session-id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("karooma-session-id", sessionId);
  }
  return sessionId;
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [sessionId] = useState(getOrCreateSessionId);

  // Mutation para salvar consent na API
  const saveConsentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/cookie-consent", "POST", data)
  });

  useEffect(() => {
    // Verifica se o usuário já fez uma escolha sobre cookies
    const consent = localStorage.getItem("karooma-cookie-consent");
    if (!consent) {
      // Aguarda um pouco antes de mostrar para não incomodar
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000); // 3 segundos após carregar
      
      return () => clearTimeout(timer);
    }

    // Listener para reabrir banner via footer link
    const handleReopenBanner = () => {
      setShowBanner(true);
      setShowPreferences(false);
    };

    window.addEventListener("reopen-cookie-banner", handleReopenBanner);
    
    return () => {
      window.removeEventListener("reopen-cookie-banner", handleReopenBanner);
    };
  }, []);

  const handleAcceptAll = async () => {
    const consent = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now()
    };
    
    // Salva no localStorage
    localStorage.setItem("karooma-cookie-consent", JSON.stringify(consent));
    
    // Salva na API
    try {
      await saveConsentMutation.mutateAsync({
        sessionId,
        necessary: true,
        analytics: true,
        marketing: true
      });
    } catch (error) {
      console.error("Erro ao salvar consent:", error);
    }
    
    setShowBanner(false);
  };

  const handleAcceptNecessary = async () => {
    const consent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now()
    };
    
    // Salva no localStorage
    localStorage.setItem("karooma-cookie-consent", JSON.stringify(consent));
    
    // Salva na API
    try {
      await saveConsentMutation.mutateAsync({
        sessionId,
        necessary: true,
        analytics: false,
        marketing: false
      });
    } catch (error) {
      console.error("Erro ao salvar consent:", error);
    }
    
    setShowBanner(false);
  };

  const handleSavePreferences = async (preferences: { analytics: boolean; marketing: boolean }) => {
    const consent = {
      necessary: true,
      ...preferences,
      timestamp: Date.now()
    };
    
    // Salva no localStorage
    localStorage.setItem("karooma-cookie-consent", JSON.stringify(consent));
    
    // Salva na API
    try {
      await saveConsentMutation.mutateAsync({
        sessionId,
        necessary: true,
        ...preferences
      });
    } catch (error) {
      console.error("Erro ao salvar consent:", error);
    }
    
    setShowBanner(false);
    setShowPreferences(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-6xl mx-auto">
            {!showPreferences ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-lg bg-opacity-95">
                <div className="flex items-start gap-4">
                  {/* Ícone amigável */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-poppins">
                      Um minutinho, mãe! 🍪
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">
                      Para tornar sua experiência no Karooma ainda melhor, usamos alguns cookies. 
                      Eles nos ajudam a lembrar suas preferências e entender como podemos melhorar 
                      o site para você e outras mães. <strong>Não se preocupe</strong> - seus dados ficam seguros conosco!
                    </p>
                    
                    <div className="flex flex-wrap gap-3 items-center">
                      <Button
                        onClick={handleAcceptAll}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
                        data-testid="button-accept-all-cookies"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Aceitar tudo
                      </Button>
                      
                      <Button
                        onClick={handleAcceptNecessary}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 font-medium px-4 py-2 rounded-full"
                        data-testid="button-accept-necessary-cookies"
                      >
                        Apenas necessários
                      </Button>
                      
                      <Button
                        onClick={() => setShowPreferences(true)}
                        variant="ghost"
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20 font-medium px-4 py-2 rounded-full"
                        data-testid="button-cookie-preferences"
                      >
                        <Settings2 className="w-4 h-4 mr-2" />
                        Preferências
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Link para política */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Quer saber mais detalhes? Dê uma olhadinha na nossa{" "}
                    <Link href="/privacidade" className="text-purple-600 dark:text-purple-400 hover:underline">
                      Política de Privacidade
                    </Link>
                  </p>
                </div>
              </div>
            ) : (
              <CookiePreferences 
                onSave={handleSavePreferences}
                onBack={() => setShowPreferences(false)}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CookiePreferences({ 
  onSave, 
  onBack 
}: { 
  onSave: (preferences: { analytics: boolean; marketing: boolean }) => void;
  onBack: () => void;
}) {
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 backdrop-blur-lg bg-opacity-95"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-poppins">
        Suas Preferências de Cookies 🍪
      </h3>
      
      <div className="space-y-6">
        {/* Cookies Necessários */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Cookies Necessários
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Estes são essenciais para o funcionamento básico do site (como lembrar seus itens favoritos).
            </p>
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full font-medium">
              Sempre ativado
            </span>
          </div>
        </div>

        {/* Analytics */}
        <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Cookies de Analytics
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="sr-only peer"
                  data-testid="toggle-analytics-cookies"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Nos ajudam a entender quais conteúdos são mais úteis para vocês, mães, 
              para podermos criar ainda mais dicas que fazem diferença na sua rotina.
            </p>
          </div>
        </div>

        {/* Marketing */}
        <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Cookies de Marketing
              </h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="sr-only peer"
                  data-testid="toggle-marketing-cookies"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Para mostrar produtos e ofertas que realmente podem interessar você, 
              baseado nos seus interesses (como organização ou bem-estar infantil).
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={() => onSave({ analytics, marketing })}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-2 rounded-full flex-1"
          data-testid="button-save-preferences"
        >
          Salvar Preferências
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
          className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 font-medium px-4 py-2 rounded-full"
          data-testid="button-back-cookies"
        >
          Voltar
        </Button>
      </div>
    </motion.div>
  );
}