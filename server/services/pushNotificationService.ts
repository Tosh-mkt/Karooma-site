import webPush from 'web-push';

const VAPID_PUBLIC_KEY = 'BFZnro_v7UvyFjOorowFQYn3sfM_mLSpcGhfQQJPj0DEEWFhMbenz2SCfruk47nWSC1PyAvtsLXCLIWgZd8pVxM';
const VAPID_PRIVATE_KEY = 'um0rPnuBV1e-YexMZQ9gcfUofjcYi_BJaOO9XQedZOk';

webPush.setVapidDetails(
  'mailto:admin@karooma.life',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  data?: any;
}

export class PushNotificationService {
  async sendNotification(
    subscription: PushSubscription,
    payload: PushNotificationPayload
  ): Promise<boolean> {
    try {
      const notificationPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        badge: payload.badge || '/favicon.ico',
        data: {
          url: payload.url || '/',
          ...payload.data
        }
      });

      await webPush.sendNotification(subscription, notificationPayload);
      console.log('✅ Push notification sent successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Error sending push notification:', error);
      
      if (error.statusCode === 410 || error.statusCode === 404) {
        console.log('Subscription is no longer valid, should be removed');
      }
      
      return false;
    }
  }

  async sendToMultiple(
    subscriptions: PushSubscription[],
    payload: PushNotificationPayload
  ): Promise<{ sent: number; failed: number; invalidSubscriptions: string[] }> {
    const results = await Promise.allSettled(
      subscriptions.map(sub => this.sendNotification(sub, payload))
    );

    const invalidSubscriptions: string[] = [];
    let sent = 0;
    let failed = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        sent++;
      } else {
        failed++;
        invalidSubscriptions.push(subscriptions[index].endpoint);
      }
    });

    return { sent, failed, invalidSubscriptions };
  }

  getPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }
}

export const pushNotificationService = new PushNotificationService();
