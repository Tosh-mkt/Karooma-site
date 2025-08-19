import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentSchema, insertProductSchema, insertNewsletterSchema } from "@shared/schema";
import { z } from "zod";
import { sseManager } from "./sse";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { isSessionAuthenticated, isSessionAdmin } from "./middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

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

  // Endpoint para importar produto no formato de tabela estruturada
  app.post("/api/products/import", async (req, res) => {
    try {
      const data = req.body;
      
      // Mapear dados da tabela para o formato do produto
      const productData = {
        title: data["Nome do Produto"] || data.title,
        description: data["Descrição"] || data.description,
        category: "Eletrodomésticos", // Categoria padrão baseada na sanduicheira
        affiliateLink: data["Link Afiliado"] || data.affiliateLink,
        productLink: data["Link do Produto"] || data.productLink,
        rating: data["Pontuação Geral"] ? data["Pontuação Geral"].toString().split(" ")[0] : null,
        expertReview: data["Avaliação dos Especialistas"] || data.expertReview,
        teamEvaluation: data["Avaliação Geral da Equipe KAROOMA"] || data.teamEvaluation,
        benefits: data["Benefícios (por avaliador)"] || data.benefits,
        tags: data["Tags"] || data.tags,
        evaluators: data["Seleção da Equipe de Avaliadores"] || data.evaluators,
        introduction: data["Introdução"] || data.introduction,
        featured: false,
        imageUrl: null, // Será preenchido posteriormente
        currentPrice: "0", // Preço será extraído do campo "Preço"
        originalPrice: null,
        discount: null
      };

      // Extrair preço se disponível
      if (data["Preço"]) {
        const priceText = data["Preço"].toString();
        const priceMatch = priceText.match(/R\$\s*(\d+(?:,\d+)?(?:\.\d+)?)/);
        if (priceMatch) {
          productData.currentPrice = priceMatch[1].replace(',', '.');
        }
      }

      const product = await storage.createProduct(productData);
      res.status(201).json({ 
        message: "Produto importado com sucesso",
        product 
      });
    } catch (error) {
      console.error("Erro ao importar produto:", error);
      res.status(500).json({ error: "Falha ao importar produto" });
    }
  });

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

  // String.com Automation endpoints
  app.post("/api/automation/products/sync", async (req, res) => {
    try {
      const productData = req.body;
      
      // Validar dados obrigatórios
      const requiredFields = ['title', 'currentPrice', 'affiliateLink', 'category'];
      for (const field of requiredFields) {
        if (!productData[field]) {
          return res.status(400).json({ error: `Campo obrigatório: ${field}` });
        }
      }
      
      // Validar categoria
      const validCategories = ['casa', 'autocuidado', 'familia', 'saude', 'tecnologia'];
      if (!validCategories.includes(productData.category)) {
        return res.status(400).json({ error: 'Categoria inválida' });
      }
      
      // Validar preço
      const price = parseFloat(productData.currentPrice);
      if (price < 10 || price > 5000) {
        return res.status(400).json({ error: 'Preço inválido' });
      }
      
      // Verificar se produto já existe pelo link afiliado
      const existingProducts = await storage.getAllProducts();
      const existingProduct = existingProducts.find(p => p.affiliateLink === productData.affiliateLink);
      
      const formattedProduct = {
        title: productData.title,
        description: productData.description || '',
        category: productData.category,
        imageUrl: productData.imageUrl || null,
        currentPrice: productData.currentPrice.toString(),
        originalPrice: productData.originalPrice?.toString() || null,
        affiliateLink: productData.affiliateLink,
        rating: productData.rating?.toString() || null,
        discount: productData.discount || null,
        featured: productData.featured || false
      };
      
      if (existingProduct) {
        // Atualizar produto existente (implementar updateProduct se necessário)
        console.log(`Produto já existe: ${existingProduct.id}`);
        res.json({ success: true, message: 'Produto já existe', productId: existingProduct.id });
      } else {
        // Criar novo produto
        const newProduct = await storage.createProduct(formattedProduct);
        console.log(`Novo produto criado via String.com: ${newProduct.title}`);
        res.json({ success: true, message: 'Produto criado', productId: newProduct.id });
      }
      
    } catch (error) {
      console.error('Erro na sincronização String.com:', error);
      res.status(500).json({ error: "Falha na sincronização do produto" });
    }
  });

  // Endpoint para lotes de produtos (5-20)
  app.post("/api/automation/products/batch", async (req, res) => {
    try {
      const { products } = req.body;
      
      // 🔍 LOG TEMPORÁRIO: Ver dados que chegam do N8N
      console.log('\n🔍 DADOS RECEBIDOS DO N8N:');
      console.log('products array:', JSON.stringify(products, null, 2));
      
      if (!products || !Array.isArray(products)) {
        return res.status(400).json({ error: 'Campo "products" deve ser um array' });
      }
      
      if (products.length === 0 || products.length > 20) {
        return res.status(400).json({ error: 'Envie entre 1 e 20 produtos por lote' });
      }
      
      const results = {
        successful: [],
        failed: [],
        skipped: [],
        total: products.length
      };
      
      for (let i = 0; i < products.length; i++) {
        const productData = products[i];
        
        try {
          // Validação usando schema existente
          const validatedProduct = insertProductSchema.parse(productData);
          
          // Validação de preço
          const price = parseFloat(validatedProduct.currentPrice || '0');
          if (price < 10 || price > 5000) {
            (results.failed as any[]).push({ index: i + 1, title: productData.title || 'Sem título', reason: 'Preço inválido' });
            continue;
          }
          
          // Verificar duplicata
          const existingProducts = await storage.getAllProducts();
          const existingProduct = existingProducts.find(p => p.affiliateLink === validatedProduct.affiliateLink);
          
          if (existingProduct) {
            (results.skipped as any[]).push({ index: i + 1, title: productData.title || 'Sem título', reason: 'Produto já existe', id: existingProduct.id });
            continue;
          }
          
          const formattedProduct = {
            title: validatedProduct.title,
            description: validatedProduct.description || '',
            category: validatedProduct.category,
            imageUrl: validatedProduct.imageUrl || null,
            currentPrice: validatedProduct.currentPrice?.toString() || '0',
            originalPrice: validatedProduct.originalPrice?.toString() || null,
            affiliateLink: validatedProduct.affiliateLink,
            rating: validatedProduct.rating?.toString() || null,
            discount: validatedProduct.discount || null,
            featured: validatedProduct.featured || false
          };
          
          const newProduct = await storage.createProduct(formattedProduct);
          (results.successful as any[]).push({ index: i + 1, title: newProduct.title || 'Produto criado', id: newProduct.id });
          
          // Notificar clientes SSE sobre novo produto
          sseManager.notifyNewProduct(newProduct);
          
          console.log(`✅ NOVO PRODUTO CRIADO VIA N8N:`);
          console.log(`   Título: ${newProduct.title}`);
          console.log(`   Preço: R$ ${newProduct.currentPrice}`);
          console.log(`   Categoria: ${newProduct.category}`);
          console.log(`   ID: ${newProduct.id}`);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          (results.failed as any[]).push({ index: i + 1, title: productData.title || 'Sem título', reason: errorMessage });
        }
      }
      
      console.log(`\n📊 RELATÓRIO BATCH N8N`);
      console.log(`=======================`);
      console.log(`Total processados: ${results.total}`);
      console.log(`✅ Sucessos: ${results.successful.length}`);
      console.log(`⏭️ Ignorados: ${results.skipped.length}`);
      console.log(`❌ Falhas: ${results.failed.length}`);
      console.log(`Taxa de sucesso: ${((results.successful.length / results.total) * 100).toFixed(1)}%`);
      
      // Notificar conclusão do lote via SSE
      sseManager.notifyBatchComplete({
        successful: results.successful.length,
        failed: results.failed.length,
        total: results.total
      });
      
      res.json({
        success: true,
        message: `Lote processado: ${results.successful.length} criados, ${results.skipped.length} ignorados, ${results.failed.length} falhas`,
        results
      });
      
    } catch (error) {
      console.error('Erro no processamento em lote:', error);
      res.status(500).json({ error: "Falha no processamento em lote" });
    }
  });
  
  app.get("/api/automation/products/status", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      const totalProducts = products.length;
      const featuredProducts = products.filter(p => p.featured).length;
      
      res.json({
        totalProducts,
        featuredProducts,
        lastSync: new Date().toISOString(),
        status: 'active'
      });
    } catch (error) {
      res.status(500).json({ error: "Falha ao obter status" });
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

  const httpServer = createServer(app);
  return httpServer;
}
