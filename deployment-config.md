# Configurações para Deploy da Karooma

## Variáveis de Ambiente Necessárias

### 🔐 Banco de Dados
- `DATABASE_URL` - URL de conexão PostgreSQL (já configurado automaticamente no Replit)

### 🔑 Autenticação Google  
- `GOOGLE_CLIENT_ID` - ID do cliente Google OAuth
- `GOOGLE_CLIENT_SECRET` - Secret do cliente Google OAuth

### 📧 SendGrid (Email)
- `SENDGRID_API_KEY` - Chave API do SendGrid para envio de emails

### 🛍️ Amazon PA API
- `AMAZON_ACCESS_KEY` - Chave de acesso da Amazon PA API
- `AMAZON_SECRET_KEY` - Chave secreta da Amazon PA API  
- `AMAZON_PARTNER_TAG` - Tag de parceiro Amazon

### ☁️ Object Storage
- `PUBLIC_OBJECT_SEARCH_PATHS` - Caminhos de busca para objetos públicos
- `PRIVATE_OBJECT_DIR` - Diretório para objetos privados
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID` - ID do bucket padrão

### ⚙️ Configurações Gerais
- `NODE_ENV=production` - Ambiente de produção
- `PORT` - Porta da aplicação (Replit define automaticamente)
- `ENABLE_CRON_JOBS=true` - Habilita jobs automáticos em produção

## 🚀 Configurações de Deployment Replit

### Build Command
```bash
npm run build
```

### Run Command  
```bash
npm start
```

### App Type
- **Web server** (aplicação serve na porta 5000)

### Machine Power
- Recomendado: **Shared CPU 1x, 1GB RAM** para início
- Pode escalar conforme necessário

### Domínio
- Usar subdomínio personalizado: `karooma` 
- Resultado: `karooma.replit.app`

## 📋 Checklist Pré-Deploy

### ✅ Já Configurado
- [x] Scripts de build otimizados no package.json
- [x] Banco PostgreSQL configurado  
- [x] Autenticação Google configurada
- [x] Object Storage configurado
- [x] Sistema de monitoramento PA API

### 🔄 Para Configurar no Deploy
- [ ] Configurar secrets de produção no painel Replit
- [ ] Definir ENABLE_CRON_JOBS=true para jobs automáticos
- [ ] Configurar domínio customizado (opcional)
- [ ] Testar todas as funcionalidades após deploy

## 🎯 Recursos da Aplicação

### Principais Funcionalidades
- ✨ Sistema de autenticação completo
- 📝 CMS avançado com geração automática de conteúdo  
- 🛒 Gestão de produtos com PA API da Amazon
- 📧 Newsletter integrada com SendGrid
- 🖼️ Upload de imagens com Object Storage
- 📊 Dashboard administrativo completo
- 🔄 Sistema de monitoramento e jobs automáticos

### Tecnologias
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Banco**: PostgreSQL (Neon)
- **Autenticação**: Google OAuth
- **Email**: SendGrid
- **Storage**: Google Cloud Storage via Replit

## 🌟 Pronto para Deploy!

A aplicação Karooma está completamente configurada e pronta para ser deployada no Replit usando Autoscale Deployments.