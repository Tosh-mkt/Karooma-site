import React from 'react';
import { motion } from 'framer-motion';
import { EbookTemplate, EBOOK_STYLES } from '@/lib/ebook-templates';
import { Download, BookOpen, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import karoomaLogo from '@/assets/LOGO_KAROOMA_TIPO_1753945361411.png';

interface EbookGeneratorProps {
  template: EbookTemplate;
  onDownload?: () => void;
}

export function EbookGenerator({ template, onDownload }: EbookGeneratorProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* E-book Preview */}
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Cover Page */}
        <EbookCover template={template} />
        
        {/* Welcome Page */}
        <EbookWelcome template={template} />
        
        {/* Table of Contents */}
        <EbookTableOfContents template={template} />
        
        {/* Chapters */}
        {template.chapters.map((chapter, index) => (
          <EbookChapter key={chapter.id} chapter={chapter} template={template} />
        ))}
        
        {/* Final Page */}
        <EbookFinalPage template={template} />
      </div>
      
      {/* Download Action */}
      <div className="text-center">
        <Button
          onClick={onDownload}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
        >
          <Download className="w-5 h-5 mr-2" />
          Baixar E-book PDF
        </Button>
      </div>
    </div>
  );
}

// Cover Page Component
function EbookCover({ template }: { template: EbookTemplate }) {
  return (
    <div 
      className="relative h-screen flex items-center justify-center text-center p-12"
      style={{
        backgroundImage: `url(${template.coverImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-purple-50/80 to-pink-50/90" />
      
      <div className="relative z-10 max-w-3xl">
        {/* Logo */}
        <motion.img 
          src={karoomaLogo} 
          alt="Karooma" 
          className="h-12 object-contain mx-auto mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        />
        
        {/* Title */}
        <motion.h1 
          className="font-fredoka text-5xl md:text-7xl gradient-text mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {template.title}
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p 
          className="font-poppins text-xl md:text-2xl text-gray-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {template.subtitle}
        </motion.p>
        
        {/* Metadata */}
        <motion.div 
          className="flex justify-center space-x-8 text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            <span className="font-poppins">{template.chapters.length} capítulos</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-poppins">{template.metadata.estimatedReadTime}</span>
          </div>
          <div className="flex items-center">
            <Target className="w-5 h-5 mr-2" />
            <span className="font-poppins">{template.metadata.targetAudience}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Welcome Page Component
function EbookWelcome({ template }: { template: EbookTemplate }) {
  return (
    <div className="p-12 min-h-screen flex items-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-fredoka text-4xl gradient-text mb-8 text-center">
          Olá, mãe guerreira! 💜
        </h2>
        
        <div className="space-y-6 font-poppins text-lg leading-relaxed text-gray-700">
          <p>
            Você não está sozinha nessa jornada. Sabemos que os dias são longos, 
            as noites curtas, e que às vezes parece que a casa conspira contra você.
          </p>
          
          <p>
            Este guia nasceu da compreensão de que você não precisa ser perfeita - 
            você só precisa de estratégias que <strong>realmente funcionam</strong> na vida real, 
            com crianças reais, em uma rotina real.
          </p>
          
          <p>
            Cada dica aqui foi testada por mães como você. Cada sistema foi pensado 
            para caber na sua agenda corrida. Cada estratégia foi criada para 
            simplificar, não complicar sua vida.
          </p>
          
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-3xl mt-8">
            <p className="text-center italic">
              "Sua família tem sorte de ter você. E você merece sentir-se 
              confiante e no controle do seu lar."
            </p>
            <p className="text-center mt-4 font-semibold">
              Com carinho,<br />Equipe Karooma 💜
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Table of Contents Component
function EbookTableOfContents({ template }: { template: EbookTemplate }) {
  return (
    <div className="p-12 min-h-screen">
      <h2 className="font-fredoka text-4xl gradient-text mb-12 text-center">
        O que você vai aprender
      </h2>
      
      <div className="max-w-3xl mx-auto space-y-6">
        {template.chapters.map((chapter, index) => (
          <motion.div
            key={chapter.id}
            className="flex items-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl hover:shadow-md transition-shadow"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-3xl mr-6">{chapter.icon}</div>
            <div className="flex-1">
              <h3 className="font-outfit text-xl font-bold text-gray-800 mb-2">
                Capítulo {chapter.order}: {chapter.title}
              </h3>
              <p className="text-gray-600 font-poppins">
                {chapter.sections.length} seções práticas + checklist de implementação
              </p>
            </div>
            <div className="text-purple-600 font-semibold">
              {chapter.checklist.length} ações
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Chapter Component
function EbookChapter({ chapter, template }: { chapter: any; template: EbookTemplate }) {
  return (
    <div className="p-12 min-h-screen">
      {/* Chapter Header */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">{chapter.icon}</div>
        <h2 className="font-fredoka text-4xl gradient-text mb-4">
          {chapter.title}
        </h2>
        <div className="w-32 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto rounded-full" />
      </div>
      
      {/* Chapter Sections */}
      <div className="max-w-3xl mx-auto space-y-8">
        {chapter.sections.map((section: any, index: number) => (
          <div key={section.id} className="space-y-4">
            <div className="font-poppins text-lg leading-relaxed text-gray-700">
              {section.content}
            </div>
            {section.image && (
              <div className="text-center my-8">
                <img 
                  src={section.image} 
                  alt="Ilustração do capítulo"
                  className="rounded-2xl shadow-lg max-w-full h-64 object-cover mx-auto"
                />
              </div>
            )}
          </div>
        ))}
        
        {/* Chapter Checklist */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-3xl mt-12">
          <h3 className="font-outfit text-2xl font-bold text-gray-800 mb-6 text-center">
            ✅ Checklist de Implementação
          </h3>
          
          <div className="space-y-4">
            {chapter.checklist.map((item: any, index: number) => (
              <div key={item.id} className="flex items-start p-4 bg-white rounded-2xl shadow-sm">
                <div className="w-6 h-6 border-2 border-purple-300 rounded mr-4 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-poppins text-gray-800 mb-1">{item.text}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full ${
                      item.category === 'easy' ? 'bg-green-100 text-green-600' :
                      item.category === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {item.category === 'easy' ? 'Fácil' : 
                       item.category === 'medium' ? 'Médio' : 'Avançado'}
                    </span>
                    <span>⏱️ {item.timeEstimate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Final Page Component
function EbookFinalPage({ template }: { template: EbookTemplate }) {
  return (
    <div className="p-12 min-h-screen flex items-center bg-gradient-to-br from-purple-600 to-pink-600 text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-fredoka text-5xl mb-8">
          Você consegue! 🌟
        </h2>
        
        <div className="space-y-6 font-poppins text-xl leading-relaxed">
          <p>
            Agora você tem tudo o que precisa para transformar sua casa em 
            um ambiente organizado e funcional.
          </p>
          
          <p>
            Lembre-se: não precisa implementar tudo de uma vez. Escolha uma 
            estratégia, teste por uma semana, e depois adicione a próxima.
          </p>
          
          <p>
            Você está fazendo um trabalho incrível. Sua família é sortuda 
            por ter você! 💜
          </p>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm p-8 rounded-3xl mt-12">
          <h3 className="font-outfit text-2xl font-bold mb-4">
            Continue sua jornada com a Karooma
          </h3>
          <p className="mb-6">
            Receba mais guias práticos, dicas e estratégias direto no seu email
          </p>
          <div className="text-lg font-semibold">
            📧 newsletter@karooma.life<br />
            🌐 www.karooma.life
          </div>
        </div>
      </div>
    </div>
  );
}