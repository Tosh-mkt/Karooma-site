import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { AdminLogin } from "./AdminLogin";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Package, 
  Send,
  Eye,
  Clock,
  ArrowRightLeft,
  History,
  Shield,
  Filter,
  Search
} from "lucide-react";
import type { ProductIssue, ProductReplacementLog } from "@shared/schema";

type IssueType = "UNAVAILABLE" | "PRICE_CHANGE" | "DATA_STALE" | "LOW_RATING" | "OUT_OF_STOCK";
type IssueStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "IGNORED";

const issueTypeLabels: Record<string, string> = {
  UNAVAILABLE: "Indisponível",
  PRICE_CHANGE: "Mudança de Preço",
  DATA_STALE: "Dados Desatualizados",
  LOW_RATING: "Avaliação Baixa",
  OUT_OF_STOCK: "Fora de Estoque"
};

const issueTypeBadges: Record<string, string> = {
  UNAVAILABLE: "bg-red-100 text-red-800",
  PRICE_CHANGE: "bg-yellow-100 text-yellow-800",
  DATA_STALE: "bg-orange-100 text-orange-800",
  LOW_RATING: "bg-purple-100 text-purple-800",
  OUT_OF_STOCK: "bg-gray-100 text-gray-800"
};

function IssuesDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<ProductIssue | null>(null);
  const [replacementAsin, setReplacementAsin] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const buildQueryUrl = () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (typeFilter !== "all") params.append("issueType", typeFilter);
    const queryString = params.toString();
    return `/api/admin/product-issues${queryString ? `?${queryString}` : ""}`;
  };

  const { data: issuesResponse, isLoading } = useQuery<{
    success: boolean;
    issues: ProductIssue[];
    summary: any;
    pendingCount: number;
  }>({
    queryKey: ["/api/admin/product-issues", statusFilter, typeFilter],
    queryFn: async () => {
      const response = await fetch(buildQueryUrl());
      if (!response.ok) throw new Error("Failed to fetch issues");
      return response.json();
    }
  });

  const issues = issuesResponse?.issues;
  const stats = {
    total: issues?.length || 0,
    pending: issuesResponse?.pendingCount || 0,
    resolved: issues?.filter(i => i.status === "RESOLVED").length || 0,
    ignored: issues?.filter(i => i.status === "IGNORED").length || 0,
  };

  const resolveMutation = useMutation({
    mutationFn: async (data: { id: string; status: string; resolutionNotes?: string; replacementAsin?: string }) => {
      if (data.replacementAsin) {
        return apiRequest(`/api/admin/product-issues/${data.id}/replace`, "POST", {
          newAsin: data.replacementAsin,
          resolutionNotes: data.resolutionNotes
        });
      }
      if (data.status === "ignored") {
        return apiRequest(`/api/admin/product-issues/${data.id}/ignore`, "POST", {
          reason: data.resolutionNotes
        });
      }
      return apiRequest(`/api/admin/product-issues/${data.id}/resolve`, "POST", {
        resolutionNotes: data.resolutionNotes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-issues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/product-issues/stats"] });
      toast({ title: "Pendência atualizada!" });
      setSelectedIssue(null);
      setReplacementAsin("");
      setResolutionNotes("");
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar pendência", description: error.message, variant: "destructive" });
    }
  });

  const sendDigestMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/admin/product-issues/send-digest", "POST");
    },
    onSuccess: () => {
      toast({ title: "Digest enviado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao enviar digest", description: error.message, variant: "destructive" });
    }
  });

  const filteredIssues = issues?.filter(issue => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        issue.asin?.toLowerCase().includes(search) ||
        issue.productTitle?.toLowerCase().includes(search)
      );
    }
    return true;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glassmorphism border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Resolvidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.resolved || 0}</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <XCircle className="w-4 h-4 mr-2 text-gray-500" />
              Ignoradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ignored || 0}</div>
          </CardContent>
        </Card>
        <Card className="glassmorphism border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Package className="w-4 h-4 mr-2 text-blue-500" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PENDING">Pendentes</SelectItem>
              <SelectItem value="RESOLVED">Resolvidas</SelectItem>
              <SelectItem value="IGNORED">Ignoradas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]" data-testid="select-type-filter">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="UNAVAILABLE">Indisponível</SelectItem>
              <SelectItem value="PRICE_CHANGE">Mudança de Preço</SelectItem>
              <SelectItem value="DATA_STALE">Dados Desatualizados</SelectItem>
              <SelectItem value="LOW_RATING">Avaliação Baixa</SelectItem>
              <SelectItem value="OUT_OF_STOCK">Fora de Estoque</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar ASIN ou título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[200px]"
              data-testid="input-search"
            />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => sendDigestMutation.mutate()}
          disabled={sendDigestMutation.isPending}
          data-testid="button-send-digest"
        >
          <Send className="w-4 h-4 mr-2" />
          {sendDigestMutation.isPending ? "Enviando..." : "Enviar Digest Agora"}
        </Button>
      </div>

      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <Card className="glassmorphism border-0">
            <CardContent className="py-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-gray-600">Nenhuma pendência encontrada!</p>
            </CardContent>
          </Card>
        ) : (
          filteredIssues.map((issue) => (
            <Card key={issue.id} className="glassmorphism border-0">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={issueTypeBadges[issue.issueType] || "bg-gray-100"}>
                        {issueTypeLabels[issue.issueType] || issue.issueType}
                      </Badge>
                      <Badge variant={issue.status === "PENDING" ? "destructive" : issue.status === "RESOLVED" ? "default" : "secondary"}>
                        {issue.status === "PENDING" ? "Pendente" : issue.status === "RESOLVED" ? "Resolvida" : "Ignorada"}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-lg" data-testid={`text-title-${issue.id}`}>
                      {issue.productTitle || issue.asin}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">ASIN: {issue.asin}</p>
                    {issue.issueDetails && (
                      <p className="text-sm text-gray-700">
                        {issue.issueDetails.previousPrice ? `Preço anterior: R$${issue.issueDetails.previousPrice}` : ''}
                        {issue.issueDetails.currentPrice ? ` → R$${issue.issueDetails.currentPrice}` : ''}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString('pt-BR') : '-'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    {issue.status === "PENDING" && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedIssue(issue)}
                              data-testid={`button-replace-${issue.id}`}
                            >
                              <ArrowRightLeft className="w-4 h-4 mr-1" />
                              Substituir
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Substituir Produto</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm font-medium mb-1">Produto Atual</p>
                                <p className="text-sm text-gray-600">{issue.productTitle}</p>
                                <p className="text-xs text-gray-500">ASIN: {issue.asin}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">ASIN do Novo Produto</label>
                                <Input
                                  placeholder="B0XXXXXXXX"
                                  value={replacementAsin}
                                  onChange={(e) => setReplacementAsin(e.target.value)}
                                  className="mt-1"
                                  data-testid="input-replacement-asin"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Notas (opcional)</label>
                                <Textarea
                                  placeholder="Motivo da substituição..."
                                  value={resolutionNotes}
                                  onChange={(e) => setResolutionNotes(e.target.value)}
                                  className="mt-1"
                                  data-testid="input-notes"
                                />
                              </div>
                              <Button
                                onClick={() => resolveMutation.mutate({
                                  id: issue.id,
                                  status: "resolved",
                                  resolutionNotes,
                                  replacementAsin
                                })}
                                disabled={!replacementAsin || resolveMutation.isPending}
                                className="w-full"
                                data-testid="button-confirm-replace"
                              >
                                {resolveMutation.isPending ? "Processando..." : "Confirmar Substituição"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => resolveMutation.mutate({
                            id: issue.id,
                            status: "resolved",
                            resolutionNotes: "Resolvido manualmente"
                          })}
                          disabled={resolveMutation.isPending}
                          data-testid={`button-resolve-${issue.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resolveMutation.mutate({
                            id: issue.id,
                            status: "ignored",
                            resolutionNotes: "Ignorado pelo admin"
                          })}
                          disabled={resolveMutation.isPending}
                          data-testid={`button-ignore-${issue.id}`}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Ignorar
                        </Button>
                      </>
                    )}
                    {issue.status !== "PENDING" && issue.resolutionNotes && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <p className="font-medium">Notas:</p>
                        <p>{issue.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function ReplacementHistory() {
  const { data: response, isLoading } = useQuery<{ success: boolean; log: ProductReplacementLog[] }>({
    queryKey: ["/api/admin/replacement-log"],
  });

  const logs = response?.log;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center">
        <History className="w-5 h-5 mr-2" />
        Histórico de Substituições
      </h3>
      {!logs || logs.length === 0 ? (
        <Card className="glassmorphism border-0">
          <CardContent className="py-8 text-center">
            <History className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Nenhuma substituição registrada ainda.</p>
          </CardContent>
        </Card>
      ) : (
        logs.map((log) => (
          <Card key={log.id} className="glassmorphism border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{log.oldAsin}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium text-green-600">{log.newAsin}</span>
              </div>
              {log.replacementReason && (
                <p className="text-sm text-gray-600">{log.replacementReason}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                {log.createdAt ? new Date(log.createdAt).toLocaleString('pt-BR') : '-'}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

export default function AdminProductIssues() {
  const { isLoading, isAuthenticated, isAdmin, user } = useAuth();

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <AdminLogin />;
  }

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <h1 className="font-outfit font-bold text-2xl md:text-4xl gradient-text">
                Pendências de Produtos
              </h1>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/admin/dashboard"}>
              Voltar ao Dashboard
            </Button>
          </div>
          <p className="text-gray-600 font-poppins">
            Gerencie problemas detectados em produtos e substitua itens quando necessário.
          </p>
        </motion.div>

        <Tabs defaultValue="issues" className="space-y-6">
          <TabsList className="bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="issues" className="data-[state=active]:bg-purple-100">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Pendências
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-100">
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="issues">
            <IssuesDashboard />
          </TabsContent>

          <TabsContent value="history">
            <ReplacementHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
