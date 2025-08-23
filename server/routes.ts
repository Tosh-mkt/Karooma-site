import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentSchema, insertProductSchema, insertNewsletterSchema, insertPageSchema } from "@shared/schema";
import { z } from "zod";
import { sseManager } from "./sse";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { setupGoogleAuth } from "./googleAuth";
import { isSessionAuthenticated, isSessionAdmin } from "./middleware";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);
  
  // Setup Google OAuth
  setupGoogleAuth(app);

  // Object Storage routes
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Public objects serving route
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/objects/upload", isSessionAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  app.put("/api/images/upload", isSessionAuthenticated, async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: "admin-karooma",
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
        imageURL: objectPath
      });
    } catch (error) {
      console.error("Error setting image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Temporary login route for testing
  app.post('/api/auth/temp-login', async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Set a simple session cookie for testing
      (req.session as any).user = user;
      res.json({ 
        message: "Logged in successfully", 
        user,
        isAdmin: user.isAdmin 
      });
    } catch (error) {
      console.error("Error in temp login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Login route for email/password authentication
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, loginType } = req.body;

      // For admin login
      if (loginType === 'admin') {
        // Find user by email
        const user = await storage.getUserByEmail(email);
        if (!user || !user.isAdmin) {
          return res.status(401).json({ message: "Invalid admin credentials" });
        }
        
        // Verify password
        const bcrypt = require('bcryptjs');
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!passwordMatch) {
          return res.status(401).json({ message: "Invalid admin credentials" });
        }
          
        (req.session as any).user = user;
        return res.json({ 
          message: "Logged in successfully", 
          user,
          isAdmin: true 
        });
      }
      
      // For regular user login (can be extended later)
      return res.status(401).json({ message: "User login not implemented yet" });
      
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get current session user
  app.get('/api/auth/session-user', async (req, res) => {
    try {
      const sessionUser = (req.session as any).user;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not logged in" });
      }
      res.json(sessionUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to get session user" });
    }
  });

  // Test route to create user (temporary - only for setup)
  app.post('/api/test/create-user', async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.upsertUser(userData);
      res.json({ message: "User created", user });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Admin route to make user admin (temporary - only for setup)
  app.post('/api/admin/make-admin/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const adminUser = await storage.makeUserAdmin(userId);
      res.json({ message: "User is now admin", user: adminUser });
    } catch (error) {
      console.error("Error making user admin:", error);
      res.status(500).json({ error: "Failed to make user admin" });
    }
  });

  // Content routes
  app.get("/api/content/featured", async (req, res) => {
    try {
      const content = await storage.getFeaturedContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured content" });
    }
  });

  app.get("/api/content/videos", async (req, res) => {
    try {
      const videos = await storage.getContentByType("video");
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.get("/api/content/videos/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const videos = await storage.getContentByTypeAndCategory("video", category);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos by category" });
    }
  });

  app.get("/api/content/blog", async (req, res) => {
    try {
      const articles = await storage.getContentByType("blog");
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog articles" });
    }
  });

  app.get("/api/content/blog/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const articles = await storage.getContentByTypeAndCategory("blog", category);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog articles by category" });
    }
  });

  app.get("/api/content/page/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const pageContent = await storage.getContentByTypeAndCategory("page", slug);
      if (!pageContent || pageContent.length === 0) {
        return res.status(404).json({ error: "Page content not found" });
      }
      res.json(pageContent[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch page content" });
    }
  });

  app.get("/api/content/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const content = await storage.getContentById(id);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      // Incrementar views
      await storage.incrementContentViews(id);
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.post("/api/content", async (req, res) => {
    try {
      const validatedData = insertContentSchema.parse(req.body);
      const content = await storage.createContent(validatedData);
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid content data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create content" });
      }
    }
  });

  app.put("/api/content/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertContentSchema.partial().parse(req.body);
      const updatedContent = await storage.updateContent(id, validatedData);
      res.json(updatedContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid content data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update content" });
      }
    }
  });

  app.delete("/api/content/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteContent(id);
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete content" });
    }
  });

  // Product routes (String.com integration ready)
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid product data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create product" });
      }
    }
  });

  // Endpoint padronizado para importar produto - PROCESSO GARANTIDO SEM AJUSTES
  app.post("/api/products/import", async (req, res) => {
    try {
      const data = req.body;
      
      // VALIDAÇÃO OBRIGATÓRIA - Bloqueia se dados essenciais faltando
      const validationErrors = [];
      
      // 1. Campos obrigatórios
      if (!data["Nome do Produto"] && !data.title) {
        validationErrors.push("Nome do Produto é obrigatório");
      }
      if (!data["Link Afiliado"] && !data.affiliateLink) {
        validationErrors.push("Link Afiliado é obrigatório");
      }
      if (!data["Benefícios (por avaliador)"] && !data.benefits) {
        validationErrors.push("Avaliações dos especialistas são obrigatórias");
      }
      
      // 2. Validar mínimo de 3 especialistas nas avaliações
      const benefits = data["Benefícios (por avaliador)"] || data.benefits || "";
      if (benefits.length < 100) { // Se o texto é muito curto, provavelmente não tem especialistas
        validationErrors.push("Avaliações dos especialistas devem conter análises detalhadas");
      }
      
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: "Dados inválidos para importação", 
          details: validationErrors,
          message: "Consulte PROCESSO_IMPORTACAO_PRODUTOS.md para formato correto"
        });
      }

      // PROCESSAMENTO AUTOMÁTICO INTELIGENTE
      const productData = {
        title: data["Nome do Produto"] || data.title,
        description: data["Descrição"] || data.description || "Produto recomendado pela equipe Karooma",
        category: extractCategory(data["Nome do Produto"] || data.title || ""),
        affiliateLink: data["Link Afiliado"] || data.affiliateLink,
        productLink: data["Link do Produto"] || data.productLink || data["Link Afiliado"] || data.affiliateLink,
        rating: extractRating(data["Pontuação Geral"]),
        expertReview: data["Avaliação dos Especialistas"] || data.expertReview,
        teamEvaluation: data["Avaliação Geral da Equipe KAROOMA"] || data.teamEvaluation,
        benefits: data["Benefícios (por avaliador)"] || data.benefits,
        tags: data["Tags"] || data.tags || "Benefícios:<br>#Praticidade<br>#QualidadeDeVida",
        evaluators: data["Seleção da Equipe de Avaliadores"] || data.evaluators || "- Especialistas Karooma",
        introduction: data["Introdução"] || data.introduction || "Nossa equipe multidisciplinar analisou este produto para verificar seu impacto na rotina das mães ocupadas.",
        featured: false,
        imageUrl: null,
        currentPrice: "0",
        originalPrice: null,
        discount: null
      };

      // Extrair preços com MÚLTIPLOS FORMATOS suportados
      const priceInfo = extractPrice(data["Preço"]);
      productData.currentPrice = priceInfo.current;
      if (priceInfo.original) productData.originalPrice = priceInfo.original as any;
      if (priceInfo.discount) productData.discount = priceInfo.discount as any;

      const product = await storage.createProduct(productData);
      res.status(201).json({ 
        message: "Produto importado com sucesso",
        product,
        validation: {
          categoryDetected: productData.category,
          priceExtracted: priceInfo,
          allFieldsProcessed: true,
          benefitsLength: productData.benefits?.length || 0
        }
      });
    } catch (error) {
      console.error("Erro ao importar produto:", error);
      res.status(500).json({ 
        error: "Falha ao importar produto",
        message: "Verifique o formato dos dados conforme PROCESSO_IMPORTACAO_PRODUTOS.md" 
      });
    }
  });

  // FUNÇÕES AUXILIARES PARA PROCESSAMENTO AUTOMÁTICO
  function extractCategory(productName: string): string {
    const categories = {
      'Eletrodomésticos': ['sanduicheira', 'liquidificador', 'microondas', 'geladeira', 'fogão', 'elétrica', 'elétrico'],
      'Casa e Organização': ['organizador', 'gaveta', 'armário', 'estante', 'cesta', 'organizadora'],
      'Cuidados Pessoais': ['creme', 'shampoo', 'sabonete', 'hidratante', 'perfume', 'maquiagem'],
      'Família': ['brinquedo', 'criança', 'bebê', 'infantil', 'escolar', 'educativo'],
      'Saúde e Bem-estar': ['vitamina', 'suplemento', 'exercício', 'yoga', 'relaxamento'],
      'Tecnologia': ['smartphone', 'tablet', 'notebook', 'app', 'digital', 'smart']
    };
    
    const name = productName.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return category;
      }
    }
    return "Casa e Organização"; // Categoria padrão para mães ocupadas
  }

  function extractRating(ratingText: any): string | null {
    if (!ratingText) return null;
    
    const text = ratingText.toString();
    // Formatos: "4.7 de 5 estrelas", "4.5", "Excelente (4.8/5)"
    const ratingMatch = text.match(/(\d+[.,]\d+)/);
    return ratingMatch ? ratingMatch[1].replace(',', '.') : null;
  }

  function extractPrice(priceText: any): { current: string; original: string | null; discount: number | null } {
    if (!priceText) return { current: "0", original: null, discount: null };
    
    const text = priceText.toString();
    
    // Formato "R$ 125 a R$ 150"
    const rangeMatch = text.match(/R\$\s*(\d+(?:[.,]\d+)?)\s*a\s*R\$\s*(\d+(?:[.,]\d+)?)/);
    if (rangeMatch) {
      const current = parseFloat(rangeMatch[1].replace(',', '.'));
      const original = parseFloat(rangeMatch[2].replace(',', '.'));
      const discount = Math.round(((original - current) / original) * 100);
      return { 
        current: current.toFixed(2), 
        original: original.toFixed(2),
        discount: discount > 0 ? discount : null
      };
    }
    
    // Formato "R$ 99,90" ou "R$ 99"
    const singleMatch = text.match(/R\$\s*(\d+(?:[.,]\d+)?)/);
    if (singleMatch) {
      const price = parseFloat(singleMatch[1].replace(',', '.'));
      return { current: price.toFixed(2), original: null, discount: null };
    }
    
    // Formato "Varia em torno de R$ 125"
    const variaMatch = text.match(/(?:varia|torno).*?R\$\s*(\d+(?:[.,]\d+)?)/i);
    if (variaMatch) {
      const price = parseFloat(variaMatch[1].replace(',', '.'));
      return { current: price.toFixed(2), original: null, discount: null };
    }
    
    return { current: "0", original: null, discount: null };
  }

  // String.com webhook endpoint (for automatic product updates)
  app.post("/api/products/webhook/string", async (req, res) => {
    try {
      // This endpoint would handle String.com product data
      const { products } = req.body;
      
      if (Array.isArray(products)) {
        for (const productData of products) {
          // Transform String.com data to our schema
          const transformedProduct = {
            title: productData.title,
            description: productData.description,
            category: productData.category || "general",
            imageUrl: productData.image_url,
            currentPrice: productData.current_price?.toString(),
            originalPrice: productData.original_price?.toString(),
            affiliateLink: productData.affiliate_link,
            rating: productData.rating?.toString(),
            discount: productData.discount_percent,
            featured: productData.is_featured || false,
          };
          
          await storage.createProduct(transformedProduct);
        }
      }
      
      res.json({ success: true, message: "Products updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to process webhook data" });
    }
  });

  // Newsletter routes
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const validatedData = insertNewsletterSchema.parse(req.body);
      const subscription = await storage.createNewsletterSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid email address", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to subscribe to newsletter" });
      }
    }
  });





  // Server-Sent Events endpoint
  app.get("/api/events", (req, res) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sseManager.addClient(clientId, res);
  });

  // Update product by ID (Admin only)
  app.patch("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const productId = req.params.id;
      const updates = req.body;
      
      // Get existing product
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      // Update product
      const updatedProduct = await storage.updateProduct(productId, updates);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      res.status(500).json({ error: "Falha ao atualizar produto" });
    }
  });

  // Delete product by ID (Admin only)
  app.delete("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const productId = req.params.id;
      
      // Check if product exists
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      // Delete product
      await storage.deleteProduct(productId);
      res.json({ message: "Produto deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      res.status(500).json({ error: "Falha ao deletar produto" });
    }
  });

  // Analytics/tracking routes
  app.post("/api/analytics/affiliate-click", async (req, res) => {
    try {
      const { productId, affiliateLink } = req.body;
      // Log affiliate click for analytics
      console.log(`Affiliate click tracked: Product ${productId}, Link: ${affiliateLink}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to track click" });
    }
  });

  // Favorites routes (protected by session)
  app.get("/api/favorites", isSessionAuthenticated, async (req: any, res) => {
    try {
      const userId = req.sessionUserId;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites/:productId", isSessionAuthenticated, async (req: any, res) => {
    try {
      const userId = req.sessionUserId;
      const { productId } = req.params;
      
      const favorite = await storage.addToFavorites(userId, productId);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:productId", isSessionAuthenticated, async (req: any, res) => {
    try {
      const userId = req.sessionUserId;
      const { productId } = req.params;
      
      await storage.removeFromFavorites(userId, productId);
      res.json({ message: "Removed from favorites" });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  app.get("/api/favorites/check/:productId", isSessionAuthenticated, async (req: any, res) => {
    try {
      const userId = req.sessionUserId;
      const { productId } = req.params;
      
      const isFavorite = await storage.isFavorite(userId, productId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Pages management routes
  app.get("/api/pages", isSessionAdmin, async (req, res) => {
    try {
      const pages = await storage.getAllPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getPageBySlug(slug);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.post("/api/pages", isSessionAdmin, async (req, res) => {
    try {
      const validatedData = insertPageSchema.parse(req.body);
      
      // Verificar se slug já existe
      const existingPage = await storage.getPageBySlug(validatedData.slug);
      if (existingPage) {
        return res.status(400).json({ message: "A page with this slug already exists" });
      }
      
      const page = await storage.createPage(validatedData);
      res.status(201).json(page);
    } catch (error) {
      console.error("Error creating page:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create page" });
    }
  });

  app.put("/api/pages/:id", isSessionAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertPageSchema.parse(req.body);
      
      const page = await storage.updatePage(id, validatedData);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error updating page:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update page" });
    }
  });

  app.delete("/api/pages/:id", isSessionAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePage(id);
      res.json({ message: "Page deleted successfully" });
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
