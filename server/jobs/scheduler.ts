import cron from 'node-cron';
import { runAlertChecker } from './alertChecker';
import { sendAlertNotifications } from './notificationService';
import { issueTrackerService } from '../services/issueTrackerService';

let alertCheckerTask: cron.ScheduledTask | null = null;
let issueDigestTask: cron.ScheduledTask | null = null;

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

/**
 * Inicia o scheduler de envio do digest diário de pendências de produtos
 * Executa às 8h da manhã (horário do servidor) por padrão
 */
export function startIssueDigestScheduler() {
  if (issueDigestTask) {
    console.log('⚠️  Issue digest scheduler já está rodando');
    return;
  }

  const cronExpression = '0 8 * * *';

  issueDigestTask = cron.schedule(cronExpression, async () => {
    console.log('📋 Executando envio do digest diário de pendências...');
    
    try {
      const sent = await issueTrackerService.sendDailyDigest();
      if (sent) {
        console.log('✅ Digest diário enviado com sucesso');
      }
    } catch (error) {
      console.error('Erro no envio do digest diário:', error);
    }
  });

  console.log(`✅ Issue digest scheduler iniciado (executa ${cronExpression} - 8h da manhã)`);
}

/**
 * Para o scheduler de digest de pendências
 */
export function stopIssueDigestScheduler() {
  if (issueDigestTask) {
    issueDigestTask.stop();
    issueDigestTask = null;
    console.log('🛑 Issue digest scheduler parado');
  }
}

/**
 * Envia digest imediatamente (para testes/manual)
 */
export async function sendImmediateDigest(): Promise<boolean> {
  console.log('📋 Executando envio manual do digest de pendências...');
  
  try {
    return await issueTrackerService.sendDailyDigest();
  } catch (error) {
    console.error('Erro no envio manual do digest:', error);
    return false;
  }
}
