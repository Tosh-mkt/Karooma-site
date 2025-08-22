#!/bin/bash

# Script de Deploy para Hostinger
# Execute este script no servidor da Hostinger via SSH

echo "🚀 Iniciando deploy do Karooma..."

# 1. Atualizar código do GitHub
echo "📥 Baixando últimas atualizações..."
git pull origin main

# 2. Instalar dependências do servidor
echo "📦 Instalando dependências do servidor..."
npm install --production

# 3. Instalar dependências do cliente
echo "📦 Instalando dependências do frontend..."
cd client
npm install
echo "🔨 Fazendo build do frontend..."
npm run build
cd ..

# 4. Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 restart karooma-app || pm2 start server/index.js --name "karooma-app"

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Aplicação disponível no seu domínio"