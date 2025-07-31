import { Link } from "wouter";
import { motion } from "framer-motion";
import { Rocket, Instagram, Youtube, Twitter } from "lucide-react";
import { FaTiktok } from "react-icons/fa";

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
              className="flex items-center space-x-2 mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Rocket className="text-white w-5 h-5" />
              </div>
              <h3 className="font-fredoka text-2xl gradient-text">CreativeHub</h3>
            </motion.div>
            <p className="text-gray-400 font-inter mb-4">
              Sua plataforma completa para conteúdo digital e descobertas incríveis.
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
                      <motion.a 
                        className="text-gray-400 hover:text-white transition-colors duration-300 font-inter"
                        whileHover={{ x: 5 }}
                      >
                        {link.label}
                      </motion.a>
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
          <p className="text-gray-400 font-inter text-sm">
            © 2024 CreativeHub. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {["Privacidade", "Termos", "Cookies"].map((item) => (
              <motion.a
                key={item}
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-inter"
                whileHover={{ scale: 1.05 }}
              >
                {item}
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
