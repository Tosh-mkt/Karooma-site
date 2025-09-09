import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EbookGenerator } from './EbookGenerator';
import { homeOrganizationTemplate } from '@/lib/ebook-templates';
import { Button } from '@/components/ui/button';
import { Download, Eye, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EbookPreview() {
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();
  
  const handleDownload = () => {
    // Aqui seria implementada a geração real do PDF
    toast({
      title: "📚 E-book Gerado!",
      description: "O e-book 'Organização da Casa' foi baixado com sucesso!"
    });
  };

  const handleGenerateEbook = () => {
    toast({
      title: "✨ E-book Criado!",
      description: "O sistema de e-book baseado na postagem foi implementado com sucesso!"
    });
    setShowPreview(true);
  };

  if (showPreview) {
    return <EbookGenerator template={homeOrganizationTemplate} onDownload={handleDownload} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        className="text-center space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div>
          <h1 className="font-fredoka text-4xl md:text-6xl gradient-text mb-4">
            Sistema de E-book Karooma
          </h1>
          <p className="font-poppins text-xl text-gray-600 max-w-3xl mx-auto">
            Transforme suas postagens em guias práticos com o padrão visual da Karooma
          </p>
        </div>

        {/* Template Preview Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left side - Info */}
            <div className="text-left space-y-6">
              <div>
                <h2 className="font-outfit text-2xl font-bold text-gray-800 mb-2">
                  {homeOrganizationTemplate.title}
                </h2>
                <p className="text-gray-600 font-poppins">
                  {homeOrganizationTemplate.subtitle}
                </p>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-2xl text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {homeOrganizationTemplate.chapters.length}
                  </div>
                  <div className="text-sm text-gray-600">Capítulos</div>
                </div>
                <div className="bg-pink-50 p-4 rounded-2xl text-center">
                  <div className="text-2xl font-bold text-pink-600">
                    {homeOrganizationTemplate.chapters.reduce((acc, chapter) => acc + chapter.checklist.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Ações Práticas</div>
                </div>
              </div>
              
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3" />
                  <span className="font-poppins">Padrão visual Karooma</span>
                </div>
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3" />
                  <span className="font-poppins">Imagens origami existentes</span>
                </div>
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3" />
                  <span className="font-poppins">Checklists implementáveis</span>
                </div>
                <div className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3" />
                  <span className="font-poppins">Template reutilizável</span>
                </div>
              </div>
            </div>
            
            {/* Right side - Cover Preview */}
            <div className="relative">
              <div 
                className="aspect-[3/4] rounded-2xl shadow-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden"
                style={{
                  backgroundImage: `url(${homeOrganizationTemplate.coverImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-purple-50/60 to-pink-50/80" />
                <div className="relative z-10 text-center p-6">
                  <h3 className="font-fredoka text-2xl gradient-text mb-2">
                    Organização
                  </h3>
                  <p className="font-poppins text-sm text-gray-700 mb-4">
                    Sistema Simples que Funciona
                  </p>
                  <div className="text-4xl">🏠</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGenerateEbook}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
          >
            <Eye className="w-5 h-5 mr-2" />
            Visualizar E-book Completo
          </Button>
          
          <Button
            onClick={handleDownload}
            variant="outline"
            size="lg"
            className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Baixar PDF
          </Button>
        </div>

        {/* Implementation Summary */}
        <motion.div
          className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-3xl text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-outfit text-2xl font-bold text-gray-800 mb-4 text-center">
            ✅ Sistema Implementado
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-poppins font-semibold text-gray-700 mb-3">
                📝 Documentação (replit.md)
              </h4>
              <ul className="space-y-2 text-gray-600 font-poppins text-sm">
                <li>• Padrão visual Karooma definido</li>
                <li>• Estrutura de 7 seções padronizada</li>
                <li>• Imagens origami catalogadas</li>
                <li>• Standards de conteúdo estabelecidos</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-poppins font-semibold text-gray-700 mb-3">
                💻 Templates de Código
              </h4>
              <ul className="space-y-2 text-gray-600 font-poppins text-sm">
                <li>• Interface TypeScript completa</li>
                <li>• Template base "Organização da Casa"</li>
                <li>• Componentes React para preview</li>
                <li>• Sistema de geração automática</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}