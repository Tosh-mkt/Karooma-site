// Configuração PM2 para Hostinger
module.exports = {
  apps: [{
    name: "karooma-app",
    script: "server/index.js",
    cwd: "./",
    instances: 1,
    exec_mode: "fork",
    
    // Configurações de ambiente
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    
    // Logs
    log_file: "./logs/app.log",
    out_file: "./logs/out.log",
    error_file: "./logs/error.log",
    
    // Restart automatico
    watch: false,
    autorestart: true,
    max_restarts: 5,
    min_uptime: "5s",
    
    // Configurações avançadas
    kill_timeout: 5000,
    listen_timeout: 8000,
    shutdown_with_message: true,
    
    // Health check
    health_check_grace_period: 3000
  }]
};