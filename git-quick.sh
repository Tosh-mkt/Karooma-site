#!/bin/bash

# Comando ultra-simples para GitHub
# Uso: ./git-quick.sh "mensagem"

echo "🚀 Enviando para GitHub..."
git add . && git commit -m "$1" && git push origin main && echo "✅ Enviado com sucesso!" || echo "❌ Erro ao enviar"