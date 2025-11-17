import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, ExternalLink, Shirt } from "lucide-react";
import type { FeaturedApparel } from "@shared/schema";

export default function AdminApparel() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingApparel, setEditingApparel] = useState<FeaturedApparel | null>(null);

  const { data: apparelList, isLoading } = useQuery<FeaturedApparel[]>({
    queryKey: ["/api/apparel"],
  });

  const { data: missions } = useQuery<any[]>({
    queryKey: ["/api/missions"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/apparel", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apparel"] });
      toast({ title: "Produto de roupa criado com sucesso!" });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar produto", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiRequest(`/api/apparel/${data.id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apparel"] });
      toast({ title: "Produto atualizado com sucesso!" });
      setEditingApparel(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar produto", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest(`/api/apparel/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apparel"] });
      toast({ title: "Produto excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir produto", description: error.message, variant: "destructive" });
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    price: "",
    montinkUrl: "",
    category: "",
    isFeatured: false,
    relatedMissionSlugs: [] as string[],
    sortOrder: 0,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      price: "",
      montinkUrl: "",
      category: "",
      isFeatured: false,
      relatedMissionSlugs: [],
      sortOrder: 0,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      price: formData.price,
      sortOrder: Number(formData.sortOrder),
    };

    if (editingApparel) {
      updateMutation.mutate({ ...payload, id: editingApparel.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (apparel: FeaturedApparel) => {
    setEditingApparel(apparel);
    setFormData({
      title: apparel.title,
      description: apparel.description || "",
      imageUrl: apparel.imageUrl,
      price: apparel.price,
      montinkUrl: apparel.montinkUrl,
      category: apparel.category || "",
      isFeatured: apparel.isFeatured || false,
      relatedMissionSlugs: apparel.relatedMissionSlugs || [],
      sortOrder: apparel.sortOrder || 0,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      deleteMutation.mutate(id);
    }
  };

  const categories = [
    "humor",
    "empowerment",
    "motherhood",
    "self-care",
    "mindfulness"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Gerenciar Produtos Montink
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Curadoria de produtos de roupa que expressam jornadas emocionais
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingApparel(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingApparel ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
                <DialogDescription>
                  Adicione produtos da Montink que expressam sentimentos e jornadas das mães
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Produto *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder='Ex: "Café antes de falar"'
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ex: Camiseta oversized que expressa o humor materno"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL da Imagem *</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://..."
                    required
                  />
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-40 h-40 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImagem não encontrada%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="Ex: 89.90"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="montinkUrl">URL da Montink *</Label>
                  <Input
                    id="montinkUrl"
                    value={formData.montinkUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, montinkUrl: e.target.value }))}
                    placeholder="https://www.montink.com.br/..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Ordem de Exibição</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isFeatured: !!checked }))
                    }
                  />
                  <Label htmlFor="isFeatured" className="cursor-pointer">
                    Produto em destaque (aparece na página /produtos)
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Missões Relacionadas</Label>
                  <p className="text-sm text-gray-500">Selecione as missões onde este produto deve aparecer</p>
                  <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-4">
                    {missions?.map(mission => (
                      <div key={mission.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`mission-${mission.slug}`}
                          checked={formData.relatedMissionSlugs.includes(mission.slug)}
                          onCheckedChange={(checked) => {
                            setFormData(prev => ({
                              ...prev,
                              relatedMissionSlugs: checked
                                ? [...prev.relatedMissionSlugs, mission.slug]
                                : prev.relatedMissionSlugs.filter(s => s !== mission.slug)
                            }));
                          }}
                        />
                        <Label htmlFor={`mission-${mission.slug}`} className="cursor-pointer text-sm">
                          {mission.title}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingApparel(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {editingApparel ? "Salvar Alterações" : "Criar Produto"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {apparelList?.map(apparel => (
            <Card key={apparel.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {apparel.imageUrl && (
                      <img 
                        src={apparel.imageUrl} 
                        alt={apparel.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shirt className="w-5 h-5 text-pink-500" />
                        {apparel.title}
                        {apparel.isFeatured && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            Destaque
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {apparel.description}
                      </CardDescription>
                      <div className="flex gap-4 mt-3 text-sm text-gray-600">
                        <span className="font-semibold text-pink-600">
                          R$ {Number(apparel.price).toFixed(2)}
                        </span>
                        {apparel.category && (
                          <span className="text-gray-500">
                            {apparel.category}
                          </span>
                        )}
                        {apparel.relatedMissionSlugs && apparel.relatedMissionSlugs.length > 0 && (
                          <span className="text-gray-500">
                            {apparel.relatedMissionSlugs.length} missões
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => window.open(apparel.montinkUrl, '_blank')}
                      title="Ver na Montink"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(apparel)}
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(apparel.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {(!apparelList || apparelList.length === 0) && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Shirt className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Nenhum produto cadastrado ainda.
                  <br />
                  Comece adicionando seu primeiro produto Montink!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
