import { sendEmail } from "../emailService";
import type { Product } from "@shared/schema";

export interface NotificationService {
  sendProductUnavailableAlert(product: Product): Promise<boolean>;
  sendProductUpdateSummary(summary: UpdateSummary): Promise<boolean>;
  sendErrorAlert(error: string, context?: string): Promise<boolean>;
}

export interface UpdateSummary {
  totalProducts: number;
  updatedProducts: number;
  unavailableProducts: number;
  errorCount: number;
  duration: number;
  frequency: 'high' | 'medium' | 'low';
}

export class EmailNotificationService implements NotificationService {
  private adminEmail = "admin@karooma.life";
  
  async sendProductUnavailableAlert(product: Product): Promise<boolean> {
    const subject = `🚨 Produto Indisponível - ${product.title}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Produto Indisponível Detectado</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">${product.title}</h3>
          <p><strong>ASIN:</strong> ${product.asin}</p>
          <p><strong>Categoria:</strong> ${product.category}</p>
          <p><strong>Status Anterior:</strong> ${product.status}</p>
          <p><strong>Última Verificação:</strong> ${product.lastChecked?.toLocaleString('pt-BR')}</p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px;">
          <p style="margin: 0;"><strong>⚠️ Ação Necessária:</strong></p>
          <p style="margin: 5px 0 0 0;">Este produto foi marcado como indisponível e precisa de verificação manual.</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>Sistema de Monitoramento Karooma - ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    `;

    const text = `
      PRODUTO INDISPONÍVEL DETECTADO
      
      Produto: ${product.title}
      ASIN: ${product.asin}
      Categoria: ${product.category}
      Status Anterior: ${product.status}
      Última Verificação: ${product.lastChecked?.toLocaleString('pt-BR')}
      
      Este produto foi marcado como indisponível e precisa de verificação manual.
    `;

    try {
      return await sendEmail({
        to: this.adminEmail,
        from: "no-reply@karooma.net",
        subject,
        text,
        html
      });
    } catch (error) {
      console.error('Erro ao enviar alerta de produto indisponível:', error);
      return false;
    }
  }

  async sendProductUpdateSummary(summary: UpdateSummary): Promise<boolean> {
    const subject = `📊 Relatório de Atualização de Produtos - ${summary.frequency.toUpperCase()}`;
    
    const successRate = summary.totalProducts > 0 
      ? ((summary.updatedProducts / summary.totalProducts) * 100).toFixed(1)
      : '0';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Relatório de Atualização de Produtos</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">Resumo da Atualização - ${summary.frequency.toUpperCase()}</h3>
          
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
            <div style="background: white; padding: 15px; border-radius: 5px; text-align: center;">
              <h4 style="margin: 0; color: #3498db;">${summary.totalProducts}</h4>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Total de Produtos</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; text-align: center;">
              <h4 style="margin: 0; color: #27ae60;">${summary.updatedProducts}</h4>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Atualizados</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; text-align: center;">
              <h4 style="margin: 0; color: #e74c3c;">${summary.unavailableProducts}</h4>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Indisponíveis</p>
            </div>
            
            <div style="background: white; padding: 15px; border-radius: 5px; text-align: center;">
              <h4 style="margin: 0; color: #f39c12;">${summary.errorCount}</h4>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Erros</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <div style="background: white; padding: 15px; border-radius: 5px;">
              <h4 style="margin: 0; color: #9b59b6;">${successRate}%</h4>
              <p style="margin: 5px 0 0 0; font-size: 14px;">Taxa de Sucesso</p>
            </div>
          </div>
          
          <p><strong>Duração:</strong> ${Math.round(summary.duration / 1000)}s</p>
          <p><strong>Executado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        ${summary.unavailableProducts > 0 ? `
          <div style="background: #ffebee; border: 1px solid #ffcdd2; padding: 15px; border-radius: 5px;">
            <p style="margin: 0;"><strong>⚠️ Atenção:</strong></p>
            <p style="margin: 5px 0 0 0;">${summary.unavailableProducts} produto(s) foram marcados como indisponíveis e podem precisar de ação manual.</p>
          </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>Sistema de Monitoramento Karooma - Atualização Automática</p>
        </div>
      </div>
    `;

    const text = `
      RELATÓRIO DE ATUALIZAÇÃO DE PRODUTOS - ${summary.frequency.toUpperCase()}
      
      Total de Produtos: ${summary.totalProducts}
      Produtos Atualizados: ${summary.updatedProducts}
      Produtos Indisponíveis: ${summary.unavailableProducts}
      Erros: ${summary.errorCount}
      Taxa de Sucesso: ${successRate}%
      Duração: ${Math.round(summary.duration / 1000)}s
      
      Executado em: ${new Date().toLocaleString('pt-BR')}
    `;

    try {
      return await sendEmail({
        to: this.adminEmail,
        from: "no-reply@karooma.net",
        subject,
        text,
        html
      });
    } catch (error) {
      console.error('Erro ao enviar relatório de atualização:', error);
      return false;
    }
  }

  async sendErrorAlert(error: string, context?: string): Promise<boolean> {
    const subject = `🚨 Erro no Sistema de Atualização - Karooma`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Erro no Sistema de Atualização</h2>
        
        <div style="background: #ffebee; border: 1px solid #ffcdd2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #c62828;">Detalhes do Erro</h3>
          <p><strong>Erro:</strong> ${error}</p>
          ${context ? `<p><strong>Contexto:</strong> ${context}</p>` : ''}
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px;">
          <p style="margin: 0;"><strong>⚠️ Ação Necessária:</strong></p>
          <p style="margin: 5px 0 0 0;">Verifique os logs do sistema e considere uma verificação manual dos produtos.</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          <p>Sistema de Monitoramento Karooma</p>
        </div>
      </div>
    `;

    const text = `
      ERRO NO SISTEMA DE ATUALIZAÇÃO
      
      Erro: ${error}
      ${context ? `Contexto: ${context}` : ''}
      Timestamp: ${new Date().toLocaleString('pt-BR')}
      
      Verifique os logs do sistema e considere uma verificação manual dos produtos.
    `;

    try {
      return await sendEmail({
        to: this.adminEmail,
        from: "no-reply@karooma.net",
        subject,
        text,
        html
      });
    } catch (error) {
      console.error('Erro ao enviar alerta de erro:', error);
      return false;
    }
  }
}

export const notificationService = new EmailNotificationService();