import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSSE } from "@/hooks/useSSE";
import { useAuth } from "@/hooks/useAuth";
import { isForbiddenError, isUnauthorizedError } from "@/lib/authUtils";
import {
  BarChart3, Users, Settings, Zap, Database, Eye, ExternalLink, Star, TrendingUp,
  Plus, Edit, Trash2, Save, RefreshCw, Shield, Activity, Wifi, WifiOff, LogIn, Layout,
  Bell, Mail, Clock, Filter, Download
} from "lucide-react";
import type { Product, Content } from "@shared/schema";
import { NewProductModal } from "@/components/admin/NewProductModal";
import { EditProductModal } from "@/components/admin/EditProductModal";
import { CreatePostModal } from "@/components/admin/CreatePostModal";
import { EditPostModal } from "@/components/admin/EditPostModal";
import { EditPageContentModal } from "@/components/admin/EditPageContentModal";
import { AdminLogin } from "@/components/AdminLogin";

// Dashboard Overview Component
function DashboardOverview() {
  const { events, isConnected } = useSSE();
  
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });



  const stats = {
    totalProducts: products?.length || 0,
    featuredProducts: products?.filter(p => p.featured).length || 0,
    recentProducts: products?.filter(p => {
      if (!p.createdAt) return false;
      const date = new Date(p.createdAt);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return date > dayAgo;
    }).length || 0,
    systemStatus: isConnected
  };

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glassmorphism border-0">
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                <Database className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-blue-500" />
                <span className="hidden sm:inline">Total de Produtos</span>
                <span className="sm:hidden">Produtos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Todos os produtos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glassmorphism border-0">
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                <Star className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-yellow-500" />
                <span className="hidden sm:inline">Em Destaque</span>
                <span className="sm:hidden">Destaque</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.featuredProducts}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Produtos destacados</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glassmorphism border-0">
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
                <span className="hidden sm:inline">Recentes (24h)</span>
                <span className="sm:hidden">Novos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl md:text-2xl font-bold">{stats.recentProducts}</div>
              <p className="text-xs text-muted-foreground hidden sm:block">Novos produtos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glassmorphism border-0">
            <CardHeader className="pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-sm font-medium flex items-center">
                {stats.systemStatus ? (
                  <Wifi className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
                ) : (
                  <WifiOff className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-red-500" />
                )}
                Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg md:text-2xl font-bold">
                {stats.systemStatus ? "ON" : "OFF"}
                <span className="hidden sm:inline">
                  {stats.systemStatus ? "LINE" : "LINE"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Status em tempo real
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-500" />
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Eventos em tempo real via SSE
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {events.slice(-5).reverse().map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-sm font-medium">
                        {event.type === 'newProduct' ? 'Novo produto criado' : 'Lote processado'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    {event.type === 'newProduct' ? 'NOVO' : 'EVENTO'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma atividade recente</p>
              <p className="text-xs">Eventos aparecerão aqui em tempo real</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Products Management Component
function ProductsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductModalOpen, setNewProductModalOpen] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ productId, featured }: { productId: string; featured: boolean }) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured }),
      });
      if (!response.ok) throw new Error('Falha ao atualizar produto');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Produto atualizado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: () => {
      toast({ title: "Erro ao atualizar produto", variant: "destructive" });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao deletar produto');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Produto deletado com sucesso!" });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: () => {
      toast({ title: "Erro ao deletar produto", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-base md:text-lg font-semibold">Gerenciar Produtos</h3>
        <Button 
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-sm w-full sm:w-auto"
          onClick={() => setNewProductModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <NewProductModal 
        open={newProductModalOpen}
        onOpenChange={setNewProductModalOpen}
      />

      <EditProductModal 
        product={editingProduct}
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      />

      <div className="grid gap-4">
        {products?.map((product) => (
          <Card key={product.id} className="glassmorphism border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold">{product.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      R$ {product.currentPrice} • {product.category}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {product.featured && (
                        <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                          Destaque
                        </Badge>
                      )}
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`featured-${product.id}`} className="text-sm">
                      Destaque
                    </Label>
                    <Switch
                      id={`featured-${product.id}`}
                      checked={product.featured || false}
                      onCheckedChange={(checked) =>
                        toggleFeatured.mutate({ productId: product.id, featured: checked })
                      }
                    />
                  </div>

                  <Button size="sm" variant="outline" asChild>
                    <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingProduct(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteProduct.mutate(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Main Admin Dashboard Component
export function AdminDashboard() {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();

  // No automatic redirects - show login form instead

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    return <AdminLogin onLoginSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
              <h1 className="font-outfit font-bold text-2xl md:text-4xl gradient-text">
                Painel Administrativo
              </h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-500">Bem-vinda,</p>
                <p className="font-semibold text-sm md:text-base">{user?.firstName || user?.email}</p>
              </div>
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="text-xs md:text-sm"
              >
                Sair
              </Button>
            </div>
          </div>
          <p className="text-gray-600 font-poppins text-sm md:text-lg">
            Gerencie todo o conteúdo e configurações do site Karooma
          </p>
        </motion.div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          {/* Mobile: Dropdown style tabs */}
          <div className="md:hidden">
            <TabsList className="grid w-full grid-cols-2 glassmorphism">
              <TabsTrigger value="dashboard" className="flex items-center justify-center space-x-1 text-xs">
                <BarChart3 className="w-3 h-3" />
                <span className="hidden xs:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="flex items-center justify-center space-x-1 text-xs">
                <Mail className="w-3 h-3" />
                <span className="hidden xs:inline">Newsletter</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Secondary row for mobile */}
            <div className="mt-2">
              <TabsList className="grid w-full grid-cols-3 glassmorphism">
                <TabsTrigger value="products" className="flex items-center justify-center space-x-1 text-xs">
                  <Database className="w-3 h-3" />
                  <span className="hidden xs:inline">Produtos</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center justify-center space-x-1 text-xs">
                  <Edit className="w-3 h-3" />
                  <span className="hidden xs:inline">Conteúdo</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center justify-center space-x-1 text-xs">
                  <Shield className="w-3 h-3" />
                  <span className="hidden xs:inline">Config</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
          
          {/* Desktop: Original layout */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-7 glassmorphism">
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Newsletter</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Produtos</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Conteúdo</span>
              </TabsTrigger>
              <TabsTrigger value="pages" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Páginas</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Configurações</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="newsletter">
            <NewsletterManagement />
          </TabsContent>

          <TabsContent value="products">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="content">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="pages">
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layout className="w-5 h-5 mr-2" />
                  Gerenciamento de Páginas
                </CardTitle>
                <CardDescription>
                  Construa páginas personalizadas com o editor visual drag-and-drop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Layout className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Editor Visual de Páginas</h3>
                  <p className="text-gray-600 mb-6">
                    Crie páginas personalizadas com seções arrastar-e-soltar, templates prontos e editor visual em tempo real.
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/admin/pages'}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    <Layout className="w-4 h-4 mr-2" />
                    Abrir Gerenciador
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle>Analytics & Relatórios</CardTitle>
                <CardDescription>
                  Estatísticas de visitantes, cliques e conversões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle>Configurações do Site</CardTitle>
                <CardDescription>
                  Configurações gerais, SEO e integrações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Configurações em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Newsletter Management Component
function NewsletterManagement() {
  const { events, isConnected } = useSSE();
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    totalWeek: 0,
    totalMonth: 0,
    averagePerDay: 0
  });

  // Filter newsletter events from SSE
  useEffect(() => {
    const newsletterEvents = events.filter(event => event.type === 'newsletter-subscription');
    setNewsletters(newsletterEvents.slice(-50)); // Keep last 50
    
    // Update stats
    const now = new Date();
    const todayCount = newsletterEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate.toDateString() === now.toDateString();
    }).length;
    
    const weekCount = newsletterEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return (now.getTime() - eventDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
    }).length;
    
    const monthCount = newsletterEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate.getMonth() === now.getMonth() && 
             eventDate.getFullYear() === now.getFullYear();
    }).length;
    
    setStats({
      totalToday: todayCount,
      totalWeek: weekCount,
      totalMonth: monthCount,
      averagePerDay: weekCount / 7
    });
  }, [events]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <Card className="glassmorphism border-0">
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium flex items-center">
              <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-blue-500" />
              Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats.totalToday}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">inscrições</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-0">
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium flex items-center">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
              <span className="hidden sm:inline">Esta Semana</span>
              <span className="sm:hidden">Semana</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats.totalWeek}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">inscrições</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-0">
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium flex items-center">
              <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-purple-500" />
              <span className="hidden sm:inline">Este Mês</span>
              <span className="sm:hidden">Mês</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl md:text-2xl font-bold">{stats.totalMonth}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">inscrições</p>
          </CardContent>
        </Card>

        <Card className="glassmorphism border-0">
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium flex items-center">
              {isConnected ? (
                <Wifi className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-green-500" />
              ) : (
                <WifiOff className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 text-red-500" />
              )}
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg md:text-2xl font-bold">
              {isConnected ? "ON" : "OFF"}
              <span className="hidden sm:inline">
                {isConnected ? "LINE" : "LINE"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Monitoramento em tempo real
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Notifications */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              <CardTitle className="text-sm md:text-base">Inscrições em Tempo Real</CardTitle>
              {newsletters.length > 0 && (
                <Badge variant="secondary" className="text-xs">{newsletters.length}</Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Filter className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Filtrar</span>
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </div>
          </div>
          <CardDescription className="text-xs md:text-sm">
            Últimas {newsletters.length} inscrições na newsletter
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="max-h-[400px] md:max-h-[500px] overflow-y-auto space-y-3 md:space-y-4">
            {newsletters.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Mail className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Aguardando inscrições...</p>
                <p className="text-sm text-center">
                  As novas inscrições aparecerão aqui em tempo real
                </p>
              </div>
            ) : (
              newsletters.map((newsletter, index) => (
                <motion.div
                  key={`${newsletter.data?.email}-${newsletter.timestamp}`}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {newsletter.data?.name ? newsletter.data.name.charAt(0).toUpperCase() : newsletter.data?.email?.charAt(0).toUpperCase()}
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {newsletter.data?.name || 'Usuário Anônimo'}
                          </h4>
                          <p className="text-sm text-gray-600">{newsletter.data?.email}</p>
                        </div>
                      </div>
                      
                      {newsletter.data?.categories?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {newsletter.data.categories.slice(0, 3).map((category: string) => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {newsletter.data.categories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{newsletter.data.categories.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(newsletter.timestamp)}
                        </div>
                        
                        {newsletter.data?.source && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {newsletter.data.source}
                          </div>
                        )}
                        
                        {newsletter.data?.leadMagnet && (
                          <Badge variant="outline" className="text-xs">
                            {newsletter.data.leadMagnet}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {index === 0 && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Novo
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Content Management Component
function ContentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blogPosts, isLoading } = useQuery<Content[]>({
    queryKey: ["/api/content/blog"],
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/content/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Falha ao deletar post");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post deletado",
        description: "O post foi removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/content/blog"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao deletar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <Card className="glassmorphism border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Carregando posts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Gestão de Blog - Estrutura Moderna
              </CardTitle>
              <CardDescription>
                Crie e gerencie posts com o padrão Karooma de alto impacto
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <CreatePostModal />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!blogPosts || blogPosts.length === 0 ? (
            <div className="text-center py-12">
              <Edit className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum post criado ainda
              </h3>
              <p className="text-gray-500 mb-6">
                Comece criando seu primeiro post com a estrutura moderna de alto impacto
              </p>
              <CreatePostModal 
                trigger={
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Post
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {blogPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge 
                          variant={post.featured ? "default" : "outline"}
                          className={post.featured ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
                        >
                          {post.category}
                        </Badge>
                        {post.featured && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                            <Star className="w-3 h-3 mr-1" />
                            Destaque
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {post.views || 0} visualizações
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-1 line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {post.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Criado em {post.createdAt ? formatDate(post.createdAt.toString()) : "Data não disponível"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/blog/${post.id}`, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <EditPostModal 
                        postId={post.id}
                        trigger={
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePostMutation.mutate(post.id)}
                        disabled={deletePostMutation.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas de Conteúdo */}
      {blogPosts && blogPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glassmorphism border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Posts</p>
                  <p className="text-2xl font-bold">{blogPosts.length}</p>
                </div>
                <Edit className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glassmorphism border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Posts em Destaque</p>
                  <p className="text-2xl font-bold">
                    {blogPosts.filter(p => p.featured).length}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="glassmorphism border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Views</p>
                  <p className="text-2xl font-bold">
                    {blogPosts.reduce((total, post) => total + (post.views || 0), 0)}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Page Management Component
function PageManagement() {
  const { data: heroContent, isLoading } = useQuery<Content>({
    queryKey: ["/api/content/page/homepage-hero"],
  });

  if (isLoading) {
    return (
      <Card className="glassmorphism border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Carregando conteúdo...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Gestão de Páginas Estáticas
              </CardTitle>
              <CardDescription>
                Edite textos e conteúdos das páginas principais do site
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Página Inicial - Hero</span>
                  <Badge variant="secondary">homepage-hero</Badge>
                </CardTitle>
                <CardDescription>
                  Texto principal que aparece no topo da página inicial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {heroContent ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Título Principal:</Label>
                      <p className="text-lg font-bold text-gray-900 bg-white/50 p-3 rounded-lg">
                        {heroContent.title}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Subtítulo:</Label>
                      <p className="text-base text-gray-800 bg-white/50 p-3 rounded-lg">
                        {heroContent.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Texto de Apoio:</Label>
                      <p className="text-base text-gray-700 bg-white/50 p-3 rounded-lg">
                        {heroContent.content}
                      </p>
                    </div>
                    <div className="flex justify-end pt-2">
                      <EditPageContentModal 
                        pageContent={heroContent}
                        trigger={
                          <Button variant="default" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Textos
                          </Button>
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Conteúdo não encontrado
                    </h3>
                    <p className="text-gray-500 mb-6">
                      O conteúdo da página inicial ainda não foi criado
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}