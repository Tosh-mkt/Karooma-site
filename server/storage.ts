import { 
  type User, 
  type InsertUser, 
  type UpsertUser,
  type Content, 
  type InsertContent,
  type Product,
  type InsertProduct,
  type NewsletterSubscription,
  type InsertNewsletterSubscription,
  type Favorite,
  type InsertFavorite,
  users,
  content,
  products,
  newsletterSubscriptions,
  favorites
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  makeUserAdmin(userId: string): Promise<User>;
  
  // Content methods
  getContent(id: string): Promise<Content | undefined>;
  getContentById(id: string): Promise<Content | undefined>;
  getAllContent(): Promise<Content[]>;
  getContentByType(type: string): Promise<Content[]>;
  getContentByTypeAndCategory(type: string, category: string): Promise<Content[]>;
  getFeaturedContent(): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  incrementContentViews(id: string): Promise<void>;
  updateContent(id: string, data: Partial<InsertContent>): Promise<Content>;
  deleteContent(id: string): Promise<void>;
  
  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Newsletter methods
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  
  // Favorites methods
  getUserFavorites(userId: string): Promise<(Favorite & { product: Product })[]>;
  addToFavorites(userId: string, productId: string): Promise<Favorite>;
  removeFromFavorites(userId: string, productId: string): Promise<void>;
  isFavorite(userId: string, productId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private content: Map<string, Content>;
  private products: Map<string, Product>;
  private newsletters: Map<string, NewsletterSubscription>;

  constructor() {
    this.users = new Map();
    this.content = new Map();
    this.products = new Map();
    this.newsletters = new Map();
    
    // Initialize with empty state - no mock data
    // Real data will be added through API calls or String.com integration
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || randomUUID();
    const user: User = { 
      id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      isAdmin: userData.isAdmin || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async makeUserAdmin(userId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    const adminUser = { ...user, isAdmin: true, updatedAt: new Date() };
    this.users.set(userId, adminUser);
    return adminUser;
  }

  // Content methods
  async getContent(id: string): Promise<Content | undefined> {
    return this.content.get(id);
  }

  async getAllContent(): Promise<Content[]> {
    return Array.from(this.content.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getContentByType(type: string): Promise<Content[]> {
    return Array.from(this.content.values())
      .filter(content => content.type === type)
      .sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }

  async getContentByTypeAndCategory(type: string, category: string): Promise<Content[]> {
    return Array.from(this.content.values())
      .filter(content => content.type === type && content.category === category)
      .sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }

  async getFeaturedContent(): Promise<Content[]> {
    return Array.from(this.content.values())
      .filter(content => content.featured)
      .sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = randomUUID();
    const content: Content = {
      id,
      title: insertContent.title,
      description: insertContent.description || null,
      content: insertContent.content || null,
      type: insertContent.type,
      category: insertContent.category || null,
      imageUrl: insertContent.imageUrl || null,
      videoUrl: insertContent.videoUrl || null,
      youtubeId: insertContent.youtubeId || null,
      views: 0,
      featured: insertContent.featured || null,
      createdAt: new Date(),
    };
    this.content.set(id, content);
    return content;
  }

  async updateContent(id: string, updateData: Partial<InsertContent>): Promise<Content> {
    const existingContent = this.content.get(id);
    if (!existingContent) {
      throw new Error('Content not found');
    }
    
    const updatedContent: Content = {
      ...existingContent,
      ...updateData,
    };
    
    this.content.set(id, updatedContent);
    return updatedContent;
  }

  async deleteContent(id: string): Promise<void> {
    if (!this.content.has(id)) {
      throw new Error('Content not found');
    }
    this.content.delete(id);
  }

  async getContentById(id: string): Promise<Content | undefined> {
    return this.content.get(id);
  }

  async incrementContentViews(id: string): Promise<void> {
    const content = this.content.get(id);
    if (content) {
      content.views = (content.views || 0) + 1;
      this.content.set(id, content);
    }
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.category === category)
      .sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(product => product.featured)
      .sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      id,
      title: insertProduct.title,
      description: insertProduct.description || null,
      category: insertProduct.category,
      imageUrl: insertProduct.imageUrl || null,
      currentPrice: insertProduct.currentPrice || null,
      originalPrice: insertProduct.originalPrice || null,
      affiliateLink: insertProduct.affiliateLink,
      rating: insertProduct.rating || null,
      discount: insertProduct.discount || null,
      featured: insertProduct.featured || null,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    const updatedProduct = { ...existingProduct, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    this.products.delete(id);
  }

  // Newsletter methods
  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const id = randomUUID();
    const subscription: NewsletterSubscription = {
      ...insertSubscription,
      id,
      createdAt: new Date(),
    };
    this.newsletters.set(id, subscription);
    return subscription;
  }

  // Favorites methods for MemStorage (simplified in-memory implementation)
  async getUserFavorites(userId: string): Promise<(Favorite & { product: Product })[]> {
    return []; // Simplified implementation for memory storage
  }

  async addToFavorites(userId: string, productId: string): Promise<Favorite> {
    const favorite: Favorite = {
      id: randomUUID(),
      userId,
      productId,
      createdAt: new Date(),
    };
    return favorite;
  }

  async removeFromFavorites(userId: string, productId: string): Promise<void> {
    // Simplified implementation for memory storage
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    return false; // Simplified implementation for memory storage
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async makeUserAdmin(userId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isAdmin: true, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    if (!user) throw new Error('User not found');
    return user;
  }

  // Content methods
  async getContent(id: string): Promise<Content | undefined> {
    const [contentItem] = await db.select().from(content).where(eq(content.id, id));
    return contentItem || undefined;
  }

  async getContentById(id: string): Promise<Content | undefined> {
    const [contentItem] = await db.select().from(content).where(eq(content.id, id));
    return contentItem || undefined;
  }

  async getAllContent(): Promise<Content[]> {
    return await db.select().from(content).orderBy(desc(content.createdAt));
  }

  async getContentByType(type: string): Promise<Content[]> {
    return await db.select().from(content)
      .where(eq(content.type, type))
      .orderBy(desc(content.createdAt));
  }

  async getContentByTypeAndCategory(type: string, category: string): Promise<Content[]> {
    return await db.select().from(content)
      .where(and(eq(content.type, type), eq(content.category, category)))
      .orderBy(desc(content.createdAt));
  }

  async getFeaturedContent(): Promise<Content[]> {
    return await db.select().from(content)
      .where(eq(content.featured, true))
      .orderBy(desc(content.createdAt));
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const [contentItem] = await db
      .insert(content)
      .values(insertContent)
      .returning();
    return contentItem;
  }

  async incrementContentViews(id: string): Promise<void> {
    // Buscar views atual
    const [currentContent] = await db.select({ views: content.views }).from(content).where(eq(content.id, id));
    const currentViews = currentContent?.views || 0;
    
    // Incrementar views
    await db
      .update(content)
      .set({ views: currentViews + 1 })
      .where(eq(content.id, id));
  }

  async updateContent(id: string, data: Partial<InsertContent>): Promise<Content> {
    const [updatedContent] = await db
      .update(content)
      .set(data)
      .where(eq(content.id, id))
      .returning();
    return updatedContent;
  }

  async deleteContent(id: string): Promise<void> {
    await db.delete(content).where(eq(content.id, id));
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.category, category))
      .orderBy(desc(products.createdAt));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products)
      .where(eq(products.featured, true))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Newsletter methods
  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [subscription] = await db
      .insert(newsletterSubscriptions)
      .values(insertSubscription)
      .returning();
    return subscription;
  }

  // Favorites methods
  async getUserFavorites(userId: string): Promise<(Favorite & { product: Product })[]> {
    const result = await db
      .select({
        id: favorites.id,
        userId: favorites.userId,
        productId: favorites.productId,
        createdAt: favorites.createdAt,
        product: products
      })
      .from(favorites)
      .innerJoin(products, eq(favorites.productId, products.id))
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
    
    return result;
  }

  async addToFavorites(userId: string, productId: string): Promise<Favorite> {
    try {
      const [result] = await db
        .insert(favorites)
        .values({ userId, productId })
        .returning();
      return result;
    } catch (error) {
      // If already exists, just return the existing one
      const [existing] = await db
        .select()
        .from(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
        .limit(1);
      return existing;
    }
  }

  async removeFromFavorites(userId: string, productId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)));
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.productId, productId)))
      .limit(1);
    
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
