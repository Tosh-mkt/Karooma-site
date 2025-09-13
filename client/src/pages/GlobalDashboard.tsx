import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  DollarSign, 
  Globe, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  Activity,
  Settings,
  RefreshCw,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RegionOverview {
  regionId: string;
  regionName: string;
  isActive: boolean;
  totalProducts: number;
  availableProducts: number;
  monthlyBudget: number;
  currentSpent: number;
  dailyLimitUsage: number;
  clicksToday: number;
  conversionRate: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface CostAnalytics {
  totalMonthlyBudget: number;
  totalSpent: number;
  projectedSpend: number;
  savingsOpportunity: number;
  mostExpensiveRegion: string;
  costEfficiencyScore: number;
}

interface SmartLinkStats {
  totalClicks: number;
  successRate: number;
  fallbackRate: number;
  topPerformingRegions: Array<{ region: string; clicks: number; conversion: number }>;
  recentActivity: Array<{ time: string; region: string; product: string; success: boolean }>;
}

export default function GlobalDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Queries para dados do dashboard
  const { data: regionOverview, isLoading: loadingRegions } = useQuery({
    queryKey: ['/api/admin/regions/overview'],
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  const { data: costAnalytics, isLoading: loadingCosts } = useQuery({
    queryKey: ['/api/admin/costs/analytics']
  });

  const { data: linkStats, isLoading: loadingLinks } = useQuery({
    queryKey: ['/api/admin/smart-links/stats']
  });

  const handleRefreshAll = async () => {
    setRefreshing(true);
    // Trigger refresh of all queries
    await Promise.all([
      // queryClient.invalidateQueries({ queryKey: ['/api/admin/regions/overview'] }),
      // queryClient.invalidateQueries({ queryKey: ['/api/admin/costs/analytics'] }),
      // queryClient.invalidateQueries({ queryKey: ['/api/admin/smart-links/stats'] })
    ]);
    setRefreshing(false);
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6" data-testid="global-dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="dashboard-title">
              Dashboard Global Karooma
            </h1>
            <p className="text-gray-600">
              Gerencie produtos, regiões e otimize custos da Amazon PA API
            </p>
          </div>
          <Button 
            onClick={handleRefreshAll} 
            disabled={refreshing}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar Dados
          </Button>
        </div>

        {/* Alertas e Status */}
        {costAnalytics && costAnalytics.savingsOpportunity > 50 && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Oportunidade de Economia Detectada</AlertTitle>
            <AlertDescription>
              Você pode economizar até {formatCurrency(costAnalytics.savingsOpportunity)} 
              este mês otimizando a frequência de atualizações da PA API.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="regions" data-testid="tab-regions">Regiões</TabsTrigger>
            <TabsTrigger value="costs" data-testid="tab-costs">Custos</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Configurações</TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-budget">
                    {costAnalytics ? formatCurrency(costAnalytics.totalMonthlyBudget) : '$--'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {costAnalytics && 
                      `${((costAnalytics.totalSpent / costAnalytics.totalMonthlyBudget) * 100).toFixed(1)}% usado`
                    }
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Regiões Ativas</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-active-regions">
                    {regionOverview ? regionOverview.filter((r: RegionOverview) => r.isActive).length : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {regionOverview ? `de ${regionOverview.length} total` : 'Carregando...'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clicks Hoje</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-clicks-today">
                    {linkStats ? linkStats.totalClicks.toLocaleString() : '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {linkStats && `${linkStats.successRate.toFixed(1)}% taxa de sucesso`}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Eficiência</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-efficiency">
                    {costAnalytics ? `${costAnalytics.costEfficiencyScore}/100` : '--'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Score de otimização
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Executar operações comuns de otimização
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="justify-start" data-testid="button-optimize-costs">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Otimizar Custos
                </Button>
                <Button variant="outline" className="justify-start" data-testid="button-update-products">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Produtos
                </Button>
                <Button variant="outline" className="justify-start" data-testid="button-view-analytics">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Analytics Completo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Regiões */}
          <TabsContent value="regions" className="space-y-6">
            <div className="grid gap-6">
              {regionOverview && regionOverview.map((region: RegionOverview) => (
                <Card key={region.regionId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <CardTitle className="text-lg">{region.regionName}</CardTitle>
                        <Badge variant={region.isActive ? 'default' : 'secondary'}>
                          {region.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                        <Badge variant={getRiskBadgeColor(region.riskLevel)}>
                          Risco: {region.riskLevel}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Produtos</p>
                        <p className="text-lg font-semibold">
                          {region.availableProducts}/{region.totalProducts}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Orçamento</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(region.currentSpent)}/{formatCurrency(region.monthlyBudget)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Clicks Hoje</p>
                        <p className="text-lg font-semibold">{region.clicksToday}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversão</p>
                        <p className="text-lg font-semibold">{region.conversionRate.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uso do orçamento</span>
                        <span>{((region.currentSpent / region.monthlyBudget) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={(region.currentSpent / region.monthlyBudget) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Limite diário de API</span>
                        <span>{region.dailyLimitUsage.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={region.dailyLimitUsage} 
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Custos */}
          <TabsContent value="costs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Custos</CardTitle>
                  <CardDescription>Visão detalhada dos gastos com PA API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {costAnalytics && (
                    <>
                      <div className="flex justify-between items-center">
                        <span>Gasto atual</span>
                        <span className="font-semibold text-lg">
                          {formatCurrency(costAnalytics.totalSpent)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Projeção mensal</span>
                        <span className="font-semibold text-lg">
                          {formatCurrency(costAnalytics.projectedSpend)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Economia possível</span>
                        <span className="font-semibold text-lg text-green-600">
                          {formatCurrency(costAnalytics.savingsOpportunity)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Região mais cara</span>
                        <span className="font-semibold">
                          {costAnalytics.mostExpensiveRegion}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recomendações de Otimização</CardTitle>
                  <CardDescription>Sugestões para reduzir custos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Agrupar requisições em horários off-peak</p>
                      <p className="text-xs text-muted-foreground">Economia estimada: $45/mês</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Estender cache de produtos menos populares</p>
                      <p className="text-xs text-muted-foreground">Economia estimada: $32/mês</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Desativar produtos inativos há 30+ dias</p>
                      <p className="text-xs text-muted-foreground">Economia estimada: $18/mês</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance dos Smart Links</CardTitle>
                <CardDescription>Estatísticas de redirecionamento e conversão</CardDescription>
              </CardHeader>
              <CardContent>
                {linkStats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {linkStats.totalClicks.toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Total de Clicks</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {linkStats.successRate.toFixed(1)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">
                        {linkStats.fallbackRate.toFixed(1)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Taxa de Fallback</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regiões com Melhor Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {linkStats && linkStats.topPerformingRegions && (
                  <div className="space-y-4">
                    {linkStats.topPerformingRegions.map((region: any, index: number) => (
                      <div key={region.region} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{region.region}</p>
                            <p className="text-sm text-muted-foreground">
                              {region.clicks} clicks
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{region.conversion.toFixed(1)}%</p>
                          <p className="text-sm text-muted-foreground">conversão</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Globais</CardTitle>
                <CardDescription>
                  Ajustar parâmetros do sistema de globalização
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Orçamentos por Região
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  Gerenciar Regiões Ativas
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Configurar Frequência de Cache
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Configurar Fallbacks por Região
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}