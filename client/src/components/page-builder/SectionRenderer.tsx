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

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: data.backgroundImage ? `url(${data.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-800/30 to-blue-900/40"></div>
      
      <motion.div 
        className="relative z-10 text-center px-4 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="font-fredoka text-5xl md:text-7xl text-white mb-6 drop-shadow-lg">
          {data.title || 'Título Principal'}
        </h1>
        
        <p className="font-poppins text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
          {data.subtitle || 'Subtítulo da seção'}
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
            <p className="font-poppins text-lg text-gray-700 leading-relaxed text-center">
              Acreditamos que toda mãe merece sentir-se apoiada e confiante. Nossa missão é fornecer recursos práticos, produtos cuidadosamente selecionados e conteúdo empático que realmente fazem a diferença no cotidiano familiar.
            </p>
            <p className="font-poppins text-lg text-gray-700 leading-relaxed text-center mt-4">
              Sabemos que você carrega uma carga mental imensa - desde lembrar dos compromissos médicos das crianças até planejar as refeições da semana. Por isso, criamos um espaço onde você encontra soluções testadas e estratégias que funcionam.
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
                Entendemos que ser mãe é uma jornada cheia de desafios únicos. Cada dia traz novas situações, e você não está sozinha nisso.
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
                Oferecemos estratégias testadas por mães reais, produtos que realmente funcionam e conteúdo que facilita o dia a dia.
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

  // Como Te Auxiliamos section (Facilita a Vida)
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
                <h4 className="font-outfit text-lg gradient-text mb-3">Testados por Mães</h4>
                <p className="font-poppins text-sm text-gray-600">
                  Cada produto é testado na vida real, por mães reais
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
                <h4 className="font-outfit text-lg gradient-text mb-3">Preço Justo</h4>
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