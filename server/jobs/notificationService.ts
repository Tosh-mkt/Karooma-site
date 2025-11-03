import { db } from "../db";
import { users, pushSubscriptions } from "../../shared/schema";
import { eq, and } from "drizzle-orm";
import { sendPriceAlertEmail } from "../emailService";
import { pushNotificationService } from "../services/pushNotificationService";

interface PromotionAlert {
  alertId: string;
  userId: string;
  type: 'product' | 'category';
  productId?: number;
  category?: string;
  productDetails: {
    asin?: string;
    title: string;
    currentPrice?: number;
    originalPrice?: number;
    discountPercent: number;
    imageUrl?: string;
    productUrl: string;
  };
  notifyEmail: boolean;
  notifyPush: boolean;
}

/**
 * Envia notificações (email e push) para alertas de promoção
 */
export async function sendAlertNotifications(promotions: PromotionAlert[]): Promise<void> {
  console.log(`📧 Enviando notificações para ${promotions.length} alertas...`);

  const notificationResults = {
    emailsSent: 0,
    emailsFailed: 0,
    pushSent: 0,
    pushFailed: 0
  };

  for (const promotion of promotions) {
    try {
      // Buscar dados do usuário
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, promotion.userId))
        .limit(1);

      if (userResult.length === 0) {
        console.log(`⚠️  Usuário ${promotion.userId} não encontrado`);
        continue;
      }

      const user = userResult[0];

      // Enviar notificação por email
      if (promotion.notifyEmail && user.email) {
        try {
          const emailSent = await sendPriceAlertEmail({
            email: user.email,
            name: user.name || 'Cliente',
            productTitle: promotion.productDetails.title,
            currentPrice: promotion.productDetails.currentPrice,
            originalPrice: promotion.productDetails.originalPrice,
            discountPercent: promotion.productDetails.discountPercent,
            productUrl: promotion.productDetails.productUrl,
            imageUrl: promotion.productDetails.imageUrl,
            alertType: promotion.type
          });

          if (emailSent) {
            notificationResults.emailsSent++;
            console.log(`✅ Email enviado para ${user.email}: ${promotion.productDetails.title}`);
          } else {
            notificationResults.emailsFailed++;
            console.log(`❌ Falha ao enviar email para ${user.email}`);
          }
        } catch (error) {
          notificationResults.emailsFailed++;
          console.error(`Erro ao enviar email para ${user.email}:`, error);
        }
      }

      // Enviar notificação push
      if (promotion.notifyPush) {
        try {
          await sendPushNotification(user.id, {
            title: `🔥 ${promotion.productDetails.discountPercent}% OFF!`,
            body: promotion.productDetails.title,
            icon: promotion.productDetails.imageUrl,
            url: promotion.productDetails.productUrl,
            data: {
              alertId: promotion.alertId,
              type: promotion.type,
              productUrl: promotion.productDetails.productUrl
            }
          });

          notificationResults.pushSent++;
          console.log(`✅ Push enviado para usuário ${user.id}`);
        } catch (error) {
          notificationResults.pushFailed++;
          console.error(`Erro ao enviar push para ${user.id}:`, error);
        }
      }

      // Pequeno delay entre notificações para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Erro ao processar notificação:`, error);
    }
  }

  console.log('📊 Resumo de notificações:');
  console.log(`   - Emails enviados: ${notificationResults.emailsSent}`);
  console.log(`   - Emails falhados: ${notificationResults.emailsFailed}`);
  console.log(`   - Push enviados: ${notificationResults.pushSent}`);
  console.log(`   - Push falhados: ${notificationResults.pushFailed}`);
}

/**
 * Envia notificação push para um usuário
 */
async function sendPushNotification(
  userId: string,
  notification: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    data?: any;
  }
): Promise<void> {
  try {
    // Buscar todas as push subscriptions ativas do usuário
    const userSubscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.userId, userId),
          eq(pushSubscriptions.isActive, true)
        )
      );

    if (userSubscriptions.length === 0) {
      console.log(`⚠️  Nenhuma push subscription ativa para usuário ${userId}`);
      return;
    }

    // Enviar notificação para todas as subscriptions do usuário
    const subscriptionObjects = userSubscriptions.map(sub => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    }));

    const results = await pushNotificationService.sendToMultiple(
      subscriptionObjects,
      {
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        url: notification.url,
        data: notification.data
      }
    );

    // Remover subscriptions inválidas
    if (results.invalidSubscriptions.length > 0) {
      console.log(`🧹 Removendo ${results.invalidSubscriptions.length} subscriptions inválidas`);
      for (const endpoint of results.invalidSubscriptions) {
        await db
          .delete(pushSubscriptions)
          .where(eq(pushSubscriptions.endpoint, endpoint));
      }
    }

    console.log(`📨 Push enviado: ${results.sent} sucesso, ${results.failed} falhas`);
  } catch (error) {
    console.error('Erro ao enviar push notification:', error);
    throw error;
  }
}
