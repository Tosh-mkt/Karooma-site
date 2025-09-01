#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE
 * 
 * Este script verifica se todas as variáveis necessárias
 * estão configuradas corretamente para produção.
 */

console.log('🔍 Verificando configurações de ambiente...\n');

const requiredEnvVars = {
  'NODE_ENV': {
    required: true,
    expectedValue: 'production',
    description: 'Ambiente de execução'
  },
  'SESSION_SECRET': {
    required: true,
    minLength: 32,
    description: 'Chave secreta para sessões'
  },
  'DATABASE_URL': {
    required: true,
    pattern: /^postgresql:\/\/.+/,
    description: 'URL de conexão PostgreSQL'
  },
  'SENDGRID_API_KEY': {
    required: true,
    pattern: /^SG\..+/,
    description: 'API Key do SendGrid'
  },
  'GOOGLE_CLIENT_ID': {
    required: false,
    pattern: /\.apps\.googleusercontent\.com$/,
    description: 'Google OAuth Client ID'
  },
  'GOOGLE_CLIENT_SECRET': {
    required: false,
    minLength: 10,
    description: 'Google OAuth Client Secret'
  },
  'NEXTAUTH_URL': {
    required: false,
    pattern: /^https?:\/\/.+/,
    description: 'URL base da aplicação'
  }
};

let allValid = true;
let warnings = [];

console.log('📋 RESULTADO DA VERIFICAÇÃO:');
console.log('═'.repeat(50));

for (const [varName, config] of Object.entries(requiredEnvVars)) {
  const value = process.env[varName];
  let status = '✅';
  let message = 'Configurada';

  if (!value) {
    if (config.required) {
      status = '❌';
      message = 'OBRIGATÓRIA - Não configurada';
      allValid = false;
    } else {
      status = '⚠️';
      message = 'Opcional - Não configurada';
      warnings.push(varName);
    }
  } else {
    // Verificar comprimento mínimo
    if (config.minLength && value.length < config.minLength) {
      status = '❌';
      message = `Muito curta (mín: ${config.minLength} chars)`;
      allValid = false;
    }
    
    // Verificar padrão
    if (config.pattern && !config.pattern.test(value)) {
      status = '❌';
      message = 'Formato inválido';
      allValid = false;
    }
    
    // Verificar valor esperado
    if (config.expectedValue && value !== config.expectedValue) {
      status = '⚠️';
      message = `Esperado: ${config.expectedValue}, Atual: ${value}`;
      warnings.push(varName);
    }
  }

  console.log(`${status} ${varName.padEnd(20)} - ${message}`);
  console.log(`   ${config.description}`);
  console.log('');
}

console.log('═'.repeat(50));

if (allValid && warnings.length === 0) {
  console.log('🎉 SUCESSO! Todas as configurações estão corretas.');
  process.exit(0);
} else if (allValid) {
  console.log('⚠️  FUNCIONANDO com avisos:');
  warnings.forEach(warning => {
    console.log(`   • ${warning} - Configure para funcionalidade completa`);
  });
  process.exit(0);
} else {
  console.log('❌ ERRO! Configurações obrigatórias estão faltando.');
  console.log('   Configure as variáveis marcadas com ❌ antes do deploy.');
  process.exit(1);
}