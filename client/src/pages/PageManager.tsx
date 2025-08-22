import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  FileText, 
  ArrowLeft,
  Search,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PageData } from "@/types/page-builder";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function PageManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<PageData | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pages, isLoading } = useQuery<PageData[]>({
    queryKey: ['/api/pages'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete page');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({
        title: "Página Deletada",
        description: "A página foi removida com sucesso."
      });
      setDeleteDialogOpen(false);
      setPageToDelete(null);
    },
    onError: () => {
      toast({
        title: "Erro ao Deletar",
        description: "Não foi possível remover a página.",
        variant: "destructive"
      });
    }
  });

  const handleDeletePage = (page: PageData) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (pageToDelete) {
      deleteMutation.mutate(pageToDelete.id!);
    }
  };

  // Filtrar páginas baseado na busca e status
  const filteredPages = pages?.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" ||
                         (statusFilter === "published" && page.isPublished) ||
                         (statusFilter === "draft" && !page.isPublished);
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 data-testid="title-page-manager" className="text-3xl font-bold text-gray-900">
                Gerenciador de Páginas
              </h1>
              <p className="text-gray-600 mt-1">
                Crie e gerencie páginas personalizadas com o construtor visual
              </p>
            </div>
          </div>
          
          <Link href="/admin/pages/new">
            <Button data-testid="button-create-page" className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Nova Página
            </Button>
          </Link>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  data-testid="input-search-pages"
                  placeholder="Buscar páginas..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40" data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="published">Publicadas</SelectItem>
                    <SelectItem value="draft">Rascunhos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Páginas</p>
                  <p data-testid="stat-total-pages" className="text-2xl font-bold text-gray-900">
                    {pages?.length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Páginas Publicadas</p>
                  <p data-testid="stat-published-pages" className="text-2xl font-bold text-green-600">
                    {pages?.filter(p => p.isPublished).length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rascunhos</p>
                  <p data-testid="stat-draft-pages" className="text-2xl font-bold text-orange-600">
                    {pages?.filter(p => !p.isPublished).length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Páginas */}
        {filteredPages.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm || statusFilter !== "all" ? "Nenhuma página encontrada" : "Nenhuma página criada"}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== "all" 
                    ? "Tente ajustar os filtros ou criar uma nova página."
                    : "Comece criando sua primeira página personalizada."
                  }
                </p>
                <Link href="/admin/pages/new">
                  <Button data-testid="button-create-first-page">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Página
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPages.map((page, index) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card data-testid={`page-card-${page.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 data-testid={`page-title-${page.id}`} className="text-lg font-semibold text-gray-900">
                            {page.title}
                          </h3>
                          <Badge 
                            data-testid={`page-status-${page.id}`}
                            variant={page.isPublished ? "default" : "outline"}
                            className={page.isPublished ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                          >
                            {page.isPublished ? "Publicada" : "Rascunho"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>/{page.slug}</span>
                          <span>•</span>
                          <span>{page.sections?.length || 0} seções</span>
                          <span>•</span>
                          <span>
                            Atualizada {(page as any).updatedAt ? formatDistanceToNow(new Date((page as any).updatedAt), { 
                              addSuffix: true, 
                              locale: ptBR 
                            }) : 'recentemente'}
                          </span>
                        </div>
                        
                        {page.metaDescription && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {page.metaDescription}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {page.isPublished && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                            data-testid={`button-view-${page.id}`}
                          >
                            <Link href={`/${page.slug}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver
                            </Link>
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                          data-testid={`button-edit-${page.id}`}
                        >
                          <Link href={`/admin/pages/${page.id}/edit`}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Editar
                          </Link>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              data-testid={`button-menu-${page.id}`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleDeletePage(page)}
                              className="text-red-600"
                              data-testid={`menu-delete-${page.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Deletar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-page">
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Página</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a página "{pageToDelete?.title}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}