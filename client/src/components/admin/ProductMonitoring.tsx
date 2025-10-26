import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Package,
  TrendingUp,
  TrendingDown,
  Database,
  Settings,
  Play,
  Pause
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface JobStatus {
  [key: string]: boolean;
}

interface UpdateStats {
  totalUpdates: number;
  successfulUpdates: number;
  failedUpdates: number;
  lastUpdate: string;
  averageUpdateTime: number;
}

interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  highFreq: number;
  mediumFreq: number;
  lowFreq: number;
}

interface MonitoringStatus {
  jobs: JobStatus;
  statistics: UpdateStats;
  apiConfigured: boolean;
}

export function ProductMonitoring() {
  const [selectedFrequency, setSelectedFrequency] = useState<'high' | 'medium' | 'low' | undefined>();
  const [syncProgress, setSyncProgress] = useState<{total: number, current: number, updated: number, failed: number} | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para status do sistema
  const { data: monitoringStatus, isLoading } = useQuery({
    queryKey: ['/api/admin/product-updates/status'],
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  }) as { data: MonitoringStatus, isLoading: boolean };

  // Query para produtos por status
  const { data: activeProducts } = useQuery({
    queryKey: ['/api/admin/products/by-status/active'],
  }) as { data: any[] };

  const { data: inactiveProducts } = useQuery({
    queryKey: ['/api/admin/products/by-status/inactive'],
  }) as { data: any[] };

  // Mutation para executar atualização manual
  const runUpdateMutation = useMutation({
    mutationFn: async (frequency?: 'high' | 'medium' | 'low') => {
      const response = await apiRequest('POST', '/api/admin/product-updates/run', {
        frequency
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Atualização iniciada",
        description: "A atualização de produtos foi iniciada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/product-updates/status'] });
    },
    onError: (error) => {
      toast({
        title: "Erro na atualização",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Função para sincronização em massa com Amazon
  const syncAllProductsWithAmazon = async () => {
    setIsSyncing(true);
    setSyncProgress({ total: 0, current: 0, updated: 0, failed: 0 });

    try {
      const response = await apiRequest('POST', '/api/admin/sync-products-amazon', { 
        syncAll: true 
      });
      const result = await response.json();

      setSyncProgress({
        total: result.total,
        current: result.total,
        updated: result.updated,
        failed: result.failed
      });

      toast({
        title: "Sincronização concluída",
        description: `${result.updated} produtos atualizados com sucesso, ${result.failed} falharam.`,
      });

      queryClient.invalidateQueries({ queryKey: ['/api/admin/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products/by-status/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/products/by-status/inactive'] });

    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Erro ao sincronizar produtos com Amazon",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncProgress(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  const stats = monitoringStatus?.statistics;
  const jobs = monitoringStatus?.jobs || {};
  const successRate = stats?.totalUpdates ? 
    Math.round((stats.successfulUpdates / stats.totalUpdates) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Monitoramento de Produtos</h2>
          <p className="text-sm md:text-base text-gray-600">Status da PA API da Amazon e atualizações automáticas</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/product-updates/status'] })}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            <span className="text-xs md:text-sm">Atualizar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={syncAllProductsWithAmazon}
            disabled={isSyncing || !monitoringStatus?.apiConfigured}
            className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50"
            data-testid="button-sync-amazon"
          >
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-spin" />
            ) : (
              <Database className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            )}
            <span className="text-xs md:text-sm">Sincronizar com Amazon</span>
          </Button>
          <Button
            onClick={() => runUpdateMutation.mutate(undefined)}
            disabled={runUpdateMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 w-full sm:w-auto"
            size="sm"
          >
            {runUpdateMutation.isPending ? (
              <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            )}
            <span className="text-xs md:text-sm">Executar Atualização</span>
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">API Amazon</p>
                <p className="text-lg md:text-2xl font-bold">
                  {monitoringStatus?.apiConfigured ? (
                    <span className="text-green-600">Ativa</span>
                  ) : (
                    <span className="text-red-600">Inativa</span>
                  )}
                </p>
              </div>
              <div className={`p-1.5 md:p-2 rounded-full ${
                monitoringStatus?.apiConfigured ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {monitoringStatus?.apiConfigured ? (
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                <p className="text-lg md:text-2xl font-bold text-blue-600">{successRate}%</p>
              </div>
              <div className="p-1.5 md:p-2 rounded-full bg-blue-100">
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Produtos Ativos</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">
                  {activeProducts?.length || 0}
                </p>
              </div>
              <div className="p-1.5 md:p-2 rounded-full bg-green-100">
                <Package className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-600">Indisponíveis</p>
                <p className="text-lg md:text-2xl font-bold text-red-600">
                  {inactiveProducts?.length || 0}
                </p>
              </div>
              <div className="p-1.5 md:p-2 rounded-full bg-red-100">
                <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {!monitoringStatus?.apiConfigured && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API da Amazon não configurada</AlertTitle>
          <AlertDescription>
            Configure as credenciais da PA API para habilitar as atualizações automáticas de produtos.
          </AlertDescription>
        </Alert>
      )}

      {/* Progresso da Sincronização */}
      {syncProgress && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Database className="w-5 h-5 animate-pulse" />
              Sincronizando com Amazon PA API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span className="font-medium">
                  {syncProgress.current} / {syncProgress.total} produtos
                </span>
              </div>
              <Progress 
                value={syncProgress.total > 0 ? (syncProgress.current / syncProgress.total) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{syncProgress.updated}</p>
                <p className="text-xs text-gray-600">Atualizados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{syncProgress.current}</p>
                <p className="text-xs text-gray-600">Processados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{syncProgress.failed}</p>
                <p className="text-xs text-gray-600">Falharam</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="jobs" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="jobs" className="text-xs md:text-sm px-2 py-2">
            <span className="hidden sm:inline">Jobs de Atualização</span>
            <span className="sm:hidden">Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="text-xs md:text-sm px-2 py-2">
            <span className="hidden sm:inline">Estatísticas</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="text-xs md:text-sm px-2 py-2">
            Produtos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className="px-3 py-3 md:px-6 md:py-6">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <Activity className="w-4 h-4 md:w-5 md:h-5" />
                Status dos Jobs Automáticos
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Jobs executam automaticamente em intervalos definidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(jobs).map(([jobName, isActive]) => (
                  <div key={jobName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <p className="font-medium">
                          {jobName === 'highFreq' && 'Alta Frequência (30min)'}
                          {jobName === 'mediumFreq' && 'Média Frequência (2h)'}
                          {jobName === 'lowFreq' && 'Baixa Frequência (6h)'}
                          {jobName === 'reactivation' && 'Reativação (1x/dia)'}
                          {jobName === 'cleanup' && 'Limpeza (semanal)'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {isActive ? 'Ativo' : 'Parado'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {isActive ? 'Executando' : 'Parado'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Execução Manual</CardTitle>
              <CardDescription>
                Execute atualizações imediatas por frequência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => runUpdateMutation.mutate('high')}
                  disabled={runUpdateMutation.isPending}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Clock className="w-6 h-6 mb-2" />
                  <span className="font-medium">Alta Frequência</span>
                  <span className="text-xs text-gray-500">Produtos atualizados a cada 30min</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runUpdateMutation.mutate('medium')}
                  disabled={runUpdateMutation.isPending}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Clock className="w-6 h-6 mb-2" />
                  <span className="font-medium">Média Frequência</span>
                  <span className="text-xs text-gray-500">Produtos atualizados a cada 2h</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => runUpdateMutation.mutate('low')}
                  disabled={runUpdateMutation.isPending}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Clock className="w-6 h-6 mb-2" />
                  <span className="font-medium">Baixa Frequência</span>
                  <span className="text-xs text-gray-500">Produtos atualizados a cada 6h</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Atualização</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total de Atualizações</span>
                  <span className="text-lg font-bold">{stats?.totalUpdates || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Sucessos</span>
                  <span className="text-lg font-bold text-green-600">{stats?.successfulUpdates || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Falhas</span>
                  <span className="text-lg font-bold text-red-600">{stats?.failedUpdates || 0}</span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Taxa de Sucesso</span>
                    <span>{successRate}%</span>
                  </div>
                  <Progress value={successRate} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Última Atualização</span>
                  <span className="text-sm text-gray-600">
                    {stats?.lastUpdate ? new Date(stats.lastUpdate).toLocaleString('pt-BR') : 'Nunca'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tempo Médio</span>
                  <span className="text-sm text-gray-600">
                    {stats?.averageUpdateTime ? `${Math.round(stats.averageUpdateTime / 1000)}s` : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Produtos Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {activeProducts?.length || 0}
                </div>
                <p className="text-sm text-gray-600">
                  Produtos com atualizações funcionando
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Produtos Indisponíveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {inactiveProducts?.length || 0}
                </div>
                <p className="text-sm text-gray-600">
                  Produtos que precisam de atenção
                </p>
                {inactiveProducts && inactiveProducts.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => {
                      // TODO: Abrir modal com lista de produtos indisponíveis
                    }}
                  >
                    Ver detalhes
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}