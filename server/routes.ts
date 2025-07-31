import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentSchema, insertProductSchema, insertNewsletterSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
