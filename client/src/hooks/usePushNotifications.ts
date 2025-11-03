import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);
      
      if (supported && 'Notification' in window) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  const { data: publicKey } = useQuery<{ publicKey: string }>({
    queryKey: ['/api/push/vapid-public-key'],
    enabled: isSupported,
  });

  const subscriptionMutation = useMutation({
    mutationFn: async (subscription: PushSubscription) => {
      return await apiRequest('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription.toJSON()),
      });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async (endpoint: string) => {
      return await apiRequest('/api/push/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint }),
      });
    },
  });

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications não são suportadas neste navegador');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  };

  const subscribe = async (): Promise<boolean> => {
    if (!isSupported || !publicKey) {
      return false;
    }

    try {
      const permissionGranted = permission === 'granted' || await requestPermission();
      
      if (!permissionGranted) {
        console.log('Permissão negada');
        return false;
      }

      let registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        await navigator.serviceWorker.ready;
      }

      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        await subscriptionMutation.mutateAsync(existingSubscription);
        setIsSubscribed(true);
        return true;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey.publicKey)
      });

      await subscriptionMutation.mutateAsync(subscription);
      setIsSubscribed(true);
      
      console.log('✅ Inscrito em push notifications');
      return true;
    } catch (error) {
      console.error('Erro ao se inscrever em push:', error);
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        return false;
      }

      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        return false;
      }

      await unsubscribeMutation.mutateAsync(subscription.endpoint);
      await subscription.unsubscribe();
      setIsSubscribed(false);
      
      console.log('✅ Desinscrição de push notifications realizada');
      return true;
    } catch (error) {
      console.error('Erro ao cancelar inscrição:', error);
      return false;
    }
  };

  const checkSubscription = async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        return false;
      }

      const subscription = await registration.pushManager.getSubscription();
      const subscribed = !!subscription;
      setIsSubscribed(subscribed);
      return subscribed;
    } catch (error) {
      console.error('Erro ao verificar inscrição:', error);
      return false;
    }
  };

  useEffect(() => {
    if (isSupported) {
      checkSubscription();
    }
  }, [isSupported]);

  return {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    requestPermission,
    checkSubscription,
  };
}
