import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Mail, Lock, Info, Sparkles } from "lucide-react";
import karoomaIcon from "@assets/ICON_KAROOMA_Y_1753945353338.png";
import karoomaLogo from "@assets/LOGO_KAROOMA_TIPO_1753945361411.png";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Logo Section */}
        <motion.div 
          className="flex items-center justify-center space-x-3 mb-10"
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {/* Empresa Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="font-poppins font-bold text-lg mb-4 text-pink-400">
              Empresa
            </h4>
            
            <div className="flex items-start space-x-3 text-gray-300">
              <MapPin className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
              <div className="font-inter text-sm leading-relaxed">
                <p>Rua Comendador Torlogo Dauntre 74</p>
                <p>Sala 1207</p>
                <p>Campinas, 13025-270</p>
                <p>São Paulo, Brasil</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-300">
              <Mail className="w-5 h-5 text-pink-400 flex-shrink-0" />
              <a 
                href="mailto:contato@karooma.life"
                className="font-inter text-sm hover:text-pink-400 transition-colors duration-300"
              >
                contato@karooma.life
              </a>
            </div>
          </motion.div>

          {/* Ajuda Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="font-poppins font-bold text-lg mb-4 text-pink-400">
              Precisa de Ajuda?
            </h4>
            
            <Link href="/#custom-content">
              <motion.div
                className="flex items-center space-x-3 text-gray-300 hover:text-pink-400 transition-colors duration-300 cursor-pointer group"
                whileHover={{ x: 5 }}
              >
                <Sparkles className="w-5 h-5 text-pink-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-inter text-sm">
                  Qual assunto te ajudaria?
                </span>
              </motion.div>
            </Link>

            <Link href="/about">
              <motion.div
                className="flex items-center space-x-3 text-gray-300 hover:text-pink-400 transition-colors duration-300 cursor-pointer group"
                whileHover={{ x: 5 }}
              >
                <Info className="w-5 h-5 text-pink-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="font-inter text-sm">
                  Sobre a Karooma
                </span>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Privacy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-t border-gray-800 pt-8 mb-8"
        >
          <div className="flex items-start space-x-3 mb-4">
            <Lock className="w-5 h-5 text-pink-400 flex-shrink-0 mt-1" />
            <div className="space-y-3">
              <h5 className="font-poppins font-bold text-pink-400">
                Sua privacidade é nossa prioridade.
              </h5>
              <p className="text-gray-300 font-inter text-sm leading-relaxed max-w-3xl">
                Respeitamos seus dados e os usamos apenas para melhorar sua jornada em nosso site. 
                Seja para uma experiência de pesquisa mais fluida ou para receber conteúdos que 
                realmente interessam a você. Não vendemos, alugamos ou compartilhamos suas 
                informações com ninguém.
              </p>
              <Link href="/privacidade">
                <motion.span
                  className="inline-flex items-center text-pink-400 hover:text-pink-300 font-inter text-sm font-medium cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  Leia nossa Política Completa →
                </motion.span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Copyright */}
        <motion.div 
          className="text-center text-gray-400 font-inter text-sm"
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
