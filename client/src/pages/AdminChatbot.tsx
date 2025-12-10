import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bot, Settings, Brain, MessageSquare, Plus, Trash2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ChatbotConfig {
  id: string;
  name: string;
  isActive: boolean;
  llmProvider: string;
  llmModel: string;
  systemPrompt: string;
  temperature: string;
  maxTokens: number;
  ragEnabled: boolean;
  ragSources: string[];
  ragMaxResults: number;
  welcomeMessage: string;
  suggestedQuestions: string[];
  widgetPosition: string;
  widgetPrimaryColor: string;
  widgetTitle: string;
}

interface LLMProvider {
  id: string;
  name: string;
  defaultModel: string;
  hasApiKey: boolean;
}

interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  category?: string;
  keywords?: string[];
  priority?: number;
  isActive: boolean;
}

interface Conversation {
  id: string;
  sessionId: string;
  userEmail?: string;
  userName?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminChatbot() {
  const { toast } = useToast();
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [newEntry, setNewEntry] = useState({ question: "", answer: "", category: "", keywords: "", priority: 0 });
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const { data: config, isLoading: configLoading } = useQuery<ChatbotConfig>({
    queryKey: ["/api/chatbot/admin/config"],
  });

  const { data: providers } = useQuery<LLMProvider[]>({
    queryKey: ["/api/chatbot/admin/providers"],
  });

  const { data: knowledge, isLoading: knowledgeLoading } = useQuery<KnowledgeEntry[]>({
    queryKey: ["/api/chatbot/admin/knowledge"],
  });

  const { data: conversations } = useQuery<Conversation[]>({
    queryKey: ["/api/chatbot/admin/conversations"],
  });

  const { data: conversationMessages } = useQuery({
    queryKey: ["/api/chatbot/admin/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<ChatbotConfig>) => {
      return apiRequest("PUT", "/api/chatbot/admin/config", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/admin/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/config/public"] });
      toast({ title: "Configuração salva com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao salvar configuração", variant: "destructive" });
    },
  });

  const addKnowledgeMutation = useMutation({
    mutationFn: async (entry: typeof newEntry) => {
      return apiRequest("POST", "/api/chatbot/admin/knowledge", {
        ...entry,
        keywords: entry.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/admin/knowledge"] });
      setNewEntry({ question: "", answer: "", category: "", keywords: "", priority: 0 });
      toast({ title: "Entrada adicionada!" });
    },
  });

  const deleteKnowledgeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/chatbot/admin/knowledge/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/admin/knowledge"] });
      toast({ title: "Entrada removida!" });
    },
  });

  const [localConfig, setLocalConfig] = useState<Partial<ChatbotConfig>>({});

  const handleConfigChange = (key: keyof ChatbotConfig, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  const saveConfig = () => {
    updateConfigMutation.mutate(localConfig);
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const mergedConfig = { ...config, ...localConfig };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <Bot className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Chatbot IA</h1>
          <p className="text-muted-foreground">Configure o assistente virtual do site</p>
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="prompt" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Prompt & RAG
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Base de Conhecimento
          </TabsTrigger>
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Conversas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Ajuste o comportamento e aparência do chatbot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Chatbot Ativo</Label>
                  <p className="text-sm text-muted-foreground">Ativar ou desativar o widget de chat</p>
                </div>
                <Switch
                  checked={mergedConfig.isActive}
                  onCheckedChange={(v) => handleConfigChange("isActive", v)}
                  data-testid="switch-chatbot-active"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Assistente</Label>
                  <Input
                    value={mergedConfig.name || ""}
                    onChange={(e) => handleConfigChange("name", e.target.value)}
                    placeholder="Karooma Assistant"
                    data-testid="input-assistant-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Título do Widget</Label>
                  <Input
                    value={mergedConfig.widgetTitle || ""}
                    onChange={(e) => handleConfigChange("widgetTitle", e.target.value)}
                    placeholder="Precisa de ajuda?"
                    data-testid="input-widget-title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provedor LLM</Label>
                  <Select
                    value={mergedConfig.llmProvider}
                    onValueChange={(v) => {
                      handleConfigChange("llmProvider", v);
                      const provider = providers?.find((p) => p.id === v);
                      if (provider) {
                        handleConfigChange("llmModel", provider.defaultModel);
                      }
                    }}
                  >
                    <SelectTrigger data-testid="select-llm-provider">
                      <SelectValue placeholder="Selecione o provedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {providers?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <div className="flex items-center gap-2">
                            {p.name}
                            {!p.hasApiKey && (
                              <Badge variant="destructive" className="text-xs">Sem API Key</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input
                    value={mergedConfig.llmModel || ""}
                    onChange={(e) => handleConfigChange("llmModel", e.target.value)}
                    placeholder="deepseek-chat"
                    data-testid="input-llm-model"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Temperatura ({mergedConfig.temperature || "0.7"})</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={mergedConfig.temperature || "0.7"}
                    onChange={(e) => handleConfigChange("temperature", e.target.value)}
                    data-testid="input-temperature"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <Input
                    type="number"
                    value={mergedConfig.maxTokens || 1024}
                    onChange={(e) => handleConfigChange("maxTokens", parseInt(e.target.value))}
                    data-testid="input-max-tokens"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Posição do Widget</Label>
                  <Select
                    value={mergedConfig.widgetPosition || "bottom-right"}
                    onValueChange={(v) => handleConfigChange("widgetPosition", v)}
                  >
                    <SelectTrigger data-testid="select-widget-position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Inferior Direito</SelectItem>
                      <SelectItem value="bottom-left">Inferior Esquerdo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cor Principal</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={mergedConfig.widgetPrimaryColor || "#6366f1"}
                    onChange={(e) => handleConfigChange("widgetPrimaryColor", e.target.value)}
                    className="w-20 h-10 p-1 cursor-pointer"
                    data-testid="input-widget-color"
                  />
                  <Input
                    value={mergedConfig.widgetPrimaryColor || "#6366f1"}
                    onChange={(e) => handleConfigChange("widgetPrimaryColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <Button onClick={saveConfig} disabled={updateConfigMutation.isPending} data-testid="button-save-config">
                {updateConfigMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prompt do Sistema</CardTitle>
              <CardDescription>Defina a personalidade e comportamento do assistente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={mergedConfig.systemPrompt || ""}
                onChange={(e) => handleConfigChange("systemPrompt", e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                placeholder="Digite o prompt do sistema..."
                data-testid="textarea-system-prompt"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>RAG (Busca de Contexto)</CardTitle>
              <CardDescription>Configure quais fontes de dados o chatbot pode consultar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>RAG Ativado</Label>
                  <p className="text-sm text-muted-foreground">Buscar contexto do site para enriquecer respostas</p>
                </div>
                <Switch
                  checked={mergedConfig.ragEnabled}
                  onCheckedChange={(v) => handleConfigChange("ragEnabled", v)}
                  data-testid="switch-rag-enabled"
                />
              </div>

              {mergedConfig.ragEnabled && (
                <>
                  <div className="space-y-2">
                    <Label>Fontes de Dados</Label>
                    <div className="flex flex-wrap gap-2">
                      {["missions", "blog", "products", "kits", "custom"].map((source) => {
                        const sources = mergedConfig.ragSources || [];
                        const isActive = sources.includes(source);
                        return (
                          <Badge
                            key={source}
                            variant={isActive ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const newSources = isActive
                                ? sources.filter((s) => s !== source)
                                : [...sources, source];
                              handleConfigChange("ragSources", newSources);
                            }}
                          >
                            {source === "missions" && "Missões"}
                            {source === "blog" && "Blog"}
                            {source === "products" && "Produtos"}
                            {source === "kits" && "Kits"}
                            {source === "custom" && "Personalizado"}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Máximo de Resultados RAG</Label>
                    <Input
                      type="number"
                      min="1"
                      max="20"
                      value={mergedConfig.ragMaxResults || 5}
                      onChange={(e) => handleConfigChange("ragMaxResults", parseInt(e.target.value))}
                      className="w-24"
                      data-testid="input-rag-max-results"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mensagens</CardTitle>
              <CardDescription>Configure as mensagens de boas-vindas e sugestões</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mensagem de Boas-Vindas</Label>
                <Textarea
                  value={mergedConfig.welcomeMessage || ""}
                  onChange={(e) => handleConfigChange("welcomeMessage", e.target.value)}
                  placeholder="Olá! Sou a assistente virtual da Karooma..."
                  data-testid="textarea-welcome-message"
                />
              </div>

              <div className="space-y-2">
                <Label>Perguntas Sugeridas (uma por linha)</Label>
                <Textarea
                  value={(mergedConfig.suggestedQuestions || []).join("\n")}
                  onChange={(e) =>
                    handleConfigChange("suggestedQuestions", e.target.value.split("\n").filter(Boolean))
                  }
                  placeholder="Como organizar minha manhã?&#10;Quais produtos ajudam na alimentação?"
                  className="min-h-[100px]"
                  data-testid="textarea-suggested-questions"
                />
              </div>

              <Button onClick={saveConfig} disabled={updateConfigMutation.isPending} data-testid="button-save-prompt">
                {updateConfigMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Base de Conhecimento Personalizada</CardTitle>
              <CardDescription>Adicione perguntas e respostas personalizadas para o chatbot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pergunta</Label>
                    <Input
                      value={newEntry.question}
                      onChange={(e) => setNewEntry((p) => ({ ...p, question: e.target.value }))}
                      placeholder="Qual o horário de funcionamento?"
                      data-testid="input-new-question"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria (opcional)</Label>
                    <Input
                      value={newEntry.category}
                      onChange={(e) => setNewEntry((p) => ({ ...p, category: e.target.value }))}
                      placeholder="FAQ, Produtos, Suporte..."
                      data-testid="input-new-category"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Resposta</Label>
                  <Textarea
                    value={newEntry.answer}
                    onChange={(e) => setNewEntry((p) => ({ ...p, answer: e.target.value }))}
                    placeholder="Nossa equipe está disponível de segunda a sexta, das 9h às 18h."
                    data-testid="textarea-new-answer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Palavras-chave (separadas por vírgula)</Label>
                    <Input
                      value={newEntry.keywords}
                      onChange={(e) => setNewEntry((p) => ({ ...p, keywords: e.target.value }))}
                      placeholder="horário, funcionamento, atendimento"
                      data-testid="input-new-keywords"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Input
                      type="number"
                      value={newEntry.priority}
                      onChange={(e) => setNewEntry((p) => ({ ...p, priority: parseInt(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                      data-testid="input-new-priority"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => addKnowledgeMutation.mutate(newEntry)}
                  disabled={!newEntry.question || !newEntry.answer || addKnowledgeMutation.isPending}
                  data-testid="button-add-knowledge"
                >
                  {addKnowledgeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Adicionar Entrada
                </Button>
              </div>

              {knowledgeLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : knowledge && knowledge.length > 0 ? (
                <div className="space-y-3">
                  {knowledge.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{entry.question}</p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{entry.answer}</p>
                          <div className="flex gap-2 mt-2">
                            {entry.category && <Badge variant="outline">{entry.category}</Badge>}
                            {entry.priority && entry.priority > 0 && (
                              <Badge variant="secondary">Prioridade: {entry.priority}</Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteKnowledgeMutation.mutate(entry.id)}
                          className="text-destructive hover:text-destructive"
                          data-testid={`button-delete-knowledge-${entry.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma entrada na base de conhecimento ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversas Recentes</CardTitle>
              <CardDescription>Visualize as interações com o chatbot</CardDescription>
            </CardHeader>
            <CardContent>
              {conversations && conversations.length > 0 ? (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedConversation === conv.id ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedConversation(conv.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">
                            {conv.userName || conv.userEmail || `Sessão ${conv.sessionId.slice(0, 12)}...`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(conv.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <Badge variant={conv.status === "active" ? "default" : "secondary"}>
                          {conv.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma conversa ainda.
                </p>
              )}

              {selectedConversation && conversationMessages && Array.isArray(conversationMessages) && (
                <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Detalhes da Conversa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                      {conversationMessages.map((msg: any) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg ${
                            msg.role === "user"
                              ? "bg-primary/10 ml-8"
                              : "bg-muted mr-8"
                          }`}
                        >
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            {msg.role === "user" ? "Usuário" : "Assistente"}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(msg.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
