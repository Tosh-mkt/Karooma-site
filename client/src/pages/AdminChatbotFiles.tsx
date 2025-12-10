import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, FileText, FolderOpen, Plus, Save, Trash2, RefreshCw, 
  Database, BookOpen, Shield, Settings, MessageCircle, Loader2,
  ChevronRight, Edit, AlertCircle
} from "lucide-react";
import { Link } from "wouter";

interface FAQEntry {
  question: string;
  answer: string;
  category: string;
  subcategory: string;
  missionSlug?: string;
  emotionalTrigger?: string;
  keywords: string[];
  source: string;
  filePath?: string;
}

interface ChatbotFilesData {
  config: {
    chatbot: { name: string; version: string; company: string };
    tone: { style: string; characteristics: string[] };
    restrictions: { must_not: string[] };
    links: Record<string, string>;
  } | null;
  systemPrompt: string | null;
  categories: string[];
  stats: {
    faqFiles: number;
    policyFiles: number;
    totalEntries: number;
  };
  entries: {
    faq: FAQEntry[];
    policies: FAQEntry[];
  };
}

export default function AdminChatbotFiles() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"faq" | "policy">("faq");
  const [showNewDialog, setShowNewDialog] = useState(false);

  const { data: filesData, isLoading, refetch } = useQuery<ChatbotFilesData>({
    queryKey: ["/api/chatbot/admin/files"],
  });

  const { data: categoryContent, isLoading: categoryLoading } = useQuery<{ category: string; content: string }>({
    queryKey: ["/api/chatbot/admin/files/category", selectedCategory],
    enabled: !!selectedCategory,
  });

  const saveCategoryMutation = useMutation({
    mutationFn: async ({ category, content }: { category: string; content: string }) => {
      return apiRequest("PUT", `/api/chatbot/admin/files/category/${encodeURIComponent(category)}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/admin/files"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/admin/files/category", selectedCategory] });
      setIsEditing(false);
      toast({ title: "Arquivo salvo com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar arquivo", variant: "destructive" });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: string }) => {
      return apiRequest("POST", "/api/chatbot/admin/files/category", { name, type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/admin/files"] });
      setShowNewDialog(false);
      setNewCategoryName("");
      toast({ title: "Categoria criada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar categoria", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (category: string) => {
      return apiRequest("DELETE", `/api/chatbot/admin/files/category/${encodeURIComponent(category)}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/admin/files"] });
      setSelectedCategory(null);
      toast({ title: "Categoria excluída!" });
    },
    onError: () => {
      toast({ title: "Erro ao excluir categoria", variant: "destructive" });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/chatbot/admin/files/sync", {});
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/admin/knowledge"] });
      toast({ 
        title: "Sincronização concluída!", 
        description: `${data.added} adicionados, ${data.skipped} já existentes` 
      });
    },
    onError: () => {
      toast({ title: "Erro na sincronização", variant: "destructive" });
    },
  });

  const handleEditCategory = () => {
    if (categoryContent) {
      setEditingContent(categoryContent.content);
      setIsEditing(true);
    }
  };

  const handleSaveCategory = () => {
    if (selectedCategory) {
      saveCategoryMutation.mutate({ category: selectedCategory, content: editingContent });
    }
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate({ 
        name: newCategoryName.toLowerCase().replace(/\s+/g, "-"), 
        type: newCategoryType 
      });
    }
  };

  const faqCategories = filesData?.categories.filter(c => !c.startsWith("policies/")) || [];
  const policyCategories = filesData?.categories.filter(c => c.startsWith("policies/")) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-20 md:pt-24 px-4 pb-8 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-purple-600" />
                Base de Conhecimento Karoo
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Gerencie arquivos de FAQ, políticas e configurações do chatbot
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              onClick={() => syncMutation.mutate()} 
              disabled={syncMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {syncMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Sincronizar com RAG
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Arquivos FAQ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{filesData?.stats.faqFiles || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                Arquivos Políticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{filesData?.stats.policyFiles || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-500" />
                Total de Perguntas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{filesData?.stats.totalEntries || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                Configuração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                {filesData?.config ? "Ativo" : "Não configurado"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tom: {filesData?.config?.tone?.style || "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-purple-600" />
                  Categorias
                </CardTitle>
                <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Nova
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Nova Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Nome da categoria</Label>
                        <Input 
                          placeholder="ex: sono, escola, higiene" 
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <Select value={newCategoryType} onValueChange={(v: "faq" | "policy") => setNewCategoryType(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="faq">FAQ (Perguntas Frequentes)</SelectItem>
                            <SelectItem value="policy">Política (Termos, LGPD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button 
                        onClick={handleCreateCategory}
                        disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                      >
                        {createCategoryMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Criar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">FAQ</h4>
                <div className="space-y-1">
                  {faqCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setIsEditing(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        selectedCategory === cat 
                          ? "bg-purple-100 text-purple-700" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span className="capitalize">{cat.replace(/-/g, " ")}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                  {faqCategories.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Nenhuma categoria</p>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Políticas</h4>
                <div className="space-y-1">
                  {policyCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setIsEditing(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        selectedCategory === cat 
                          ? "bg-green-100 text-green-700" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span className="capitalize">{cat.replace("policies/", "").replace(/-/g, " ")}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                  {policyCategories.length === 0 && (
                    <p className="text-sm text-gray-400 italic">Nenhuma política</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedCategory ? (
                    <span className="capitalize flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {selectedCategory.replace("policies/", "").replace(/-/g, " ")}
                    </span>
                  ) : (
                    "Selecione uma categoria"
                  )}
                </CardTitle>
                {selectedCategory && (
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <>
                        <Button size="sm" variant="outline" onClick={handleEditCategory}>
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteCategoryMutation.mutate(selectedCategory)}
                          disabled={deleteCategoryMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                          Cancelar
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSaveCategory}
                          disabled={saveCategoryMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {saveCategoryMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <Save className="w-4 h-4 mr-1" />
                          )}
                          Salvar
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedCategory ? (
                <div className="text-center py-12 text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione uma categoria à esquerda para visualizar ou editar</p>
                </div>
              ) : categoryLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              ) : isEditing ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Formato do arquivo:</p>
                      <p className="mt-1">Use ## para criar uma nova pergunta. Campos disponíveis:</p>
                      <code className="block mt-2 bg-yellow-100 p-2 rounded text-xs">
                        ## Título da pergunta{"\n"}
                        **Pergunta**: Texto da pergunta?{"\n"}
                        **Resposta**: Texto da resposta.{"\n"}
                        **Missão relacionada**: slug-da-missao{"\n"}
                        **Gatilho emocional**: Sentimento{"\n"}
                        **Palavras-chave**: palavra1, palavra2
                      </code>
                    </div>
                  </div>
                  <Textarea 
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                    placeholder="Conteúdo do arquivo..."
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {filesData?.entries && (
                    <>
                      {(selectedCategory.startsWith("policies/") 
                        ? filesData.entries.policies 
                        : filesData.entries.faq
                      ).filter(e => {
                        if (selectedCategory.startsWith("policies/")) {
                          return e.filePath?.includes(selectedCategory.replace("policies/", ""));
                        }
                        return e.filePath?.includes(`/faq/${selectedCategory}.md`);
                      }).map((entry, idx) => (
                        <div key={idx} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-gray-800">{entry.question}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {entry.subcategory}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{entry.answer}</p>
                          {entry.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2">
                              {entry.keywords.slice(0, 5).map((kw, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {kw}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {entry.missionSlug && (
                            <p className="text-xs text-purple-600">
                              Missão: {entry.missionSlug}
                            </p>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {filesData?.config && (
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-600" />
                Configuração Atual (config.json)
              </CardTitle>
              <CardDescription>
                Configurações de tom, restrições e comportamento da Karoo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="tone">
                <TabsList>
                  <TabsTrigger value="tone">Tom de Voz</TabsTrigger>
                  <TabsTrigger value="restrictions">Restrições</TabsTrigger>
                  <TabsTrigger value="links">Links</TabsTrigger>
                </TabsList>
                <TabsContent value="tone" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Estilo: {filesData.config.tone.style}</h4>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Características:</h4>
                      <div className="flex flex-wrap gap-2">
                        {filesData.config.tone.characteristics.map((c, i) => (
                          <Badge key={i} variant="secondary">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="restrictions" className="mt-4">
                  <div>
                    <h4 className="font-medium mb-2">A Karoo NÃO deve:</h4>
                    <ul className="space-y-2">
                      {filesData.config.restrictions.must_not.map((r, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="links" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(filesData.config.links).map(([key, value]) => (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">{key}</p>
                        <p className="font-medium text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
