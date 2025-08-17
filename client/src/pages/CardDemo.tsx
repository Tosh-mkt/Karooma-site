import { useState } from "react";
import { motion } from "framer-motion";
import AmazonStyleCard from "@/components/AmazonStyleCard";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Palette, Eye } from "lucide-react";
import { useLocation } from "wouter";

// Dados de exemplo para demonstração
const sampleProducts = [
  {
    id: "demo-1",
    title: "Echo Dot (4ª Geração) | Smart Speaker com Alexa",
    description: "Alto-falante inteligente com Alexa - Som de alta qualidade e hub de casa inteligente",
    category: "Eletrônicos",
    imageUrl: "https://m.media-amazon.com/images/I/71v2jVJxF6L._AC_SX425_.jpg",
    currentPrice: "249.90",
    originalPrice: "349.90",
    affiliateLink: "https://www.amazon.com.br/dp/B08N5WRWNW",
    rating: "4.5",
    discount: 29,
    featured: true,
    createdAt: new Date()
  },
  {
    id: "demo-2",
    title: "Fire TV Stick 4K Max | Streaming em 4K Ultra HD",
    description: "Streaming player com controle remoto por voz Alexa - Wi-Fi 6",
    category: "Streaming",
    imageUrl: "https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SX425_.jpg",
    currentPrice: "299.90",
    originalPrice: "449.90",
    affiliateLink: "https://www.amazon.com.br/dp/B08MQZXN1X",
    rating: "4.7",
    discount: 33,
    featured: false,
    createdAt: new Date()
  },
  {
    id: "demo-3",
    title: "Kindle (11ª geração) | E-reader com luz embutida",
    description: "Mais leve que um livro de bolso, com luz embutida ajustável e bateria que dura semanas",
    category: "Livros",
    imageUrl: "https://m.media-amazon.com/images/I/71rRtaU+lGL._AC_SX425_.jpg",
    currentPrice: "349.90",
    originalPrice: null,
    affiliateLink: "https://www.amazon.com.br/dp/B07FQ4DJ7X",
    rating: "4.6",
    discount: null,
    featured: true,
    createdAt: new Date()
  },
  {
    id: "demo-4",
    title: "JBL Clip 4 | Alto-falante Bluetooth portátil",
    description: "Som JBL Pro, à prova d'água IP67, até 10h de música, mosquetão integrado",
    category: "Áudio",
    imageUrl: "https://m.media-amazon.com/images/I/61F7qONJk1L._AC_SX425_.jpg",
    currentPrice: "199.90",
    originalPrice: "299.90",
    affiliateLink: "https://www.amazon.com.br/dp/B08X1L5P3Z",
    rating: "4.3",
    discount: 33,
    featured: false,
    createdAt: new Date()
  }
];

export default function CardDemo() {
  const [, navigate] = useLocation();
  const [currentStyle, setCurrentStyle] = useState<'amazon' | 'karooma'>('amazon');
  const [isCompact, setIsCompact] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Início
            </Button>
            
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Demo Cards Amazon
              </h1>
            </div>
            
            <Badge variant="outline" className="hidden sm:block">
              <Eye className="h-3 w-3 mr-1" />
              Visualização
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Controles de Visualização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                  <Button
                    variant={currentStyle === 'amazon' ? 'default' : 'outline'}
                    onClick={() => setCurrentStyle('amazon')}
                    data-testid="button-style-amazon"
                  >
                    Estilo Amazon
                  </Button>
                  <Button
                    variant={currentStyle === 'karooma' ? 'default' : 'outline'}
                    onClick={() => setCurrentStyle('karooma')}
                    data-testid="button-style-karooma"
                  >
                    Estilo Karooma
                  </Button>
                </div>
                
                {currentStyle === 'amazon' && (
                  <div className="flex gap-2">
                    <Button
                      variant={!isCompact ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsCompact(false)}
                      data-testid="button-size-normal"
                    >
                      Normal
                    </Button>
                    <Button
                      variant={isCompact ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setIsCompact(true)}
                      data-testid="button-size-compact"
                    >
                      Compacto
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Style Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardContent className="pt-6">
              {currentStyle === 'amazon' ? (
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-orange-600">Estilo Amazon</h3>
                  <p className="text-gray-600 mb-4">
                    Inspirado no design dos cards de produtos da Amazon, com foco em conversão e clareza de informações. 
                    {isCompact ? ' Versão compacta para listagens densas.' : ' Versão completa com mais detalhes.'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">🛒 Botão de compra destacado</Badge>
                    <Badge variant="outline">⭐ Sistema de avaliações</Badge>
                    <Badge variant="outline">💰 Preços com desconto</Badge>
                    <Badge variant="outline">❤️ Favoritos integrados</Badge>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-purple-600">Estilo Karooma</h3>
                  <p className="text-gray-600 mb-4">
                    Design personalizado do Karooma com gradientes, animações e efeitos visuais modernos. 
                    Foca na experiência visual e interação suave.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">🎨 Gradientes coloridos</Badge>
                    <Badge variant="outline">✨ Animações suaves</Badge>
                    <Badge variant="outline">🌟 Efeitos glassmorphism</Badge>
                    <Badge variant="outline">💝 Sistema completo de favoritos</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Produtos de Demonstração
          </h2>
          
          <div className={`grid gap-6 justify-items-center ${
            currentStyle === 'amazon' && isCompact 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {sampleProducts.map((product, index) => (
              currentStyle === 'amazon' ? (
                <AmazonStyleCard
                  key={product.id}
                  product={product}
                  index={index}
                  compact={isCompact}
                />
              ) : (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                />
              )
            ))}
          </div>
        </motion.div>

        {/* Code Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle>Como Usar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Estilo Amazon:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import AmazonStyleCard from '@/components/AmazonStyleCard';

<AmazonStyleCard 
  product={productData} 
  compact={false} 
/>`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Estilo Karooma:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import ProductCard from '@/components/ProductCard';

<ProductCard 
  product={productData} 
  index={0} 
/>`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}