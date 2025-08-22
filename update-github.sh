#!/bin/bash

# Script automático para enviar mudanças para GitHub
# Uso: ./update-github.sh "mensagem do commit"

# Cores para mensagens
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando envio para GitHub...${NC}"

# Verifica se foi passada uma mensagem
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: Precisa de uma mensagem!${NC}"
    echo "Uso: ./update-github.sh \"Sua mensagem aqui\""
    echo "Exemplo: ./update-github.sh \"Adicionado novo blog post\""
    exit 1
fi

# Executa os comandos Git
echo -e "${BLUE}📦 Preparando arquivos...${NC}"
git add .

echo -e "${BLUE}💾 Criando commit...${NC}"
git commit -m "$1"

echo -e "${BLUE}📤 Enviando para GitHub...${NC}"
git push origin main

# Verifica se deu certo
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Sucesso! Mudanças enviadas para GitHub!${NC}"
    echo -e "${GREEN}🔗 Repositório: https://github.com/Tosh-mkt/Karooma-site${NC}"
else
    echo -e "${RED}❌ Erro ao enviar. Verifique sua conexão.${NC}"
fi