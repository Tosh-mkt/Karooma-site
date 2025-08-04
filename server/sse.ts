import { Response } from 'express';

interface SSEClient {
  id: string;
  response: Response;
}

class SSEManager {
  private clients: SSEClient[] = [];

  addClient(id: string, response: Response) {
    // Configurar headers SSE
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Heartbeat inicial
    response.write('data: {"type":"connected"}\n\n');

    // Adicionar cliente
    this.clients.push({ id, response });

    // Remover cliente quando conexão fechar
    response.on('close', () => {
      this.removeClient(id);
    });

    console.log(`SSE Client conectado: ${id}`);
  }

  removeClient(id: string) {
    this.clients = this.clients.filter(client => client.id !== id);
    console.log(`SSE Client desconectado: ${id}`);
  }

  broadcast(event: string, data: any) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    
    this.clients.forEach(client => {
      try {
        client.response.write(message);
      } catch (error) {
        console.error(`Erro ao enviar para cliente ${client.id}:`, error);
        this.removeClient(client.id);
      }
    });

    console.log(`SSE Broadcast enviado: ${event} para ${this.clients.length} clientes`);
  }

  notifyNewProduct(product: any) {
    this.broadcast('newProduct', {
      type: 'newProduct',
      product: product,
      timestamp: new Date().toISOString()
    });
  }

  notifyBatchComplete(results: any) {
    this.broadcast('batchComplete', {
      type: 'batchComplete',
      results: results,
      timestamp: new Date().toISOString()
    });
  }

  getClientCount() {
    return this.clients.length;
  }
}

export const sseManager = new SSEManager();