import { motion } from "framer-motion";
import { ArrowRight, Play, Rocket } from "lucide-react";
import { GradientButton } from "@/components/ui/gradient-button";
import { VideoCard } from "@/components/content/video-card";
import { BlogCard } from "@/components/content/blog-card";
import { ProductCard } from "@/components/content/product-card";
import { Newsletter } from "@/components/content/newsletter";
import { useQuery } from "@tanstack/react-query";
import { Content, Product } from "@shared/schema";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function Home() {
  const { data: featuredContent } = useQuery<Content[]>({
    queryKey: ["/api/content/featured"],
  });

  const { data: featuredProducts } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const { data: latestVideos } = useQuery<Content[]>({
    queryKey: ["/api/content/videos", "latest"],
  });

  const { data: latestArticles } = useQuery<Content[]>({
    queryKey: ["/api/content/blog", "latest"],
  });

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="font-fredoka text-6xl md:text-8xl gradient-text mb-6"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              Você Merece Mais
            </motion.h2>
            
            <p className="font-poppins text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Dicas práticas, produtos que realmente funcionam e momentos para você se reconectar com quem você é
            </p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <GradientButton size="lg">
                Descubra o que Funciona
                <ArrowRight className="ml-2 w-5 h-5" />
              </GradientButton>
              
              <GradientButton variant="glass" size="lg">
                Dicas Práticas
                <Play className="ml-2 w-5 h-5" />
              </GradientButton>
            </motion.div>
          </motion.div>

          {/* Featured Content Grid */}
          {featuredContent && featuredContent.length > 0 && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {featuredContent.slice(0, 3).map((item, index) => (
                <motion.div key={item.id} variants={staggerItem}>
                  {item.type === "video" ? (
                    <VideoCard video={item} index={index} />
                  ) : (
                    <BlogCard article={item} index={index} />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Fallback Content */}
          {(!featuredContent || featuredContent.length === 0) && (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Rocket className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-bounce-slow" />
              <h3 className="font-poppins text-2xl text-gray-600 mb-2">
                Preparando Algo Especial
              </h3>
              <p className="text-gray-500">
                Estamos organizando dicas práticas que vão fazer diferença no seu dia a dia!
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Latest Videos Preview */}
      {latestVideos && latestVideos.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-purple-100 via-pink-50 to-blue-100">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-fredoka text-5xl gradient-text mb-4">
                Dicas que Funcionam
              </h2>
              <p className="font-poppins text-xl text-gray-600">
                Soluções práticas para o seu dia a dia
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {latestVideos.slice(0, 3).map((video, index) => (
                <motion.div key={video.id} variants={staggerItem}>
                  <VideoCard video={video} index={index} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Featured Products Preview */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h2 className="font-fredoka text-5xl gradient-text mb-4">
                Produtos que Facilitam
              </h2>
              <p className="font-poppins text-xl text-gray-600">
                Testados e aprovados para otimizar seu tempo
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {featuredProducts.slice(0, 4).map((product, index) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <Newsletter />
    </div>
  );
}
