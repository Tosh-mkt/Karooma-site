import { getUncachableSendGridClient } from './sendgridClient';

// Função helper para obter cliente e email do SendGrid
async function getSendGridClient() {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    console.log(`📧 SendGrid cliente obtido com sucesso. Email remetente: ${fromEmail}`);
    return { client, fromEmail };
  } catch (error) {
    console.warn('⚠️ SendGrid não configurado ou erro ao obter credenciais:', error);
    return null;
  }
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
  const sendgrid = await getSendGridClient();
  if (!sendgrid) {
    console.log('SendGrid não configurado. Notificação via email desabilitada.');
    return false;
  }

  const { client, fromEmail } = sendgrid;
  const adminEmail = 'admin@karooma.life'; // Email do admin

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
    await client.send({
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
  disableClickTracking?: boolean;
}

export async function sendEmail(data: EmailData): Promise<boolean> {
  const sendgrid = await getSendGridClient();
  if (!sendgrid) {
    console.log('SendGrid não configurado. Email não enviado:', data.subject);
    return false;
  }

  const { client } = sendgrid;

  try {
    const emailData: any = {
      to: data.to,
      from: data.from,
      subject: data.subject,
      ...(data.text && { text: data.text }),
      ...(data.html && { html: data.html }),
      trackingSettings: {
        clickTracking: {
          enable: !data.disableClickTracking,
          enableText: false
        }
      }
    };
    
    console.log('\n📤 ===== ENVIANDO EMAIL VIA SENDGRID =====');
    console.log(`   Para: ${data.to}`);
    console.log(`   De: ${data.from}`);
    console.log(`   Assunto: ${data.subject}`);
    console.log(`   Tem conteúdo HTML: ${!!data.html}`);
    console.log(`   Tem conteúdo texto: ${!!data.text}`);
    console.log(`   Click Tracking: ${!data.disableClickTracking ? 'ATIVADO' : 'DESATIVADO'}`);
    
    const response = await client.send(emailData);
    
    console.log(`✅ SendGrid Response:`, JSON.stringify(response, null, 2));
    console.log(`✅ Email enviado com sucesso!`);
    console.log('==========================================\n');
    return true;
  } catch (error: any) {
    console.error('\n❌ ===== ERRO AO ENVIAR EMAIL VIA SENDGRID =====');
    console.error(`   Para: ${data.to}`);
    console.error(`   De: ${data.from}`);
    console.error(`   Assunto: ${data.subject}`);
    console.error(`\n🔴 Detalhes do erro:`);
    console.error(`   Código HTTP: ${error?.code || 'N/A'}`);
    console.error(`   Mensagem: ${error?.message || 'N/A'}`);
    
    if (error?.response) {
      console.error(`\n📋 Response do SendGrid:`);
      console.error(`   Status: ${error.response.statusCode || 'N/A'}`);
      console.error(`   Headers:`, JSON.stringify(error.response.headers, null, 2));
      
      if (error.response.body) {
        console.error(`   Body:`, JSON.stringify(error.response.body, null, 2));
        
        // Se houver erros específicos no body
        if (error.response.body.errors && Array.isArray(error.response.body.errors)) {
          console.error(`\n⚠️ Erros específicos do SendGrid:`);
          error.response.body.errors.forEach((err: any, index: number) => {
            console.error(`   ${index + 1}. ${err.message || JSON.stringify(err)}`);
            if (err.field) console.error(`      Campo: ${err.field}`);
            if (err.help) console.error(`      Ajuda: ${err.help}`);
          });
        }
      }
    }
    
    console.error(`\n📚 Stack trace:`, error?.stack);
    console.error('================================================\n');
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
  const sendgrid = await getSendGridClient();
  if (!sendgrid) {
    console.log('\n🎉 ===== EMAIL DE BOAS-VINDAS (SIMULADO - SendGrid não configurado) =====');
    console.log(`📧 Para: ${data.email}`);
    if (data.name) console.log(`👤 Nome: ${data.name}`);
    if (data.source) console.log(`📍 Fonte: ${data.source}`);
    console.log('📄 Conteúdo: Email HTML de boas-vindas com benefícios e CTA');
    console.log('==============================================\n');
    return true; // Simula sucesso para fins de teste
  }

  const { fromEmail } = sendgrid;
  
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

  return await sendEmail(emailData);
}

// Email de Recuperação de Senha
export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const sendgrid = await getSendGridClient();
  if (!sendgrid) {
    console.log('\n🔐 ===== EMAIL DE RECUPERAÇÃO DE SENHA (SIMULADO - SendGrid não configurado) =====');
    console.log(`📧 Para: ${email}`);
    console.log(`🔗 Token: ${token}`);
    console.log('📄 Conteúdo: Email HTML de recuperação de senha com link seguro');
    console.log('=========================================================\n');
    return true; // Simula sucesso para fins de teste
  }

  const { fromEmail } = sendgrid;
  
  // Usar o primeiro domínio da lista ou fallback para localhost
  const domains = process.env.REPLIT_DOMAINS || 'http://localhost:5000';
  const primaryDomain = domains.split(',')[0].trim();
  const baseUrl = primaryDomain.startsWith('http') ? primaryDomain : `https://${primaryDomain}`;
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Recuperação de Senha - Karooma</title>
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
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
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
        .reset-message { 
          font-size: 18px; line-height: 1.6; color: #374151; margin-bottom: 30px; 
        }
        .warning-box { 
          background: #fef3c7; border: 1px solid #f59e0b; 
          padding: 20px; border-radius: 8px; margin: 20px 0; 
          color: #92400e;
        }
        .cta-section { 
          text-align: center; margin: 40px 0; 
        }
        .cta-button { 
          display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); 
          color: white; text-decoration: none; padding: 16px 32px; 
          border-radius: 8px; font-weight: 600; font-size: 16px; 
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); 
        }
        .footer { 
          background: #f9fafb; padding: 30px; text-align: center; 
          color: #6b7280; font-size: 14px; line-height: 1.6; 
        }
        .security-note { 
          background: #f3f4f6; padding: 20px; border-radius: 8px; 
          margin: 20px 0; font-size: 14px; color: #6b7280; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Recuperação de Senha</h1>
          <p>Solicitação de alteração de senha</p>
        </div>
        
        <div class="content">
          <div class="reset-message">
            <p>Olá! 👋</p>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta Karooma. Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha.</p>
          </div>
          
          <div class="warning-box">
            <strong>⚠️ Importante:</strong> Este link é válido por apenas 1 hora por questões de segurança.
          </div>
          
          <div class="cta-section">
            <a href="${resetUrl}" class="cta-button">
              🔑 Redefinir Minha Senha
            </a>
          </div>
          
          <div class="security-note">
            <p><strong>🛡️ Dicas de Segurança:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Se você não solicitou esta alteração, ignore este email</li>
              <li>Nunca compartilhe este link com outras pessoas</li>
              <li>Use uma senha forte com letras, números e símbolos</li>
              <li>Não use a mesma senha em outros sites</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; color: #6b7280; line-height: 1.6;">
            Se o botão não funcionar, copie e cole o link abaixo no seu navegador:<br/>
            <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>Karooma</strong> - Plataforma de produtos e conteúdo familiar</p>
          <p>Este email foi enviado automaticamente. Se você não solicitou esta alteração, pode ignorar esta mensagem com segurança.</p>
          <p>Em caso de dúvidas, entre em contato: <a href="mailto:contato@karooma.life">contato@karooma.life</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
    🔐 Recuperação de Senha - Karooma
    
    Olá!
    
    Recebemos uma solicitação para redefinir a senha da sua conta Karooma. Se você fez esta solicitação, acesse o link abaixo para criar uma nova senha:
    
    ${resetUrl}
    
    ⚠️ IMPORTANTE: Este link é válido por apenas 1 hora por questões de segurança.
    
    🛡️ Dicas de Segurança:
    • Se você não solicitou esta alteração, ignore este email
    • Nunca compartilhe este link com outras pessoas  
    • Use uma senha forte com letras, números e símbolos
    • Não use a mesma senha em outros sites
    
    ---
    Karooma - Plataforma de produtos e conteúdo familiar
    
    Este email foi enviado automaticamente. Se você não solicitou esta alteração, pode ignorar esta mensagem com segurança.
    Em caso de dúvidas: contato@karooma.life
  `;

  const emailData: EmailData = {
    to: email,
    from: fromEmail,
    subject: "🔐 Recuperação de Senha - Karooma",
    text: textContent,
    html: htmlContent,
    disableClickTracking: true
  };

  return await sendEmail(emailData);
}