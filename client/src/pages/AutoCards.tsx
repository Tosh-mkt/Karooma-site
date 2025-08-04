import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/content/product-card";
import { RefreshCw, Zap, Database } from "lucide-react";
import { useEffect, useState } from "react";
import { GradientButton } from "@/components/ui/gradient-button";
import { Badge } from "@/components/ui/badge";

export default function AutoCards() {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [newProductsCount, setNewProductsCount] = useState(0);
  const queryClient = useQueryClient();

  // Buscar todos os produtos
  const { data: products, isLoading, refetch } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });

  // Buscar status da automação
  const { data: automationStatus } = useQuery<{
    totalProducts: number;
    featuredProducts: number;
    lastSync: string;
    status: string;
  }>({
    queryKey: ["/api/automation/products/status"],
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });

  // Detectar novos produtos
  useEffect(() => {
    if (products) {
      const recentProducts = products.filter(product => {
        if (!product.createdAt) return false;
        const productDate = new Date(product.createdAt);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return productDate > fiveMinutesAgo;
      });
      setNewProductsCount(recentProducts.length);
    }
  }, [products]);

  const handleManualRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["/api/automation/products/status"] });
    setLastUpdate(new Date());
  };

  // Separar produtos por recentes e antigos
  const recentProducts = products?.filter(product => {
    if (!product.createdAt) return false;
    const productDate = new Date(product.createdAt);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return productDate > oneHourAgo;
  }) || [];

  const olderProducts = products?.filter(product => {
    if (!product.createdAt) return true;
    const productDate = new Date(product.createdAt);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return productDate <= oneHourAgo;
  }) || [];

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
            <span className="ml-3 text-lg">Carregando produtos automáticos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-yellow-500 mr-3" />
            <h1 className="font-outfit font-bold text-4xl md:text-6xl gradient-text">
              Cards Automáticos
            </h1>
          </div>
          
          <p className="font-poppins text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Produtos criados automaticamente via N8N com dados reais da Amazon
          </p>

          {/* Status da Automação */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <Badge className="bg-green-500 text-white px-4 py-2">
              <Database className="w-4 h-4 mr-2" />
              {products?.length || 0} Produtos Total
            </Badge>
            
            {newProductsCount > 0 && (
              <Badge className="bg-blue-500 text-white px-4 py-2 animate-pulse">
                <Zap className="w-4 h-4 mr-2" />
                {newProductsCount} Novos (5min)
              </Badge>
            )}

            {automationStatus && (
              <Badge className="bg-purple-500 text-white px-4 py-2">
                Status: {(automationStatus as any).status || 'Ativo'}
              </Badge>
            )}
          </div>

          <GradientButton onClick={handleManualRefresh} size="lg">
            <RefreshCw className="w-5 h-5 mr-2" />
            Atualizar Agora
          </GradientButton>
          
          <p className="text-sm text-gray-500 mt-2">
            Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
          </p>
        </motion.div>

        {/* Produtos Recentes (última hora) */}
        {recentProducts.length > 0 && (
          <motion.section 
            className="mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center mb-8">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
              <h2 className="font-outfit font-bold text-2xl text-gray-800">
                Produtos Recentes (Última Hora)
              </h2>
              <Badge className="ml-3 bg-green-100 text-green-700">
                {recentProducts.length} novos
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recentProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-yellow-400 text-yellow-900 animate-bounce">
                      NOVO
                    </Badge>
                  </div>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Todos os Produtos */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center mb-8">
            <h2 className="font-outfit font-bold text-2xl text-gray-800">
              Todos os Produtos
            </h2>
            <Badge className="ml-3 bg-gray-100 text-gray-700">
              {products?.length || 0} total
            </Badge>
          </div>
          
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-poppins text-xl text-gray-600 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500">
                Os produtos do N8N aparecerão aqui automaticamente
              </p>
            </div>
          )}
        </motion.section>

        {/* Informações sobre Automação */}
        <motion.div 
          className="mt-16 bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center">
            <Zap className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="font-outfit font-bold text-xl mb-4">
              Automação N8N Ativa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <strong>Fonte:</strong> Amazon via N8N
              </div>
              <div>
                <strong>Atualização:</strong> Automática a cada 5s
              </div>
              <div>
                <strong>Processamento:</strong> Tempo real
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}