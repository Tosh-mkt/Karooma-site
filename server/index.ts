import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { getProductUpdateJobs } from "./jobs/productUpdateJobs";
import { pool } from "./db";
import path from "path";

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Trust proxy - required for secure cookies to work behind reverse proxy (Replit)
// Use 'true' to trust all proxies in the chain (load balancer + internal routing)
app.set('trust proxy', true);

// Configure session middleware with PostgreSQL store (production-ready)
const PgStore = connectPgSimple(session);
app.use(session({
  store: new PgStore({
    pool: pool,
    tableName: 'session',
    pruneSessionInterval: 60 * 15 // Limpa sessões expiradas a cada 15 minutos
  }),
  secret: process.env.SESSION_SECRET || process.env.AUTH_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
}));

// Anti-cache headers SUPER AGRESSIVO para forçar atualização do browser
app.use((req, res, next) => {
  // Forçar no-cache para TUDO para garantir atualização
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'ETag': 'false',
    'Last-Modified': new Date().toUTCString(),
    'Surrogate-Control': 'no-store',
    'Vary': '*'
  });
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Serve attached_assets images via API route (supports subfolders)
app.get('/api/images/:filename(*)', (req, res) => {
  const imagePath = req.params.filename; // Gets the full path including subfolders
  const filepath = path.resolve(process.cwd(), 'attached_assets', imagePath);
  
  // Set proper content type for images
  if (imagePath.endsWith('.png')) {
    res.contentType('image/png');
  } else if (imagePath.endsWith('.jpg') || imagePath.endsWith('.jpeg')) {
    res.contentType('image/jpeg');
  }
  
  res.sendFile(filepath, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Inicializar jobs de atualização de produtos
    try {
      const productJobs = getProductUpdateJobs();
      productJobs.startAllJobs();
      log('Product update jobs initialized successfully');
    } catch (error) {
      log('Failed to initialize product update jobs:', String(error));
    }
  });
})();
