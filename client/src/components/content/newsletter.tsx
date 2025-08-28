import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Send, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GradientButton } from "@/components/ui/gradient-button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: (email: string) => 
      apiRequest("POST", "/api/newsletter/subscribe", { email }),
    onSuccess: () => {
      toast({
        title: "Inscrição realizada!",
        description: "Você receberá nossos melhores conteúdos em breve.",
      });
      setEmail("");
    },
    onError: () => {
      toast({
        title: "Erro na inscrição",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      subscribeMutation.mutate(email);
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div 
          className="glassmorphism rounded-3xl p-8 md:p-12"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <motion.div 
              className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Mail className="text-white text-2xl" />
            </motion.div>
            
            <h2 className="font-fredoka text-4xl md:text-5xl text-white mb-4">
              Você Merece Esse Tempo
            </h2>
            
            <p className="font-poppins text-xl text-white/90 max-w-2xl mx-auto">
              Dicas práticas que funcionam, produtos testados e momentos para você se reconectar - tudo no seu email, sem spam
            </p>
          </div>
          
          <motion.form 
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Input
              type="email"
              placeholder="Digite seu email aqui"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 font-poppins"
            />
            
            <GradientButton 
              type="submit"
              disabled={subscribeMutation.isPending}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4"
            >
              {subscribeMutation.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Send className="w-4 h-4" />
                </motion.div>
              ) : (
                <>
                  Me Avise de Novidades
                  <Send className="ml-2 w-4 h-4" />
                </>
              )}
            </GradientButton>
          </motion.form>
          
          {/* Botão de newsletter avançada */}
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button 
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-full text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm border border-white/30"
              onClick={() => {
                // Disparar evento para abrir modal no componente pai
                window.dispatchEvent(new CustomEvent('openAdvancedNewsletter'));
              }}
            >
              ⚙️ Quero Conteúdo Específico
            </button>
          </motion.div>

          <motion.p 
            className="text-white/70 text-sm mt-4 font-inter flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Shield className="w-4 h-4" />
            Seus dados estão seguros. Só conteúdo que faz sentido para você.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
