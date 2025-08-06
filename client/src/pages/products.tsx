import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ShoppingBag, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GradientButton } from "@/components/ui/gradient-button";
import { ProductCard } from "@/components/content/product-card";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { queryClient } from "@/lib/queryClient";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Invalidate cache on component mount to ensure fresh data
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/products"] });
  }, []);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 0, // Always refetch
  });

  const categories = [
    { id: "all", label: "Todos" },
    { id: "casa", label: "Casa & Organização" },
    { id: "autocuidado", label: "Autocuidado" },
    { id: "familia", label: "Família" },
    { id: "saude", label: "Saúde & Bem-estar" },
    { id: "tecnologia", label: "Tecnologia" },
  ];

  const filteredProducts = products?.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  }) || [];

  return (
    <div className="pt-20">
      <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-fredoka text-5xl gradient-text mb-4">
              Facilita a Vida
            </h1>
            <p className="font-poppins text-xl text-gray-600">
              Produtos testados e aprovados que realmente fazem diferença no seu dia a dia
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div 
            className="mb-8 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Que produto você precisa?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 rounded-full bg-white/70 backdrop-blur-sm border border-white/30"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <GradientButton
                  key={category.id}
                  variant={selectedCategory === category.id ? "primary" : "glass"}
                  onClick={() => setSelectedCategory(category.id)}
                  size="sm"
                >
                  {category.label}
                </GradientButton>
              ))}
            </div>
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-3xl h-80"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {filteredProducts.map((product, index) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-poppins text-2xl text-gray-600 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros ou termo de busca
              </p>
            </motion.div>
          )}

          {/* Load More Button */}
          {filteredProducts.length > 8 && (
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              <GradientButton variant="glass" size="lg">
                Carregar Mais Produtos
                <ChevronDown className="ml-2 w-5 h-5" />
              </GradientButton>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
