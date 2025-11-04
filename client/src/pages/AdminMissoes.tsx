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
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, Eye, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import type { SelectMission } from "@shared/schema";

export default function AdminMissoes() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<SelectMission | null>(null);

  const { data: missions, isLoading } = useQuery<SelectMission[]>({
    queryKey: ["/api/missions"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("/api/admin/missions", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      toast({ title: "Missão criada com sucesso!" });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar missão", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiRequest(`/api/admin/missions/${data.id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      toast({ title: "Missão atualizada com sucesso!" });
      setEditingMission(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar missão", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest(`/api/admin/missions/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      toast({ title: "Missão excluída com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir missão", description: error.message, variant: "destructive" });
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Organização",
    understandingText: "",
    bonusTip: "",
    inspirationalQuote: "",
    productAsins: "",
    heroImageUrl: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      category: "Organização",
      understandingText: "",
      bonusTip: "",
      inspirationalQuote: "",
      productAsins: "",
      heroImageUrl: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      productAsins: formData.productAsins.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (editingMission) {
      updateMutation.mutate({ ...payload, id: editingMission.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (mission: SelectMission) => {
    setEditingMission(mission);
    setFormData({
      title: mission.title,
      slug: mission.slug,
      category: mission.category,
      understandingText: mission.understandingText,
      bonusTip: mission.bonusTip || "",
      inspirationalQuote: mission.inspirationalQuote || "",
      productAsins: mission.productAsins?.join(', ') || "",
      heroImageUrl: mission.heroImageUrl || "",
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta missão?")) {
      deleteMutation.mutate(id);
    }
  };

  const categories = [
    "Organização",
    "Alimentação",
    "Bem-estar",
    "Educação",
    "Segurança",
    "Desenvolvimento"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando missões...</p>
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
              Gerenciar Missões
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Crie e gerencie as missões resolvidas do Karooma
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingMission(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                <Plus className="w-4 h-4 mr-2" />
                Nova Missão
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMission ? "Editar Missão" : "Nova Missão"}
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados da missão. Todos os campos são importantes.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título da Missão</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        title,
                        slug: title.toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-+|-+$/g, "")
                      }));
                    }}
                    placeholder="Ex: Como organizar a casa com crianças pequenas"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL amigável)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="Ex: organizar-casa-criancas-pequenas"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroImageUrl">URL da Imagem Hero (opcional)</Label>
                  <Input
                    id="heroImageUrl"
                    value={formData.heroImageUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, heroImageUrl: e.target.value }))}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="understandingText">Texto de Empatia (A gente entende)</Label>
                  <Textarea
                    id="understandingText"
                    value={formData.understandingText}
                    onChange={(e) => setFormData(prev => ({ ...prev, understandingText: e.target.value }))}
                    placeholder="Conte sobre o desafio de forma empática..."
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productAsins">ASINs dos Produtos (separados por vírgula)</Label>
                  <Textarea
                    id="productAsins"
                    value={formData.productAsins}
                    onChange={(e) => setFormData(prev => ({ ...prev, productAsins: e.target.value }))}
                    placeholder="B08XYZ123, B09ABC456, B0ADEF789"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500">Cole os ASINs dos produtos que resolvem esta missão</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bonusTip">Dica Bônus (opcional)</Label>
                  <Textarea
                    id="bonusTip"
                    value={formData.bonusTip}
                    onChange={(e) => setFormData(prev => ({ ...prev, bonusTip: e.target.value }))}
                    placeholder="Uma dica extra que complementa a solução..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspirationalQuote">Frase Inspiracional (opcional)</Label>
                  <Input
                    id="inspirationalQuote"
                    value={formData.inspirationalQuote}
                    onChange={(e) => setFormData(prev => ({ ...prev, inspirationalQuote: e.target.value }))}
                    placeholder="Ex: Pequenos passos podem transformar grandes desafios"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1">
                    {editingMission ? "Atualizar" : "Criar"} Missão
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setEditingMission(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Missões */}
        <div className="grid gap-4">
          {missions?.map((mission) => (
            <Card key={mission.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{mission.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs mr-2">
                        {mission.category}
                      </span>
                      <span className="text-gray-500">/{mission.slug}</span>
                      <span className="ml-3 text-gray-400">
                        <Eye className="w-3 h-3 inline mr-1" />
                        {mission.views || 0} visualizações
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/missoes/${mission.slug}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(mission)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(mission.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {mission.understandingText}
                </p>
                {mission.productAsins && mission.productAsins.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    {mission.productAsins.length} produto(s) vinculado(s)
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          
          {missions?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Nenhuma missão criada ainda.</p>
                <p className="text-sm text-gray-400 mt-2">Clique em "Nova Missão" para começar.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
