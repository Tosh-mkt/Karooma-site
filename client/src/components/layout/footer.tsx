import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Mail, Lock, Info, Sparkles, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import karoomaIcon from "@assets/ICON_KAROOMA_Y_1753945353338.png";
import karoomaLogo from "@assets/LOGO_KAROOMA_TIPO_1753945361411.png";

export default function Footer() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* 4 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
          {/* Column 1: Logo & Icon */}
          <motion.div 
            className="flex md:flex-col items-center md:items-start justify-center md:justify-start space-x-3 md:space-x-0 md:space-y-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src={karoomaIcon} 
                alt="Karooma Icon" 
                className="w-full h-full object-contain"
              />
            </div>
            <img 
              src={karoomaLogo} 
              alt="Karooma" 
              className="h-6 object-contain brightness-0 invert"
            />
          </motion.div>

          {/* Column 2: Empresa Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <h4 className="font-poppins font-bold text-sm mb-2 text-pink-400">
              Empresa
            </h4>
            
            <div className="flex items-start space-x-2 text-gray-300">
              <MapPin className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
              <div className="font-inter text-xs leading-relaxed">
                <p>Rua Comendador Torlogo Dauntre 74, Sala 1207</p>
                <p>Campinas, 13025-270, SP, Brasil</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-300">
              <Mail className="w-4 h-4 text-pink-400 flex-shrink-0" />
              <a 
                href="mailto:contato@karooma.life"
                className="font-inter text-xs hover:text-pink-400 transition-colors duration-300"
                data-testid="link-contact-email"
              >
                contato@karooma.life
              </a>
            </div>
          </motion.div>

          {/* Column 3: Ajuda Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <h4 className="font-poppins font-bold text-sm mb-2 text-pink-400">
              Precisa de Ajuda?
            </h4>
            
            <Link href="/#custom-content">
              <motion.div
                className="flex items-center space-x-2 text-gray-300 hover:text-pink-400 transition-colors duration-300 cursor-pointer group"
                whileHover={{ x: 3 }}
                data-testid="link-custom-content"
              >
                <Sparkles className="w-4 h-4 text-pink-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-inter text-xs">
                  Qual assunto te ajudaria?
                </span>
              </motion.div>
            </Link>

            <Link href="/about">
              <motion.div
                className="flex items-center space-x-2 text-gray-300 hover:text-pink-400 transition-colors duration-300 cursor-pointer group"
                whileHover={{ x: 3 }}
                data-testid="link-about"
              >
                <Info className="w-4 h-4 text-pink-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-inter text-xs">
                  Sobre a Karooma
                </span>
              </motion.div>
            </Link>
          </motion.div>

          {/* Column 4: Privacy Section - Collapsible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Collapsible
              open={isPrivacyOpen}
              onOpenChange={setIsPrivacyOpen}
            >
              <CollapsibleTrigger 
                className="flex items-center justify-between w-full group hover:bg-gray-800/30 p-2 rounded transition-colors"
                data-testid="button-privacy-toggle"
              >
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <h5 className="font-poppins font-bold text-xs text-pink-400">
                    Sua privacidade é nossa prioridade
                  </h5>
                </div>
                <motion.div
                  animate={{ rotate: isPrivacyOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-2"
                >
                  <ChevronDown className="w-5 h-5 text-pink-400" />
                </motion.div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <div className="pt-2 pl-6 space-y-2">
                  <p className="text-gray-300 font-inter text-xs leading-relaxed">
                    Respeitamos seus dados e os usamos apenas para melhorar sua jornada em nosso site. 
                    Seja para uma experiência de pesquisa mais fluida ou para receber conteúdos que 
                    realmente interessam a você. Não vendemos, alugamos ou compartilhamos suas 
                    informações com ninguém.
                  </p>
                  <Link href="/privacidade">
                    <motion.span
                      className="inline-flex items-center text-pink-400 hover:text-pink-300 font-inter text-xs font-medium cursor-pointer"
                      whileHover={{ x: 3 }}
                      data-testid="link-privacy-policy"
                    >
                      Leia nossa Política Completa →
                    </motion.span>
                  </Link>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div 
          className="border-t border-gray-800 pt-3 text-center text-gray-400 font-inter text-xs"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p>© 2024 Karooma. Todos os direitos reservados.</p>
        </motion.div>
      </div>
    </footer>
  );
}
