import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Target, Users, CheckCircle, Heart, Star } from 'lucide-react';
import karoomaLogo from '@/assets/LOGO_KAROOMA_TIPO_1753945361411.png';

interface FlipbookPageProps {
  colorScheme: {
    primary: string;
    secondary: string;
    gradient: string;
    background: string;
    text: string;
    accent: string;
  };
}

// Cover Page
export function CoverPage({ colorScheme }: FlipbookPageProps) {
  return (
    <div 
      className="relative w-full h-full flex items-center justify-center p-6 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.secondary} 100%)`
      }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url('attached_assets/Wide_origami_home_organization_chaos_dbac14c5.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
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
          Organização da Casa
        </motion.h1>
        
        <motion.p 
          className="font-poppins text-lg mb-6 opacity-90"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Sistema Simples que Funciona
        </motion.p>
        
        <motion.div 
          className="flex justify-center space-x-6 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>15 min/dia</span>
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-1" />
            <span>7 capítulos</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>Toda família</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Welcome Page
export function WelcomePage({ colorScheme }: FlipbookPageProps) {
  return (
    <div className="w-full h-full p-6 flex items-center justify-center" style={{ backgroundColor: colorScheme.background }}>
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl mb-4">💜</div>
        
        <h2 className="font-fredoka text-2xl mb-4" style={{ color: colorScheme.primary }}>
          Olá, mãe guerreira!
        </h2>
        
        <div className="space-y-4 font-poppins text-sm leading-relaxed" style={{ color: colorScheme.text }}>
          <p>
            Você não está sozinha. Sabemos que os dias são longos e às vezes 
            parece que a casa conspira contra você.
          </p>
          
          <p>
            Este guia tem estratégias <strong>testadas por mães como você</strong> - 
            práticas que realmente funcionam na vida real.
          </p>
          
          <div 
            className="p-4 rounded-2xl"
            style={{ backgroundColor: colorScheme.accent }}
          >
            <p className="italic text-center">
              "Sua família tem sorte de ter você."
            </p>
            <p className="text-center mt-2 font-semibold">
              Com carinho, Equipe Karooma 💜
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Table of Contents
export function TableOfContentsPage({ colorScheme }: FlipbookPageProps) {
  const chapters = [
    { icon: '🤯', title: 'Por que parece impossível?', actions: 2 },
    { icon: '⏰', title: 'Sistema dos 15 Minutos', actions: 3 },
    { icon: '🏠', title: 'Organização por Cômodos', actions: 4 },
    { icon: '🔄', title: 'Rotinas que se Mantêm', actions: 3 },
    { icon: '👨‍👩‍👧‍👦', title: 'Envolvendo a Família', actions: 2 },
    { icon: '🚨', title: 'Plano de Emergência', actions: 2 },
    { icon: '✨', title: 'Mantendo o Sistema', actions: 1 }
  ];

  return (
    <div className="w-full h-full p-6 overflow-y-auto" style={{ backgroundColor: colorScheme.background }}>
      <h2 className="font-fredoka text-2xl text-center mb-6" style={{ color: colorScheme.primary }}>
        O que você vai aprender
      </h2>
      
      <div className="space-y-3 max-w-sm mx-auto">
        {chapters.map((chapter, index) => (
          <motion.div
            key={index}
            className="flex items-center p-3 rounded-xl"
            style={{ backgroundColor: colorScheme.accent }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-2xl mr-3">{chapter.icon}</div>
            <div className="flex-1">
              <h3 className="font-poppins font-semibold text-sm" style={{ color: colorScheme.text }}>
                {chapter.title}
              </h3>
              <p className="text-xs opacity-70" style={{ color: colorScheme.text }}>
                {chapter.actions} ações práticas
              </p>
            </div>
            <div className="text-xs font-semibold" style={{ color: colorScheme.primary }}>
              {index + 1}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Chapter Page Template
export function ChapterPage({ 
  colorScheme, 
  chapterNumber, 
  title, 
  icon, 
  content, 
  image 
}: FlipbookPageProps & {
  chapterNumber: number;
  title: string;
  icon: string;
  content: string;
  image?: string;
}) {
  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: colorScheme.background }}>
      {/* Header */}
      <div className="p-6 text-center">
        <div className="text-4xl mb-2">{icon}</div>
        <h2 className="font-fredoka text-xl mb-1" style={{ color: colorScheme.primary }}>
          Capítulo {chapterNumber}
        </h2>
        <h3 className="font-poppins text-lg font-semibold" style={{ color: colorScheme.text }}>
          {title}
        </h3>
        <div 
          className="w-16 h-1 mx-auto mt-3 rounded-full"
          style={{ backgroundColor: colorScheme.primary }}
        />
      </div>
      
      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        {image && (
          <div className="mb-4">
            <img 
              src={image} 
              alt="Ilustração do capítulo"
              className="w-full h-32 object-cover rounded-xl"
            />
          </div>
        )}
        
        <div className="font-poppins text-sm leading-relaxed space-y-3" style={{ color: colorScheme.text }}>
          {content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// Checklist Page
export function ChecklistPage({ 
  colorScheme, 
  title, 
  items 
}: FlipbookPageProps & {
  title: string;
  items: Array<{
    text: string;
    category: 'easy' | 'medium' | 'advanced';
    time: string;
  }>;
}) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'easy': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return colorScheme.primary;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'advanced': return 'Avançado';
      default: return '';
    }
  };

  return (
    <div className="w-full h-full p-6 overflow-y-auto" style={{ backgroundColor: colorScheme.background }}>
      <div className="text-center mb-6">
        <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: colorScheme.primary }} />
        <h2 className="font-fredoka text-xl" style={{ color: colorScheme.primary }}>
          {title}
        </h2>
      </div>
      
      <div className="space-y-3 max-w-sm mx-auto">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="p-3 rounded-xl"
            style={{ backgroundColor: colorScheme.accent }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start">
              <div className="w-5 h-5 border-2 rounded mr-3 mt-0.5 flex-shrink-0" style={{ borderColor: colorScheme.primary }} />
              <div className="flex-1">
                <p className="font-poppins text-sm mb-2" style={{ color: colorScheme.text }}>
                  {item.text}
                </p>
                <div className="flex items-center space-x-2">
                  <span 
                    className="px-2 py-1 rounded-full text-xs text-white font-semibold"
                    style={{ backgroundColor: getCategoryColor(item.category) }}
                  >
                    {getCategoryLabel(item.category)}
                  </span>
                  <span className="text-xs opacity-70" style={{ color: colorScheme.text }}>
                    ⏱️ {item.time}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Testimonial Page
export function TestimonialPage({ colorScheme }: FlipbookPageProps) {
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Mãe de 2",
      text: "Consegui organizar a rotina das crianças em apenas um final de semana!",
      avatar: "👩🏻"
    },
    {
      name: "Ana Costa", 
      role: "Mãe de 3",
      text: "Finalmente consigo jantar em família sem correria.",
      avatar: "👩🏽"
    }
  ];

  return (
    <div className="w-full h-full p-6 flex items-center justify-center" style={{ backgroundColor: colorScheme.background }}>
      <div className="max-w-md space-y-6">
        <div className="text-center">
          <Star className="w-8 h-8 mx-auto mb-2" style={{ color: colorScheme.primary }} />
          <h2 className="font-fredoka text-xl mb-2" style={{ color: colorScheme.primary }}>
            Mães que transformaram suas rotinas
          </h2>
        </div>
        
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            className="p-4 rounded-xl"
            style={{ backgroundColor: colorScheme.accent }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="flex items-center mb-3">
              <div className="text-2xl mr-3">{testimonial.avatar}</div>
              <div>
                <h4 className="font-poppins font-semibold text-sm" style={{ color: colorScheme.text }}>
                  {testimonial.name}
                </h4>
                <p className="text-xs opacity-70" style={{ color: colorScheme.text }}>
                  {testimonial.role}
                </p>
              </div>
            </div>
            <p className="font-poppins text-sm italic" style={{ color: colorScheme.text }}>
              "{testimonial.text}"
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Final Page
export function FinalPage({ colorScheme }: FlipbookPageProps) {
  return (
    <div 
      className="w-full h-full flex items-center justify-center p-6"
      style={{
        background: `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.secondary} 100%)`
      }}
    >
      <div className="text-center text-white max-w-md space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="font-fredoka text-2xl mb-4">
            Você consegue!
          </h2>
          
          <div className="space-y-4 font-poppins text-sm leading-relaxed">
            <p>
              Agora você tem tudo para transformar sua casa em um ambiente 
              organizado e funcional.
            </p>
            
            <p>
              Lembre-se: não precisa implementar tudo de uma vez. Vá com calma!
            </p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mt-6">
            <h3 className="font-poppins font-semibold mb-2">
              Continue com a Karooma
            </h3>
            <p className="text-sm opacity-90">
              📧 newsletter@karooma.com<br />
              🌐 www.karooma.com
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}