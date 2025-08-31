import { MailService } from '@sendgrid/mail';

// Configuração básica do SendGrid
let mailService: MailService | null = null;

if (process.env.SENDGRID_API_KEY) {
  mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface NewsletterNotificationData {
  email: string;
  name?: string | null;
  categories: string[];
  source?: string;
  leadMagnet?: string;
  timestamp: string;
}

// Enviar notificação para o administrador sobre nova inscrição na newsletter
export async function sendNewsletterNotification(data: NewsletterNotificationData): Promise<boolean> {
  if (!mailService) {
    console.log('SendGrid não configurado. Notificação via email desabilitada.');
    return false;
  }

  const fromEmail = 'admin@karooma.com'; // Email remetente
  const adminEmail = 'admin@karooma.com'; // Email do admin

  const categoriesText = data.categories.length > 0 
    ? data.categories.join(', ') 
    : 'Nenhuma categoria selecionada';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nova Inscrição Newsletter - Karooma</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 24px; }
        .info-item { margin-bottom: 16px; }
        .label { font-weight: 600; color: #374151; margin-bottom: 4px; }
        .value { color: #6b7280; background: #f3f4f6; padding: 8px 12px; border-radius: 6px; }
        .categories { background: #ede9fe; color: #7c3aed; }
        .footer { padding: 16px 24px; background: #f9fafb; border-radius: 0 0 12px 12px; text-align: center; color: #6b7280; font-size: 14px; }
        .timestamp { font-size: 14px; opacity: 0.7; }
        .highlight { color: #059669; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Nova Inscrição na Newsletter</h1>
          <p class="timestamp">${new Date(data.timestamp).toLocaleString('pt-BR')}</p>
        </div>
        
        <div class="content">
          <div class="info-item">
            <div class="label">📧 Email:</div>
            <div class="value highlight">${data.email}</div>
          </div>
          
          ${data.name ? `
          <div class="info-item">
            <div class="label">👤 Nome:</div>
            <div class="value">${data.name}</div>
          </div>
          ` : ''}
          
          <div class="info-item">
            <div class="label">🏷️ Categorias de Interesse:</div>
            <div class="value categories">${categoriesText}</div>
          </div>
          
          ${data.source ? `
          <div class="info-item">
            <div class="label">📍 Fonte:</div>
            <div class="value">${data.source}</div>
          </div>
          ` : ''}
          
          ${data.leadMagnet ? `
          <div class="info-item">
            <div class="label">🎯 Lead Magnet:</div>
            <div class="value">${data.leadMagnet}</div>
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Karooma Admin Dashboard - Sistema de Notificações</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    Nova Inscrição na Newsletter - Karooma
    
    📧 Email: ${data.email}
    ${data.name ? `👤 Nome: ${data.name}\n` : ''}🏷️ Categorias: ${categoriesText}
    ${data.source ? `📍 Fonte: ${data.source}\n` : ''}${data.leadMagnet ? `🎯 Lead Magnet: ${data.leadMagnet}\n` : ''}⏰ Data/Hora: ${new Date(data.timestamp).toLocaleString('pt-BR')}
    
    ---
    Karooma Admin Dashboard
  `;

  try {
    await mailService.send({
      to: adminEmail,
      from: fromEmail,
      subject: `📬 Nova inscrição newsletter: ${data.email}`,
      text: textContent,
      html: htmlContent,
    });
    
    console.log(`✅ Notificação de newsletter enviada para admin: ${data.email}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar notificação de newsletter:', error);
    return false;
  }
}

// Sistema de fallback para notificações mesmo sem SendGrid configurado
export function logNewsletterSubscription(data: NewsletterNotificationData): void {
  console.log('\n🎉 ===== NOVA INSCRIÇÃO NEWSLETTER =====');
  console.log(`📧 Email: ${data.email}`);
  if (data.name) console.log(`👤 Nome: ${data.name}`);
  console.log(`🏷️ Categorias: ${data.categories.join(', ') || 'Nenhuma'}`);
  if (data.source) console.log(`📍 Fonte: ${data.source}`);
  if (data.leadMagnet) console.log(`🎯 Lead Magnet: ${data.leadMagnet}`);
  console.log(`⏰ Data/Hora: ${new Date(data.timestamp).toLocaleString('pt-BR')}`);
  console.log('========================================\n');
}

// Função genérica para envio de emails
interface EmailData {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  if (!mailService) {
    console.log('SendGrid não configurado. Email não enviado:', data.subject);
    return false;
  }

  try {
    await mailService.send(data);
    console.log(`✅ Email enviado: ${data.subject} para ${data.to}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
}