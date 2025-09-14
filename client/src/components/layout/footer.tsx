import { Link } from "wouter";
import { motion } from "framer-motion";
import { Rocket, Instagram, Youtube, Twitter } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import karoomaIcon from "@assets/ICON_KAROOMA_Y_1753945353338.png";
import karoomaLogo from "@assets/LOGO_KAROOMA_TIPO_1753945361411.png";

export default function Footer() {
  const footerSections = [
    {
      title: "Conteúdo",
      links: [
        { label: "Últimos Vídeos", href: "/videos" },
        { label: "Artigos do Blog", href: "/blog" },
        { label: "Tutoriais", href: "/videos?category=tutorial" },
        { label: "Reviews", href: "/videos?category=review" },
      ]
    },
    {
      title: "Produtos",
      links: [
        { label: "Tecnologia", href: "/products?category=tech" },
        { label: "Design", href: "/products?category=design" },
        { label: "Cursos Online", href: "/products?category=courses" },
        { label: "Equipamentos", href: "/products?category=equipment" },
      ]
    },
    {
      title: "Contato",
      links: [
        { label: "Sobre Nós", href: "/about" },
        { label: "contato@karooma.life", href: "mailto:contato@karooma.life" },
        { label: "Colaborações", href: "/contact" },
        { label: "Suporte", href: "/support" },
        { label: "Parcerias", href: "/partnerships" },
      ]
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: FaTiktok, href: "#", label: "TikTok", isReactIcon: true },
  ];

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <motion.div 
              className="flex items-center space-x-3 mb-4"
              whileHover={{ scale: 1.05 }}
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
            <p className="text-gray-400 font-inter mb-4">
              Sua plataforma completa para conteúdo digital e descobertas incríveis com Karooma.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="text-gray-400 hover:text-pink-500 transition-colors duration-300"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.isReactIcon ? (
                    <social.icon className="text-xl" />
                  ) : (
                    <social.icon className="w-5 h-5" />
                  )}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="font-poppins font-bold text-lg mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>
                      <motion.span 
                        className="text-gray-400 hover:text-white transition-colors duration-300 font-inter cursor-pointer"
                        whileHover={{ x: 5 }}
                      >
                        {link.label}
                      </motion.span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Copyright Section */}
        <motion.div 
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          <div className="text-gray-400 font-inter text-sm space-y-1">
            <p>© 2024 Karooma. Todos os direitos reservados.</p>
            <p className="text-xs">💜 Como associada da Amazon, a Karooma recebe uma comissão quando você compra produtos que recomendamos (sem custo extra para você!).</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link 
                href="/privacidade" 
                className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-inter"
              >
                Privacidade
              </Link>
            </motion.div>
            <motion.a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-inter"
              whileHover={{ scale: 1.05 }}
            >
              Termos
            </motion.a>
            <motion.button
              onClick={() => {
                // Dispara evento customizado para reabrir banner de cookies
                window.dispatchEvent(new CustomEvent("reopen-cookie-banner"));
              }}
              className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-inter cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              Cookies
            </motion.button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
