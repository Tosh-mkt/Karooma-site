import { motion } from "framer-motion";
import { Link } from "wouter";
import { PageSection } from "@/types/page-builder";
import { GradientButton } from "@/components/ui/gradient-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Content, Product } from "@shared/schema";
import { BlogCard } from "@/components/content/blog-card";
import { ProductCard } from "@/components/content/product-card";
import { VideoCard } from "@/components/content/video-card";
import origamiBoatImage from "../../assets/ORIGAMI_BARCO_1756356626065.png";

interface SectionRendererProps {
  section: PageSection;
  isEditing?: boolean;
}

export function SectionRenderer({ section, isEditing = false }: SectionRendererProps) {
  switch (section.type) {
    case 'hero':
      return <HeroSection section={section} isEditing={isEditing} />;
    case 'content':
      return <ContentSection section={section} isEditing={isEditing} />;
    case 'featured-content':
      return <FeaturedContentSection section={section} isEditing={isEditing} />;
    case 'gallery':
      return <GallerySection section={section} isEditing={isEditing} />;
    default:
      return (
        <div className="p-8 bg-gray-100 border-2 border-dashed border-gray-300">
          <p className="text-gray-500 text-center">
            Tipo de seção não reconhecido: {section.type}
          </p>
        </div>
      );
  }
}

// Seção Hero
function HeroSection({ section, isEditing }: SectionRendererProps) {
  const { data } = section;
  
  // Debug: verificar se a imagem está sendo carregada
  console.log('New background image path:', origamiBoatImage);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: '#6b46c1' // fallback cor para debug
      }}
    >
      {/* Imagem de fundo usando elemento img */}
      {!data.backgroundImage && (
        <img 
          src={origamiBoatImage}
          alt="Barco de origami navegando"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}
      {data.backgroundImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${data.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}
      
      <motion.div 
        className="relative z-10 text-center px-4 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="font-fredoka text-5xl md:text-7xl text-white mb-6 drop-shadow-lg">
          {data.title || 'Karooma?'}
        </h1>
        
        <p className="font-poppins text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
          {data.subtitle || 'A Karooma nasceu da compreensão profunda de que cuidar da casa e da família é uma das experiências mais transformadoras e desafiadoras da vida. Estamos aqui para trazer conhecimento, simplificar seu dia a dia e fortalecer sua confiança neste processo.'}
        </p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {data.primaryButtonText && (
            <Link href={data.primaryButtonLink || '#'}>
              <GradientButton 
                size="lg" 
                className="text-lg px-8 py-6"
              >
                {data.primaryButtonText}
              </GradientButton>
            </Link>
          )}
          
          {data.secondaryButtonText && (
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 bg-white/20 border-white/30 text-white hover:bg-white/30"
              asChild
            >
              <Link href={data.secondaryButtonLink || '#'}>
                {data.secondaryButtonText}
              </Link>
            </Button>
          )}
        </motion.div>
      </motion.div>
      
      {isEditing && (
        <div className="absolute top-4 left-4">
          <Badge variant="secondary">Hero Section</Badge>
        </div>
      )}
    </section>
  );
}

