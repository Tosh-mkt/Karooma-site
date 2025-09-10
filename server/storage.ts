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
  type Page,
  type InsertPage,
  type AuthorizedFlipbookUser,
  type InsertAuthorizedFlipbookUser,
  users,
  content,
  products,
  newsletterSubscriptions,
  favorites,
  pages,
  authorizedFlipbookUsers,
  flipbookConversions,
  flipbookModalTriggers,
  type FlipbookConversion,
  type InsertFlipbookConversion,
  type FlipbookModalTrigger,
  type InsertFlipbookModalTrigger
} from "@shared/schema";
import type { ConversionData, ModalTriggerData, ConversionMetrics, ThemePerformance, PostConversionReport } from "@shared/analytics";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User>;
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
  updateProductFrequency(id: string, frequency: 'high' | 'medium' | 'low'): Promise<void>;
  getProductsByStatus(status: string): Promise<Product[]>;
  getProductsByFrequency(frequency: 'high' | 'medium' | 'low'): Promise<Product[]>;
  updateProductLastChecked(id: string): Promise<void>;
  clearProducts(): Promise<void>;
  
  // Newsletter methods
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  createNewsletterAdvanced(subscription: any): Promise<NewsletterSubscription>;
  
  // Favorites methods
  getUserFavorites(userId: string): Promise<(Favorite & { product: Product })[]>;
  addToFavorites(userId: string, productId: string): Promise<Favorite>;
  removeFromFavorites(userId: string, productId: string): Promise<void>;
  isFavorite(userId: string, productId: string): Promise<boolean>;
  
  // Pages methods
  getAllPages(): Promise<Page[]>;
  getPageById(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(pageData: InsertPage): Promise<Page>;
  updatePage(id: string, pageData: Partial<InsertPage>): Promise<Page | undefined>;
  deletePage(id: string): Promise<void>;
  getPublishedPages(): Promise<Page[]>;
  
  // Flipbook Access Control methods
  isEmailAuthorizedForFlipbook(email: string, flipbookId: string): Promise<boolean>;
  addAuthorizedUser(data: InsertAuthorizedFlipbookUser): Promise<AuthorizedFlipbookUser>;
  removeAuthorizedUser(email: string, flipbookId: string): Promise<void>;
  getAuthorizedUsers(flipbookId: string): Promise<AuthorizedFlipbookUser[]>;
  getAllAuthorizedUsers(): Promise<AuthorizedFlipbookUser[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private content: Map<string, Content>;
  private products: Map<string, Product>;
  private newsletters: Map<string, NewsletterSubscription>;
  private pages: Map<string, Page>;

  constructor() {
    this.users = new Map();
    this.content = new Map();
    this.products = new Map();
    this.newsletters = new Map();
    this.pages = new Map();
    
    // Initialize with empty state - no mock data
    // Real data will be added through API calls or String.com integration
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of Array.from(this.users.values())) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      name: userData.name || null,
      email: userData.email || null,
      emailVerified: null,
      image: userData.image || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      passwordHash: userData.passwordHash || null,
      isAdmin: userData.isAdmin || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    const updatedUser = { ...user, ...data, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || randomUUID();
    const user: User = { 
      id,
      name: userData.name || null,
      email: userData.email || null,
      emailVerified: userData.emailVerified || null,
      image: userData.image || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      passwordHash: userData.passwordHash || null,
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
      heroImageUrl: insertContent.heroImageUrl || null,
      footerImageUrl: insertContent.footerImageUrl || null,
      videoUrl: insertContent.videoUrl || null,
      youtubeId: insertContent.youtubeId || null,
      views: 0,
      featured: insertContent.featured || false,
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
      productLink: insertProduct.productLink || null,
      rating: insertProduct.rating || null,
      discount: insertProduct.discount || null,
      featured: insertProduct.featured || false,
      expertReview: insertProduct.expertReview || null,
      teamEvaluation: insertProduct.teamEvaluation || null,
      benefits: insertProduct.benefits || null,
      tags: insertProduct.tags || null,
      evaluators: insertProduct.evaluators || null,
      introduction: insertProduct.introduction || null,
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

  async updateProductFrequency(id: string, frequency: 'high' | 'medium' | 'low'): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      product.updateFrequency = frequency;
      product.updatedAt = new Date();
    }
  }

  async getProductsByStatus(status: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.status === status);
  }

  async getProductsByFrequency(frequency: 'high' | 'medium' | 'low'): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.updateFrequency === frequency);
  }

  async updateProductLastChecked(id: string): Promise<void> {
    const product = this.products.get(id);
    if (product) {
      product.lastChecked = new Date();
      product.updatedAt = new Date();
    }
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

  async createNewsletterAdvanced(insertSubscription: any): Promise<NewsletterSubscription> {
    const id = randomUUID();
    const subscription: NewsletterSubscription = {
      ...insertSubscription,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
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

  // Pages methods - Add implementation for MemStorage
  async getAllPages(): Promise<Page[]> {
    return Array.from(this.pages.values()).sort((a, b) => 
      new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
  }

  async getPageById(id: string): Promise<Page | undefined> {
    return this.pages.get(id);
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    for (const page of Array.from(this.pages.values())) {
      if (page.slug === slug) {
        return page;
      }
    }
    return undefined;
  }

  async createPage(pageData: InsertPage): Promise<Page> {
    const id = randomUUID();
    const page: Page = {
      id,
      slug: pageData.slug,
      title: pageData.title,
      metaDescription: pageData.metaDescription || null,
      layout: pageData.layout || "default",
      sections: pageData.sections || "[]",
      isPublished: pageData.isPublished || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.pages.set(id, page);
    return page;
  }

  async updatePage(id: string, pageData: Partial<InsertPage>): Promise<Page | undefined> {
    const existingPage = this.pages.get(id);
    if (!existingPage) {
      return undefined;
    }
    
    const updatedPage: Page = {
      ...existingPage,
      ...pageData,
      updatedAt: new Date()
    };
    
    this.pages.set(id, updatedPage);
    return updatedPage;
  }

  async deletePage(id: string): Promise<void> {
    this.pages.delete(id);
  }

  async getPublishedPages(): Promise<Page[]> {
    return Array.from(this.pages.values())
      .filter(page => page.isPublished)
      .sort((a, b) => 
        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      );
  }

  // Flipbook Access Control methods for MemStorage (simplified)
  async isEmailAuthorizedForFlipbook(email: string, flipbookId: string): Promise<boolean> {
    return false; // Simplified for memory storage
  }

  async addAuthorizedUser(data: InsertAuthorizedFlipbookUser): Promise<AuthorizedFlipbookUser> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }

  async removeAuthorizedUser(email: string, flipbookId: string): Promise<void> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }

  async getAuthorizedUsers(flipbookId: string): Promise<AuthorizedFlipbookUser[]> {
    return [];
  }

  async getAllAuthorizedUsers(): Promise<AuthorizedFlipbookUser[]> {
    return [];
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
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

  async updateProductFrequency(id: string, frequency: 'high' | 'medium' | 'low'): Promise<void> {
    await db
      .update(products)
      .set({ updateFrequency: frequency, updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  async getProductsByStatus(status: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.status, status))
      .orderBy(desc(products.updatedAt));
  }

  async getProductsByFrequency(frequency: 'high' | 'medium' | 'low'): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.updateFrequency, frequency))
      .orderBy(desc(products.lastChecked));
  }

  async updateProductLastChecked(id: string): Promise<void> {
    await db
      .update(products)
      .set({ lastChecked: new Date(), updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  async clearProducts(): Promise<void> {
    await db.delete(products);
  }

  // Newsletter methods
  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [subscription] = await db
      .insert(newsletterSubscriptions)
      .values(insertSubscription)
      .returning();
    return subscription;
  }

  async createNewsletterAdvanced(insertSubscription: any): Promise<NewsletterSubscription> {
    const [subscription] = await db
      .insert(newsletterSubscriptions)
      .values({
        ...insertSubscription,
        updatedAt: new Date(),
      })
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

  // Pages methods
  async getAllPages(): Promise<Page[]> {
    const allPages = await db.select().from(pages).orderBy(desc(pages.updatedAt));
    return allPages.map(page => ({
      ...page,
      sections: typeof page.sections === 'string' ? JSON.parse(page.sections) : page.sections
    })) as Page[];
  }

  async getPageById(id: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    if (!page) return undefined;
    
    return {
      ...page,
      sections: typeof page.sections === 'string' ? JSON.parse(page.sections) : page.sections
    } as Page;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    if (!page) return undefined;
    
    return {
      ...page,
      sections: typeof page.sections === 'string' ? JSON.parse(page.sections) : page.sections
    } as Page;
  }

  async createPage(pageData: InsertPage): Promise<Page> {
    const [page] = await db.insert(pages).values({
      ...pageData,
      sections: JSON.stringify(pageData.sections || []),
      updatedAt: new Date()
    }).returning();
    
    return {
      ...page,
      sections: typeof page.sections === 'string' ? JSON.parse(page.sections) : page.sections
    } as Page;
  }

  async updatePage(id: string, pageData: Partial<InsertPage>): Promise<Page | undefined> {
    const [page] = await db
      .update(pages)
      .set({
        ...pageData,
        sections: pageData.sections ? JSON.stringify(pageData.sections) : undefined,
        updatedAt: new Date()
      })
      .where(eq(pages.id, id))
      .returning();
    
    if (!page) return undefined;
    
    return {
      ...page,
      sections: typeof page.sections === 'string' ? JSON.parse(page.sections) : page.sections
    } as Page;
  }

  async deletePage(id: string): Promise<void> {
    await db.delete(pages).where(eq(pages.id, id));
  }

  async getPublishedPages(): Promise<Page[]> {
    const publishedPages = await db
      .select()
      .from(pages)
      .where(eq(pages.isPublished, true))
      .orderBy(desc(pages.updatedAt));
    
    return publishedPages.map(page => ({
      ...page,
      sections: typeof page.sections === 'string' ? JSON.parse(page.sections) : page.sections
    })) as Page[];
  }

  // Flipbook Access Control methods
  async isEmailAuthorizedForFlipbook(email: string, flipbookId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(authorizedFlipbookUsers)
      .where(
        and(
          eq(authorizedFlipbookUsers.email, email),
          eq(authorizedFlipbookUsers.flipbookId, flipbookId),
          eq(authorizedFlipbookUsers.isActive, true)
        )
      )
      .limit(1);

    if (!result) return false;

    // Check if expired
    if (result.expiresAt && new Date() > result.expiresAt) {
      return false;
    }

    return true;
  }

  async addAuthorizedUser(data: InsertAuthorizedFlipbookUser): Promise<AuthorizedFlipbookUser> {
    // Remove existing entry if exists
    await db
      .delete(authorizedFlipbookUsers)
      .where(
        and(
          eq(authorizedFlipbookUsers.email, data.email),
          eq(authorizedFlipbookUsers.flipbookId, data.flipbookId)
        )
      );

    const [user] = await db
      .insert(authorizedFlipbookUsers)
      .values(data)
      .returning();
    return user;
  }

  async removeAuthorizedUser(email: string, flipbookId: string): Promise<void> {
    await db
      .delete(authorizedFlipbookUsers)
      .where(
        and(
          eq(authorizedFlipbookUsers.email, email),
          eq(authorizedFlipbookUsers.flipbookId, flipbookId)
        )
      );
  }

  async getAuthorizedUsers(flipbookId: string): Promise<AuthorizedFlipbookUser[]> {
    return await db
      .select()
      .from(authorizedFlipbookUsers)
      .where(eq(authorizedFlipbookUsers.flipbookId, flipbookId))
      .orderBy(desc(authorizedFlipbookUsers.createdAt));
  }

  async getAllAuthorizedUsers(): Promise<AuthorizedFlipbookUser[]> {
    return await db
      .select()
      .from(authorizedFlipbookUsers)
      .orderBy(desc(authorizedFlipbookUsers.createdAt));
  }

  // Analytics methods
  async trackConversion(data: ConversionData): Promise<FlipbookConversion> {
    const [conversion] = await db
      .insert(flipbookConversions)
      .values({
        postId: data.postId,
        flipbookTheme: data.flipbookTheme,
        email: data.email,
        source: data.source,
        timestamp: data.timestamp,
        userAgent: data.userAgent,
        referrer: data.referrer,
        ipAddress: data.ipAddress
      })
      .returning();
    return conversion;
  }

  async trackModalTrigger(data: ModalTriggerData): Promise<FlipbookModalTrigger> {
    const [trigger] = await db
      .insert(flipbookModalTriggers)
      .values({
        triggerType: data.triggerType,
        postId: data.postId,
        themeId: data.themeId,
        delaySeconds: data.delaySeconds,
        scrollPercent: data.scrollPercent,
        timestamp: data.timestamp,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      })
      .returning();
    return trigger;
  }

  async getConversionMetrics(filters: {
    startDate: Date;
    endDate: Date;
    flipbookTheme?: string;
    postId?: string;
  }): Promise<ConversionMetrics> {
    // Implementação básica - pode ser expandida com queries mais complexas
    const conversions = await db
      .select()
      .from(flipbookConversions)
      .where(
        and(
          // Filtros de data, tema e post podem ser adicionados aqui
        )
      );

    const totalConversions = conversions.length;
    const conversionsByTheme: Record<string, number> = {};
    const conversionsByPost: Record<string, number> = {};
    const conversionsBySource: Record<string, number> = {};

    conversions.forEach(conversion => {
      // Contar por tema
      conversionsByTheme[conversion.flipbookTheme] = 
        (conversionsByTheme[conversion.flipbookTheme] || 0) + 1;
      
      // Contar por post
      if (conversion.postId) {
        conversionsByPost[conversion.postId] = 
          (conversionsByPost[conversion.postId] || 0) + 1;
      }
      
      // Contar por source
      conversionsBySource[conversion.source] = 
        (conversionsBySource[conversion.source] || 0) + 1;
    });

    return {
      totalConversions,
      conversionsByTheme,
      conversionsByPost,
      conversionsBySource,
      dailyConversions: [] // Implementar query para dados diários
    };
  }

  async getThemePerformance(filters: {
    startDate: Date;
    endDate: Date;
  }): Promise<ThemePerformance[]> {
    // Implementação básica - retorna array vazio por agora
    return [];
  }

  async getPostConversionReport(filters: {
    startDate: Date;
    endDate: Date;
    limit: number;
  }): Promise<PostConversionReport[]> {
    // Implementação básica - retorna array vazio por agora
    return [];
  }
}

export const storage = new DatabaseStorage();
