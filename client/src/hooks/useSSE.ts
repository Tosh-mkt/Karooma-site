import { useEffect, useRef, useState } from 'react';

interface SSEEvent {
  type: string;
  data: any;
  timestamp: string;
}

export function useSSE() {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Conectar ao SSE
    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/events');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          console.log('SSE Conectado');
          setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'connected') {
              console.log('SSE Handshake recebido');
              return;
            }
            
            setEvents(prev => [...prev.slice(-9), data]); // Manter apenas últimos 10 eventos
          } catch (error) {
            console.error('Erro ao processar evento SSE:', error);
          }
        };

        // Eventos específicos
        eventSource.addEventListener('newProduct', (event) => {
          const data = JSON.parse((event as MessageEvent).data);
          console.log('Novo produto recebido via SSE:', data.product.title);
          setEvents(prev => [...prev.slice(-9), data]);
        });

        eventSource.addEventListener('batchComplete', (event) => {
          const data = JSON.parse((event as MessageEvent).data);
          console.log('Lote N8N concluído via SSE:', data.results);
          setEvents(prev => [...prev.slice(-9), data]);
        });

        eventSource.onerror = (error) => {
          console.error('Erro SSE:', error);
          setIsConnected(false);
          
          // Reconectar após 3 segundos
          setTimeout(() => {
            if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
              connectSSE();
            }
          }, 3000);
        };

        // EventSource não tem onclose, usar addEventListener
        eventSource.addEventListener('close', () => {
          console.log('SSE Desconectado');
          setIsConnected(false);
        });

      } catch (error) {
        console.error('Erro ao conectar SSE:', error);
        setIsConnected(false);
      }
    };

    connectSSE();

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const clearEvents = () => {
    setEvents([]);
  };

  return {
    events,
    isConnected,
    clearEvents
  };
}