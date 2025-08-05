import { Link, useLocation } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, Menu, Rocket } from "lucide-react";
import karoomaIcon from "@assets/ICON_KAROOMA_Y_1753945353338.png";
import karoomaLogo from "@assets/LOGO_KAROOMA_TIPO_1753945361411.png";

export default function Navigation() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Início", id: "home" },
    { href: "/videos", label: "Te Entendo", id: "videos" },
    { href: "/blog", label: "Momentos Meus", id: "blog" },
    { href: "/products", label: "Facilita a Vida", id: "products" },
    { href: "/autocards", label: "Auto Cards", id: "autocards" },
    { href: "/admin/dashboard", label: "Admin", id: "admin" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <motion.nav 
      className="glassmorphism fixed top-0 w-full z-50 px-4 py-3"
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
              className="w-12 h-12 flex items-center justify-center"
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
              className="h-8 object-contain"
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
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
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
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.nav>
  );
}
