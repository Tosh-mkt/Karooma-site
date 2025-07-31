import { Link, useLocation } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Search, Menu, Rocket } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home", id: "home" },
    { href: "/videos", label: "Vídeos", id: "videos" },
    { href: "/blog", label: "Blog", id: "blog" },
    { href: "/products", label: "Produtos", id: "products" },
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
            className="flex items-center space-x-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Rocket className="text-white text-lg" />
            </motion.div>
            <h1 className="font-fredoka text-2xl gradient-text">CreativeHub</h1>
          </motion.div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link key={item.id} href={item.href}>
              <motion.a
                className={`font-poppins transition-colors duration-300 ${
                  isActive(item.href) 
                    ? "text-pink-500 font-semibold" 
                    : "text-gray-700 hover:text-pink-500"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {item.label}
              </motion.a>
            </Link>
          ))}
        </div>
        
        {/* Search and Mobile Menu */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <Input
              type="text"
              placeholder="Buscar..."
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
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-full"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                </div>
                
                {navItems.map((item) => (
                  <Link key={item.id} href={item.href}>
                    <motion.a
                      className={`block font-poppins text-lg transition-colors duration-300 ${
                        isActive(item.href) 
                          ? "text-pink-500 font-semibold" 
                          : "text-gray-700"
                      }`}
                      onClick={() => setIsOpen(false)}
                      whileHover={{ x: 10 }}
                    >
                      {item.label}
                    </motion.a>
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
