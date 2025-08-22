// Configurações específicas para ambiente de produção
// Use este arquivo para sobrescrever configurações durante o deploy

module.exports = {
  // Configurações do Express
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    
    // Security headers
    security: {
      helmet: true,
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://seudominio.com'],
        credentials: true
      }
    },
    
    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100 // máximo 100 requests por IP
    }
  },
  
  // Configurações do banco de dados
  database: {
    ssl: process.env.NODE_ENV === 'production',
    connectionLimit: 10,
    idleTimeout: 30000
  },
  
  // Configurações de cache
  cache: {
    staticFiles: '1y', // Cache de arquivos estáticos por 1 ano
    api: '5m', // Cache de API por 5 minutos
    html: 'no-cache' // Não fazer cache do HTML
  },
  
  // Configurações de logging
  logging: {
    level: 'info',
    file: './logs/app.log',
    errorFile: './logs/error.log',
    maxFiles: 5,
    maxSize: '10m'
  },
  
  // Configurações de session
  session: {
    secure: true, // HTTPS only
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
};