// Seção de Conteúdo
function ContentSection({ section, isEditing }: SectionRendererProps) {
  const { data } = section;

  // Check if this is one of our special styled sections
  if (data.title === "Nossa Missão" && data.content?.includes('Empatia Genuína')) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 relative">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2 
            className="font-outfit text-4xl text-center gradient-text mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {data.title}
          </motion.h2>
          
          <motion.div 
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-12 rounded-3xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-outfit text-3xl gradient-text text-center mb-6">Empatia Genuína</h3>
            <p className="font-poppins text-lg text-gray-700 leading-relaxed text-center">Acreditamos que toda família precisa sentir-se apoiada e confiante. Nossa missão é fornecer recursos práticos, produtos cuidadosamente selecionados e conteúdo empático que realmente fazem a diferença no cotidiano familiar.</p>
            <p className="font-poppins text-lg text-gray-700 leading-relaxed text-center mt-4">Sabemos que você carrega uma carga mental imensa - desde lembrar dos compromissos médicos das crianças até planejar as refeições da semana. Por isso, criamos um espaço onde você encontra soluções, produtos avaliados e estratégias que funcionam.</p>
          </motion.div>
        </div>
        {isEditing && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary">Content Section</Badge>
          </div>
        )}
      </section>
    );
  }

  // Nossos Valores section
  if (data.title === "Nossos Valores") {
    return (
      <section className="py-16 bg-white relative">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            className="font-outfit text-4xl text-center gradient-text mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {data.title}
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div 
              className="glassmorphism p-8 text-center rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-4xl mb-4">💜</div>
              <h4 className="font-outfit text-xl gradient-text mb-4">Empatia Genuína</h4>
              <p className="font-poppins text-gray-600">
                Entendemos que gestão familiar é uma jornada cheia de desafios únicos. Cada dia traz novas situações, e vocês não estão sozinhos nisso.
              </p>
            </motion.div>
            
            <motion.div 
              className="glassmorphism p-8 text-center rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl mb-4">✨</div>
              <h4 className="font-outfit text-xl gradient-text mb-4">Soluções Práticas</h4>
              <p className="font-poppins text-gray-600">
                Oferecemos estratégias testadas por famílias reais através de produtos que realmente funcionam e conteúdo que facilita o dia a dia.
              </p>
            </motion.div>
            
            <motion.div 
              className="glassmorphism p-8 text-center rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="font-outfit text-xl gradient-text mb-4">Objetivos Claros</h4>
              <p className="font-poppins text-gray-600">
                Nosso foco é simplificar sua rotina familiar para que você tenha mais tempo para o que realmente importa: momentos especiais.
              </p>
            </motion.div>
          </div>
        </div>
        
        {isEditing && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary">Content Section</Badge>
          </div>
        )}
      </section>
    );
  }

  // Mensagem Final section
  if (data.title === "Você Não Está Sozinha") {
    return (
      <section className="py-16 bg-white relative">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2 
            className="font-outfit text-4xl text-center gradient-text mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {data.title}
          </motion.h2>
          
          <motion.div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 p-12 rounded-3xl text-white text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-outfit text-3xl mb-6">Sua família tem sorte de ter você</h3>
            <p className="font-poppins text-xl leading-relaxed mb-8">
              Esta é nossa mensagem principal: reconhecer o trabalho incrível que você faz todos os dias, mesmo nos momentos quando tudo parece caótico.
            </p>
            <p className="font-outfit text-lg">
              Com carinho,<br/>Equipe Karooma 💜
            </p>
          </motion.div>
        </div>
        
        {isEditing && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary">Content Section</Badge>
          </div>
        )}
      </section>
    );
  }

  // Tempo para Você section (Momentos Meus)
  if (data.title === "Tempo para Você") {
    return (
      <section className="py-16 bg-white relative">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2 
            className="font-outfit text-4xl text-center gradient-text mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {data.title}
          </motion.h2>
          
          <motion.div 
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-12 rounded-3xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-poppins text-lg text-gray-700 leading-relaxed text-center mb-6">
              Aqui você encontra dicas práticas, momentos de reflexão e lembranças gentis de que cuidar de você é cuidar de toda a família.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="glassmorphism p-6 text-center rounded-2xl">
                <div className="text-3xl mb-4">🌸</div>
                <h4 className="font-outfit text-lg gradient-text mb-3">5 Minutos Contam</h4>
                <p className="font-poppins text-sm text-gray-600">
                  Pequenos momentos de autocuidado que cabem na rotina mais corrida
                </p>
              </div>
              
              <div className="glassmorphism p-6 text-center rounded-2xl">
                <div className="text-3xl mb-4">💆‍♀️</div>
                <h4 className="font-outfit text-lg gradient-text mb-3">Bem-estar Real</h4>
                <p className="font-poppins text-sm text-gray-600">
                  Estratégias práticas para reduzir o estresse e encontrar equilíbrio
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {isEditing && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary">Content Section</Badge>
          </div>
        )}
      </section>
    );
  }

  // Como Te Auxiliamos section (Facilitam a Vida)
  if (data.title === "Como Te Auxiliamos") {
    return (
      <section className="py-16 bg-white relative">
        <div className="max-w-6xl mx-auto px-4">
          <motion.h2 
            className="font-outfit text-4xl text-center gradient-text mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {data.title}
          </motion.h2>
          
          <motion.div 
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-12 rounded-3xl mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-poppins text-lg text-gray-700 leading-relaxed text-center mb-8">
              Porque o seu tempo é precioso demais para ser desperdiçado com coisas que não funcionam.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glassmorphism p-6 text-center rounded-2xl">
                <div className="text-3xl mb-4">🔍</div>
                <h4 className="font-outfit text-lg gradient-text mb-3">Testados por Famílias</h4>
                <p className="font-poppins text-sm text-gray-600">
                  Cada produto é testado na vida real, por famílias reais
                </p>
              </div>
              
              <div className="glassmorphism p-6 text-center rounded-2xl">
                <div className="text-3xl mb-4">⭐</div>
                <h4 className="font-outfit text-lg gradient-text mb-3">Qualidade Garantida</h4>
                <p className="font-poppins text-sm text-gray-600">
                  Só recomendamos o que realmente vale a pena
                </p>
              </div>
              
              <div className="glassmorphism p-6 text-center rounded-2xl">
                <div className="text-3xl mb-4">💝</div>
                <h4 className="font-outfit text-lg gradient-text mb-3">Preço Coerente</h4>
                <p className="font-poppins text-sm text-gray-600">
                  Produtos que cabem no orçamento familiar
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {isEditing && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary">Content Section</Badge>
          </div>
        )}
      </section>
    );
  }

  // 🌈 Nossa Jornada de Cuidado section (Enhanced UX)
  if (data.title === "🌈 Nossa Jornada de Cuidado") {
    return (
      <section className="py-16 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 to-pink-100/20 animate-pulse"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.h2 
            className="font-outfit text-5xl text-center gradient-text mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {data.title}
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
            <div className="space-y-6">
              <motion.div 
                className="glassmorphism p-8 rounded-3xl card-hover group cursor-pointer"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02, rotateY: 2 }}
              >
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    💝
                  </motion.div>
                  <h3 className="font-outfit text-2xl gradient-text ml-4 group-hover:scale-105 transition-transform">Nossa Essência</h3>
                </div>
                <p className="font-poppins text-gray-700 leading-relaxed">
                  Acreditamos que todos que dedicam tempo e energia cuidando da casa e família merecem sentir-se apoiados e confiantes. Nossa missão é fornecer recursos práticos, produtos cuidadosamente selecionados e conteúdo empático que realmente fazem a diferença no cotidiano doméstico.
                </p>
              </motion.div>
              
              <motion.div 
                className="glassmorphism p-8 rounded-3xl card-hover group cursor-pointer"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02, rotateY: -2 }}
              >
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    🧠
                  </motion.div>
                  <h3 className="font-outfit text-2xl gradient-text ml-4 group-hover:scale-105 transition-transform">Entendemos Você</h3>
                </div>
                <p className="font-poppins text-gray-700 leading-relaxed">
                  Sabemos que você carrega uma carga mental imensa - desde organizar a agenda familiar até planejar as refeições da semana. Por isso, criamos um espaço onde você encontra soluções testadas, estratégias práticas e produtos que realmente funcionam para simplificar sua rotina.
                </p>
              </motion.div>
            </div>
            
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div 
                className="bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 p-12 rounded-3xl text-center cursor-pointer group"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                whileHover={{ scale: 1.05, rotateZ: 1 }}
              >
                <motion.div 
                  className="text-6xl mb-6"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🤗
                </motion.div>
                <h4 className="font-outfit text-3xl gradient-text mb-4 group-hover:scale-110 transition-transform">Você não está sozinho</h4>
                <p className="font-poppins text-lg text-gray-600 mb-6">Milhares de pessoas já encontraram apoio e soluções práticas para cuidar melhor da família</p>
                <div className="flex justify-center space-x-4">
                  <motion.div 
                    className="bg-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="font-outfit font-bold text-purple-600">⭐ Produtos Testados</span>
                  </motion.div>
                  <motion.div 
                    className="bg-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="font-outfit font-bold text-pink-600">💬 Dicas Práticas</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {isEditing && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary">Enhanced Journey Section</Badge>
          </div>
        )}
      </section>
    );
  }

  // 💎 Os Pilares da Karooma section (Enhanced UX)
  if (data.title === "💎 Os Pilares da Karooma") {
    return (
      <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-20 left-10 w-32 h-32 bg-purple-200 rounded-full opacity-20"
            animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-20 right-10 w-40 h-40 bg-pink-200 rounded-full opacity-20"
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.h2 
            className="font-outfit text-5xl text-center gradient-text mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            {data.title}
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div 
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="glassmorphism p-8 text-center rounded-3xl card-hover transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                <div className="relative mb-6">
                  <motion.div 
                    className="text-5xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                    whileHover={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    💜
                  </motion.div>
                  <motion.div 
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <h4 className="font-outfit text-2xl gradient-text mb-4 transform transition-all duration-300 group-hover:text-purple-600">Empatia Genuína</h4>
                <p className="font-poppins text-gray-600 mb-4">Entendemos que cuidar da casa e família é uma jornada cheia de desafios únicos. Cada dia traz novas situações, e você não precisa enfrentar isso sozinho.</p>
                <motion.div 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ y: 20 }}
                  whileHover={{ y: 0 }}
                >
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-outfit hover:shadow-lg transition-shadow">Saiba mais ✨</button>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glassmorphism p-8 text-center rounded-3xl card-hover transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                <div className="relative mb-6">
                  <motion.div 
                    className="text-5xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    ✨
                  </motion.div>
                  <motion.div 
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                </div>
                <h4 className="font-outfit text-2xl gradient-text mb-4 transform transition-all duration-300 group-hover:text-pink-600">Soluções Práticas</h4>
                <p className="font-poppins text-gray-600 mb-4">Oferecemos estratégias testadas na vida real, produtos que realmente funcionam e conteúdo que facilita o dia a dia de quem cuida da família.</p>
                <motion.div 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ y: 20 }}
                  whileHover={{ y: 0 }}
                >
                  <button className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-outfit hover:shadow-lg transition-shadow">Explorar 🔥</button>
                </motion.div>
              </div>
            </motion.div>
            
            <motion.div 
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="glassmorphism p-8 text-center rounded-3xl card-hover transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                <div className="relative mb-6">
                  <motion.div 
                    className="text-5xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                    whileHover={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    🎯
                  </motion.div>
                  <motion.div 
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  />
                </div>
                <h4 className="font-outfit text-2xl gradient-text mb-4 transform transition-all duration-300 group-hover:text-indigo-600">Objetivos Claros</h4>
                <p className="font-poppins text-gray-600 mb-4">Nosso foco é simplificar sua rotina doméstica para que você tenha mais tempo para o que realmente importa: momentos especiais com sua família.</p>
                <motion.div 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ y: 20 }}
                  whileHover={{ y: 0 }}
                >
                  <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-outfit hover:shadow-lg transition-shadow">Começar 🚀</button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {isEditing && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary">Enhanced Pillars Section</Badge>
          </div>
        )}
      </section>
    );
  }

  // 🌟 Nossa Missão Diária section (Enhanced UX)
  if (data.title === "🌟 Nossa Missão Diária") {
    return (
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.h2 
            className="font-outfit text-5xl text-center gradient-text mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            {data.title}
          </motion.h2>
          
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-12 rounded-3xl mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <motion.div 
                className="text-center group cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="text-4xl font-outfit font-bold gradient-text mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🔍
                </motion.div>
                <p className="font-poppins text-gray-600 font-semibold mb-2 group-hover:text-purple-600 transition-colors">Produtos Testados</p>
                <p className="font-poppins text-sm text-gray-500">Avaliamos cada item na vida real</p>
              </motion.div>
              
              <motion.div 
                className="text-center group cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="text-4xl font-outfit font-bold gradient-text mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  📚
                </motion.div>
                <p className="font-poppins text-gray-600 font-semibold mb-2 group-hover:text-pink-600 transition-colors">Conteúdo Útil</p>
                <p className="font-poppins text-sm text-gray-500">Dicas práticas para o dia a dia</p>
              </motion.div>
              
              <motion.div 
                className="text-center group cursor-pointer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className="text-4xl font-outfit font-bold gradient-text mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  💝
                </motion.div>
                <p className="font-poppins text-gray-600 font-semibold mb-2 group-hover:text-indigo-600 transition-colors">Preço Justo</p>
                <p className="font-poppins text-sm text-gray-500">Produtos que cabem no orçamento</p>
              </motion.div>
            </div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="font-outfit text-2xl gradient-text mb-4">"A Karooma facilitou minha rotina!"</h4>
              <p className="font-poppins text-lg text-gray-700 italic mb-4">"Finalmente encontrei um lugar que entende as demandas de cuidar da família. Os produtos recomendados realmente funcionam e o conteúdo me ajuda no dia a dia."</p>
              <div className="flex items-center justify-center space-x-2">
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <span className="font-outfit text-sm text-gray-600">Ana, cuidadora da família</span>
              </div>
            </motion.div>
          </div>
        </div>
        
        {isEditing && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary">Enhanced Impact Section</Badge>
          </div>
        )}
      </section>
    );
  }

  // 💜 Nosso Compromisso Com Você section (Enhanced UX)
  if (data.title === "💜 Nosso Compromisso Com Você") {
    return (
      <section className="py-20 bg-gradient-to-br from-white via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-100/30 to-pink-100/30"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.h2 
            className="font-outfit text-5xl text-center gradient-text mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
          >
            {data.title}
          </motion.h2>
          
          <motion.div 
            className="relative overflow-hidden rounded-3xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-12 text-white text-center relative z-10">
              <motion.div 
                className="absolute inset-0 bg-white opacity-10 rounded-3xl"
                animate={{ opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              <div className="relative z-20">
                <motion.h3 
                  className="font-outfit text-4xl mb-6"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Sua família tem sorte de ter você! 🌟
                </motion.h3>
                
                <p className="font-poppins text-xl leading-relaxed mb-8">
                  Esta é nossa mensagem principal: reconhecer o trabalho incrível que você faz todos os dias cuidando da casa e família, mesmo nos momentos quando tudo parece caótico.
                </p>
                
                <div className="space-y-4 mb-8">
                  <motion.div 
                    className="flex items-center justify-center space-x-4"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div 
                      className="bg-white bg-opacity-20 rounded-full px-6 py-3 backdrop-blur-sm cursor-pointer"
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="font-outfit">📬 Dicas Semanais</span>
                    </motion.div>
                    <motion.div 
                      className="bg-white bg-opacity-20 rounded-full px-6 py-3 backdrop-blur-sm cursor-pointer"
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="font-outfit">🎁 Conteúdo Exclusivo</span>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center justify-center space-x-4"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.div 
                      className="bg-white bg-opacity-20 rounded-full px-6 py-3 backdrop-blur-sm cursor-pointer"
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="font-outfit">✨ Produtos Testados</span>
                    </motion.div>
                    <motion.div 
                      className="bg-white bg-opacity-20 rounded-full px-6 py-3 backdrop-blur-sm cursor-pointer"
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="font-outfit">💝 Apoio Constante</span>
                    </motion.div>
                  </motion.div>
                </div>
                
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <motion.button 
                    className="bg-white text-purple-600 font-outfit font-bold px-8 py-4 rounded-full text-lg hover:shadow-xl transform transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🚀 Explorar Produtos
                  </motion.button>
                  <br />
                  <motion.button 
                    className="border-2 border-white text-white font-outfit px-6 py-3 rounded-full hover:bg-white hover:text-purple-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    📱 Ver Conteúdos
                  </motion.button>
                </motion.div>
                
                <motion.p 
                  className="font-outfit text-lg mt-6"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Com muito carinho e admiração,<br/>💜 Equipe Karooma
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {isEditing && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary">Enhanced Community Section</Badge>
          </div>
        )}
      </section>
    );
  }

  // Default content section fallback
  return (
    <section className="py-16 bg-white relative">
      <div className="max-w-4xl mx-auto px-4">
        {data.title && (
          <motion.h2 
            className="font-outfit text-4xl text-center gradient-text mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {data.title}
          </motion.h2>
        )}
        
        <motion.div 
          className={`prose prose-lg max-w-none ${
            data.alignment === 'center' ? 'text-center' : 
            data.alignment === 'right' ? 'text-right' : 'text-left'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div dangerouslySetInnerHTML={{ 
            __html: (data.content || 'Conteúdo da seção...').replace(/\\n/g, '<br />') 
          }} />
        </motion.div>
      </div>
      {isEditing && (
        <div className="absolute top-4 left-4">
          <Badge variant="secondary">Content Section</Badge>
        </div>
      )}
    </section>
  );
}

// Seção de Conteúdo em Destaque
function FeaturedContentSection({ section, isEditing }: SectionRendererProps) {
  const { data } = section;
  
  const { data: content, isLoading } = useQuery({
    queryKey: [`/api/${data.contentType === 'products' ? 'products' : 'content'}${data.contentType === 'products' ? '' : `/${data.contentType}`}/featured`],
    enabled: !!data.contentType
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        </div>
        {isEditing && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary">Featured Content</Badge>
          </div>
        )}
      </section>
    );
  }

  const items = content ? (Array.isArray(content) ? content : [content]).slice(0, data.limit || 3) : [];

  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50 relative">
      <div className="max-w-7xl mx-auto px-4">
        {data.title && (
          <motion.h2 
            className="font-fredoka text-4xl text-center gradient-text mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {data.title}
          </motion.h2>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item: any, index: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {data.contentType === 'products' ? (
                <ProductCard product={item as Product} />
              ) : data.contentType === 'videos' ? (
                <VideoCard video={item as Content} />
              ) : (
                <BlogCard article={item as Content} />
              )}
            </motion.div>
          ))}
        </div>
        
        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum conteúdo encontrado</p>
          </div>
        )}
      </div>
      
      {isEditing && (
        <div className="absolute top-4 left-4">
          <Badge variant="secondary">Featured Content</Badge>
        </div>
      )}
    </section>
  );
}

// Seção de Galeria
function GallerySection({ section, isEditing }: SectionRendererProps) {
  const { data } = section;
  const images = data.images ? data.images.split('\\n').filter((url: string) => url.trim()) : [];
  const columns = parseInt(data.columns) || 3;

  return (
    <section className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4">
        {data.title && (
          <motion.h2 
            className="font-fredoka text-4xl text-center gradient-text mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {data.title}
          </motion.h2>
        )}
        
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
          {images.map((imageUrl: string, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={imageUrl}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=400&h=300';
                }}
              />
            </motion.div>
          ))}
        </div>
        
        {images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma imagem adicionada à galeria</p>
          </div>
        )}
      </div>
      
      {isEditing && (
        <div className="absolute top-4 left-4">
          <Badge variant="secondary">Gallery Section</Badge>
        </div>
      )}
    </section>
  );
}