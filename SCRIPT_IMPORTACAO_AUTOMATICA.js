#!/usr/bin/env node

/**
 * SCRIPT DE IMPORTAÇÃO AUTOMATIZADA - KAROOMA
 * 
 * Este script permite importar produtos usando o processo padronizado
 * sem necessidade de ajustes manuais ou correções posteriores.
 * 
 * Uso: node SCRIPT_IMPORTACAO_AUTOMATICA.js produto.json
 */

import fs from 'fs';
import http from 'http';

// Configuração do servidor (ajustar conforme necessário)
const API_BASE = process.env.API_BASE || 'http://localhost:5000';

async function importProduct(filePath) {
  try {
    // 1. Ler arquivo JSON
    console.log('📖 Lendo arquivo:', filePath);
    const rawData = fs.readFileSync(filePath, 'utf8');
    const productData = JSON.parse(rawData);
    
    // 2. Validar dados básicos antes de enviar
    console.log('✅ Validando dados...');
    const requiredFields = [
      'Nome do Produto',
      'Link Afiliado', 
      'Benefícios (por avaliador)'
    ];
    
    for (const field of requiredFields) {
      if (!productData[field]) {
        throw new Error(`Campo obrigatório faltando: ${field}`);
      }
    }
    
    // 3. Verificar se há pelo menos 3 especialistas
    const benefits = productData['Benefícios (por avaliador)'] || '';
    const specialistCount = (benefits.match(/(Nutricionista|Organizadora Profissional|Planejadora de Experiências Familiares|Especialista em Design \(Usabilidade\)|Especialista em Bem-Estar e Autocuidado):/g) || []).length;
    
    if (specialistCount < 3) {
      throw new Error(`Mínimo de 3 especialistas necessários. Encontrados: ${specialistCount}`);
    }
    
    console.log(`✅ ${specialistCount} especialistas detectados`);
    
    // 4. Enviar para API
    console.log('🚀 Enviando para servidor...');
    const result = await sendToAPI(productData);
    
    // 5. Mostrar resultado
    console.log('\n🎉 SUCESSO! Produto importado:');
    console.log('📋 ID:', result.product.id);
    console.log('📝 Nome:', result.product.title);
    console.log('🏷️ Categoria:', result.validation.categoryDetected);
    console.log('⭐ Rating:', result.product.rating);
    console.log('💰 Preço:', `R$ ${result.product.currentPrice}`);
    console.log('👥 Especialistas:', result.validation.specialistsFound);
    
    // 6. Link direto para ver o produto
    console.log('\n🔗 Acesse: http://localhost:3000/products');
    console.log('   Clique em "💡 Porque Indicamos?" para ver as avaliações');
    
    return result;
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    
    if (error.message.includes('Campo obrigatório')) {
      console.log('\n📚 Consulte: PROCESSO_IMPORTACAO_PRODUTOS.md');
      console.log('📋 Template: TEMPLATE_PRODUTO_EXEMPLO.json');
    }
    
    process.exit(1);
  }
}

function sendToAPI(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/products/import',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(responseData));
        } else {
          const error = JSON.parse(responseData);
          console.log('\n📄 Detalhes do erro:', error);
          reject(new Error(error.error || 'Erro desconhecido'));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error(`Erro de conexão: ${err.message}`));
    });

    req.write(postData);
    req.end();
  });
}

// Executar se chamado diretamente
const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ Uso: node SCRIPT_IMPORTACAO_AUTOMATICA.js arquivo.json');
  console.log('📋 Exemplo: node SCRIPT_IMPORTACAO_AUTOMATICA.js TEMPLATE_PRODUTO_EXEMPLO.json');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`❌ Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

console.log('🚀 INICIANDO IMPORTAÇÃO AUTOMATIZADA KAROOMA');
console.log('=' .repeat(50));

importProduct(filePath);

export { importProduct };