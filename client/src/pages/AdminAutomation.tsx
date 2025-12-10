import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Circle, Clock, ArrowRight, Zap, Mail, Bell, MessageSquare, Activity } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AutomationStage {
  id: string;
  day: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  evidence?: any;
  completedAt?: string;
  estimatedTime: string;
  successCriteria: string[];
  icon: any;
}

const AUTOMATION_STAGES: AutomationStage[] = [
  {
    id: 'day_1',
    day: 'Dia 1',
    title: 'Email Welcome System',
    description: 'Configurar template de boas-vindas + entrega de lead magnet via SendGrid',
    status: 'pending',
    estimatedTime: '2-3 horas',
    successCriteria: [
      'Template de email criado no SendGrid',
      'Webhook de lead_captured funcionando',
      '1 email de teste enviado e recebido'
    ],
    icon: Mail
  },
  {
    id: 'day_2',
    day: 'Dia 2',
    title: 'SendGrid Integration',
    description: 'Integração completa com logs de envio e tratamento de erros',
    status: 'pending',
    estimatedTime: '2 horas',
    successCriteria: [
      'Logs de envio salvos no banco',
      'Tratamento de erros implementado',
      'Dashboard de métricas básico'
    ],
    icon: CheckCircle
  },
  {
    id: 'day_3',
    day: 'Dia 3', 
    title: 'Web Push Notifications',
    description: 'Service Worker + sistema de opt-in para notificações push',
    status: 'pending',
    estimatedTime: '3 horas',
    successCriteria: [
      'Service worker instalado e funcionando',
      'Pop-up de opt-in implementado',
      '1 push notification enviada com sucesso'
    ],
    icon: Bell
  },
  {
    id: 'day_4',
    day: 'Dia 4',
    title: 'Push Notification Testing',
    description: 'Testar notificações para eventos de conteúdo novo',
    status: 'pending',
    estimatedTime: '1-2 horas',
    successCriteria: [
      'Push enviada ao publicar conteúdo',
      'Taxa de opt-in > 10%',
      'Notificações exibindo corretamente'
    ],
    icon: Activity
  },
  {
    id: 'day_5',
    day: 'Dia 5',
    title: 'WhatsApp Opt-in Collection',
    description: 'Landing page para coletar interesse em WhatsApp',
    status: 'pending',
    estimatedTime: '2 horas',
    successCriteria: [
      'Checkbox de WhatsApp em formulários',
      'Base de opt-ins coletada',
      'Consentimento LGPD implementado'
    ],
    icon: MessageSquare
  },
  {
    id: 'day_6',
    day: 'Dia 6',
    title: 'Price Monitoring System',
    description: 'Cron job para monitorar mudanças de preço diariamente',
    status: 'pending',
    estimatedTime: '3 horas',
    successCriteria: [
      'Cron job configurado',
      'Comparação de preços funcionando',
      'Detecção de mudanças automática'
    ],
    icon: Zap
  },
  {
    id: 'day_7',
    day: 'Dia 7',
    title: 'Price Alert System',
    description: 'Notificar usuários sobre mudanças de preço via email/push',
    status: 'pending',
    estimatedTime: '2-3 horas',
    successCriteria: [
      'Alertas enviados para leads interessados',
      'Aumento de 10% em conversões',
      'Sistema funcionando end-to-end'
    ],
    icon: ArrowRight
  }
];

