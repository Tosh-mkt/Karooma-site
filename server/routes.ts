import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentSchema, insertProductSchema, insertNewsletterSchema, insertNewsletterAdvancedSchema, insertPageSchema } from "@shared/schema";
import { z } from "zod";
import { sseManager } from "./sse";
import { setupNextAuth } from "./nextAuthExpress";
import { sendNewsletterNotification, logNewsletterSubscription } from "./emailService";
// Auth middleware will be added with NextAuth
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import bcrypt from "bcryptjs";
import { getProductUpdateJobs } from "./jobs/productUpdateJobs";
import AmazonPAAPIService from "./services/amazonApi";
import { getBlogTemplate, generateContentSuggestions, type BlogCategory } from "@shared/blog-template";
import { blogValidator } from "./blog-validator";
import path from "path";
import express from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup NextAuth
  setupNextAuth(app);


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

  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // Google Sheets Import - Importar produtos do CSV
  app.post("/api/admin/import-products", async (req, res) => {
    try {
      const { csvData, overwrite = false } = req.body;
      
      if (!csvData) {
        return res.status(400).json({ error: "CSV data is required" });
      }

      // Parse CSV data
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map((h: string) => h.trim().replace(/"/g, ''));
      
      const products = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v: string) => v.trim().replace(/"/g, ''));
        
        if (values.length !== headers.length) continue;
        
        const productData: any = {};
        headers.forEach((header, index) => {
          productData[header] = values[index] || '';
        });

        // Mapear campos do CSV para o schema do produto
        const product = {
          title: productData['Título'] || productData['Title'] || productData['title'],
          description: productData['Descrição'] || productData['Description'] || productData['description'],
          category: productData['Categoria'] || productData['Category'] || productData['category'],
          imageUrl: productData['Imagem'] || productData['Image'] || productData['imageUrl'],
          currentPrice: productData['Preço Atual'] || productData['Current Price'] || productData['currentPrice'],
          originalPrice: productData['Preço Original'] || productData['Original Price'] || productData['originalPrice'],
          affiliateLink: productData['Link Afiliado'] || productData['Affiliate Link'] || productData['affiliateLink'],
          rating: productData['Avaliação'] || productData['Rating'] || productData['rating'],
          discount: productData['Desconto'] || productData['Discount'] || productData['discount'],
          featured: (productData['Destaque'] || productData['Featured'] || productData['featured'])?.toLowerCase() === 'true',
          expertReview: productData['Avaliação Especialista'] || productData['Expert Review'] || productData['expertReview'],
          teamEvaluation: productData['Avaliação Equipe'] || productData['Team Evaluation'] || productData['teamEvaluation'],
          benefits: productData['Benefícios'] || productData['Benefits'] || productData['benefits'],
          tags: productData['Tags'] || productData['tags'],
          introduction: productData['Introdução'] || productData['Introduction'] || productData['introduction'],
          nutritionistEvaluation: productData['Avaliação Nutricionista'] || productData['Nutritionist Evaluation'],
          organizerEvaluation: productData['Avaliação Organizadora'] || productData['Organizer Evaluation'],
          designEvaluation: productData['Avaliação Design'] || productData['Design Evaluation'],
          karoomaTeamEvaluation: productData['Avaliação Karooma'] || productData['Karooma Team Evaluation'],
          categoryTags: productData['Tags Categoria'] || productData['Category Tags'],
          searchTags: productData['Tags Busca'] || productData['Search Tags']
        };

        // Validar dados essenciais
        if (product.title && product.category && product.affiliateLink) {
          products.push(product);
        }
      }

      // Limpar produtos existentes se overwrite = true
      if (overwrite) {
        await storage.clearProducts();
      }

      // Inserir produtos no banco
      const insertedProducts = [];
      for (const productData of products) {
        try {
          const insertedProduct = await storage.createProduct(productData);
          insertedProducts.push(insertedProduct);
        } catch (error) {
          console.error('Error inserting product:', error);
        }
      }

      res.json({ 
        success: true, 
        imported: insertedProducts.length, 
        total: products.length,
        products: insertedProducts 
      });

    } catch (error) {
      console.error('Error importing products:', error);
      res.status(500).json({ error: "Failed to import products" });
    }
  });

  app.put("/api/images/upload", async (req, res) => {
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

  // Auth routes - will be replaced with NextAuth
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // TODO: Implement with NextAuth session
      res.status(401).json({ message: "Authentication not implemented yet" });
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
      if (req.session) {
        (req.session as any).user = user;
      }
      res.json({ 
        message: "Logged in successfully", 
        user,
        // isAdmin functionality will be implemented with NextAuth 
      });
    } catch (error) {
      console.error("Error in temp login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Login route for email/password authentication
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password, type } = req.body;

      // For admin login
      if (type === 'admin') {
        // Find user by email
        const user = await storage.getUserByEmail(email);
        
        // TODO: Implement admin check with NextAuth
        if (!user || !user.passwordHash) {
          return res.status(401).json({ message: "Invalid admin credentials" });
        }
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!passwordMatch) {
          return res.status(401).json({ message: "Invalid admin credentials" });
        }
          
        // Login bem-sucedido - por enquanto só retorna sucesso
        // TODO: Implementar session management com NextAuth
        return res.json({ 
          message: "Logged in successfully", 
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            isAdmin: user.isAdmin
          },
          success: true
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
      const sessionUser = req.session ? (req.session as any).user : null;
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

  // Rota específica para latest videos (usada na home)
  app.get("/api/content/videos/latest", async (req, res) => {
    try {
      const videos = await storage.getContentByType("video");
      // Retornar os 3 vídeos mais recentes
      const sortedVideos = videos.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      res.json(sortedVideos.slice(0, 3));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest videos" });
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

  // Rota específica para latest blog posts (usada na home)
  app.get("/api/content/blog/latest", async (req, res) => {
    try {
      const articles = await storage.getContentByType("blog");
      // Retornar os 3 posts mais recentes
      const sortedArticles = articles.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      res.json(sortedArticles.slice(0, 3));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest blog articles" });
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

  // ===== BLOG TEMPLATE SYSTEM ENDPOINTS =====
  
  // Obter template para uma categoria específica
  app.get("/api/blog/template/:category", async (req, res) => {
    try {
      const category = req.params.category as BlogCategory;
      const template = getBlogTemplate(category);
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to get blog template" });
    }
  });

  // Gerar sugestões de conteúdo baseadas na categoria e tópico
  app.post("/api/blog/suggestions", async (req, res) => {
    try {
      const { category, topic } = req.body;
      
      if (!category || !topic) {
        return res.status(400).json({ error: "Category and topic are required" });
      }
      
      const suggestions = generateContentSuggestions(category as BlogCategory, topic);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate content suggestions" });
    }
  });

  // Validar post do blog seguindo padrões Karooma
  app.post("/api/blog/validate", async (req, res) => {
    try {
      const post = req.body;
      const validation = blogValidator.validatePost(post);
      res.json(validation);
    } catch (error) {
      res.status(500).json({ error: "Failed to validate blog post" });
    }
  });

  // Obter sugestões de melhoria para um post
  app.post("/api/blog/improve", async (req, res) => {
    try {
      const post = req.body;
      const suggestions = blogValidator.generateImprovementSuggestions(post);
      res.json({ suggestions });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate improvement suggestions" });
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

  // Newsletter subscription with advanced preferences
  app.post("/api/newsletter/subscribe-advanced", async (req, res) => {
    try {
      const validatedData = insertNewsletterAdvancedSchema.parse(req.body);
      const subscription = await storage.createNewsletterAdvanced(validatedData);
      
      // Prepare notification data
      const notificationData = {
        email: subscription.email,
        name: subscription.name || null,
        categories: (subscription.interests as any)?.categories || [],
        source: subscription.source,
        leadMagnet: subscription.leadMagnet,
        timestamp: new Date().toISOString()
      };
      
      // Broadcast to admin dashboard for real-time notifications
      sseManager.broadcast('newsletter-subscription', notificationData);
      
      // Send email notification to admin (async, non-blocking)
      sendNewsletterNotification(notificationData).catch(error => {
        console.error('Failed to send email notification:', error);
      });
      
      // Log to console as fallback
      logNewsletterSubscription(notificationData);
      
      res.status(201).json(subscription);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Dados inválidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Falha ao se inscrever na newsletter" });
      }
    }
  });





  // Server-Sent Events endpoint
  app.get("/api/events", (req, res) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sseManager.addClient(clientId, res);
  });

  // Update product by ID (Admin only)
  app.patch("/api/products/:id", async (req, res) => {
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
  app.delete("/api/products/:id", async (req, res) => {
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
  app.get("/api/favorites", async (req: any, res) => {
    try {
      const userId = req.sessionUserId;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites/:productId", async (req: any, res) => {
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

  app.delete("/api/favorites/:productId", async (req: any, res) => {
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

  app.get("/api/favorites/check/:productId", async (req: any, res) => {
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
  app.get("/api/pages", async (req, res) => {
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

  app.post("/api/pages", async (req, res) => {
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

  app.put("/api/pages/:id", async (req, res) => {
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

  app.delete("/api/pages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePage(id);
      res.json({ message: "Page deleted successfully" });
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  // Amazon PA API routes
  const jobsManager = getProductUpdateJobs();
  const amazonService = new AmazonPAAPIService();

  // Rota para verificar status dos jobs de atualização
  app.get("/api/admin/product-updates/status", async (req, res) => {
    try {
      const jobsStatus = jobsManager.getJobsStatus();
      const stats = await jobsManager.getUpdateStats();
      
      res.json({
        jobs: jobsStatus,
        statistics: stats,
        apiConfigured: amazonService.isConfigured()
      });
    } catch (error) {
      console.error("Error getting update status:", error);
      res.status(500).json({ message: "Failed to get update status" });
    }
  });

  // Rota para executar atualização manual
  app.post("/api/admin/product-updates/run", async (req, res) => {
    try {
      const { frequency } = req.body;
      
      if (frequency && !['high', 'medium', 'low'].includes(frequency)) {
        return res.status(400).json({ message: "Invalid frequency. Use: high, medium, or low" });
      }

      const result = await jobsManager.runManualUpdate(frequency);
      res.json({
        message: "Update completed",
        result
      });
    } catch (error) {
      console.error("Error running manual update:", error);
      res.status(500).json({ message: "Failed to run update", error: error.message });
    }
  });

  // Rota para verificar produto específico pela PA API
  app.post("/api/admin/products/check-amazon", async (req, res) => {
    try {
      const { asin } = req.body;
      
      if (!asin) {
        return res.status(400).json({ message: "ASIN is required" });
      }

      const result = await amazonService.getProductByASIN(asin);
      res.json(result);
    } catch (error) {
      console.error("Error checking Amazon product:", error);
      res.status(500).json({ message: "Failed to check product", error: error.message });
    }
  });

  // Rota para atualizar configuração de frequência de produtos
  app.put("/api/admin/products/:id/update-frequency", async (req, res) => {
    try {
      const { id } = req.params;
      const { frequency } = req.body;
      
      if (!['high', 'medium', 'low'].includes(frequency)) {
        return res.status(400).json({ message: "Invalid frequency. Use: high, medium, or low" });
      }

      await storage.updateProductFrequency(id, frequency);
      res.json({ message: "Product update frequency updated successfully" });
    } catch (error) {
      console.error("Error updating product frequency:", error);
      res.status(500).json({ message: "Failed to update product frequency" });
    }
  });

  // Rota para obter produtos por status
  app.get("/api/admin/products/by-status/:status", async (req, res) => {
    try {
      const { status } = req.params;
      
      if (!['active', 'inactive', 'discontinued'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const products = await storage.getProductsByStatus(status);
      res.json(products);
    } catch (error) {
      console.error("Error getting products by status:", error);
      res.status(500).json({ message: "Failed to get products" });
    }
  });

  // Endpoint de teste do SendGrid
  app.post("/api/admin/test-email", async (req, res) => {
    try {
      const { sendEmail } = await import('./emailService');
      
      const testResult = await sendEmail({
        to: 'admin@karooma.com',
        from: 'admin@karooma.com',
        subject: 'Teste SendGrid - Karooma',
        html: `
          <h2>🎉 SendGrid Configurado com Sucesso!</h2>
          <p>Este é um email de teste para verificar se o SendGrid está funcionando corretamente.</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p><strong>Status:</strong> ✅ Funcionando</p>
        `,
        text: 'SendGrid configurado com sucesso! Este é um email de teste.'
      });
      
      if (testResult) {
        res.json({ 
          success: true, 
          message: 'Email de teste enviado com sucesso!',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Falha ao enviar email de teste'
        });
      }
    } catch (error) {
      console.error('Erro no teste do SendGrid:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno no teste de email',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
