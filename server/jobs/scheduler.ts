import cron from 'node-cron';
import { runAlertChecker } from './alertChecker';
import { sendAlertNotifications } from './notificationService';

let alertCheckerTask: cron.ScheduledTask | null = null;

/**
 * Inicia o scheduler de verificação de alertas
 * Executa a cada 2 horas por padrão
 */
export function startAlertScheduler() {
  if (alertCheckerTask) {
    console.log('⚠️  Alert scheduler já está rodando');
    return;
  }

  // Executar a cada 2 horas (0 */2 * * *)
  // Para testes, pode usar '*/5 * * * *' (a cada 5 minutos)
  const cronExpression = '0 */2 * * *';

  alertCheckerTask = cron.schedule(cronExpression, async () => {
    console.log('⏰ Executando verificação automática de alertas...');
    
    try {
      // Verificar alertas e detectar promoções
      const promotions = await runAlertChecker() as any[];
      
      // Enviar notificações para as promoções detectadas
      if (promotions && promotions.length > 0) {
        await sendAlertNotifications(promotions);
      }
    } catch (error) {
      console.error('Erro no scheduler de alertas:', error);
    }
  });

  console.log(`✅ Alert scheduler iniciado (executa ${cronExpression})`);
}

/**
 * Para o scheduler de verificação de alertas
 */
export function stopAlertScheduler() {
  if (alertCheckerTask) {
    alertCheckerTask.stop();
    alertCheckerTask = null;
    console.log('🛑 Alert scheduler parado');
  }
}

/**
 * Executa verificação imediata (para testes/manual)
 */
export async function runImmediateCheck(): Promise<any[]> {
  console.log('🚀 Executando verificação manual de alertas...');
  
  try {
    const promotions = await runAlertChecker() as any[];
    
    if (promotions && promotions.length > 0) {
      await sendAlertNotifications(promotions);
    }
    
    return promotions || [];
  } catch (error) {
    console.error('Erro na verificação manual:', error);
    return [];
  }
}
