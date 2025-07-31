import { 
  type User, 
  type InsertUser, 
  type Content, 
  type InsertContent,
  type Product,
  type InsertProduct,
  type NewsletterSubscription,
  type InsertNewsletterSubscription
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Content methods
  getContent(id: string): Promise<Content | undefined>;
  getAllContent(): Promise<Content[]>;
  getContentByType(type: string): Promise<Content[]>;
  getContentByTypeAndCategory(type: string, category: string): Promise<Content[]>;
  getFeaturedContent(): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  
  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Newsletter methods
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
}

export const storage = new MemStorage();
