import { motion } from "framer-motion";
import { VideoCard } from "@/components/content/video-card";
import { BlogCard } from "@/components/content/blog-card";
import { ProductCard } from "@/components/content/product-card";
import { Newsletter } from "@/components/content/newsletter";
import { NewsletterModal } from "@/components/newsletter/NewsletterModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Content, Product } from "@shared/schema";
import { staggerContainer, staggerItem } from "@/lib/animations";
import equilibristaImage from "@assets/generated_images/woman_balancing_life_plates_c97c57fa.png";

export default function Home() {
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);
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

  // Buscar conteúdo editável da página inicial
  const { data: heroContent } = useQuery<Content>({
    queryKey: ["/api/content/page/homepage-hero"],
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
              className="font-outfit font-bold text-5xl md:text-7xl gradient-text mt-[54px] mb-[54px]"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {heroContent?.title || "Você Não Está Sozinha"}
            </motion.h2>
            
            <p className="font-poppins text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-6">
              Sabemos como é correr atrás dos filhos, lidar com casa, dar conta do trabalho... e ainda tentar sobrar um tempinho pra você.
            </p>
            
            {/* Botão de teste para modal de newsletter */}
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowNewsletterModal(true)}
            >
              📧 Teste Newsletter Avançada
            </Button>
            
            <NewsletterModal 
              isOpen={showNewsletterModal}
              onClose={() => setShowNewsletterModal(false)}
              source="homepage-hero"
              leadMagnet="newsletter-test-button"
            />
            
            <p className="font-poppins text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              {heroContent?.content || "Aqui você encontra produtos e soluções que realmente facilitam a vida e dicas de quem entende essa correria toda ❤️"}
            </p>
            
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
              className="py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
                {/* Image Section */}
                <motion.div 
                  className="lg:w-2/5 flex justify-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <img 
                    src={equilibristaImage}
                    alt="Mulher equilibrando pratos representando as responsabilidades da vida"
                    className="w-full max-w-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                  />
                </motion.div>
                
                {/* Text Section */}
                <motion.div 
                  className="lg:w-3/5 text-center lg:text-left space-y-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-fredoka text-3xl md:text-4xl lg:text-5xl gradient-text leading-tight mb-6">
                    Organizando Coisas Boas pra Você
                  </h3>
                  
                  <div className="space-y-5">
                    <p className="font-poppins text-gray-900 text-xl md:text-2xl leading-relaxed font-semibold">
                      A vida está um malabarismo constante?
                    </p>
                    
                    <p className="text-gray-800 text-lg md:text-xl leading-relaxed font-medium">
                      Estamos preparando dicas que realmente funcionam na correria do dia a dia. Continue por aqui e assine a newsletter para receber avisos de novidades!
                    </p>
                    
                    <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full border-2 border-pink-300 mt-6 shadow-sm">
                      <div className="w-2.5 h-2.5 bg-pink-600 rounded-full animate-pulse"></div>
                      <span className="text-pink-800 font-bold text-sm">Novidades chegando em breve!</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
      {/* Empathy Section */}
      <section className="py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-fredoka text-4xl md:text-5xl gradient-text mb-8">
              Se Você Chegou Até Aqui...
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-4xl mb-4">😓</div>
              <h3 className="font-poppins text-lg font-semibold text-gray-700 mb-3">
                Provavelmente você está cansada
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">Aquela sensação de que o dia acabou e você não fez nem metade do que queria. Conhecemos  bem isso.</p>
            </motion.div>

            <motion.div 
              className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl mb-4">🤹‍♀️</div>
              <h3 className="font-poppins text-lg font-semibold text-gray-700 mb-3">
                Fazendo malabarismo com tudo
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Criança chorando, trabalho chamando, casa bagunçada... e você tentando dar conta de tudo ao mesmo tempo.
              </p>
            </motion.div>

            <motion.div 
              className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-4xl mb-4">💝</div>
              <h3 className="font-poppins text-lg font-semibold text-gray-700 mb-3">Está precisando de um abraço</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Daqueles que dizem "você está fazendo um trabalho incrível dentro do possível, mesmo quando parece que não está".</p>
            </motion.div>
          </div>

          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="font-poppins text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              <strong>Você chegou no lugar certo.</strong> Aqui não tem julgamento, só soluções práticas e a certeza de que você não precisa ser perfeita para ser uma mãe incrível.
            </p>
          </motion.div>
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
                "Mãe, Respira..."
              </h2>
              <p className="font-poppins text-xl text-gray-600">
                Aqueles momentos onde você precisa ouvir: "Está tudo bem, você está fazendo o seu melhor"
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
              <h2 className="font-fredoka text-5xl gradient-text mb-4">Descobertas que Mudam Vidas</h2>
              <p className="font-poppins text-xl text-gray-600">
                Produtos que realmente funcionam (testados na correria de casa com 3 filhos!)
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
