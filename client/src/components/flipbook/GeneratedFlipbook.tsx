import React, { useState, useEffect } from 'react';
import { FlipbookCore } from './FlipbookCore';
import { getFlipbookTheme } from '@shared/flipbook-themes';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Target, 
  Users, 
  CheckCircle, 
  Heart, 
  Star,
  BookOpen,
  Wand2,
  Home
} from 'lucide-react';
import karoomaLogo from '@/assets/LOGO_KAROOMA_TIPO_1753945361411.png';

interface FlipbookPageData {
  id: string;
  type: 'cover' | 'toc' | 'chapter' | 'checklist' | 'testimonial' | 'final';
  title?: string;
  icon?: string;
  content?: string;
  image?: string;
  items?: {
    text: string;
    time: string;
    category: 'easy' | 'medium' | 'hard';
  }[];
}

interface GeneratedFlipbookData {
  id: string;
  postId: string;
  themeId: string;
  title: string;
  description: string | null;
  status: 'generating' | 'ready' | 'failed';
  pages: FlipbookPageData[];
  createdAt: string;
  updatedAt?: string;
}

interface GeneratedFlipbookProps {
  flipbook: GeneratedFlipbookData;
  onPageChange?: (pageIndex: number) => void;
}

interface FlipbookPage {
  id: string;
  content: React.ReactNode;
}

export function GeneratedFlipbook({ flipbook, onPageChange }: GeneratedFlipbookProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [pages, setPages] = useState<FlipbookPage[]>([]);
  
  const theme = getFlipbookTheme(flipbook.themeId) || getFlipbookTheme('organizacao');

  useEffect(() => {
    // Converter dados JSON em componentes React
    const generatePages = () => {
      const generatedPages: FlipbookPage[] = [];

      flipbook.pages.forEach((pageData, index) => {
        let pageContent: React.ReactNode;

        switch (pageData.type) {
          case 'cover':
            pageContent = (
              <CoverPage 
                colorScheme={theme.colors}
                title={flipbook.title}
                description={flipbook.description}
                image={pageData.image}
              />
            );
            break;

          case 'toc':
            pageContent = (
              <TableOfContentsPage 
                colorScheme={theme.colors}
                chapters={flipbook.pages.filter(p => p.type === 'chapter')}
              />
            );
            break;

          case 'chapter':
            pageContent = (
              <ChapterPage 
                colorScheme={theme.colors}
                title={pageData.title || 'Capítulo'}
                content={pageData.content || ''}
                icon={pageData.icon}
                chapterNumber={flipbook.pages.filter((p, i) => p.type === 'chapter' && i <= index).length}
              />
            );
            break;

          case 'checklist':
            pageContent = (
              <ChecklistPage 
                colorScheme={theme.colors}
                title={pageData.title || 'Lista de Verificação'}
                items={pageData.items || []}
              />
            );
            break;

          case 'testimonial':
            pageContent = (
              <TestimonialPage 
                colorScheme={theme.colors}
                title={pageData.title}
                content={pageData.content}
              />
            );
            break;

          case 'final':
            pageContent = (
              <FinalPage 
                colorScheme={theme.colors}
                flipbookTitle={flipbook.title}
              />
            );
            break;

          default:
            pageContent = (
              <div className="flex items-center justify-center h-full">
                <p>Tipo de página não reconhecido: {pageData.type}</p>
              </div>
            );
        }

        generatedPages.push({
          id: pageData.id || `page-${index}`,
          content: pageContent
        });
      });

      setPages(generatedPages);
      setIsLoading(false);
    };

    generatePages();
  }, [flipbook, theme.colors]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-poppins">Carregando seu guia personalizado...</p>
        </motion.div>
      </div>
    );
  }

  if (flipbook.status === 'failed') {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="font-fredoka text-2xl text-gray-800 mb-4">
            Erro na Geração
          </h2>
          <p className="text-gray-600 mb-6">
            Houve um problema ao gerar seu guia personalizado. Por favor, tente novamente.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Voltar
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <FlipbookCore 
      pages={pages} 
      colorScheme={theme.colors}
      onPageChange={onPageChange}
    />
  );
}

