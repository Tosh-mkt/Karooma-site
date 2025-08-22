# 🚀 Guia de Deploy - Karooma na Hostinger

Este guia vai te ensinar como fazer deploy do seu site na Hostinger usando GitHub, passo a passo.

## 📋 Pré-requisitos

### 1. Conta na Hostinger
- ✅ Você precisa de um **VPS** ou **Cloud Hosting** (não funciona no shared hosting básico)
- ✅ Acesso SSH ao servidor

### 2. Conta no GitHub
- ✅ Conta no GitHub criada
- ✅ Repositório criado para o projeto

### 3. Credenciais do Google OAuth
- ✅ Google Cloud Console configurado
- ✅ GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET

## 🔧 Passo 1: Conectar Replit ao GitHub

### No Replit:
1. Vá no painel lateral → **Git** (ícone de ramificação)
2. Clique em **Create a GitHub repository**
3. Nomeie seu repositório (ex: `karooma-site`)
4. Clique **Create repository**
5. Faça o primeiro commit:
   - Escreva uma mensagem: "Deploy inicial do Karooma"
   - Clique **Commit & push**

## 🖥️ Passo 2: Configurar Servidor na Hostinger

### 2.1. Acessar via SSH
```bash
ssh usuario@seu-ip-hostinger
```

### 2.2. Instalar Node.js (se não estiver instalado)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2.3. Instalar PM2 (gerenciador de processos)
```bash
npm install -g pm2
```

### 2.4. Instalar Git (se não estiver instalado)
```bash
sudo apt-get update
sudo apt-get install git
```

## 📥 Passo 3: Baixar o Projeto

### 3.1. Clonar do GitHub
```bash
cd /var/www/html/
git clone https://github.com/SEU-USUARIO/karooma-site.git
cd karooma-site
```

### 3.2. Configurar Variáveis de Ambiente
```bash
# Copiar template das variáveis
cp .env.example .env

# Editar variáveis (use nano ou vim)
nano .env
```

**Configure estas variáveis no arquivo .env:**
```env
# Banco de dados (da Hostinger ou externo)
DATABASE_URL=postgresql://usuario:senha@localhost:5432/karooma

# Google OAuth
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui

# Sessão (gere uma chave forte)
SESSION_SECRET=uma_chave_super_forte_e_aleatoria

# Servidor
NODE_ENV=production
PORT=3000
```

## 🔨 Passo 4: Build e Deploy

### 4.1. Instalar Dependências e Fazer Build
```bash
# Dar permissão ao script
chmod +x deploy.sh

# Executar deploy
./deploy.sh
```

### 4.2. Iniciar com PM2
```bash
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

## 🌐 Passo 5: Configurar Nginx (Opcional)

Se quiser usar um domínio, configure o Nginx:

```bash
sudo nano /etc/nginx/sites-available/karooma
```

Adicione:
```nginx
server {
    listen 80;
    server_name seudominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site:
```bash
sudo ln -s /etc/nginx/sites-available/karooma /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔄 Passo 6: Deploy de Atualizações

Para atualizar o site quando você fizer mudanças:

### No Replit:
1. Faça suas mudanças
2. Vá no Git → Commit & push

### Na Hostinger:
```bash
cd /var/www/html/karooma-site
./deploy.sh
```

## 🔍 Comandos Úteis

### Verificar se está funcionando:
```bash
pm2 status
pm2 logs karooma-app
```

### Reiniciar aplicação:
```bash
pm2 restart karooma-app
```

### Ver logs em tempo real:
```bash
pm2 logs karooma-app --lines 50
```

## 🆘 Problemas Comuns

### 1. "npm: command not found"
- Instale o Node.js novamente

### 2. "Permission denied"
- Use `sudo` antes dos comandos ou mude as permissões

### 3. "Port already in use"
- Mude a porta no .env ou mate o processo:
```bash
sudo lsof -t -i:3000 | xargs sudo kill -9
```

### 4. Site não carrega
- Verifique os logs: `pm2 logs karooma-app`
- Verifique se o banco de dados está conectado
- Verifique as variáveis de ambiente

## ✅ Checklist Final

- [ ] Replit conectado ao GitHub
- [ ] Servidor Hostinger configurado
- [ ] Node.js e PM2 instalados
- [ ] Projeto clonado do GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Build realizado com sucesso
- [ ] PM2 iniciado e salvo
- [ ] Site acessível pelo IP/domínio
- [ ] Google OAuth funcionando

---

**🎉 Parabéns! Seu site Karooma está no ar!**

Para dúvidas, verifique os logs com `pm2 logs` ou entre em contato.