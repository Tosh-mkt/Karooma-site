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
import { Trash2, Edit, Plus, Eye, ExternalLink, BookOpen, Heart, Brain, Lightbulb, ArrowLeft, Bot, Upload, ImageIcon } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { AudioUploader } from "@/components/admin/AudioUploader";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { SelectGuidePost, SelectMission } from "@shared/schema";

const CATEGORIES = [
  { value: "Rotina Matinal", emoji: "🌅", color: "bg-amber-100 text-amber-800" },
  { value: "Casa em Ordem", emoji: "🏠", color: "bg-blue-100 text-blue-800" },
  { value: "Cozinha Inteligente", emoji: "🍳", color: "bg-orange-100 text-orange-800" },
  { value: "Educação e Brincadeiras", emoji: "📚", color: "bg-green-100 text-green-800" },
  { value: "Tempo para Mim", emoji: "💆", color: "bg-purple-100 text-purple-800" },
  { value: "Presentes e Afetos", emoji: "💝", color: "bg-pink-100 text-pink-800" },
  { value: "Passeios e Saídas", emoji: "🚗", color: "bg-teal-100 text-teal-800" },
  { value: "Saúde e Emergências", emoji: "🏥", color: "bg-red-100 text-red-800" },
  { value: "Manutenção e Melhorias do Lar", emoji: "🔧", color: "bg-gray-100 text-gray-800" },
];

