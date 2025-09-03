import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { handleStaleCache } from "@/utils/cacheUtils";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/home";
import Videos from "./pages/videos";
import About from "./pages/About";
import Blog from "./pages/blog";
import BlogPost from "./pages/blog-post";
import Products from "./pages/products";
import TestFiltersClean from "./pages/test-filters-clean";
import TestFiltersHierarchical from "./pages/test-filters-hierarchical";
import TestFiltersVertical from "./pages/test-filters-vertical";
import TestFiltersSidebar from "./pages/test-filters-sidebar";

import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminProductImport } from "./pages/AdminProductImport";
import { TempLogin } from "./pages/TempLogin";
import { Login } from "./pages/Login";
import { AdminLogin } from "./pages/AdminLogin";
import { Register } from "./pages/Register";
import Favorites from "./pages/Favorites";
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
          <Route path="/videos" component={Videos} />
          <Route path="/blog" component={Blog} />
          <Route path="/blog/:id" component={BlogPost} />
          <Route path="/products" component={Products} />
          <Route path="/filtros-hierarquia" component={TestFiltersClean} />
          <Route path="/filtros-cascata" component={TestFiltersHierarchical} />
          <Route path="/filtros-vertical" component={TestFiltersVertical} />
          <Route path="/filtros-sidebar" component={TestFiltersSidebar} />
          <Route path="/favoritos" component={Favorites} />

          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/import-products" component={AdminProductImport} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin/temp-login" component={TempLogin} />
          
          <Route path="/sobre" component={About} />
          
          {/* Dynamic Page Routes - specific slugs */}
          <Route path="/sobre2" component={PageRenderer} />
          <Route path="/facilita-a-vida" component={PageRenderer} />
          <Route path="/inicio" component={PageRenderer} />
          
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      
    </div>
  );
}

function App() {
  // Auto-detectar e corrigir cache antigo
  useEffect(() => {
    handleStaleCache();
  }, []);

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
