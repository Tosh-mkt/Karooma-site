import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Pencil, Trash2, AlertCircle, CalendarDays, Sparkles } from "lucide-react";
import { format, parseISO, isBefore, isAfter, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";

interface SeasonalTheme {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  startDate: string;
  endDate: string;
  suggestedTopics: string[] | null;
  relatedCategories: string[] | null;
  relatedMissionSlugs: string[] | null;
  priority: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { id: "rotina-organizacao", name: "Rotina e Organização" },
  { id: "casa-ordem", name: "Casa em Ordem" },
  { id: "cozinha-alimentacao", name: "Cozinha e Alimentação" },
  { id: "educacao-brincadeiras", name: "Educação e Brincadeiras" },
  { id: "bem-estar-autocuidado", name: "Bem-estar e Autocuidado" },
  { id: "passeios-viagens", name: "Passeios e Viagens" },
  { id: "saude-seguranca", name: "Saúde e Segurança" },
];

export default function AdminSeasonalCalendar() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<SeasonalTheme | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    startDate: "",
    endDate: "",
    suggestedTopics: "",
    relatedCategories: [] as string[],
    priority: "medium",
    isActive: true,
  });

  const { data: themesData, isLoading } = useQuery<{ success: boolean; themes: SeasonalTheme[] }>({
    queryKey: ["/api/admin/seasonal-themes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/seasonal-themes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seasonal-themes"] });
      resetForm();
      setIsDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/admin/seasonal-themes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seasonal-themes"] });
      resetForm();
      setIsDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/seasonal-themes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/seasonal-themes"] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      startDate: "",
      endDate: "",
      suggestedTopics: "",
      relatedCategories: [],
      priority: "medium",
      isActive: true,
    });
    setEditingTheme(null);
  };

  const handleEdit = (theme: SeasonalTheme) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      slug: theme.slug,
      description: theme.description || "",
      startDate: theme.startDate ? format(parseISO(theme.startDate), "yyyy-MM-dd") : "",
      endDate: theme.endDate ? format(parseISO(theme.endDate), "yyyy-MM-dd") : "",
      suggestedTopics: theme.suggestedTopics?.join(", ") || "",
      relatedCategories: theme.relatedCategories || [],
      priority: theme.priority || "medium",
      isActive: theme.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
      description: formData.description || null,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      suggestedTopics: formData.suggestedTopics.split(",").map(t => t.trim()).filter(Boolean),
      relatedCategories: formData.relatedCategories,
      priority: formData.priority,
      isActive: formData.isActive,
    };

    if (editingTheme) {
      updateMutation.mutate({ id: editingTheme.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getThemeStatus = (theme: SeasonalTheme) => {
    const now = new Date();
    const start = parseISO(theme.startDate);
    const end = parseISO(theme.endDate);

    if (isBefore(now, start)) {
      const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { status: "upcoming", label: `Em ${daysUntil} dias`, color: "bg-blue-500" };
    }
    if (isWithinInterval(now, { start, end })) {
      return { status: "active", label: "Ativo agora", color: "bg-green-500" };
    }
    return { status: "past", label: "Encerrado", color: "bg-gray-400" };
  };

  const themes: SeasonalTheme[] = themesData?.themes || [];
  const activeThemes = themes.filter(t => getThemeStatus(t).status === "active");
  const upcomingThemes = themes.filter(t => getThemeStatus(t).status === "upcoming");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendário Sazonal</h1>
              <p className="text-gray-600">Planeje conteúdo baseado em datas e eventos importantes</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/content-hub">
              <Button variant="outline" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Content Hub
              </Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4" />
                  Novo Tema
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingTheme ? "Editar Tema" : "Novo Tema Sazonal"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Tema</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Volta às Aulas"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Breve descrição do tema e contexto..."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Data Início</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">Data Fim</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="suggestedTopics">Tópicos Sugeridos (separados por vírgula)</Label>
                    <Textarea
                      id="suggestedTopics"
                      value={formData.suggestedTopics}
                      onChange={(e) => setFormData({ ...formData, suggestedTopics: e.target.value })}
                      placeholder="Lista de materiais, Lancheira saudável, Rotina de estudos..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Categorias Relacionadas</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {CATEGORIES.map((cat) => (
                        <Badge
                          key={cat.id}
                          variant={formData.relatedCategories.includes(cat.id) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const updated = formData.relatedCategories.includes(cat.id)
                              ? formData.relatedCategories.filter(c => c !== cat.id)
                              : [...formData.relatedCategories, cat.id];
                            setFormData({ ...formData, relatedCategories: updated });
                          }}
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="low">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Tema ativo</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingTheme ? "Salvar" : "Criar Tema"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {activeThemes.length > 0 && (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                <AlertCircle className="w-5 h-5" />
                Temas Ativos Agora ({activeThemes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {activeThemes.map((theme) => (
                  <Badge key={theme.id} className="bg-green-600 text-white px-3 py-1">
                    {theme.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {upcomingThemes.length > 0 && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
                <CalendarDays className="w-5 h-5" />
                Próximos Temas ({upcomingThemes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingThemes.slice(0, 5).map((theme) => {
                  const status = getThemeStatus(theme);
                  return (
                    <div key={theme.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                      <span className="font-medium">{theme.name}</span>
                      <Badge variant="outline" className="text-blue-600">
                        {status.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Todos os Temas ({themes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {themes.map((theme) => {
                const status = getThemeStatus(theme);
                return (
                  <div
                    key={theme.id}
                    className={`p-4 rounded-lg border ${
                      status.status === "active" ? "border-green-300 bg-green-50/30" :
                      status.status === "upcoming" ? "border-blue-200 bg-blue-50/30" :
                      "border-gray-200 bg-gray-50/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{theme.name}</h3>
                          <Badge variant={theme.priority === "high" ? "destructive" : theme.priority === "medium" ? "default" : "secondary"}>
                            {theme.priority === "high" ? "Alta" : theme.priority === "medium" ? "Média" : "Baixa"}
                          </Badge>
                          <Badge className={status.color}>{status.label}</Badge>
                          {!theme.isActive && <Badge variant="outline">Inativo</Badge>}
                        </div>
                        {theme.description && (
                          <p className="text-sm text-gray-600 mb-2">{theme.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {format(parseISO(theme.startDate), "dd MMM", { locale: ptBR })} - {format(parseISO(theme.endDate), "dd MMM yyyy", { locale: ptBR })}
                          </span>
                          {theme.suggestedTopics && theme.suggestedTopics.length > 0 && (
                            <span>{theme.suggestedTopics.length} tópicos sugeridos</span>
                          )}
                        </div>
                        {theme.suggestedTopics && theme.suggestedTopics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {theme.suggestedTopics.slice(0, 4).map((topic, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                            {theme.suggestedTopics.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{theme.suggestedTopics.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(theme)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (confirm(`Excluir o tema "${theme.name}"?`)) {
                              deleteMutation.mutate(theme.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {themes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum tema sazonal cadastrado. Clique em "Novo Tema" para começar.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
