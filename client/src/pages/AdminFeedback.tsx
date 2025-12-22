import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MessageSquare, Lightbulb, AlertTriangle, FileText, Trash2, Check, Clock, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VisitorFeedback {
  id: string;
  type: "suggestion" | "complaint" | "request";
  message: string;
  visitorName: string | null;
  visitorEmail: string | null;
  conversationContext: string | null;
  pageUrl: string | null;
  userAgent: string | null;
  status: "pending" | "reviewed" | "resolved";
  adminNotes: string | null;
  emailSent: boolean;
  createdAt: string;
  updatedAt: string;
}

const typeConfig = {
  suggestion: { label: "Sugestão", icon: Lightbulb, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" },
  complaint: { label: "Reclamação", icon: AlertTriangle, color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  request: { label: "Pedido", icon: FileText, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
};

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  reviewed: { label: "Analisado", icon: Eye, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  resolved: { label: "Resolvido", icon: Check, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
};

export default function AdminFeedback() {
  const { toast } = useToast();
  const [selectedFeedback, setSelectedFeedback] = useState<VisitorFeedback | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: feedbackList, isLoading } = useQuery<VisitorFeedback[]>({
    queryKey: ["/api/chatbot/admin/feedback"],
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<VisitorFeedback> }) => {
      return apiRequest("PUT", `/api/chatbot/admin/feedback/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/admin/feedback"] });
      toast({ title: "Feedback atualizado!" });
      setSelectedFeedback(null);
    },
    onError: () => {
      toast({ title: "Erro ao atualizar feedback", variant: "destructive" });
    },
  });

  const deleteFeedbackMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/chatbot/admin/feedback/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chatbot/admin/feedback"] });
      toast({ title: "Feedback removido!" });
    },
    onError: () => {
      toast({ title: "Erro ao remover feedback", variant: "destructive" });
    },
  });

  const filteredFeedback = feedbackList?.filter((f) => {
    if (filterType !== "all" && f.type !== filterType) return false;
    if (filterStatus !== "all" && f.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: feedbackList?.length || 0,
    pending: feedbackList?.filter((f) => f.status === "pending").length || 0,
    suggestions: feedbackList?.filter((f) => f.type === "suggestion").length || 0,
    complaints: feedbackList?.filter((f) => f.type === "complaint").length || 0,
    requests: feedbackList?.filter((f) => f.type === "request").length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="feedback-loading">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4" data-testid="admin-feedback-page">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-purple-600" />
          Feedback dos Visitantes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gerencie sugestões, reclamações e pedidos recebidos via chatbot
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pendentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600">{stats.suggestions}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sugestões</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{stats.complaints}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Reclamações</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.requests}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pedidos</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]" data-testid="filter-type">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="suggestion">Sugestões</SelectItem>
            <SelectItem value="complaint">Reclamações</SelectItem>
            <SelectItem value="request">Pedidos</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]" data-testid="filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="reviewed">Analisados</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredFeedback?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhum feedback encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFeedback?.map((feedback) => {
            const TypeIcon = typeConfig[feedback.type]?.icon || FileText;
            const StatusIcon = statusConfig[feedback.status]?.icon || Clock;

            return (
              <Card key={feedback.id} className="hover:shadow-md transition-shadow" data-testid={`feedback-card-${feedback.id}`}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={typeConfig[feedback.type]?.color}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {typeConfig[feedback.type]?.label}
                        </Badge>
                        <Badge className={statusConfig[feedback.status]?.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[feedback.status]?.label}
                        </Badge>
                        {feedback.emailSent && (
                          <Badge variant="outline" className="text-xs">
                            Email enviado
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-900 dark:text-white font-medium mb-2">
                        {feedback.message}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        {feedback.visitorName && (
                          <span>Nome: {feedback.visitorName}</span>
                        )}
                        {feedback.visitorEmail && (
                          <span>Email: {feedback.visitorEmail}</span>
                        )}
                        <span>
                          {format(new Date(feedback.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>

                      {feedback.adminNotes && (
                        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                          <strong>Notas:</strong> {feedback.adminNotes}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setAdminNotes(feedback.adminNotes || "");
                            }}
                            data-testid={`button-edit-${feedback.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <TypeIcon className="w-5 h-5" />
                              Detalhes do Feedback
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mensagem</label>
                              <p className="mt-1 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                                {feedback.message}
                              </p>
                            </div>

                            {feedback.conversationContext && (
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contexto da Conversa</label>
                                <p className="mt-1 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm whitespace-pre-wrap">
                                  {feedback.conversationContext}
                                </p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                <Select
                                  value={feedback.status}
                                  onValueChange={(value) => {
                                    updateFeedbackMutation.mutate({
                                      id: feedback.id,
                                      updates: { status: value as "pending" | "reviewed" | "resolved" },
                                    });
                                  }}
                                >
                                  <SelectTrigger className="mt-1" data-testid={`select-status-${feedback.id}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="reviewed">Analisado</SelectItem>
                                    <SelectItem value="resolved">Resolvido</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Página de Origem</label>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {feedback.pageUrl || "Não registrado"}
                                </p>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notas do Admin</label>
                              <Textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Adicione notas sobre este feedback..."
                                className="mt-1"
                                rows={3}
                                data-testid={`textarea-notes-${feedback.id}`}
                              />
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              onClick={() => {
                                updateFeedbackMutation.mutate({
                                  id: feedback.id,
                                  updates: { adminNotes },
                                });
                              }}
                              disabled={updateFeedbackMutation.isPending}
                              data-testid={`button-save-${feedback.id}`}
                            >
                              {updateFeedbackMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                              Salvar Notas
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir este feedback?")) {
                            deleteFeedbackMutation.mutate(feedback.id);
                          }
                        }}
                        data-testid={`button-delete-${feedback.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