export default function AdminGuidePosts() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SelectGuidePost | null>(null);

  const { data: posts, isLoading } = useQuery<SelectGuidePost[]>({
    queryKey: ["/api/admin/guide-posts"],
  });

  const { data: missions } = useQuery<SelectMission[]>({
    queryKey: ["/api/missions"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/admin/guide-posts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guide-posts"] });
      toast({ title: "Post de guia criado com sucesso!" });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao criar post", 
        description: error.details || error.message || "Erro desconhecido", 
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("PATCH", `/api/admin/guide-posts/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guide-posts"] });
      toast({ title: "Post atualizado com sucesso!" });
      setEditingPost(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro ao atualizar post", 
        description: error.details || error.message || "Erro desconhecido", 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/admin/guide-posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guide-posts"] });
      toast({ title: "Post excluído com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Rotina Matinal",
    categoryEmoji: "🌅",
    readingTime: "5",
    sectionEuTeEntendo: "",
    sectionCiencia: "",
    sectionProblema: "",
    sectionBoaNoticia: "",
    quote: "",
    quoteAuthor: "",
    stats: "",
    relatedMissionSlugs: [] as string[],
    audioUrl: "",
    audioDuration: "",
    heroImageUrl: "",
    metaDescription: "",
    featured: false,
    isPublished: false,
  });

  const [jsonInput, setJsonInput] = useState("");

  const parseJsonToForm = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      const normalizeArray = (value: any): string[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value.filter(Boolean);
        if (typeof value === 'string') return value.split('|').filter(Boolean);
        return [];
      };

      const normalizeStats = (value: any): string => {
        if (!value) return "";
        if (typeof value === 'string') return value;
        if (Array.isArray(value)) return JSON.stringify(value, null, 2);
        return "";
      };

      const category = parsed.category || "Rotina Matinal";
      const categoryData = CATEGORIES.find(c => c.value === category);
      
      setFormData({
        title: parsed.title || "",
        slug: parsed.slug || "",
        category: category,
        categoryEmoji: categoryData?.emoji || parsed.categoryEmoji || "🌅",
        readingTime: parsed.readingTime?.toString() || "5",
        sectionEuTeEntendo: parsed.sectionEuTeEntendo || "",
        sectionCiencia: parsed.sectionCiencia || "",
        sectionProblema: parsed.sectionProblema || "",
        sectionBoaNoticia: parsed.sectionBoaNoticia || "",
        quote: parsed.quote || "",
        quoteAuthor: parsed.quoteAuthor || "",
        stats: normalizeStats(parsed.stats),
        relatedMissionSlugs: normalizeArray(parsed.relatedMissionSlugs),
        audioUrl: parsed.audioUrl || "",
        audioDuration: parsed.audioDuration?.toString() || "",
        heroImageUrl: parsed.heroImageUrl || "",
        metaDescription: parsed.metaDescription || "",
        featured: parsed.featured === "sim" || parsed.featured === true,
        isPublished: parsed.isPublished === "sim" || parsed.isPublished === true,
      });
      
      toast({ 
        title: "JSON carregado com sucesso!", 
        description: "Revise os campos e salve quando estiver pronto." 
      });
      setJsonInput("");
    } catch (error) {
      toast({ 
        title: "Erro ao processar JSON", 
        description: error instanceof Error ? error.message : "Verifique se o JSON está válido",
        variant: "destructive" 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      category: "Rotina Matinal",
      categoryEmoji: "🌅",
      readingTime: "5",
      sectionEuTeEntendo: "",
      sectionCiencia: "",
      sectionProblema: "",
      sectionBoaNoticia: "",
      quote: "",
      quoteAuthor: "",
      stats: "",
      relatedMissionSlugs: [],
      audioUrl: "",
      audioDuration: "",
      heroImageUrl: "",
      metaDescription: "",
      featured: false,
      isPublished: false,
    });
    setJsonInput("");
  };

  const loadEditForm = (post: SelectGuidePost) => {
    setFormData({
      title: post.title,
      slug: post.slug,
      category: post.category || "Rotina Matinal",
      categoryEmoji: post.categoryEmoji || "🌅",
      readingTime: post.readingTime?.toString() || "5",
      sectionEuTeEntendo: post.sectionEuTeEntendo || "",
      sectionCiencia: post.sectionCiencia || "",
      sectionProblema: post.sectionProblema || "",
      sectionBoaNoticia: post.sectionBoaNoticia || "",
      quote: post.quote || "",
      quoteAuthor: post.quoteAuthor || "",
      stats: post.stats ? JSON.stringify(post.stats) : "",
      relatedMissionSlugs: post.relatedMissionSlugs || [],
      audioUrl: post.audioUrl || "",
      audioDuration: post.audioDuration?.toString() || "",
      heroImageUrl: post.heroImageUrl || "",
      metaDescription: post.metaDescription || "",
      featured: post.featured || false,
      isPublished: post.isPublished || false,
    });
    setEditingPost(post);
  };

  const handleCategoryChange = (value: string) => {
    const category = CATEGORIES.find(c => c.value === value);
    setFormData(prev => ({
      ...prev,
      category: value,
      categoryEmoji: category?.emoji || "🌅"
    }));
  };

  const handleMissionToggle = (missionSlug: string) => {
    setFormData(prev => ({
      ...prev,
      relatedMissionSlugs: prev.relatedMissionSlugs.includes(missionSlug)
        ? prev.relatedMissionSlugs.filter(s => s !== missionSlug)
        : [...prev.relatedMissionSlugs, missionSlug]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
      return;
    }
    if (!formData.slug.trim()) {
      toast({ title: "Slug é obrigatório", variant: "destructive" });
      return;
    }
    if (!formData.sectionEuTeEntendo.trim()) {
      toast({ title: "Seção 'Eu Te Entendo' é obrigatória", variant: "destructive" });
      return;
    }
    
    let parsedStats = null;
    if (formData.stats) {
      try {
        parsedStats = JSON.parse(formData.stats);
      } catch {
        toast({ title: "Erro no JSON de estatísticas", variant: "destructive" });
        return;
      }
    }

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      category: formData.category,
      categoryEmoji: formData.categoryEmoji,
      readingTime: parseInt(formData.readingTime) || 5,
      sectionEuTeEntendo: formData.sectionEuTeEntendo.trim(),
      sectionCiencia: formData.sectionCiencia.trim() || null,
      sectionProblema: formData.sectionProblema.trim() || null,
      sectionBoaNoticia: formData.sectionBoaNoticia.trim() || null,
      quote: formData.quote.trim() || null,
      quoteAuthor: formData.quoteAuthor.trim() || null,
      stats: parsedStats,
      relatedMissionSlugs: formData.relatedMissionSlugs,
      audioUrl: formData.audioUrl.trim() || null,
      audioDuration: formData.audioDuration ? parseInt(formData.audioDuration) : null,
      heroImageUrl: formData.heroImageUrl.trim() || null,
      metaDescription: formData.metaDescription.trim() || null,
      featured: formData.featured,
      isPublished: formData.isPublished,
    };

    console.log("Enviando payload:", payload);

    if (editingPost) {
      updateMutation.mutate({ ...payload, id: editingPost.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getCategoryBadge = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? `${cat.emoji} ${cat.value}` : category;
  };

  const getCategoryColor = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.color || "bg-gray-100 text-gray-800";
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* Importação JSON */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="jsonInput" className="text-sm font-semibold text-green-900 dark:text-green-100">
            <Bot className="w-4 h-4 inline mr-2" />
            Colar JSON da IA (GEP)
          </Label>
          {jsonInput && (
            <Button
              type="button"
              size="sm"
              onClick={parseJsonToForm}
              className="bg-green-600 hover:bg-green-700"
            >
              Carregar JSON
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
      </div>

      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Informações Básicas
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Por que as manhãs são tão difíceis?"
              required
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="por-que-manhas-sao-dificeis"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="readingTime">Tempo de Leitura (min)</Label>
            <Input
              id="readingTime"
              type="number"
              value={formData.readingTime}
              onChange={(e) => setFormData({ ...formData, readingTime: e.target.value })}
              placeholder="5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
          <Textarea
            id="metaDescription"
            value={formData.metaDescription}
            onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
            placeholder="Descrição para SEO..."
            rows={2}
          />
        </div>

        {/* Imagem de Capa */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="heroImageUrl" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Imagem de Capa (16:9)
            </Label>
            <ImageUploader 
              onImageInserted={(url) => setFormData({ ...formData, heroImageUrl: url })}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
            />
          </div>
          <Input
            id="heroImageUrl"
            value={formData.heroImageUrl}
            onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
            placeholder="https://..."
          />
          {formData.heroImageUrl && (
            <div className="mt-2 relative aspect-video max-w-md rounded-lg overflow-hidden border border-gray-200">
              <img 
                src={formData.heroImageUrl} 
                alt="Preview da capa" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'%3E%3Crect fill='%23f3f4f6' width='400' height='225'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImagem não encontrada%3C/text%3E%3C/svg%3E";
                }}
              />
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">16:9</span>
            </div>
          )}
        </div>
      </div>

      {/* Seções de Conteúdo */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          Seção: Eu Te Entendo
        </h3>
        <Textarea
          value={formData.sectionEuTeEntendo}
          onChange={(e) => setFormData({ ...formData, sectionEuTeEntendo: e.target.value })}
          placeholder="Texto empático que mostra compreensão pelo problema..."
          rows={4}
        />
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-500" />
          Seção: O Que a Ciência Diz
        </h3>
        <Textarea
          value={formData.sectionCiencia}
          onChange={(e) => setFormData({ ...formData, sectionCiencia: e.target.value })}
          placeholder="Dados e pesquisas sobre o tema..."
          rows={4}
        />
        
        <div>
          <Label htmlFor="stats">Estatísticas (JSON)</Label>
          <Textarea
            id="stats"
            value={formData.stats}
            onChange={(e) => setFormData({ ...formData, stats: e.target.value })}
            placeholder='[{"value": "73%", "label": "das mães sentem", "color": "text-amber-600"}]'
            rows={2}
            className="font-mono text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="quote">Citação</Label>
            <Textarea
              id="quote"
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              placeholder="Uma citação inspiradora..."
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="quoteAuthor">Autor da Citação</Label>
            <Input
              id="quoteAuthor"
              value={formData.quoteAuthor}
              onChange={(e) => setFormData({ ...formData, quoteAuthor: e.target.value })}
              placeholder="Nome do autor"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-500" />
          Seção: Por Que Isso Acontece
        </h3>
        <Textarea
          value={formData.sectionProblema}
          onChange={(e) => setFormData({ ...formData, sectionProblema: e.target.value })}
          placeholder="Explicação do problema..."
          rows={4}
        />
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-green-500" />
          Seção: A Boa Notícia
        </h3>
        <Textarea
          value={formData.sectionBoaNoticia}
          onChange={(e) => setFormData({ ...formData, sectionBoaNoticia: e.target.value })}
          placeholder="Solução e esperança..."
          rows={4}
        />
      </div>

      {/* Missões Relacionadas */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold text-lg">Missões Relacionadas</h3>
        <p className="text-sm text-gray-500">Selecione as missões que aparecem como CTA no final do post</p>
        
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
          {missions?.filter(m => m.isPublished).map(mission => (
            <div 
              key={mission.slug} 
              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                formData.relatedMissionSlugs.includes(mission.slug)
                  ? 'bg-green-50 border-green-300'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleMissionToggle(mission.slug);
              }}
            >
              <Checkbox 
                checked={formData.relatedMissionSlugs.includes(mission.slug)}
                onCheckedChange={() => handleMissionToggle(mission.slug)}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm truncate">{mission.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Áudio */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Áudio (Opcional)</h3>
          <AudioUploader 
            onAudioInserted={(url) => setFormData({ ...formData, audioUrl: url })}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="audioUrl">URL do Áudio</Label>
            <Input
              id="audioUrl"
              value={formData.audioUrl}
              onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div>
            <Label htmlFor="audioDuration">Duração (segundos)</Label>
            <Input
              id="audioDuration"
              type="number"
              value={formData.audioDuration}
              onChange={(e) => setFormData({ ...formData, audioDuration: e.target.value })}
              placeholder="180"
            />
          </div>
        </div>
      </div>

      {/* Publicação */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })}
            />
            <Label htmlFor="featured">Destaque</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isPublished"
              checked={formData.isPublished}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublished: !!checked })}
            />
            <Label htmlFor="isPublished">Publicado</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-900 py-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setEditingPost(null);
            setIsCreateOpen(false);
            resetForm();
          }}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {editingPost ? "Atualizar" : "Criar"} Post
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 px-6 pb-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Posts de Guia</h1>
              <p className="text-gray-500 dark:text-gray-400">Gerencie os posts que conectam teoria à prática</p>
            </div>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Post de Guia</DialogTitle>
                <DialogDescription>
                  Posts de guia conectam conhecimento teórico às missões práticas
                </DialogDescription>
              </DialogHeader>
              <FormContent />
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Posts */}
        {isLoading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : !posts?.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Nenhum post de guia criado ainda</p>
              <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                Criar Primeiro Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getCategoryColor(post.category || "")}>
                          {getCategoryBadge(post.category || "")}
                        </Badge>
                        {post.featured && (
                          <Badge variant="secondary">⭐ Destaque</Badge>
                        )}
                        {!post.isPublished && (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            Rascunho
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {post.title}
                      </h3>
                      
                      <p className="text-sm text-gray-500 mb-3">
                        /blog-guia/{post.slug} • {post.readingTime} min de leitura • {post.views || 0} visualizações
                      </p>

                      {post.relatedMissionSlugs && post.relatedMissionSlugs.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Missões:</span>
                          {post.relatedMissionSlugs.slice(0, 3).map(slug => (
                            <Badge key={slug} variant="outline" className="text-xs">
                              {slug}
                            </Badge>
                          ))}
                          {post.relatedMissionSlugs.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{post.relatedMissionSlugs.length - 3} mais
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/blog-guia/${post.slug}`} target="_blank">
                        <Button variant="ghost" size="icon" title="Visualizar">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => loadEditForm(post)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir este post?")) {
                            deleteMutation.mutate(post.id);
                          }
                        }}
                        title="Excluir"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Editar Post de Guia</DialogTitle>
              <DialogDescription>
                Atualize as informações do post
              </DialogDescription>
            </DialogHeader>
            <FormContent />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
