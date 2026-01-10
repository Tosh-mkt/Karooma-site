import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Wand2, 
  Send, 
  ImageIcon, 
  RefreshCw, 
  Save, 
  Eye,
  ChevronDown,
  ChevronRight,
  Target,
  Calendar,
  TrendingUp,
  FileText,
  Loader2,
  AlertCircle,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

interface Category {
  id: string;
  name: string;
  emoji: string;
  keywords: string[];
}

interface Mission {
  id: string;
  title: string;
  slug: string;
  category: string;
}

interface GeneratedDraft {
  title: string;
  slug: string;
  metaDescription: string;
  content: string;
  category: string;
  type: string;
  missionId?: string;
  missionCta?: {
    title: string;
    slug: string;
    description: string;
  };
  imagePrompt: string;
  keywords: string[];
}

interface ThemeSuggestion {
  topic: string;
  category: string;
  reason?: string;
  relatedMissions: Mission[];
}

interface TrendAlert {
  id: string;
  type: "seasonal" | "trending";
  title: string;
  description: string;
  suggestedMissions: { id: string; title: string; slug: string }[];
  priority: "high" | "medium" | "low";
  expiresAt?: string;
}

export default function AdminContentHub() {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMissionId, setSelectedMissionId] = useState("");
  const [selectedType, setSelectedType] = useState<"artigo" | "guia">("artigo");
  const [keywords, setKeywords] = useState("");
  const [draft, setDraft] = useState<GeneratedDraft | null>(null);
  const [refineInstruction, setRefineInstruction] = useState("");
  const [isThemesOpen, setIsThemesOpen] = useState(true);

  const { data: categoriesData } = useQuery<{ success: boolean; categories: Category[] }>({
    queryKey: ["/api/content-hub/categories"],
  });

  const { data: missionsData } = useQuery<{ success: boolean; missions: Mission[] }>({
    queryKey: ["/api/content-hub/missions/by-category", selectedCategory],
    queryFn: async () => {
      const res = await fetch(`/api/content-hub/missions/by-category/${selectedCategory}`);
      return res.json();
    },
    enabled: !!selectedCategory,
  });

  const { data: themesData, isLoading: isLoadingThemes, refetch: refetchThemes } = useQuery<{ success: boolean; themes: ThemeSuggestion[] }>({
    queryKey: ["/api/admin/content-hub/suggest-themes"],
    enabled: false,
  });

  const { data: alertsData } = useQuery<{ success: boolean; alerts: TrendAlert[] }>({
    queryKey: ["/api/admin/content-hub/alerts"],
  });

  const generateDraftMutation = useMutation({
    mutationFn: async (data: { topic: string; category: string; missionId?: string; keywords?: string[]; type?: string }) => {
      const res = await apiRequest("POST", "/api/admin/content-hub/generate-draft", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setDraft(data.draft);
        toast({ title: "Draft gerado com sucesso!" });
      }
    },
    onError: () => {
      toast({ title: "Erro ao gerar draft", variant: "destructive" });
    },
  });

  const refineDraftMutation = useMutation({
    mutationFn: async (data: { content: string; instruction: string }) => {
      const res = await apiRequest("POST", "/api/admin/content-hub/refine-draft", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success && draft) {
        setDraft({ ...draft, content: data.content });
        setRefineInstruction("");
        toast({ title: "Conteúdo refinado!" });
      }
    },
    onError: () => {
      toast({ title: "Erro ao refinar conteúdo", variant: "destructive" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/content", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Artigo publicado com sucesso!" });
      setDraft(null);
      setTopic("");
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
    },
    onError: () => {
      toast({ title: "Erro ao publicar", variant: "destructive" });
    },
  });

  const handleGenerate = () => {
    if (!topic || !selectedCategory) {
      toast({ title: "Preencha o tópico e categoria", variant: "destructive" });
      return;
    }
    generateDraftMutation.mutate({
      topic,
      category: selectedCategory,
      missionId: selectedMissionId || undefined,
      keywords: keywords ? keywords.split(",").map(k => k.trim()) : undefined,
      type: selectedType,
    });
  };

  const handleRefine = () => {
    if (!draft?.content || !refineInstruction) return;
    refineDraftMutation.mutate({
      content: draft.content,
      instruction: refineInstruction,
    });
  };

  const handlePublish = () => {
    if (!draft) return;
    publishMutation.mutate({
      title: draft.title,
      description: draft.metaDescription,
      content: draft.content,
      type: "blog",
      category: draft.category,
      isPublished: true,
    });
  };

  const handleSelectTheme = (theme: ThemeSuggestion) => {
    setTopic(theme.topic);
    setSelectedCategory(theme.category);
    if (theme.relatedMissions?.[0]) {
      setSelectedMissionId(theme.relatedMissions[0].id);
    }
  };

  const categories = categoriesData?.categories || [];
  const missions = missionsData?.missions || [];
  const themes = themesData?.themes || [];
  const alerts = alertsData?.alerts || [];
  const activeAlerts = alerts.filter(a => a.priority === "high" || a.priority === "medium");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-600" />
                Content Intelligence Hub
              </h1>
              <p className="text-gray-600 mt-2">Crie artigos com IA, vinculados às missões do Karooma</p>
            </div>
            <Link href="/admin/seasonal-calendar">
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                Calendário Sazonal
              </Button>
            </Link>
          </div>
        </motion.div>

        {activeAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                  <Bell className="w-5 h-5" />
                  Alertas Sazonais ({activeAlerts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 bg-white/80 rounded-lg cursor-pointer hover:bg-white transition-colors"
                      onClick={() => {
                        const themeName = alert.title.replace(/^[🗓️⏰]\s*/, "").replace(/\s*em \d+ dias$/, "");
                        setTopic(themeName);
                      }}
                    >
                      <div className="flex-1">
                        <span className="font-medium">{alert.title}</span>
                        <p className="text-sm text-gray-500">{alert.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={alert.priority === "high" ? "destructive" : "secondary"}>
                          {alert.priority === "high" ? "Urgente" : "Em breve"}
                        </Badge>
                        {alert.suggestedMissions?.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {alert.suggestedMissions.length} missões
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {activeAlerts.length > 3 && (
                  <Link href="/admin/seasonal-calendar">
                    <Button variant="link" size="sm" className="mt-2 p-0 text-orange-600">
                      Ver todos os {activeAlerts.length} alertas →
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input & Preview */}
          <div className="space-y-6">
            {/* Theme Suggestions */}
            <Card>
              <Collapsible open={isThemesOpen} onOpenChange={setIsThemesOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        Sugestões de Temas
                      </span>
                      {isThemesOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchThemes()}
                      disabled={isLoadingThemes}
                      className="mb-4"
                    >
                      {isLoadingThemes ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-2" />
                      )}
                      Gerar Sugestões com IA
                    </Button>

                    {themes.length > 0 && (
                      <div className="space-y-3">
                        {themes.map((theme, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 cursor-pointer hover:shadow-md transition-all"
                            onClick={() => handleSelectTheme(theme)}
                          >
                            <p className="font-medium text-gray-800">{theme.topic}</p>
                            <p className="text-sm text-gray-500 mt-1">{theme.reason}</p>
                            {theme.relatedMissions?.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {theme.relatedMissions.slice(0, 2).map(m => (
                                  <Badge key={m.id} variant="secondary" className="text-xs">
                                    <Target className="w-3 h-3 mr-1" />
                                    {m.title}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Gerar Novo Artigo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tópico / Assunto</Label>
                  <Input
                    placeholder="Ex: Como organizar a rotina matinal com crianças"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.emoji} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tipo</Label>
                    <Select value={selectedType} onValueChange={(v) => setSelectedType(v as "artigo" | "guia")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="artigo">📝 Artigo</SelectItem>
                        <SelectItem value="guia">📖 Guia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Missão Relacionada (opcional)</Label>
                  <Select value={selectedMissionId} onValueChange={setSelectedMissionId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vincular a uma missão..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {missions.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          🎯 {m.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Palavras-chave SEO (separadas por vírgula)</Label>
                  <Input
                    placeholder="rotina, organização, manhã, crianças"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={handleGenerate}
                  disabled={generateDraftMutation.isPending}
                >
                  {generateDraftMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Wand2 className="w-4 h-4 mr-2" />
                  )}
                  Gerar Draft com IA
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            {draft && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-green-500" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <h1 className="text-xl font-bold text-gray-800">{draft.title}</h1>
                    <p className="text-gray-500 text-sm italic">{draft.metaDescription}</p>
                    <div className="flex gap-2 my-3">
                      <Badge>{draft.type}</Badge>
                      <Badge variant="outline">{draft.category}</Badge>
                    </div>
                    <div 
                      className="mt-4 text-gray-700"
                      dangerouslySetInnerHTML={{ __html: draft.content }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - AI Sidebar */}
          <div className="space-y-6">
            {draft && (
              <>
                {/* Refine Chat */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-purple-500" />
                      Refinar com IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Ex: Torne o tom mais leve, adicione uma dica sobre apps..."
                      value={refineInstruction}
                      onChange={(e) => setRefineInstruction(e.target.value)}
                      rows={3}
                    />
                    <Button
                      variant="outline"
                      onClick={handleRefine}
                      disabled={refineDraftMutation.isPending || !refineInstruction}
                      className="w-full"
                    >
                      {refineDraftMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Aplicar Ajuste
                    </Button>
                  </CardContent>
                </Card>

                {/* Image Prompt */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-pink-500" />
                      Prompt de Imagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={draft.imagePrompt}
                      onChange={(e) => setDraft({ ...draft, imagePrompt: e.target.value })}
                      rows={4}
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      Estilo: Papercraft Origami 3D volumétrico
                    </p>
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regerar Prompt
                    </Button>
                  </CardContent>
                </Card>

                {/* SEO Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">SEO (auto-preenchido)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <Label className="text-xs text-gray-500">Slug</Label>
                      <Input value={`/artigos/${draft.slug}`} readOnly className="text-xs" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Meta Description</Label>
                      <Textarea value={draft.metaDescription} readOnly className="text-xs" rows={2} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Keywords</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {draft.keywords.map((kw, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mission CTA Preview */}
                {draft.missionCta && (
                  <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Target className="w-5 h-5 text-purple-600" />
                        CTA de Missão (incluído no artigo)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-gray-800">{draft.missionCta.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{draft.missionCta.description}</p>
                      <p className="text-xs text-purple-600 mt-2">/missoes/{draft.missionCta.slug}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Publish Button */}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                  onClick={handlePublish}
                  disabled={publishMutation.isPending}
                >
                  {publishMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  Publicar Artigo
                </Button>
              </>
            )}

            {!draft && (
              <Card className="border-dashed border-2 border-gray-300">
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Gere um draft para ver as opções de edição aqui
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
