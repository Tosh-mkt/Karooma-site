import sgMail from '@sendgrid/mail';

let connectionSettings: any;

async function getCredentials() {
  console.log('\n🔍 ===== SENDGRID AUTH DEBUG =====');
  
  // 1. Verificar ambiente
  const isProduction = !!process.env.WEB_REPL_RENEWAL;
  const isDevelopment = !!process.env.REPL_IDENTITY;
  console.log(`📍 Ambiente: ${isProduction ? 'PRODUÇÃO' : isDevelopment ? 'DESENVOLVIMENTO' : 'DESCONHECIDO'}`);
  
  // 2. Verificar hostname
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  console.log(`🌐 Hostname API: ${hostname || 'NÃO CONFIGURADO'}`);
  
  // 3. Verificar tokens disponíveis
  console.log(`🔑 REPL_IDENTITY disponível: ${isDevelopment ? 'SIM' : 'NÃO'}`);
  console.log(`🔑 WEB_REPL_RENEWAL disponível: ${isProduction ? 'SIM' : 'NÃO'}`);
  
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    console.error('❌ ERRO: Nenhum token Replit encontrado');
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }
  
  console.log(`✅ Token tipo: ${xReplitToken.substring(0, 5)}... (primeiros 5 chars)`);

  // 4. Fazer request à API
  const apiUrl = 'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid';
  console.log(`📡 Fazendo request para: ${apiUrl}`);
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    });
    
    console.log(`📥 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro na API Replit: ${errorText}`);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`📦 Response data:`, JSON.stringify(data, null, 2));
    
    connectionSettings = data.items?.[0];
    
    if (!connectionSettings) {
      console.error('❌ Nenhuma conexão SendGrid encontrada na resposta');
      throw new Error('SendGrid connection not found in API response');
    }
    

    if (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email) {
      console.error('❌ SendGrid não está completamente configurado');
      throw new Error('SendGrid not connected');
    }
    
    console.log(`✅ Credenciais obtidas com sucesso`);
    console.log(`📧 Email retornado pela integração: ${connectionSettings.settings.from_email}`);
    
    // IMPORTANTE: Usar sempre um email VERIFICADO no SendGrid
    // Os emails verificados são: contato@karooma.life, admin@karooma.life, welcome@karooma.life
    const verifiedSenderEmail = 'admin@karooma.life';
    console.log(`📧 Email que será usado (verificado): ${verifiedSenderEmail}`);
    console.log('===================================\n');
    
    return {
      apiKey: connectionSettings.settings.api_key, 
      email: verifiedSenderEmail  // Usar email verificado ao invés do retornado pela integração
    };
  } catch (error: any) {
    console.error('❌ ERRO ao obter credenciais SendGrid:');
    console.error('   Mensagem:', error.message);
    console.error('   Stack:', error.stack);
    console.log('===================================\n');
    throw error;
  }
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableSendGridClient() {
  const {apiKey, email} = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}
