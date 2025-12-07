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
import { Trash2, Edit, Plus, Eye, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AudioUploader } from "@/components/admin/AudioUploader";
import type { SelectMission } from "@shared/schema";

export default function AdminMissoes() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<SelectMission | null>(null);

  const { data: missions, isLoading } = useQuery<SelectMission[]>({
    queryKey: ["/api/missions"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/missions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      toast({ title: "Missão criada com sucesso!" });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      const errorDetails = error.details || error.message || "Erro desconhecido";
      toast({ 
        title: "Erro ao criar missão", 
        description: errorDetails, 
        variant: "destructive",
        duration: 6000
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", `/api/admin/missions/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/missions"] });
      toast({ title: "Missão atualizada com sucesso!" });
      setEditingMission(null);
      resetForm();
    },
    onError: (error: any) => {
      const errorDetails = error.details || error.message || "Erro desconhecido";
      toast({ 
        title: "Erro ao atualizar missão", 
        description: errorDetails, 
        variant: "destructive",
        duration: 6000
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/admin/missions/${id}`),
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
    category: "Rotina Matinal",
    energyLevel: "",
    estimatedMinutes: "",
    understandingText: "",
    fraseMarca: "",
    propositoPratico: "",
    descricao: "",
    exemplosDeProdutos: "",
    bonusTip: "",
    inspirationalQuote: "",
    productAsins: "",
    diagnosticAreas: [] as string[],
    tarefasSimplesDeExecucao: "",
    heroImageUrl: "",
    audioUrl: "",
    metaDescription: "",
    featured: false,
    isPublished: true,
  });

  const [jsonInput, setJsonInput] = useState("");

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      category: "Rotina Matinal",
      energyLevel: "",
      estimatedMinutes: "",
      understandingText: "",
      fraseMarca: "",
      propositoPratico: "",
      descricao: "",
      exemplosDeProdutos: "",
      bonusTip: "",
      inspirationalQuote: "",
      productAsins: "",
      diagnosticAreas: [],
      tarefasSimplesDeExecucao: "",
      heroImageUrl: "",
      audioUrl: "",
      metaDescription: "",
      featured: false,
      isPublished: true,
    });
    setJsonInput("");
  };

  const parseJsonToForm = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      // Helper: Normalize array fields to pipe-delimited strings
      const normalizeArray = (value: any): string => {
        if (!value) return "";
        if (Array.isArray(value)) return value.join('|');
        if (typeof value === 'string') return value;
        return "";
      };
      
      // Helper: Convert tarefasSimplesDeExecucao to string format
      const normalizeTasks = (value: any): string => {
        if (!value) return "";
        if (typeof value === 'string') return value;
        if (Array.isArray(value)) {
          return value
            .map((item: any) => {
              if (typeof item === 'object' && item.task && item.subtext) {
                return `${item.task}::${item.subtext}`;
              }
              return "";
            })
            .filter(Boolean)
            .join('|');
        }
        return "";
      };
      
      // Helper: Normalize diagnosticAreas to array
      const normalizeDiagnosticAreas = (value: any): string[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value.filter(Boolean);
        if (typeof value === 'string') return value.split('|').filter(Boolean);
        return [];
      };
      
      setFormData({
        title: parsed.title || "",
        slug: parsed.slug || "",
        category: parsed.category || "Rotina Matinal",
        energyLevel: parsed.energyLevel || "",
        estimatedMinutes: parsed.estimatedMinutes?.toString() || "",
        understandingText: parsed.understandingText || "",
        fraseMarca: parsed.fraseMarca || "",
        propositoPratico: parsed.propositoPratico || "",
        descricao: parsed.descricao || "",
        exemplosDeProdutos: normalizeArray(parsed.exemplosDeProdutos),
        bonusTip: parsed.bonusTip || "",
        inspirationalQuote: parsed.inspirationalQuote || "",
        productAsins: normalizeArray(parsed.productAsins),
        diagnosticAreas: normalizeDiagnosticAreas(parsed.diagnosticAreas),
        tarefasSimplesDeExecucao: normalizeTasks(parsed.tarefasSimplesDeExecucao),
        heroImageUrl: parsed.heroImageUrl || "",
        audioUrl: parsed.audioUrl || "",
        metaDescription: parsed.metaDescription || "",
        featured: parsed.featured === "sim" || parsed.featured === true,
        isPublished: parsed.isPublished === "sim" || parsed.isPublished === true || parsed.isPublished !== "não",
      });
      
      toast({ title: "JSON carregado com sucesso!", description: "Revise os campos e salve quando estiver pronto." });
      setJsonInput("");
    } catch (error) {
      toast({ 
        title: "Erro ao processar JSON", 
        description: error instanceof Error ? error.message : "Verifique se o JSON está válido",
        variant: "destructive" 
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse tarefasSimplesDeExecucao (format: "task1::subtext1|task2::subtext2")
    let parsedTasks: Array<{ task: string; subtext: string }> = [];
    if (formData.tarefasSimplesDeExecucao) {
      parsedTasks = formData.tarefasSimplesDeExecucao
        .split('|')
        .filter(Boolean)
        .map(item => {
          const [task, subtext] = item.split('::');
          return { task: task?.trim() || "", subtext: subtext?.trim() || "" };
        });
    }
    
    const payload = {
      title: formData.title,
      slug: formData.slug,
      category: formData.category,
      energyLevel: formData.energyLevel || null,
      estimatedMinutes: formData.estimatedMinutes ? parseInt(formData.estimatedMinutes) : null,
      understandingText: formData.understandingText,
      fraseMarca: formData.fraseMarca || null,
      propositoPratico: formData.propositoPratico || null,
      descricao: formData.descricao || null,
      exemplosDeProdutos: formData.exemplosDeProdutos 
        ? formData.exemplosDeProdutos.split('|').map(s => s.trim()).filter(Boolean)
        : null,
      bonusTip: formData.bonusTip || null,
      inspirationalQuote: formData.inspirationalQuote || null,
      productAsins: formData.productAsins 
        ? formData.productAsins.split(/[,|]/).map(s => s.trim()).filter(Boolean)
        : null,
      diagnosticAreas: formData.diagnosticAreas.length > 0 ? formData.diagnosticAreas : null,
      tarefasSimplesDeExecucao: parsedTasks.length > 0 ? parsedTasks : null,
      heroImageUrl: formData.heroImageUrl || null,
      audioUrl: formData.audioUrl || null,
      metaDescription: formData.metaDescription || null,
      featured: formData.featured,
      isPublished: formData.isPublished,
    };

    if (editingMission) {
      updateMutation.mutate({ ...payload, id: editingMission.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (mission: SelectMission) => {
    setEditingMission(mission);
    
    // Convert tarefasSimplesDeExecucao back to string format
    let tasksString = "";
    if (mission.tarefasSimplesDeExecucao && Array.isArray(mission.tarefasSimplesDeExecucao)) {
      tasksString = mission.tarefasSimplesDeExecucao
        .map((t: any) => `${t.task}::${t.subtext}`)
        .join('|');
    }
    
    setFormData({
      title: mission.title,
      slug: mission.slug,
      category: mission.category,
      energyLevel: mission.energyLevel || "",
      estimatedMinutes: mission.estimatedMinutes?.toString() || "",
      understandingText: mission.understandingText,
      fraseMarca: mission.fraseMarca || "",
      propositoPratico: mission.propositoPratico || "",
      descricao: mission.descricao || "",
      exemplosDeProdutos: mission.exemplosDeProdutos?.join('|') || "",
      bonusTip: mission.bonusTip || "",
      inspirationalQuote: mission.inspirationalQuote || "",
      productAsins: mission.productAsins?.join('|') || "",
      diagnosticAreas: mission.diagnosticAreas || [],
      tarefasSimplesDeExecucao: tasksString,
      heroImageUrl: mission.heroImageUrl || "",
      audioUrl: mission.audioUrl || "",
      metaDescription: mission.metaDescription || "",
      featured: mission.featured || false,
      isPublished: mission.isPublished !== false,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta missão?")) {
      deleteMutation.mutate(id);
    }
  };

  const categories = [
    "Rotina Matinal",
    "Casa em Ordem",
    "Cozinha Inteligente",
    "Educação e Brincadeiras",
    "Tempo para Mim",
    "Presentes e Afetos",
    "Passeios e Saídas",
    "Saúde e Emergências",
    "Manutenção e Melhorias do Lar"
  ];

  const diagnosticAreasOptions = [
    { value: "cargaMental", label: "🧠 Carga Mental", description: "Ajuda a reduzir sobrecarga mental" },
    { value: "tempoDaCasa", label: "🏠 Tempo da Casa", description: "Reduz tempo gasto em tarefas domésticas" },
    { value: "tempoDeQualidade", label: "❤️ Tempo de Qualidade", description: "Libera mais tempo para a família" },
    { value: "alimentacao", label: "🍽️ Alimentação", description: "Facilita planejamento e preparo de refeições" },
    { value: "gestaoDaCasa", label: "📋 Gestão da Casa", description: "Melhora organização e controle doméstico" },
    { value: "logisticaInfantil", label: "👶 Logística Infantil", description: "Simplifica rotina com crianças" },
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
              
              {/* JSON Import Section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="jsonInput" className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    🤖 Colar JSON da IA
                  </Label>
                  {jsonInput && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={parseJsonToForm}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Auto-preencher Campos
                    </Button>
                  )}
                </div>
                <Textarea
                  id="jsonInput"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='Cole aqui o JSON gerado pela IA: {"title": "...", "slug": "...", ...}'
                  rows={4}
                  className="font-mono text-xs bg-white dark:bg-gray-900"
                />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  💡 Cole o JSON completo gerado pela IA e clique em "Auto-preencher" para distribuir os valores nos campos abaixo
                </p>
              </div>

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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="energyLevel">Nível de Energia</Label>
                    <Select value={formData.energyLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, energyLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="média">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedMinutes">Tempo Estimado (min)</Label>
                    <Input
                      id="estimatedMinutes"
                      type="number"
                      min="5"
                      max="60"
                      value={formData.estimatedMinutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedMinutes: e.target.value }))}
                      placeholder="Ex: 30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fraseMarca">Frase de Marca (opcional)</Label>
                  <Input
                    id="fraseMarca"
                    value={formData.fraseMarca}
                    onChange={(e) => setFormData(prev => ({ ...prev, fraseMarca: e.target.value }))}
                    placeholder="Ex: Minutos ganhos, estresse perdido"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propositoPratico">Propósito Prático (opcional)</Label>
                  <Textarea
                    id="propositoPratico"
                    value={formData.propositoPratico}
                    onChange={(e) => setFormData(prev => ({ ...prev, propositoPratico: e.target.value }))}
                    placeholder="Ex: Ganhar 30 minutos todas as manhãs sem estresse"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição Resumida (opcional)</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Resumo breve para cards e listagens (100-150 caracteres)"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="heroImageUrl">Imagem Hero (opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="heroImageUrl"
                      value={formData.heroImageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, heroImageUrl: e.target.value }))}
                      placeholder="Cole a URL ou faça upload"
                      className="flex-1"
                    />
                    <ImageUploader
                      onImageInserted={(url) => setFormData(prev => ({ ...prev, heroImageUrl: url }))}
                      className="shrink-0"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Recomendado: 1200 x 480px (proporção 5:2), horizontal/panorâmica, 50-150KB
                  </p>
                  {formData.heroImageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={formData.heroImageUrl} 
                        alt="Preview" 
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audioUrl">Áudio de Resumo (opcional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="audioUrl"
                      value={formData.audioUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, audioUrl: e.target.value }))}
                      placeholder="Cole a URL ou faça upload"
                      className="flex-1"
                    />
                    <AudioUploader
                      onAudioInserted={(url) => setFormData(prev => ({ ...prev, audioUrl: url }))}
                      className="shrink-0"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Formatos: MP3, WAV, OGG. Máximo 10MB.
                  </p>
                  {formData.audioUrl && (
                    <div className="mt-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <audio 
                        controls 
                        className="w-full"
                        src={formData.audioUrl.startsWith('/') ? new URL(formData.audioUrl, window.location.origin).toString() : formData.audioUrl}
                      >
                        Seu navegador não suporta áudio.
                      </audio>
                    </div>
                  )}
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
                  <Label htmlFor="exemplosDeProdutos">Exemplos de Produtos (opcional)</Label>
                  <Textarea
                    id="exemplosDeProdutos"
                    value={formData.exemplosDeProdutos}
                    onChange={(e) => setFormData(prev => ({ ...prev, exemplosDeProdutos: e.target.value }))}
                    placeholder="Garrafa térmica|Organizador de gavetas|Timer colorido"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500">Tipos genéricos de produtos separados por | (pipe)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productAsins">ASINs dos Produtos (opcional)</Label>
                  <Textarea
                    id="productAsins"
                    value={formData.productAsins}
                    onChange={(e) => setFormData(prev => ({ ...prev, productAsins: e.target.value }))}
                    placeholder="B08XYZ123|B09ABC456|B0ADEF789"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500">ASINs específicos da Amazon separados por | (pipe) ou vírgula</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tarefasSimplesDeExecucao">Checklist de Tarefas (opcional)</Label>
                  <Textarea
                    id="tarefasSimplesDeExecucao"
                    value={formData.tarefasSimplesDeExecucao}
                    onChange={(e) => setFormData(prev => ({ ...prev, tarefasSimplesDeExecucao: e.target.value }))}
                    placeholder="Tarefa 1::Explicação da tarefa 1|Tarefa 2::Explicação da tarefa 2"
                    rows={5}
                  />
                  <p className="text-sm text-gray-500">
                    Use :: entre tarefa e explicação, e | entre tarefas diferentes
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Áreas do Diagnóstico que esta Missão Resolve</Label>
                  <p className="text-sm text-gray-500">Marque as áreas onde esta missão ajuda a mãe</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {diagnosticAreasOptions.map((area) => (
                      <div key={area.value} className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Checkbox
                          id={area.value}
                          checked={formData.diagnosticAreas.includes(area.value)}
                          onCheckedChange={(checked) => {
                            setFormData(prev => ({
                              ...prev,
                              diagnosticAreas: checked
                                ? [...prev.diagnosticAreas, area.value]
                                : prev.diagnosticAreas.filter(a => a !== area.value)
                            }));
                          }}
                          data-testid={`checkbox-area-${area.value}`}
                        />
                        <div className="flex-1">
                          <Label htmlFor={area.value} className="font-medium cursor-pointer">
                            {area.label}
                          </Label>
                          <p className="text-xs text-gray-500 mt-1">{area.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Descrição - SEO (opcional)</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder="Descrição para Google (120-160 caracteres)"
                    rows={2}
                  />
                </div>

                <div className="flex gap-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: !!checked }))}
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      ⭐ Destacar na Home
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPublished"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: !!checked }))}
                    />
                    <Label htmlFor="isPublished" className="cursor-pointer">
                      ✅ Publicar (visível no site)
                    </Label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="flex-1">
                    {editingMission ? "Atualizar" : "Criar"} Missão
                  </Button>
                  {editingMission && formData.slug && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => window.open(`/preview/missoes/${formData.slug}`, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Pré-visualizar
                    </Button>
                  )}
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
