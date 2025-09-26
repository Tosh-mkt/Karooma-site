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
import Landing from "./pages/landing";
import TestFiltersClean from "./pages/test-filters-clean";
import TestFiltersHierarchical from "./pages/test-filters-hierarchical";
import TestFiltersVertical from "./pages/test-filters-vertical";
import TestFiltersSidebar from "./pages/test-filters-sidebar";
import EbookTest from "./pages/ebook-test";
import FlipbookOrganizacao from "./pages/flipbook-organizacao";
import FlipbookAlimentacao from "./pages/flipbook-alimentacao";
import GeneratedFlipbookPage from "./pages/generated-flipbook";
import FlipbookUsersAdmin from "./pages/admin/flipbook-users";
import FlipbookThemesAdmin from "./pages/admin/flipbook-themes";
import DemoFlipbookCapture from "./pages/demo-flipbook-capture";
import FlipbookTest from "./pages/flipbook-test";

import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminProductImport } from "./pages/AdminProductImport";
import { AdminAutomation } from "./pages/AdminAutomation";
import AdminCuradoriaKarooma from "./pages/AdminCuradoriaKarooma";
import { TempLogin } from "./pages/TempLogin";
import { Login } from "./pages/Login";
import { AdminLogin } from "./pages/AdminLogin";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import Favorites from "./pages/Favorites";
import { PageRenderer } from "./components/PageRenderer";
import PrivacyPolicy from "./pages/PrivacyPolicy";

import NotFound from "./pages/not-found";
import Navigation from "./components/layout/navigation";
import Footer from "./components/layout/footer";
import { LandingLayout } from "./components/layout/landing-layout";
import { AutoNotification } from "./components/content/auto-notification";
import { CookieConsent } from "./components/CookieConsent";
import { ConsentProvider } from "./contexts/ConsentContext";
import { motion } from "framer-motion";

function Router() {
  return (
    <Switch>
      {/* Landing Pages - Layout Limpo (sem header/footer) */}
      <Route path="/landing">
        <LandingLayout>
          <Landing />
        </LandingLayout>
      </Route>
      <Route path="/guia-mae-ocupada">
        <LandingLayout>
          <PageRenderer />
        </LandingLayout>
      </Route>
      
      {/* Flipbooks - Layout Fullscreen (sem header/footer) */}
      <Route path="/flipbook-organizacao">
        <FlipbookOrganizacao />
      </Route>
      <Route path="/flipbook-alimentacao">
        <FlipbookAlimentacao />
      </Route>
      <Route path="/generated-flipbook/:flipbookId">
        <GeneratedFlipbookPage />
      </Route>
      <Route path="/flipbook-test">
        <FlipbookTest />
      </Route>

      {/* Todas as outras páginas - Layout Normal */}
      <Route>
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
              <Route path="/admin/automation" component={AdminAutomation} />
              <Route path="/admin/curadoria-karooma" component={AdminCuradoriaKarooma} />
              <Route path="/admin/flipbook-users" component={FlipbookUsersAdmin} />
              <Route path="/admin/flipbook-themes" component={FlipbookThemesAdmin} />
              <Route path="/demo/flipbook-capture" component={DemoFlipbookCapture} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Register} />
              <Route path="/forgot-password" component={ForgotPassword} />
              <Route path="/reset-password" component={ResetPassword} />
              <Route path="/admin/login" component={AdminLogin} />
              <Route path="/admin/temp-login" component={TempLogin} />
              
              <Route path="/sobre" component={About} />
              <Route path="/privacidade" component={PrivacyPolicy} />
              <Route path="/ebook-test" component={EbookTest} />
              
              {/* Dynamic Page Routes - specific slugs */}
              <Route path="/sobre2" component={PageRenderer} />
              <Route path="/facilita-a-vida" component={PageRenderer} />
              <Route path="/inicio" component={PageRenderer} />
              
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
        </div>
      </Route>
    </Switch>
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
        <ConsentProvider>
          <div className="custom-scrollbar">
            <Router />
            <CookieConsent />
            <Toaster />
          </div>
        </ConsentProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
