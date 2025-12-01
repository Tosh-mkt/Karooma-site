import { Link, useLocation } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, Menu, Rocket, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import karoomaIcon from "@assets/ICON_KAROOMA_Y_1753945353338.png";
import karoomaLogo from "@assets/LOGO_KAROOMA_TIPO_1753945361411.png";

export default function Navigation() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin, isAuthenticated, user, setUser } = useAuth();

  const navItems = [
    { href: "/", label: "Início", id: "home" },
    { href: "/sobre", label: "Sobre", id: "about" },
    { href: "/blog", label: "Blog", id: "blog" },
    { href: "/guias", label: "Guias", id: "guides" },
    { href: "/missoes", label: "Missões", id: "missions" },
    { href: "/diagnostico", label: "Diagnóstico", id: "diagnostic" },
    { href: "/products", label: "Nossa Loja", id: "life-hacks" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <motion.nav 
      className="glassmorphism fixed top-0 w-full z-50 px-4 py-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="w-14 h-14 md:w-12 md:h-12 flex items-center justify-center"
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={karoomaIcon} 
                alt="Karooma Icon" 
                className="w-full h-full object-contain"
              />
            </motion.div>
            <motion.img 
              src={karoomaLogo} 
              alt="Karooma" 
              className="h-8.5 md:h-6.5 object-contain"
              whileHover={{ scale: 1.02 }}
            />
          </motion.div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link key={item.id} href={item.href}>
              <motion.span
                className={`font-outfit font-medium transition-colors duration-300 cursor-pointer ${
                  isActive(item.href) 
                    ? "text-pink-500 font-semibold" 
                    : "text-gray-700 hover:text-pink-500"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
              </motion.span>
            </Link>
          ))}
        </div>
        
        {/* Auth Button (conditional) - Desktop only */}
        <div className="hidden md:block">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              {/* User Info */}
              <div className="text-sm">
                <span className="text-gray-600">Olá, </span>
                <span className="font-medium text-purple-600">
                  {user?.firstName || user?.email || 'Usuário'}
                </span>
                {isAdmin && (
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    Admin
                  </span>
                )}
              </div>
              
              {isAdmin && (
                <Link href="/admin/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:scale-105 transition-all duration-300"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Painel
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-50"
                onClick={async () => {
                  try {
                    // Call logout API to destroy session
                    await fetch('/api/logout', { method: 'POST' });
                  } catch (error) {
                    console.error('Erro ao fazer logout:', error);
                  }
                  // Clear user data
                  setUser(null);
                  window.location.href = '/';
                }}
              >
                Sair
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-purple-200 hover:bg-purple-50"
              onClick={() => window.location.href = '/login'}
            >
              <Shield className="w-4 h-4 mr-2" />
              Entrar
            </Button>
          )}
        </div>

        {/* Search and Mobile Menu */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <Input
              type="text"
              placeholder="O que você precisa?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/30 focus:ring-2 focus:ring-pink-500 transition-all duration-300"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          </div>
          
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden w-15 h-15 hover:bg-pink-100/50"
              >
                <Menu className="h-9 w-9 text-gray-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white/90 backdrop-blur-md">
              <div className="flex flex-col space-y-6 mt-8">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="O que você precisa?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-full"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                </div>
                
                {navItems.map((item) => (
                  <Link key={item.id} href={item.href}>
                    <motion.span
                      className={`block font-poppins text-lg transition-colors duration-300 cursor-pointer ${
                        isActive(item.href) 
                          ? "text-pink-500 font-semibold" 
                          : "text-gray-700"
                      }`}
                      onClick={() => setIsOpen(false)}
                      whileHover={{ x: 10 }}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                ))}
                
                {/* Auth buttons in mobile menu */}
                {isAuthenticated ? (
                  <div className="space-y-3">
                    {/* User Info Mobile */}
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-gray-600">Conectado como:</div>
                      <div className="font-medium text-purple-600">
                        {user?.firstName || user?.email || 'Usuário'}
                      </div>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Administrador
                        </span>
                      )}
                    </div>
                    
                    {isAdmin && (
                      <Link href="/admin/dashboard">
                        <motion.div
                          className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg"
                          onClick={() => setIsOpen(false)}
                          whileHover={{ x: 10 }}
                        >
                          <Shield className="w-5 h-5" />
                          <span className="font-poppins text-lg font-medium">Painel Admin</span>
                        </motion.div>
                      </Link>
                    )}
                    <motion.div
                      className="flex items-center space-x-2 border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={async () => {
                        setIsOpen(false);
                        try {
                          // Call logout API to destroy session
                          await fetch('/api/logout', { method: 'POST' });
                        } catch (error) {
                          console.error('Erro ao fazer logout:', error);
                        }
                        // Clear user data
                        setUser(null);
                        window.location.href = '/';
                      }}
                      whileHover={{ x: 10 }}
                    >
                      <span className="font-poppins text-lg font-medium">Sair</span>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div
                    className="flex items-center space-x-2 border-2 border-purple-200 text-purple-700 px-4 py-3 rounded-lg hover:bg-purple-50 cursor-pointer"
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/login';
                    }}
                    whileHover={{ x: 10 }}
                  >
                    <Shield className="w-5 h-5" />
                    <span className="font-poppins text-lg font-medium">Entrar</span>
                  </motion.div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