// Componentes de página personalizados para flipbooks gerados
function CoverPage({ 
  colorScheme, 
  title, 
  description, 
  image 
}: { 
  colorScheme: any; 
  title: string; 
  description: string | null;
  image?: string;
}) {
  return (
    <div 
      className="relative w-full h-full flex items-center justify-center px-16 py-8 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.secondary} 100%)`
      }}
    >
      {/* Background Image */}
      {image && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url('${image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />
      
      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-lg">
        <motion.img 
          src={karoomaLogo} 
          alt="Karooma" 
          className="h-8 object-contain mx-auto mb-6 filter brightness-0 invert"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        />
        
        <motion.h1 
          className="font-fredoka text-3xl mb-4 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {title}
        </motion.h1>
        
        <motion.p 
          className="font-poppins text-lg mb-6 opacity-90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {description || 'Guia Prático Personalizado'}
        </motion.p>
        
        <motion.div 
          className="flex justify-center space-x-6 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center">
            <Wand2 className="w-4 h-4 mr-1" />
            <span>Gerado por IA</span>
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-1" />
            <span>Personalizado</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function TableOfContentsPage({ 
  colorScheme, 
  chapters 
}: { 
  colorScheme: any; 
  chapters: FlipbookPageData[];
}) {
  return (
    <div className="w-full h-full p-16 bg-white flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <h2 className="font-fredoka text-4xl mb-4" style={{ color: colorScheme.text }}>
          Índice
        </h2>
        <div className="w-24 h-1 mx-auto rounded" style={{ background: colorScheme.primary }} />
      </motion.div>

      <div className="flex-1 space-y-6">
        {chapters.map((chapter, index) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-center p-4 rounded-xl"
            style={{ backgroundColor: `${colorScheme.accent}` }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mr-6 font-bold text-white"
              style={{ background: colorScheme.primary }}
            >
              {index + 1}
            </div>
            <div className="flex-1">
              <h3 className="font-poppins font-semibold text-lg" style={{ color: colorScheme.text }}>
                {chapter.title || `Capítulo ${index + 1}`}
              </h3>
            </div>
            <ChevronRight className="w-5 h-5" style={{ color: colorScheme.primary }} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ChapterPage({ 
  colorScheme, 
  title, 
  content, 
  icon,
  chapterNumber 
}: { 
  colorScheme: any; 
  title: string; 
  content: string;
  icon?: string;
  chapterNumber: number;
}) {
  return (
    <div className="w-full h-full p-16 bg-white overflow-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="flex items-center mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mr-6"
            style={{ background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})` }}
          >
            {icon ? (
              <span className="text-2xl">{icon}</span>
            ) : (
              <span className="text-white font-bold text-xl">{chapterNumber}</span>
            )}
          </div>
          <h2 className="font-fredoka text-3xl" style={{ color: colorScheme.text }}>
            {title}
          </h2>
        </div>
        
        <div className="w-full h-1 rounded" style={{ background: `linear-gradient(90deg, ${colorScheme.primary}, ${colorScheme.secondary})` }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="prose prose-lg max-w-none"
        style={{ color: colorScheme.text }}
      >
        {/* Parse markdown-like content */}
        {content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-6 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </motion.div>
    </div>
  );
}

function ChecklistPage({ 
  colorScheme, 
  title, 
  items 
}: { 
  colorScheme: any; 
  title: string;
  items: { text: string; time: string; category: string }[];
}) {
  return (
    <div className="w-full h-full p-16 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <h2 className="font-fredoka text-4xl mb-4" style={{ color: colorScheme.text }}>
          {title}
        </h2>
        <div className="w-24 h-1 mx-auto rounded" style={{ background: colorScheme.primary }} />
      </motion.div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="flex items-center p-4 rounded-lg border-2 border-gray-100 hover:shadow-md transition-all"
          >
            <CheckCircle 
              className="w-6 h-6 mr-4 flex-shrink-0" 
              style={{ color: colorScheme.primary }}
            />
            <div className="flex-1">
              <p className="font-poppins font-medium" style={{ color: colorScheme.text }}>
                {item.text}
              </p>
              {item.time && (
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {item.time}
                </div>
              )}
            </div>
            <div 
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                item.category === 'easy' ? 'bg-green-100 text-green-800' :
                item.category === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}
            >
              {item.category === 'easy' ? 'Fácil' : 
               item.category === 'medium' ? 'Médio' : 'Difícil'}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TestimonialPage({ 
  colorScheme, 
  title,
  content 
}: { 
  colorScheme: any; 
  title?: string;
  content?: string;
}) {
  return (
    <div className="w-full h-full p-16 bg-white flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center max-w-2xl"
      >
        <div 
          className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${colorScheme.primary}, ${colorScheme.secondary})` }}
        >
          <Heart className="w-10 h-10 text-white" />
        </div>
        
        {title && (
          <h3 className="font-fredoka text-2xl mb-6" style={{ color: colorScheme.text }}>
            {title}
          </h3>
        )}
        
        <blockquote className="text-xl leading-relaxed mb-8 italic" style={{ color: colorScheme.text }}>
          "{content || 'Este guia transformou minha rotina familiar. Recomendo!'}"
        </blockquote>
        
        <div className="flex justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className="w-6 h-6 mx-1 fill-current" 
              style={{ color: colorScheme.primary }}
            />
          ))}
        </div>
        
        <p className="text-sm mt-4 opacity-75" style={{ color: colorScheme.text }}>
          - Usuário Karooma
        </p>
      </motion.div>
    </div>
  );
}

function FinalPage({ 
  colorScheme,
  flipbookTitle 
}: { 
  colorScheme: any;
  flipbookTitle: string;
}) {
  return (
    <div 
      className="relative w-full h-full flex items-center justify-center px-16 py-8 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.secondary} 100%)`
      }}
    >
      <div className="absolute inset-0 bg-black/10" />
      
      <div className="relative z-10 text-center text-white max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-full mx-auto mb-6 bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Home className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="font-fredoka text-3xl mb-4">
            Parabéns!
          </h2>
          
          <p className="font-poppins text-lg mb-6 opacity-90">
            Você completou o guia "{flipbookTitle}"
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="font-poppins font-semibold text-lg mb-4">
              Continue com a Karooma
            </h3>
            <p className="text-sm opacity-90">
              📧 newsletter@karooma.life<br />
              🌐 www.karooma.life
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Import missing ChevronRight
import { ChevronRight } from 'lucide-react';