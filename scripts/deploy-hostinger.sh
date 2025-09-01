#!/bin/bash

# 🚀 SCRIPT DE DEPLOY AUTOMÁTICO PARA HOSTINGER
# 
# Este script faz deploy direto do Git para o servidor Hostinger
# Configure as variáveis abaixo com seus dados

echo "🚀 Iniciando deploy para Hostinger..."

# ============================================
# CONFIGURAÇÕES - SUBSTITUA PELOS SEUS DADOS
# ============================================

# Dados do servidor Hostinger
SERVER_HOST="seu-servidor.hostinger.com"
SERVER_USER="seu-usuario"
SERVER_PATH="/public_html"

# Dados do Git
GIT_REPO="https://github.com/seu-usuario/karooma.git"
GIT_BRANCH="main"

# ============================================
# PROCESSO DE DEPLOY
# ============================================

echo "📡 Conectando ao servidor Hostinger..."

# Comando SSH para executar no servidor
ssh $SERVER_USER@$SERVER_HOST << 'ENDSSH'

echo "📁 Navegando para diretório do site..."
cd /public_html

echo "🔄 Fazendo backup do site atual..."
if [ -d "backup_$(date +%Y%m%d_%H%M%S)" ]; then
    rm -rf backup_$(date +%Y%m%d_%H%M%S)
fi
cp -r . backup_$(date +%Y%m%d_%H%M%S)

echo "📥 Clonando/atualizando repositório..."
if [ -d ".git" ]; then
    echo "🔄 Atualizando repositório existente..."
    git fetch origin
    git reset --hard origin/main
    git clean -fd
else
    echo "📥 Clonando repositório pela primeira vez..."
    git clone https://github.com/seu-usuario/karooma.git temp_repo
    cp -r temp_repo/* .
    cp -r temp_repo/.* . 2>/dev/null || true
    rm -rf temp_repo
fi

echo "📦 Instalando dependências..."
npm install --production

echo "🏗️ Fazendo build da aplicação..."
npm run build

echo "🔧 Configurando arquivo .env..."
if [ ! -f ".env" ] && [ -f ".env.production.template" ]; then
    echo "⚠️  Arquivo .env não encontrado. Copie .env.production.template para .env e configure."
    cp .env.production.template .env
fi

echo "🔄 Reiniciando aplicação..."
# Se usar PM2
if command -v pm2 &> /dev/null; then
    pm2 restart karooma || pm2 start dist/index.js --name karooma
else
    echo "📋 PM2 não encontrado. Instale PM2 para gerenciar a aplicação:"
    echo "npm install -g pm2"
fi

echo "✅ Deploy concluído!"

ENDSSH

echo "🎉 Deploy para Hostinger concluído com sucesso!"
echo "🌐 Acesse: https://karooma.net"