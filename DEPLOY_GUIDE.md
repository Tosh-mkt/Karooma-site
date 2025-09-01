# 🚀 Guia Completo de Deploy - Hostinger

## 📋 **Duas opções de deploy automático**

### 🎯 **OPÇÃO 1: GitHub Actions (Mais fácil)**

1. **Configure secrets no GitHub:**
   - Vá em: `Settings` → `Secrets and variables` → `Actions`
   - Adicione estas secrets:
     ```
     HOSTINGER_FTP_HOST=ftp.seudominio.com
     HOSTINGER_FTP_USER=seu-usuario-ftp
     HOSTINGER_FTP_PASSWORD=sua-senha-ftp
     ```

2. **Processo automático:**
   - ✅ Toda vez que você fizer `git push`
   - ✅ GitHub Actions executa automaticamente
   - ✅ Build + Deploy para Hostinger

### 🛠️ **OPÇÃO 2: Deploy via SSH**

1. **Configure acesso SSH na Hostinger**
2. **Execute o script:**
   ```bash
   chmod +x scripts/deploy-hostinger.sh
   ./scripts/deploy-hostinger.sh
   ```

## 🔧 **Configuração inicial no servidor:**

### 1. **Instalar Node.js e PM2**
```bash
# No servidor Hostinger
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pm2
```

### 2. **Configurar variáveis de ambiente**
```bash
# Copiar template
cp .env.production.template .env

# Editar com dados reais
nano .env
```

### 3. **Iniciar aplicação**
```bash
npm install
npm run build
pm2 start dist/index.js --name karooma
pm2 save
pm2 startup
```

## 📊 **Vantagens do deploy automático:**

✅ **Sem upload manual de arquivos**  
✅ **Deploy com um git push**  
✅ **Backup automático**  
✅ **Build automatizado**  
✅ **Restart automático da aplicação**  
✅ **Controle de versão completo**

## 🔍 **Próximos passos:**

1. **Escolha uma opção (GitHub Actions recomendado)**
2. **Configure credenciais FTP/SSH da Hostinger**
3. **Execute primeiro deploy**
4. **Configure domínio karooma.net**