export function AdminAutomation() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("progress");
  
  // Query automation progress
  const { data: progress, isLoading } = useQuery({
    queryKey: ['/api/admin/automation/progress'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Query automation jobs
  const { data: jobs } = useQuery({
    queryKey: ['/api/admin/automation/jobs']
  });

  // Initialize automation system
  const initializeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/automation/initialize"),
    onSuccess: () => {
      toast({
        title: "✅ Sistema Inicializado",
        description: "Sistema de automação pronto para começar!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/automation/progress'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Erro",
        description: error?.message || "Falha ao inicializar sistema",
        variant: "destructive",
      });
    }
  });

  // Start stage mutation
  const startStageMutation = useMutation({
    mutationFn: (stageId: string) => apiRequest("POST", `/api/admin/automation/start-stage`, { stageId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/automation/progress'] });
    }
  });

  const completeStageMutation = useMutation({
    mutationFn: ({ stageId, evidence }: { stageId: string; evidence: any }) => 
      apiRequest("POST", `/api/admin/automation/complete-stage`, { stageId, evidence }),
    onSuccess: () => {
      toast({
        title: "🎉 Etapa Concluída!",
        description: "Progresso atualizado. Próxima etapa disponível.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/automation/progress'] });
    }
  });

  // Merge server progress with default stages
  const currentStages = AUTOMATION_STAGES.map(stage => {
    const progressArray = Array.isArray(progress) ? progress : [];
    const serverProgress = progressArray.find((p: any) => p.stage === stage.id);
    return {
      ...stage,
      status: serverProgress?.status || stage.status,
      evidence: serverProgress?.evidence,
      completedAt: serverProgress?.completedAt
    };
  });

  const completedStages = currentStages.filter(s => s.status === 'completed').length;
  const currentStage = currentStages.find(s => s.status === 'in_progress') || 
                     currentStages.find(s => s.status === 'pending');
  const progressPercentage = (completedStages / AUTOMATION_STAGES.length) * 100;

  const handleStartStage = (stageId: string) => {
    startStageMutation.mutate(stageId);
  };

  const handleCompleteStage = (stageId: string) => {
    const evidence = {
      completedAt: new Date().toISOString(),
      manualConfirmation: true,
      timestamp: Date.now()
    };
    completeStageMutation.mutate({ stageId, evidence });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 pt-20 md:pt-24 px-6 pb-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🚀 Marketing Automation - MVP
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Sistema de automação ultra-lean com ROI imediato. Acompanhe o progresso das 7 etapas do MVP.
          </p>
        </div>

        {/* Overall Progress */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Activity className="h-6 w-6" />
              Progresso Geral do MVP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progressPercentage} className="h-3 bg-white/20" />
              <div className="flex justify-between text-sm">
                <span>{completedStages} de {AUTOMATION_STAGES.length} etapas concluídas</span>
                <span>{Math.round(progressPercentage)}% completo</span>
              </div>
              {currentStage && (
                <Alert className="bg-white/10 border-white/20 text-white">
                  <ArrowRight className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Próxima etapa:</strong> {currentStage.title} - {currentStage.estimatedTime}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="progress" data-testid="tab-progress">📊 Progresso</TabsTrigger>
            <TabsTrigger value="jobs" data-testid="tab-jobs">⚙️ Jobs</TabsTrigger>
            <TabsTrigger value="metrics" data-testid="tab-metrics">📈 Métricas</TabsTrigger>
          </TabsList>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <div className="grid gap-4">
              {currentStages.map((stage, index) => {
                const Icon = stage.icon;
                const isNext = currentStage?.id === stage.id;
                
                return (
                  <Card 
                    key={stage.id} 
                    className={`transition-all duration-200 ${
                      stage.status === 'completed' ? 'bg-green-50 border-green-200' :
                      isNext ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-200' :
                      'bg-white border-gray-200'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        
                        {/* Status Icon */}
                        <div className={`p-2 rounded-full flex-shrink-0 ${
                          stage.status === 'completed' ? 'bg-green-100' :
                          stage.status === 'in_progress' ? 'bg-blue-100' :
                          'bg-gray-100'
                        }`}>
                          {stage.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : stage.status === 'in_progress' ? (
                            <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>

                        <div className="flex-1 space-y-3">
                          
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-gray-600" />
                              <div>
                                <h3 className="font-semibold text-lg">{stage.day}: {stage.title}</h3>
                                <p className="text-gray-600">{stage.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                stage.status === 'completed' ? 'default' :
                                stage.status === 'in_progress' ? 'secondary' :
                                'outline'
                              }>
                                {stage.status === 'completed' ? '✅ Concluído' :
                                 stage.status === 'in_progress' ? '🔄 Em Progresso' :
                                 '⏳ Pendente'}
                              </Badge>
                              <span className="text-sm text-gray-500">{stage.estimatedTime}</span>
                            </div>
                          </div>

                          {/* Success Criteria */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700">Critérios de Sucesso:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {stage.successCriteria.map((criteria, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
                                  {criteria}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Actions */}
                          {stage.status === 'pending' && isNext && (
                            <Button 
                              onClick={() => handleStartStage(stage.id)}
                              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                              disabled={startStageMutation.isPending}
                              data-testid={`button-start-${stage.id}`}
                            >
                              🚀 Iniciar Etapa
                            </Button>
                          )}
                          
                          {stage.status === 'in_progress' && (
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleCompleteStage(stage.id)}
                                className="bg-gradient-to-r from-green-500 to-blue-500 text-white"
                                disabled={completeStageMutation.isPending}
                                data-testid={`button-complete-${stage.id}`}
                              >
                                ✅ Marcar como Concluída
                              </Button>
                            </div>
                          )}

                          {stage.status === 'completed' && stage.completedAt && (
                            <div className="text-sm text-green-600">
                              Concluída em {new Date(stage.completedAt).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Initialize Button */}
            {!progress && (
              <Card className="border-dashed border-2 border-purple-300">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-semibold mb-4">Pronto para começar?</h3>
                  <p className="text-gray-600 mb-6">
                    Inicialize o sistema de automação para começar o roadmap de 7 dias.
                  </p>
                  <Button 
                    onClick={() => initializeMutation.mutate()}
                    disabled={initializeMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3"
                    data-testid="button-initialize-system"
                  >
                    {initializeMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Inicializando...
                      </div>
                    ) : (
                      <>🚀 Inicializar Sistema de Automação</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Jobs de Automação</CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(jobs) && jobs.length > 0 ? (
                  <div className="space-y-2">
                    {(jobs as any[]).map((job: any) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{job.type}</span>
                          <span className="text-sm text-gray-500 ml-2">{job.status}</span>
                        </div>
                        <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                          {job.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum job encontrado.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Email Open Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--%</div>
                  <p className="text-sm text-gray-500">Meta: {'>'}25%</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Push Opt-in Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--%</div>
                  <p className="text-sm text-gray-500">Meta: {'>'}20%</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Conversão de Alertas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--%</div>
                  <p className="text-sm text-gray-500">Meta: +10-20%</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}