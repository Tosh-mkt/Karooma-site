import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useEffect, useState } from "react";
import { Zap, X, ExternalLink, Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSSE } from "@/hooks/useSSE";

export function AutoNotification() {
  const [notifications, setNotifications] = useState<Product[]>([]);
  const queryClient = useQueryClient();
  
  // Hook SSE para atualizações em tempo real
  const { events, isConnected } = useSSE();

  // Processar eventos SSE
  useEffect(() => {
    events.forEach(event => {
      if (event.type === 'newProduct' && event.data.product) {
        const product = event.data.product;
        
        // Adicionar notificação
        setNotifications(prev => [...prev, product]);
        
        // Invalidar cache para atualizar listas
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        queryClient.invalidateQueries({ queryKey: ["/api/products/featured"] });
        
        // Auto-remover após 10 segundos
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== product.id));
        }, 10000);
      }
      
      if (event.type === 'batchComplete') {
        // Invalidar cache quando evento for concluído
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      }
    });
  }, [events, queryClient]);

  const removeNotification = (productId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== productId));
  };

  return (
    <div className="fixed top-24 right-4 z-50 space-y-2">
      {/* Indicador de Conexão SSE - REMOVIDO conforme solicitado */}

      <AnimatePresence>
        {notifications.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-4 max-w-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <Badge className="bg-green-500 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  NOVO N8N
                </Badge>
              </div>
              <button
                onClick={() => removeNotification(product.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-start space-x-3">
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-1">
                  {product.title}
                </h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    R$ {product.currentPrice}
                  </span>
                  <Badge className="text-xs bg-blue-100 text-blue-700">
                    {product.category}
                  </Badge>
                </div>

                <button
                  onClick={() => window.open(product.affiliateLink, '_blank')}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                >
                  Ver produto
                  <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>

            {/* Progress bar para auto-close */}
            <motion.div 
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-b-xl"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 10, ease: "linear" }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}