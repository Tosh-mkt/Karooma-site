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
  Plus, Edit, Trash2, Save, RefreshCw, Shield, Activity, Wifi, WifiOff, LogIn
} from "lucide-react";
import type { Product, Content } from "@shared/schema";
import { NewProductModal } from "@/components/admin/NewProductModal";
import { CreatePostModal } from "@/components/admin/CreatePostModal";
import { EditPostModal } from "@/components/admin/EditPostModal";

// Dashboard Overview Component
function DashboardOverview() {
  const { events, isConnected } = useSSE();
  
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: automationStatus } = useQuery({
    queryKey: ["/api/automation/products/status"],
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
    automationActive: isConnected
  };

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glassmorphism border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Database className="w-4 h-4 mr-2 text-blue-500" />
                Total de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Todos os produtos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glassmorphism border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                Em Destaque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.featuredProducts}</div>
              <p className="text-xs text-muted-foreground">Produtos destacados</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glassmorphism border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                Recentes (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentProducts}</div>
              <p className="text-xs text-muted-foreground">Novos produtos</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glassmorphism border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                {stats.automationActive ? (
                  <Wifi className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 mr-2 text-red-500" />
                )}
                Automação N8N
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.automationActive ? "ATIVA" : "OFF"}
              </div>
              <p className="text-xs text-muted-foreground">
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
                    {event.type === 'newProduct' ? 'N8N' : 'BATCH'}
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gerenciar Produtos</h3>
        <Button 
          className="bg-gradient-to-r from-purple-500 to-pink-500"
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Acesso Restrito",
        description: "Você precisa fazer login para acessar o painel administrativo.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 2000);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas administradores podem acessar este painel.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
      return;
    }
  }, [isAuthenticated, isAdmin, isLoading, toast]);

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

  if (!isAuthenticated) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="glassmorphism border-0 max-w-md">
          <CardContent className="p-8 text-center">
            <LogIn className="w-12 h-12 mx-auto mb-4 text-purple-600" />
            <h2 className="text-xl font-outfit font-bold mb-2">Login Necessário</h2>
            <p className="text-gray-600 mb-4">
              Você será redirecionado para o login em instantes...
            </p>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="glassmorphism border-0 max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-outfit font-bold mb-2">Acesso Restrito</h2>
            <p className="text-gray-600 mb-4">
              Apenas administradores podem acessar este painel.
            </p>
            <Button 
              onClick={() => window.location.href = "/"}
              variant="outline"
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <h1 className="font-outfit font-bold text-4xl gradient-text">
                Painel Administrativo
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Bem-vinda,</p>
                <p className="font-semibold">{user?.firstName || user?.email}</p>
              </div>
              {user?.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full"
                />
              )}
              <Button
                variant="outline"
                onClick={() => window.location.href = "/api/logout"}
              >
                Sair
              </Button>
            </div>
          </div>
          <p className="text-gray-600 font-poppins text-lg">
            Gerencie todo o conteúdo e configurações do site Karooma
          </p>
        </motion.div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 glassmorphism">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Conteúdo</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="products">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="content">
            <ContentManagement />
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
            <CreatePostModal />
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
                        Criado em {post.createdAt ? formatDate(post.createdAt) : "Data não disponível"}
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