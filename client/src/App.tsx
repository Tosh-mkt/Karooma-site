import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/home";
import Videos from "./pages/videos";
import About from "./pages/About";
import Blog from "./pages/blog";
import BlogPost from "./pages/blog-post";
import Products from "./pages/products";
import TestFiltersClean from "./pages/test-filters-clean";

import { AdminDashboard } from "./pages/AdminDashboard";
import { TempLogin } from "./pages/TempLogin";
import { Login } from "./pages/Login";
import { AdminLogin } from "./pages/AdminLogin";
import { Register } from "./pages/Register";
import Favorites from "./pages/Favorites";
import { PageManager } from "./pages/PageManager";
import { PageBuilder } from "./pages/PageBuilder";
import { PageRenderer } from "./components/PageRenderer";

import NotFound from "./pages/not-found";
import Navigation from "./components/layout/navigation";
import Footer from "./components/layout/footer";
import { AutoNotification } from "./components/content/auto-notification";
import { motion } from "framer-motion";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <AutoNotification />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/videos" component={About} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:id" component={BlogPost} />
          <Route path="/products" component={Products} />
          <Route path="/filtros-hierarquia" component={TestFiltersClean} />
          <Route path="/favoritos" component={Favorites} />

          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/pages" component={PageManager} />
          <Route path="/admin/pages/new" component={PageBuilder} />
          <Route path="/admin/pages/:id/edit" component={PageBuilder} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin/temp-login" component={TempLogin} />
          
          {/* Dynamic Page Routes - specific slugs */}
          <Route path="/sobre" component={PageRenderer} />
          <Route path="/sobre2" component={PageRenderer} />
          <Route path="/momentos-meus" component={PageRenderer} />
          <Route path="/facilita-a-vida" component={PageRenderer} />
          <Route path="/inicio" component={PageRenderer} />
          
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      
      {/* Floating Action Buttons */}
      <motion.div 
        className="fixed bottom-8 right-8 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white w-16 h-16 rounded-full shadow-2xl animate-pulse-slow">
          <i className="fas fa-comments text-xl"></i>
        </button>
      </motion.div>

      <motion.div 
        className="fixed bottom-8 left-8 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
      >
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="glassmorphism text-gray-700 w-12 h-12 rounded-full"
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      </motion.div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="custom-scrollbar">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
