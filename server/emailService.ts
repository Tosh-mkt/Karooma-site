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
    const emailData: any = {
      to: data.to,
      from: data.from,
      subject: data.subject,
      ...(data.text && { text: data.text }),
      ...(data.html && { html: data.html })
    };
    
    await mailService.send(emailData);
    console.log(`✅ Email enviado: ${data.subject} para ${data.to}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
}

// Sistema de Email de Boas-vindas - MVP Day 1 Automation
interface WelcomeEmailData {
  email: string;
  name?: string;
  source?: string;
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const fromEmail = 'welcome@karooma.life';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bem-vindo à Karooma!</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          margin: 0; padding: 0; background-color: #f8f9fa; 
        }
        .container { 
          max-width: 600px; margin: 0 auto; background: white; 
          border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; padding: 40px 30px; text-align: center; 
        }
        .header h1 { 
          margin: 0 0 10px 0; font-size: 28px; font-weight: 700; 
        }
        .header p { 
          margin: 0; font-size: 16px; opacity: 0.9; 
        }
        .content { 
          padding: 40px 30px; 
        }
        .welcome-message { 
          font-size: 18px; line-height: 1.6; color: #374151; margin-bottom: 30px; 
        }
        .benefits { 
          background: #f3f4f6; padding: 30px; border-radius: 12px; margin: 30px 0; 
        }
        .benefits h3 { 
          margin: 0 0 20px 0; color: #1f2937; font-size: 20px; 
        }
        .benefit-item { 
          display: flex; align-items: center; margin-bottom: 15px; font-size: 16px; 
        }
        .benefit-icon { 
          width: 24px; height: 24px; margin-right: 15px; 
          background: #10b981; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; color: white; 
          font-weight: bold; font-size: 14px;
        }
        .cta-section { 
          text-align: center; margin: 40px 0; 
        }
        .cta-button { 
          display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; text-decoration: none; padding: 16px 32px; 
          border-radius: 8px; font-weight: 600; font-size: 16px; 
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); 
        }
        .footer { 
          background: #f9fafb; padding: 30px; text-align: center; 
          color: #6b7280; font-size: 14px; line-height: 1.6; 
        }
        .social-links { 
          margin: 20px 0; 
        }
        .social-links a { 
          display: inline-block; margin: 0 10px; color: #6b7280; 
          text-decoration: none; font-size: 14px; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Bem-vindo à Karooma!</h1>
          <p>Sua jornada para produtos incríveis começa agora</p>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            <p>Olá${data.name ? ` ${data.name}` : ''}! 👋</p>
            <p>Que alegria ter você conosco! A Karooma é sua nova plataforma para descobrir conteúdo valioso sobre cuidado familiar, organização e estilo de vida, além de recomendação de produtos selecionados e avaliados, e ofertas exclusivas mapeadas de acordo com seus interesses.</p>
          </div>
          
          <div class="benefits">
            <h3>🌟 O que você vai encontrar:</h3>
            <div class="benefit-item">
              <div class="benefit-icon">✓</div>
              <span>Produtos cuidadosamente selecionados para mães e famílias</span>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">✓</div>
              <span>Alertas de preços para suas ofertas favoritas</span>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">✓</div>
              <span>Conteúdo exclusivo sobre organização e produtividade</span>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">✓</div>
              <span>Dicas práticas para o dia a dia da família moderna</span>
            </div>
          </div>
          
          <div class="cta-section">
            <a href="https://karooma.life/produtos" class="cta-button">
              🛍️ Explore Nossa Seleção
            </a>
          </div>
          
          <p style="font-size: 16px; color: #6b7280; line-height: 1.6;">
            <strong>Dica especial:</strong> Nos próximos dias, você receberá dicas exclusivas para aproveitar ao máximo a plataforma. Fique de olho na sua caixa de entrada! 📮
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Karooma</strong> - Simplificando a vida das mães modernas</p>
          <div class="social-links">
            <a href="https://karooma.life/blog">📝 Blog</a>
            <a href="https://karooma.life/newsletter">📬 Newsletter</a>
            <a href="https://karooma.life/sobre">ℹ️ Sobre nós</a>
          </div>
          <p>Recebeu este email porque se inscreveu em nossa newsletter. <br/>
          Se não deseja mais receber, <a href="https://karooma.life/unsubscribe">clique aqui</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    🎉 Bem-vindo à Karooma!
    
    Olá${data.name ? ` ${data.name}` : ''}!
    
    Que alegria ter você conosco! A Karooma é sua nova plataforma para descobrir conteúdo valioso sobre cuidado familiar, organização e estilo de vida, além de recomendação de produtos selecionados e avaliados, e ofertas exclusivas mapeadas de acordo com seus interesses.
    
    🌟 O que você vai encontrar:
    ✓ Produtos cuidadosamente selecionados para mães e famílias
    ✓ Alertas de preços para suas ofertas favoritas  
    ✓ Conteúdo exclusivo sobre organização e produtividade
    ✓ Dicas práticas para o dia a dia da família moderna
    
    Explore nossa seleção: https://karooma.life/produtos
    
    Dica especial: Nos próximos dias, você receberá dicas exclusivas para aproveitar ao máximo a plataforma. Fique de olho na sua caixa de entrada!
    
    ---
    Karooma - Simplificando a vida das mães modernas
    
    Recebeu este email porque se inscreveu em nossa newsletter.
    Para cancelar: https://karooma.life/unsubscribe
  `;

  const emailData: EmailData = {
    to: data.email,
    from: fromEmail,
    subject: "🎉 Bem-vindo à Karooma - Sua jornada começa agora!",
    text: textContent,
    html: htmlContent
  };

  if (!mailService) {
    // Fallback logging quando SendGrid não está configurado
    console.log('\n🎉 ===== EMAIL DE BOAS-VINDAS (SIMULADO) =====');
    console.log(`📧 Para: ${data.email}`);
    if (data.name) console.log(`👤 Nome: ${data.name}`);
    if (data.source) console.log(`📍 Fonte: ${data.source}`);
    console.log(`📝 Assunto: ${emailData.subject}`);
    console.log('📄 Conteúdo: Email HTML de boas-vindas com benefícios e CTA');
    console.log('==============================================\n');
    return true; // Simula sucesso para fins de teste
  }

  return await sendEmail(emailData);
}