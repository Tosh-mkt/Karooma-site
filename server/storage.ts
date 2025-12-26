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
  type MissionFavorite,
  type InsertMissionFavorite,
  type Page,
  type InsertPage,
  type AuthorizedFlipbookUser,
  type InsertAuthorizedFlipbookUser,
  type Flipbook,
  type InsertFlipbook,
  type CookieConsent,
  type InsertCookieConsent,
  type Taxonomy,
  type InsertTaxonomy,
  type ProductTaxonomy,
  type InsertProductTaxonomy,
  type SelectUserAlert,
  type InsertUserAlert,
  type SelectPushSubscription,
  type InsertPushSubscription,
  type SelectMission,
  type InsertMission,
  type SelectDiagnostic,
  type InsertDiagnostic,
  type FeaturedApparel,
  type InsertFeaturedApparel,
  type SelectGuidePost,
  type InsertGuidePost,
  type SelectProductKit,
  type InsertProductKit,
  type SelectKitProduct,
  type InsertKitProduct,
  users,
  content,
  products,
  featuredApparel,
  newsletterSubscriptions,
  favorites,
  missionFavorites,
  pages,
  authorizedFlipbookUsers,
  flipbooks,
  flipbookConversions,
  flipbookModalTriggers,
  cookieConsents,
  taxonomies,
  productTaxonomies,
  userAlerts,
  pushSubscriptions,
  missions,
  diagnostics,
  guidePosts,
  productKits,
  kitProducts,
  type FlipbookConversion,
  type InsertFlipbookConversion,
  type FlipbookModalTrigger,
  type InsertFlipbookModalTrigger,
  type SelectAutomationProgress,
  type InsertAutomationProgress,
  type SelectAutomationJob,
  type InsertAutomationJob,
  automationProgress,
  automationJobs
} from "@shared/schema";
import type { ConversionData, ModalTriggerData, ConversionMetrics, ThemePerformance, PostConversionReport } from "@shared/analytics";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, and, isNull, sql } from "drizzle-orm";

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
  
  // User Alerts methods
  getUserAlerts(userId: string): Promise<any[]>;
  createUserAlert(data: any): Promise<any>;
  deleteUserAlert(alertId: string, userId: string): Promise<void>;
  updateUserAlert(alertId: string, userId: string, data: any): Promise<any>;
  getActiveAlerts(): Promise<any[]>;
  updateAlertLastChecked(alertId: string): Promise<void>;
  updateAlertLastNotified(alertId: string): Promise<void>;
  
  // Push Subscription methods
  getUserPushSubscriptions(userId: string): Promise<any[]>;
  createPushSubscription(data: any): Promise<any>;
  deletePushSubscription(endpoint: string): Promise<void>;
  getPushSubscriptionByEndpoint(endpoint: string): Promise<any | undefined>;
  
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
  
  // Flipbook methods
  getFlipbookByPost(postId: string): Promise<Flipbook | undefined>;
  getFlipbook(id: string): Promise<Flipbook | undefined>;
  createFlipbook(data: InsertFlipbook): Promise<Flipbook>;
  updateFlipbookStatus(id: string, status: string, updates?: Partial<Flipbook>): Promise<Flipbook>;
  upsertFlipbookByPost(postId: string, data: InsertFlipbook): Promise<Flipbook>;

  // Cookie consent methods
  createCookieConsent(data: InsertCookieConsent): Promise<CookieConsent>;
  updateCookieConsent(sessionId: string, data: Partial<InsertCookieConsent>): Promise<CookieConsent>;
  getCookieConsent(sessionId: string): Promise<CookieConsent | undefined>;
  
  // Taxonomy methods
  getAllTaxonomies(): Promise<Taxonomy[]>;
  getTaxonomyBySlug(slug: string): Promise<Taxonomy | undefined>;
  getTaxonomiesByParent(parentSlug: string | null): Promise<Taxonomy[]>;
  createTaxonomy(data: InsertTaxonomy): Promise<Taxonomy>;
  updateTaxonomy(slug: string, data: Partial<InsertTaxonomy>): Promise<Taxonomy>;
  deleteTaxonomy(slug: string): Promise<void>;
  getTaxonomyHierarchy(): Promise<Taxonomy[]>;
  
  // Product taxonomy relationship methods
  getProductTaxonomies(productId: string): Promise<ProductTaxonomy[]>;
  addProductTaxonomy(data: InsertProductTaxonomy): Promise<ProductTaxonomy>;
  removeProductTaxonomy(productId: string, taxonomySlug: string): Promise<void>;
  getProductsByTaxonomy(taxonomySlug: string): Promise<Product[]>;
  getProductsByTaxonomies(taxonomySlugs: string[]): Promise<Product[]>;
  
  // Automation methods
  getAutomationProgress(): Promise<SelectAutomationProgress[]>;
  getAutomationProgressByStage(stage: string): Promise<SelectAutomationProgress | undefined>;
  createAutomationProgress(data: InsertAutomationProgress): Promise<SelectAutomationProgress>;
  updateAutomationProgress(stage: string, data: Partial<InsertAutomationProgress>): Promise<SelectAutomationProgress>;
  deleteAutomationProgress(stage: string): Promise<void>;
  
  getAutomationJobs(): Promise<SelectAutomationJob[]>;
  createAutomationJob(data: InsertAutomationJob): Promise<SelectAutomationJob>;
  updateAutomationJob(id: string, data: Partial<InsertAutomationJob>): Promise<SelectAutomationJob>;
  
  // Mission methods
  getAllMissions(): Promise<SelectMission[]>;
  getPublishedMissions(diagnosticAreas?: string[]): Promise<SelectMission[]>;
  getFeaturedMissions(): Promise<SelectMission[]>;
  getMissionById(id: string): Promise<SelectMission | undefined>;
  getMissionBySlug(slug: string, includeUnpublished?: boolean): Promise<SelectMission | undefined>;
  getMissionsByCategory(category: string): Promise<SelectMission[]>;
  createMission(data: InsertMission): Promise<SelectMission>;
  updateMission(id: string, data: Partial<InsertMission>): Promise<SelectMission>;
  deleteMission(id: string): Promise<void>;
  incrementMissionViews(id: string): Promise<void>;
  
  // Mission Favorites methods
  getUserMissionFavorites(userId: string): Promise<(MissionFavorite & { mission: SelectMission })[]>;
  addMissionToFavorites(userId: string, missionId: string): Promise<MissionFavorite>;
  removeMissionFromFavorites(userId: string, missionId: string): Promise<void>;
  isMissionFavorite(userId: string, missionId: string): Promise<boolean>;
  
  // Diagnostic methods
  createDiagnostic(data: InsertDiagnostic): Promise<SelectDiagnostic>;
  getDiagnosticById(id: string): Promise<SelectDiagnostic | undefined>;
  getDiagnosticsByUser(userId: string): Promise<SelectDiagnostic[]>;
  getLatestDiagnostic(userId: string): Promise<SelectDiagnostic | undefined>;
  
  // Featured Apparel methods
  getAllApparel(): Promise<FeaturedApparel[]>;
  getApparelById(id: string): Promise<FeaturedApparel | undefined>;
  getFeaturedApparel(): Promise<FeaturedApparel[]>;
  getApparelByMissionSlug(missionSlug: string): Promise<FeaturedApparel[]>;
  createApparel(data: InsertFeaturedApparel): Promise<FeaturedApparel>;
  updateApparel(id: string, data: Partial<InsertFeaturedApparel>): Promise<FeaturedApparel>;
  deleteApparel(id: string): Promise<void>;
  
  // Guide Posts methods
  getAllGuidePosts(): Promise<SelectGuidePost[]>;
  getPublishedGuidePosts(): Promise<SelectGuidePost[]>;
  getFeaturedGuidePosts(): Promise<SelectGuidePost[]>;
  getGuidePostById(id: string): Promise<SelectGuidePost | undefined>;
  getGuidePostBySlug(slug: string, includeUnpublished?: boolean): Promise<SelectGuidePost | undefined>;
  getGuidePostsByCategory(category: string): Promise<SelectGuidePost[]>;
  createGuidePost(data: InsertGuidePost): Promise<SelectGuidePost>;
  updateGuidePost(id: string, data: Partial<InsertGuidePost>): Promise<SelectGuidePost>;
  deleteGuidePost(id: string): Promise<void>;
  incrementGuidePostViews(id: string): Promise<void>;

  // Product Kits methods
  getAllProductKits(): Promise<SelectProductKit[]>;
  getActiveProductKits(): Promise<SelectProductKit[]>;
  getProductKitById(id: string): Promise<SelectProductKit | undefined>;
  getProductKitBySlug(slug: string): Promise<SelectProductKit | undefined>;
  getProductKitByMissionId(missionId: string): Promise<SelectProductKit | undefined>;
  getProductKitsByCategory(category: string): Promise<SelectProductKit[]>;
  getProductKitsByStatus(status: string): Promise<SelectProductKit[]>;
  createProductKit(data: InsertProductKit): Promise<SelectProductKit>;
  updateProductKit(id: string, data: Partial<InsertProductKit>): Promise<SelectProductKit>;
  deleteProductKit(id: string): Promise<void>;
  incrementProductKitViews(id: string): Promise<void>;
  
  // Kit Products methods (products within kits)
  getKitProducts(kitId: string): Promise<SelectKitProduct[]>;
  addKitProduct(data: InsertKitProduct): Promise<SelectKitProduct>;
  updateKitProduct(id: string, data: Partial<InsertKitProduct>): Promise<SelectKitProduct>;
  removeKitProduct(id: string): Promise<void>;
  clearKitProducts(kitId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private content: Map<string, Content>;
  private products: Map<string, Product>;
  private newsletters: Map<string, NewsletterSubscription>;
  private pages: Map<string, Page>;
  private flipbooks: Map<string, Flipbook>;
  private taxonomies: Map<string, Taxonomy>; // key: slug
  private productTaxonomies: Map<string, ProductTaxonomy[]>; // key: productId
  private missionFavorites: Map<string, MissionFavorite>; // key: `${userId}:${missionId}`
  private missions: Map<string, SelectMission>; // key: id

  constructor() {
    this.users = new Map();
    this.content = new Map();
    this.products = new Map();
    this.newsletters = new Map();
    this.pages = new Map();
    this.flipbooks = new Map();
    this.taxonomies = new Map();
    this.productTaxonomies = new Map();
    this.missionFavorites = new Map();
    this.missions = new Map();
    
    // Initialize with mock mission data for testing
    this.initializeMockMissions();
  }
  
  private initializeMockMissions() {
    const mockMission: SelectMission = {
      id: randomUUID(),
      title: `Rotina Matinal Eficiente`,
      slug: `rotina-matinal-eficiente`,
      category: "Rotina Matinal",
      understandingText: "Sabemos que as manhãs podem ser caóticas quando você tem filhos. Esta missão vai te ajudar a criar uma rotina prática e tranquila.",
      bonusTip: "Dica: Organize um item de cada vez, começando pelo que mais incomoda você visualmente.",
      inspirationalQuote: "Pequenos passos, grandes transformações.",
      fraseMarca: "Você não precisa de mais tempo, precisa de um plano que funcione para você.",
      propositoPratico: "Transformar o caos matinal em uma rotina tranquila e eficiente, economizando tempo e reduzindo o estresse diário.",
      descricao: "Esta missão foi criada para mães que enfrentam manhãs caóticas e querem começar o dia com mais leveza. Vamos criar juntas uma rotina prática e realista que funciona para sua família, respeitando o seu ritmo e as necessidades únicas dos seus filhos.",
      exemplosDeProdutos: [
        "Organizador de roupas por dia da semana",
        "Quadro de rotina visual para crianças",
        "Timer de cozinha colorido",
        "Caixa organizadora de lanches"
      ],
      tarefasSimplesDeExecucao: [
        "Prepare as roupas na noite anterior",
        "Monte uma estação de café da manhã de fácil acesso",
        "Crie um checklist visual para as crianças",
        "Defina horários realistas para cada etapa da manhã",
        "Organize mochilas e materiais escolares em um local fixo"
      ],
      productAsins: [],
      heroImageUrl: null,
      metaDescription: null,
      featured: false,
      isPublished: true,
      views: 0,
      diagnosticAreas: ["cargaMental", "tempoDaCasa"],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.missions.set(mockMission.id, mockMission);
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
      description: insertProduct.description ?? null,
      category: insertProduct.category,
      imageUrl: insertProduct.imageUrl ?? null,
      currentPrice: insertProduct.currentPrice ?? null,
      originalPrice: insertProduct.originalPrice ?? null,
      affiliateLink: insertProduct.affiliateLink,
      productLink: insertProduct.productLink ?? null,
      rating: insertProduct.rating ?? null,
      discount: insertProduct.discount ?? null,
      featured: insertProduct.featured ?? false,
      expertReview: insertProduct.expertReview ?? null,
      teamEvaluation: insertProduct.teamEvaluation ?? null,
      benefits: insertProduct.benefits ?? null,
      tags: insertProduct.tags ?? null,
      evaluators: insertProduct.evaluators ?? null,
      introduction: insertProduct.introduction ?? null,
      nutritionistEvaluation: insertProduct.nutritionistEvaluation ?? null,
      organizerEvaluation: insertProduct.organizerEvaluation ?? null,
      designEvaluation: insertProduct.designEvaluation ?? null,
      karoomaTeamEvaluation: insertProduct.karoomaTeamEvaluation ?? null,
      categoryTags: insertProduct.categoryTags ?? null,
      searchTags: insertProduct.searchTags ?? null,
      asin: insertProduct.asin ?? null,
      brand: insertProduct.brand ?? null,
      reviewCount: insertProduct.reviewCount ?? null,
      isPrime: insertProduct.isPrime ?? false,
      availability: insertProduct.availability ?? "available",
      bestSellerRank: insertProduct.bestSellerRank ?? null,
      status: insertProduct.status ?? "active",
      lastChecked: insertProduct.lastChecked ?? null,
      lastUpdated: insertProduct.lastUpdated ?? null,
      updateFrequency: insertProduct.updateFrequency ?? "medium",
      autoCheckEnabled: insertProduct.autoCheckEnabled ?? true,
      failedChecks: insertProduct.failedChecks ?? 0,
      unavailableSince: insertProduct.unavailableSince ?? null,
      amazonData: insertProduct.amazonData ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }
    const updatedProduct = { ...existingProduct, ...updates, updatedAt: new Date() };
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

  async clearProducts(): Promise<void> {
    this.products.clear();
  }

  // Newsletter methods
  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const id = randomUUID();
    const subscription: NewsletterSubscription = {
      id,
      email: insertSubscription.email,
      name: null,
      interests: null,
      keywords: null,
      frequency: "weekly",
      contentTypes: null,
      source: null,
      leadMagnet: null,
      status: "active",
      preferences: null,
      lastInteraction: null,
      engagementScore: "0",
      createdAt: new Date(),
      updatedAt: new Date(),
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

  // Mission Favorites methods (MemStorage)
  async getUserMissionFavorites(userId: string): Promise<(MissionFavorite & { mission: SelectMission })[]> {
    const favorites = Array.from(this.missionFavorites.values())
      .filter(f => f.userId === userId);
    
    // Note: This is a simplified implementation with mock mission data for testing
    // In production, use the database implementation
    return favorites.map(f => {
      const mockMission: SelectMission = {
        id: f.missionId,
        title: `Organizar a Rotina Matinal em 10 Minutos`,
        slug: `organizar-rotina-matinal`,
        category: "Rotina Matinal",
        understandingText: "Sabemos que as manhãs podem ser caóticas quando você tem filhos. Esta missão vai te ajudar a criar uma rotina prática e tranquila.",
        bonusTip: "Dica: Organize um item de cada vez, começando pelo que mais incomoda você visualmente.",
        inspirationalQuote: "Pequenos passos, grandes transformações.",
        fraseMarca: "Você não precisa de mais tempo, precisa de um plano que funcione para você.",
        propositoPratico: "Transformar o caos matinal em uma rotina tranquila e eficiente, economizando tempo e reduzindo o estresse diário.",
        descricao: "Esta missão foi criada para mães que enfrentam manhãs caóticas e querem começar o dia com mais leveza. Vamos criar juntas uma rotina prática e realista que funciona para sua família, respeitando o seu ritmo e as necessidades únicas dos seus filhos.",
        exemplosDeProdutos: [
          "Organizador de roupas por dia da semana",
          "Quadro de rotina visual para crianças",
          "Timer de cozinha colorido",
          "Caixa organizadora de lanches"
        ],
        tarefasSimplesDeExecucao: [
          "Prepare as roupas na noite anterior",
          "Monte uma estação de café da manhã de fácil acesso",
          "Crie um checklist visual para as crianças",
          "Defina horários realistas para cada etapa da manhã",
          "Organize mochilas e materiais escolares em um local fixo"
        ],
        productAsins: [],
        heroImageUrl: null,
        metaDescription: null,
        featured: false,
        isPublished: true,
        views: 0,
        diagnosticAreas: ["cargaMental", "tempoDaCasa"],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return {
        ...f,
        mission: mockMission
      };
    });
  }

  async addMissionToFavorites(userId: string, missionId: string): Promise<MissionFavorite> {
    const key = `${userId}:${missionId}`;
    const existing = this.missionFavorites.get(key);
    
    if (existing) {
      return existing;
    }
    
    const favorite: MissionFavorite = {
      id: randomUUID(),
      userId,
      missionId,
      createdAt: new Date(),
    };
    
    this.missionFavorites.set(key, favorite);
    return favorite;
  }

  async removeMissionFromFavorites(userId: string, missionId: string): Promise<void> {
    const key = `${userId}:${missionId}`;
    this.missionFavorites.delete(key);
  }

  async isMissionFavorite(userId: string, missionId: string): Promise<boolean> {
    const key = `${userId}:${missionId}`;
    return this.missionFavorites.has(key);
  }

  // Mission methods (MemStorage)
  async getPublishedMissions(diagnosticAreas?: string[]): Promise<SelectMission[]> {
    let allMissions = Array.from(this.missions.values())
      .filter(m => m.isPublished);
    
    if (diagnosticAreas && diagnosticAreas.length > 0) {
      allMissions = allMissions.filter(m => 
        m.diagnosticAreas?.some(area => diagnosticAreas.includes(area))
      );
    }
    
    return allMissions.sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getFeaturedMissions(): Promise<SelectMission[]> {
    return Array.from(this.missions.values())
      .filter(m => m.featured && m.isPublished)
      .sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }

  async getMissionById(id: string): Promise<SelectMission | undefined> {
    return this.missions.get(id);
  }

  async getMissionBySlug(slug: string): Promise<SelectMission | undefined> {
    for (const mission of Array.from(this.missions.values())) {
      if (mission.slug === slug) {
        return mission;
      }
    }
    return undefined;
  }

  async getMissionsByCategory(category: string): Promise<SelectMission[]> {
    return Array.from(this.missions.values())
      .filter(m => m.category === category && m.isPublished)
      .sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
  }

  async createMission(data: InsertMission): Promise<SelectMission> {
    const id = randomUUID();
    const mission: SelectMission = {
      id,
      ...data,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.missions.set(id, mission);
    return mission;
  }

  async updateMission(id: string, data: Partial<InsertMission>): Promise<SelectMission> {
    const existing = this.missions.get(id);
    if (!existing) {
      throw new Error('Mission not found');
    }
    const updated: SelectMission = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.missions.set(id, updated);
    return updated;
  }

  async deleteMission(id: string): Promise<void> {
    this.missions.delete(id);
  }

  async incrementMissionViews(id: string): Promise<void> {
    const mission = this.missions.get(id);
    if (mission) {
      mission.views = (mission.views || 0) + 1;
      this.missions.set(id, mission);
    }
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

  // Cookie consent methods for MemStorage
  async createCookieConsent(data: InsertCookieConsent): Promise<CookieConsent> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }

  async updateCookieConsent(sessionId: string, data: Partial<InsertCookieConsent>): Promise<CookieConsent> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }

  async getCookieConsent(sessionId: string): Promise<CookieConsent | undefined> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }

  // Flipbook methods for MemStorage
  async getFlipbookByPost(postId: string): Promise<Flipbook | undefined> {
    for (const flipbook of Array.from(this.flipbooks.values())) {
      if (flipbook.postId === postId) {
        return flipbook;
      }
    }
    return undefined;
  }

  async getFlipbook(id: string): Promise<Flipbook | undefined> {
    return this.flipbooks.get(id);
  }

  async createFlipbook(data: InsertFlipbook): Promise<Flipbook> {
    const id = randomUUID();
    const flipbook: Flipbook = {
      id,
      postId: data.postId,
      themeId: data.themeId,
      title: data.title,
      description: data.description || null,
      status: data.status || "generating",
      previewImages: data.previewImages || [],
      pages: data.pages || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.flipbooks.set(id, flipbook);
    return flipbook;
  }

  async updateFlipbookStatus(id: string, status: string, updates?: Partial<Flipbook>): Promise<Flipbook> {
    const flipbook = this.flipbooks.get(id);
    if (!flipbook) {
      throw new Error('Flipbook not found');
    }
    const updatedFlipbook = { 
      ...flipbook, 
      ...updates, 
      status, 
      updatedAt: new Date() 
    };
    this.flipbooks.set(id, updatedFlipbook);
    return updatedFlipbook;
  }

  async upsertFlipbookByPost(postId: string, data: InsertFlipbook): Promise<Flipbook> {
    const existing = await this.getFlipbookByPost(postId);
    if (existing) {
      return await this.updateFlipbookStatus(existing.id, data.status || existing.status, data);
    } else {
      return await this.createFlipbook({ ...data, postId });
    }
  }

  // Guide Posts stubs for MemStorage
  async getAllGuidePosts(): Promise<SelectGuidePost[]> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async getPublishedGuidePosts(): Promise<SelectGuidePost[]> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async getFeaturedGuidePosts(): Promise<SelectGuidePost[]> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async getGuidePostById(id: string): Promise<SelectGuidePost | undefined> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async getGuidePostBySlug(slug: string, includeUnpublished?: boolean): Promise<SelectGuidePost | undefined> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async getGuidePostsByCategory(category: string): Promise<SelectGuidePost[]> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async createGuidePost(data: InsertGuidePost): Promise<SelectGuidePost> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async updateGuidePost(id: string, data: Partial<InsertGuidePost>): Promise<SelectGuidePost> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async deleteGuidePost(id: string): Promise<void> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async incrementGuidePostViews(id: string): Promise<void> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }

  // Product Kits stubs for MemStorage
  async getAllProductKits(): Promise<SelectProductKit[]> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async getActiveProductKits(): Promise<SelectProductKit[]> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async getProductKitById(id: string): Promise<SelectProductKit | undefined> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async getProductKitBySlug(slug: string): Promise<SelectProductKit | undefined> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async getProductKitsByCategory(category: string): Promise<SelectProductKit[]> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async getProductKitsByStatus(status: string): Promise<SelectProductKit[]> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async createProductKit(data: InsertProductKit): Promise<SelectProductKit> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async updateProductKit(id: string, data: Partial<InsertProductKit>): Promise<SelectProductKit> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async deleteProductKit(id: string): Promise<void> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async incrementProductKitViews(id: string): Promise<void> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async getKitProducts(kitId: string): Promise<SelectKitProduct[]> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async addKitProduct(data: InsertKitProduct): Promise<SelectKitProduct> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async updateKitProduct(id: string, data: Partial<InsertKitProduct>): Promise<SelectKitProduct> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async removeKitProduct(id: string): Promise<void> {
    throw new Error("Method not implemented - Use DatabaseStorage");
  }
  async clearKitProducts(kitId: string): Promise<void> {
    throw new Error("Method not implemented - Use DatabaseStorage");
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
        product: {
          id: products.id,
          title: products.title,
          description: products.description,
          category: products.category,
          imageUrl: products.imageUrl,
          currentPrice: products.currentPrice,
          originalPrice: products.originalPrice,
          affiliateLink: products.affiliateLink,
          productLink: products.productLink,
          rating: products.rating,
          discount: products.discount,
          featured: products.featured,
          expertReview: products.expertReview,
          teamEvaluation: products.teamEvaluation,
          benefits: products.benefits,
          tags: products.tags,
          evaluators: products.evaluators,
          introduction: products.introduction,
          nutritionistEvaluation: products.nutritionistEvaluation,
          organizerEvaluation: products.organizerEvaluation,
          designEvaluation: products.designEvaluation,
          karoomaTeamEvaluation: products.karoomaTeamEvaluation,
          categoryTags: products.categoryTags,
          searchTags: products.searchTags,
          asin: products.asin,
          brand: products.brand,
          reviewCount: products.reviewCount,
          isPrime: products.isPrime,
          availability: products.availability,
          bestSellerRank: products.bestSellerRank,
          status: products.status,
          lastChecked: products.lastChecked,
          lastUpdated: products.lastUpdated,
          updateFrequency: products.updateFrequency,
          autoCheckEnabled: products.autoCheckEnabled,
          failedChecks: products.failedChecks,
          unavailableSince: products.unavailableSince,
          amazonData: products.amazonData,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt
        }
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

  // Mission Favorites methods
  async getUserMissionFavorites(userId: string): Promise<(MissionFavorite & { mission: SelectMission })[]> {
    const result = await db
      .select({
        id: missionFavorites.id,
        userId: missionFavorites.userId,
        missionId: missionFavorites.missionId,
        createdAt: missionFavorites.createdAt,
        mission: {
          id: missions.id,
          title: missions.title,
          slug: missions.slug,
          category: missions.category,
          understandingText: missions.understandingText,
          bonusTip: missions.bonusTip,
          inspirationalQuote: missions.inspirationalQuote,
          productAsins: missions.productAsins,
          diagnosticAreas: missions.diagnosticAreas,
          heroImageUrl: missions.heroImageUrl,
          metaDescription: missions.metaDescription,
          featured: missions.featured,
          views: missions.views,
          isPublished: missions.isPublished,
          createdAt: missions.createdAt,
          updatedAt: missions.updatedAt,
        }
      })
      .from(missionFavorites)
      .leftJoin(missions, eq(missionFavorites.missionId, missions.id))
      .where(eq(missionFavorites.userId, userId))
      .orderBy(desc(missionFavorites.createdAt));

    return result.map(r => ({
      id: r.id,
      userId: r.userId,
      missionId: r.missionId,
      createdAt: r.createdAt!,
      mission: r.mission as SelectMission
    }));
  }

  async addMissionToFavorites(userId: string, missionId: string): Promise<MissionFavorite> {
    const [favorite] = await db
      .insert(missionFavorites)
      .values({ userId, missionId })
      .onConflictDoNothing()
      .returning();
    
    // If favorite is undefined, it means it was already favorited - fetch it
    if (!favorite) {
      const [existing] = await db
        .select()
        .from(missionFavorites)
        .where(and(eq(missionFavorites.userId, userId), eq(missionFavorites.missionId, missionId)))
        .limit(1);
      return existing;
    }
    
    return favorite;
  }

  async removeMissionFromFavorites(userId: string, missionId: string): Promise<void> {
    await db
      .delete(missionFavorites)
      .where(and(eq(missionFavorites.userId, userId), eq(missionFavorites.missionId, missionId)));
  }

  async isMissionFavorite(userId: string, missionId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(missionFavorites)
      .where(and(eq(missionFavorites.userId, userId), eq(missionFavorites.missionId, missionId)))
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

  // Flipbook methods for DatabaseStorage
  async getFlipbookByPost(postId: string): Promise<Flipbook | undefined> {
    const [flipbook] = await db.select().from(flipbooks).where(eq(flipbooks.postId, postId));
    return flipbook || undefined;
  }

  async getFlipbook(id: string): Promise<Flipbook | undefined> {
    const [flipbook] = await db.select().from(flipbooks).where(eq(flipbooks.id, id));
    return flipbook || undefined;
  }

  async createFlipbook(data: InsertFlipbook): Promise<Flipbook> {
    const [flipbook] = await db
      .insert(flipbooks)
      .values(data)
      .returning();
    return flipbook;
  }

  async updateFlipbookStatus(id: string, status: string, updates?: Partial<Flipbook>): Promise<Flipbook> {
    const [flipbook] = await db
      .update(flipbooks)
      .set({ 
        ...updates, 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(flipbooks.id, id))
      .returning();
    if (!flipbook) {
      throw new Error('Flipbook not found');
    }
    return flipbook;
  }

  async upsertFlipbookByPost(postId: string, data: InsertFlipbook): Promise<Flipbook> {
    const existing = await this.getFlipbookByPost(postId);
    if (existing) {
      return await this.updateFlipbookStatus(existing.id, data.status || existing.status, data);
    } else {
      return await this.createFlipbook({ ...data, postId });
    }
  }

  // Cookie consent methods
  async createCookieConsent(data: InsertCookieConsent): Promise<CookieConsent> {
    const [consent] = await db
      .insert(cookieConsents)
      .values({
        ...data,
        consentDate: new Date(),
        lastUpdated: new Date()
      })
      .returning();
    return consent;
  }

  async updateCookieConsent(sessionId: string, data: Partial<InsertCookieConsent>): Promise<CookieConsent> {
    const [consent] = await db
      .update(cookieConsents)
      .set({ 
        ...data, 
        lastUpdated: new Date() 
      })
      .where(eq(cookieConsents.sessionId, sessionId))
      .returning();
    if (!consent) {
      throw new Error('Cookie consent not found');
    }
    return consent;
  }

  async getCookieConsent(sessionId: string): Promise<CookieConsent | undefined> {
    const [consent] = await db
      .select()
      .from(cookieConsents)
      .where(eq(cookieConsents.sessionId, sessionId))
      .orderBy(desc(cookieConsents.lastUpdated));
    return consent;
  }

  // Taxonomy methods
  async getAllTaxonomies(): Promise<Taxonomy[]> {
    return await db
      .select()
      .from(taxonomies)
      .orderBy(taxonomies.level, taxonomies.sortOrder);
  }

  async getTaxonomyBySlug(slug: string): Promise<Taxonomy | undefined> {
    const [taxonomy] = await db
      .select()
      .from(taxonomies)
      .where(eq(taxonomies.slug, slug));
    return taxonomy || undefined;
  }

  async getTaxonomiesByParent(parentSlug: string | null): Promise<Taxonomy[]> {
    if (parentSlug === null) {
      return await db
        .select()
        .from(taxonomies)
        .where(isNull(taxonomies.parentSlug))
        .orderBy(taxonomies.sortOrder);
    } else {
      return await db
        .select()
        .from(taxonomies)
        .where(eq(taxonomies.parentSlug, parentSlug))
        .orderBy(taxonomies.sortOrder);
    }
  }

  async createTaxonomy(data: InsertTaxonomy): Promise<Taxonomy> {
    const [taxonomy] = await db
      .insert(taxonomies)
      .values(data)
      .returning();
    return taxonomy;
  }

  async updateTaxonomy(slug: string, data: Partial<InsertTaxonomy>): Promise<Taxonomy> {
    const [taxonomy] = await db
      .update(taxonomies)
      .set(data)
      .where(eq(taxonomies.slug, slug))
      .returning();
    if (!taxonomy) {
      throw new Error('Taxonomy not found');
    }
    return taxonomy;
  }

  async deleteTaxonomy(slug: string): Promise<void> {
    await db
      .delete(taxonomies)
      .where(eq(taxonomies.slug, slug));
  }

  async getTaxonomyHierarchy(): Promise<Taxonomy[]> {
    return await db
      .select()
      .from(taxonomies)
      .orderBy(taxonomies.level, taxonomies.sortOrder);
  }

  // Product taxonomy relationship methods
  async getProductTaxonomies(productId: string): Promise<ProductTaxonomy[]> {
    return await db
      .select()
      .from(productTaxonomies)
      .where(eq(productTaxonomies.productId, productId));
  }

  async addProductTaxonomy(data: InsertProductTaxonomy): Promise<ProductTaxonomy> {
    const [productTaxonomy] = await db
      .insert(productTaxonomies)
      .values(data)
      .returning();
    return productTaxonomy;
  }

  async removeProductTaxonomy(productId: string, taxonomySlug: string): Promise<void> {
    await db
      .delete(productTaxonomies)
      .where(and(
        eq(productTaxonomies.productId, productId),
        eq(productTaxonomies.taxonomySlug, taxonomySlug)
      ));
  }

  async getProductsByTaxonomy(taxonomySlug: string): Promise<Product[]> {
    return await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        category: products.category,
        imageUrl: products.imageUrl,
        currentPrice: products.currentPrice,
        originalPrice: products.originalPrice,
        affiliateLink: products.affiliateLink,
        productLink: products.productLink,
        rating: products.rating,
        discount: products.discount,
        featured: products.featured,
        expertReview: products.expertReview,
        teamEvaluation: products.teamEvaluation,
        benefits: products.benefits,
        tags: products.tags,
        evaluators: products.evaluators,
        introduction: products.introduction,
        nutritionistEvaluation: products.nutritionistEvaluation,
        organizerEvaluation: products.organizerEvaluation,
        designEvaluation: products.designEvaluation,
        karoomaTeamEvaluation: products.karoomaTeamEvaluation,
        categoryTags: products.categoryTags,
        searchTags: products.searchTags,
        asin: products.asin,
        brand: products.brand,
        reviewCount: products.reviewCount,
        isPrime: products.isPrime,
        availability: products.availability,
        bestSellerRank: products.bestSellerRank,
        status: products.status,
        lastChecked: products.lastChecked,
        lastUpdated: products.lastUpdated,
        updateFrequency: products.updateFrequency,
        autoCheckEnabled: products.autoCheckEnabled,
        failedChecks: products.failedChecks,
        unavailableSince: products.unavailableSince,
        amazonData: products.amazonData,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .innerJoin(productTaxonomies, eq(products.id, productTaxonomies.productId))
      .where(and(
        eq(productTaxonomies.taxonomySlug, taxonomySlug),
        eq(products.status, 'active')
      ));
  }

  async getProductsByTaxonomies(taxonomySlugs: string[]): Promise<Product[]> {
    if (taxonomySlugs.length === 0) return [];
    
    return await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        category: products.category,
        imageUrl: products.imageUrl,
        currentPrice: products.currentPrice,
        originalPrice: products.originalPrice,
        affiliateLink: products.affiliateLink,
        productLink: products.productLink,
        rating: products.rating,
        discount: products.discount,
        featured: products.featured,
        expertReview: products.expertReview,
        teamEvaluation: products.teamEvaluation,
        benefits: products.benefits,
        tags: products.tags,
        evaluators: products.evaluators,
        introduction: products.introduction,
        nutritionistEvaluation: products.nutritionistEvaluation,
        organizerEvaluation: products.organizerEvaluation,
        designEvaluation: products.designEvaluation,
        karoomaTeamEvaluation: products.karoomaTeamEvaluation,
        categoryTags: products.categoryTags,
        searchTags: products.searchTags,
        asin: products.asin,
        brand: products.brand,
        reviewCount: products.reviewCount,
        isPrime: products.isPrime,
        availability: products.availability,
        bestSellerRank: products.bestSellerRank,
        status: products.status,
        lastChecked: products.lastChecked,
        lastUpdated: products.lastUpdated,
        updateFrequency: products.updateFrequency,
        autoCheckEnabled: products.autoCheckEnabled,
        failedChecks: products.failedChecks,
        unavailableSince: products.unavailableSince,
        amazonData: products.amazonData,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .innerJoin(productTaxonomies, eq(products.id, productTaxonomies.productId))
      .where(and(
        productTaxonomies.taxonomySlug.in ? productTaxonomies.taxonomySlug.in(taxonomySlugs) : 
          taxonomySlugs.map(slug => eq(productTaxonomies.taxonomySlug, slug)).reduce((a, b) => and(a, b)),
        eq(products.status, 'active')
      ));
  }

  // Automation methods implementation
  async getAutomationProgress(): Promise<SelectAutomationProgress[]> {
    return await db.select().from(automationProgress);
  }

  async getAutomationProgressByStage(stage: string): Promise<SelectAutomationProgress | undefined> {
    const results = await db.select().from(automationProgress).where(eq(automationProgress.stage, stage));
    return results[0];
  }

  async createAutomationProgress(data: InsertAutomationProgress): Promise<SelectAutomationProgress> {
    const results = await db.insert(automationProgress).values(data).returning();
    return results[0];
  }

  async updateAutomationProgress(stage: string, data: Partial<InsertAutomationProgress>): Promise<SelectAutomationProgress> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    const results = await db.update(automationProgress)
      .set(updateData)
      .where(eq(automationProgress.stage, stage))
      .returning();
      
    if (results.length === 0) {
      throw new Error(`Automation stage '${stage}' not found. Please initialize the automation system first.`);
    }
    
    return results[0];
  }

  async deleteAutomationProgress(stage: string): Promise<void> {
    await db.delete(automationProgress).where(eq(automationProgress.stage, stage));
  }

  async getAutomationJobs(): Promise<SelectAutomationJob[]> {
    return await db.select().from(automationJobs).orderBy(desc(automationJobs.createdAt));
  }

  async createAutomationJob(data: InsertAutomationJob): Promise<SelectAutomationJob> {
    const jobData = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const results = await db.insert(automationJobs).values(jobData).returning();
    return results[0];
  }

  async updateAutomationJob(id: string, data: Partial<InsertAutomationJob>): Promise<SelectAutomationJob> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    const results = await db.update(automationJobs)
      .set(updateData)
      .where(eq(automationJobs.id, id))
      .returning();
    return results[0];
  }

  async getAutomationWorkflows(): Promise<AutomationWorkflow[]> {
    return await db.select().from(automationWorkflows).orderBy(desc(automationWorkflows.createdAt));
  }

  async createAutomationWorkflow(data: InsertAutomationWorkflow): Promise<AutomationWorkflow> {
    const workflowData = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const results = await db.insert(automationWorkflows).values(workflowData).returning();
    return results[0];
  }

  async updateAutomationWorkflow(id: string, data: Partial<InsertAutomationWorkflow>): Promise<AutomationWorkflow> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    const results = await db.update(automationWorkflows)
      .set(updateData)
      .where(eq(automationWorkflows.id, id))
      .returning();
    return results[0];
  }

  // User Alerts methods
  async getUserAlerts(userId: string): Promise<SelectUserAlert[]> {
    const alerts = await db
      .select()
      .from(userAlerts)
      .where(eq(userAlerts.userId, userId))
      .orderBy(desc(userAlerts.createdAt));
    
    return alerts;
  }

  async createUserAlert(data: InsertUserAlert): Promise<SelectUserAlert> {
    const [alert] = await db
      .insert(userAlerts)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return alert;
  }

  async deleteUserAlert(alertId: string, userId: string): Promise<void> {
    await db
      .delete(userAlerts)
      .where(
        and(
          eq(userAlerts.id, alertId),
          eq(userAlerts.userId, userId)
        )
      );
  }

  async updateUserAlert(alertId: string, userId: string, data: Partial<InsertUserAlert>): Promise<SelectUserAlert> {
    const [alert] = await db
      .update(userAlerts)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(userAlerts.id, alertId),
          eq(userAlerts.userId, userId)
        )
      )
      .returning();
    return alert;
  }

  async getActiveAlerts(): Promise<SelectUserAlert[]> {
    return await db
      .select()
      .from(userAlerts)
      .where(eq(userAlerts.isActive, true));
  }

  async updateAlertLastChecked(alertId: string): Promise<void> {
    await db
      .update(userAlerts)
      .set({ lastChecked: new Date() })
      .where(eq(userAlerts.id, alertId));
  }

  async updateAlertLastNotified(alertId: string): Promise<void> {
    await db
      .update(userAlerts)
      .set({ lastNotified: new Date() })
      .where(eq(userAlerts.id, alertId));
  }

  // Push Subscription methods
  async getUserPushSubscriptions(userId: string): Promise<SelectPushSubscription[]> {
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
    return subscriptions;
  }

  async createPushSubscription(data: InsertPushSubscription): Promise<SelectPushSubscription> {
    const [subscription] = await db
      .insert(pushSubscriptions)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          p256dh: data.p256dh,
          auth: data.auth,
          userAgent: data.userAgent,
          isActive: true,
          updatedAt: new Date()
        }
      })
      .returning();
    return subscription;
  }

  async deletePushSubscription(endpoint: string): Promise<void> {
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
  }

  async getPushSubscriptionByEndpoint(endpoint: string): Promise<SelectPushSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);
    return subscription;
  }

  // Mission methods
  async getAllMissions(): Promise<SelectMission[]> {
    return await db.select().from(missions).orderBy(desc(missions.createdAt));
  }

  async getPublishedMissions(diagnosticAreas?: string[]): Promise<SelectMission[]> {
    // Filtrar por áreas do diagnóstico se fornecido
    if (diagnosticAreas && diagnosticAreas.length > 0) {
      return await db
        .select()
        .from(missions)
        .where(and(
          eq(missions.isPublished, true),
          sql`${missions.diagnosticAreas} && ARRAY[${diagnosticAreas.map(() => sql`?`).join(', ')}]::text[]`
        ))
        .orderBy(desc(missions.createdAt));
    }

    return await db
      .select()
      .from(missions)
      .where(eq(missions.isPublished, true))
      .orderBy(desc(missions.createdAt));
  }

  async getFeaturedMissions(): Promise<SelectMission[]> {
    return await db
      .select()
      .from(missions)
      .where(and(
        eq(missions.isPublished, true),
        eq(missions.featured, true)
      ))
      .orderBy(desc(missions.createdAt));
  }

  async getMissionById(id: string): Promise<SelectMission | undefined> {
    const [mission] = await db
      .select()
      .from(missions)
      .where(eq(missions.id, id))
      .limit(1);
    return mission;
  }

  async getMissionBySlug(slug: string, includeUnpublished: boolean = false): Promise<SelectMission | undefined> {
    const conditions = [eq(missions.slug, slug)];
    if (!includeUnpublished) {
      conditions.push(eq(missions.isPublished, true));
    }
    
    const [mission] = await db
      .select()
      .from(missions)
      .where(and(...conditions))
      .limit(1);
    return mission;
  }

  async getMissionsByCategory(category: string): Promise<SelectMission[]> {
    return await db
      .select()
      .from(missions)
      .where(and(
        eq(missions.category, category),
        eq(missions.isPublished, true)
      ))
      .orderBy(desc(missions.createdAt));
  }

  async createMission(data: InsertMission): Promise<SelectMission> {
    const [mission] = await db
      .insert(missions)
      .values({
        id: randomUUID(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return mission;
  }

  async updateMission(id: string, data: Partial<InsertMission>): Promise<SelectMission> {
    const [mission] = await db
      .update(missions)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(missions.id, id))
      .returning();
    return mission;
  }

  async deleteMission(id: string): Promise<void> {
    await db.delete(missions).where(eq(missions.id, id));
  }

  async incrementMissionViews(id: string): Promise<void> {
    const mission = await this.getMissionById(id);
    if (mission) {
      await db
        .update(missions)
        .set({ views: (mission.views || 0) + 1 })
        .where(eq(missions.id, id));
    }
  }

  // Diagnostic methods
  async createDiagnostic(data: InsertDiagnostic): Promise<SelectDiagnostic> {
    const [diagnostic] = await db
      .insert(diagnostics)
      .values({
        id: randomUUID(),
        ...data,
        createdAt: new Date()
      })
      .returning();
    return diagnostic;
  }

  async getDiagnosticById(id: string): Promise<SelectDiagnostic | undefined> {
    const [diagnostic] = await db
      .select()
      .from(diagnostics)
      .where(eq(diagnostics.id, id))
      .limit(1);
    return diagnostic;
  }

  async getDiagnosticsByUser(userId: string): Promise<SelectDiagnostic[]> {
    return await db
      .select()
      .from(diagnostics)
      .where(eq(diagnostics.userId, userId))
      .orderBy(desc(diagnostics.createdAt));
  }

  async getLatestDiagnostic(userId: string): Promise<SelectDiagnostic | undefined> {
    const [diagnostic] = await db
      .select()
      .from(diagnostics)
      .where(eq(diagnostics.userId, userId))
      .orderBy(desc(diagnostics.createdAt))
      .limit(1);
    return diagnostic;
  }

  // Featured Apparel methods
  async getAllApparel(): Promise<FeaturedApparel[]> {
    return await db
      .select()
      .from(featuredApparel)
      .where(eq(featuredApparel.isActive, true))
      .orderBy(featuredApparel.sortOrder);
  }

  async getApparelById(id: string): Promise<FeaturedApparel | undefined> {
    const [apparel] = await db
      .select()
      .from(featuredApparel)
      .where(eq(featuredApparel.id, id))
      .limit(1);
    return apparel;
  }

  async getFeaturedApparel(): Promise<FeaturedApparel[]> {
    return await db
      .select()
      .from(featuredApparel)
      .where(and(
        eq(featuredApparel.isActive, true),
        eq(featuredApparel.isFeatured, true)
      ))
      .orderBy(featuredApparel.sortOrder);
  }

  async getApparelByMissionSlug(missionSlug: string): Promise<FeaturedApparel[]> {
    return await db
      .select()
      .from(featuredApparel)
      .where(and(
        eq(featuredApparel.isActive, true),
        sql`${missionSlug} = ANY(${featuredApparel.relatedMissionSlugs})`
      ))
      .orderBy(featuredApparel.sortOrder);
  }

  async createApparel(data: InsertFeaturedApparel): Promise<FeaturedApparel> {
    const [apparel] = await db
      .insert(featuredApparel)
      .values(data)
      .returning();
    return apparel;
  }

  async updateApparel(id: string, data: Partial<InsertFeaturedApparel>): Promise<FeaturedApparel> {
    const [apparel] = await db
      .update(featuredApparel)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(featuredApparel.id, id))
      .returning();
    return apparel;
  }

  async deleteApparel(id: string): Promise<void> {
    await db
      .delete(featuredApparel)
      .where(eq(featuredApparel.id, id));
  }

  // Guide Posts methods
  async getAllGuidePosts(): Promise<SelectGuidePost[]> {
    return await db
      .select()
      .from(guidePosts)
      .orderBy(desc(guidePosts.createdAt));
  }

  async getPublishedGuidePosts(): Promise<SelectGuidePost[]> {
    return await db
      .select()
      .from(guidePosts)
      .where(eq(guidePosts.isPublished, true))
      .orderBy(desc(guidePosts.createdAt));
  }

  async getFeaturedGuidePosts(): Promise<SelectGuidePost[]> {
    return await db
      .select()
      .from(guidePosts)
      .where(and(
        eq(guidePosts.isPublished, true),
        eq(guidePosts.featured, true)
      ))
      .orderBy(desc(guidePosts.createdAt));
  }

  async getGuidePostById(id: string): Promise<SelectGuidePost | undefined> {
    const [post] = await db
      .select()
      .from(guidePosts)
      .where(eq(guidePosts.id, id))
      .limit(1);
    return post;
  }

  async getGuidePostBySlug(slug: string, includeUnpublished: boolean = false): Promise<SelectGuidePost | undefined> {
    const conditions = includeUnpublished 
      ? [eq(guidePosts.slug, slug)]
      : [eq(guidePosts.slug, slug), eq(guidePosts.isPublished, true)];
    
    const [post] = await db
      .select()
      .from(guidePosts)
      .where(and(...conditions))
      .limit(1);
    return post;
  }

  async getGuidePostsByCategory(category: string): Promise<SelectGuidePost[]> {
    return await db
      .select()
      .from(guidePosts)
      .where(and(
        eq(guidePosts.category, category),
        eq(guidePosts.isPublished, true)
      ))
      .orderBy(desc(guidePosts.createdAt));
  }

  async createGuidePost(data: InsertGuidePost): Promise<SelectGuidePost> {
    const [post] = await db
      .insert(guidePosts)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return post;
  }

  async updateGuidePost(id: string, data: Partial<InsertGuidePost>): Promise<SelectGuidePost> {
    const [post] = await db
      .update(guidePosts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(guidePosts.id, id))
      .returning();
    return post;
  }

  async deleteGuidePost(id: string): Promise<void> {
    await db
      .delete(guidePosts)
      .where(eq(guidePosts.id, id));
  }

  async incrementGuidePostViews(id: string): Promise<void> {
    await db
      .update(guidePosts)
      .set({ views: sql`${guidePosts.views} + 1` })
      .where(eq(guidePosts.id, id));
  }

  // Product Kits methods
  async getAllProductKits(): Promise<SelectProductKit[]> {
    return await db
      .select()
      .from(productKits)
      .orderBy(desc(productKits.createdAt));
  }

  async getActiveProductKits(): Promise<SelectProductKit[]> {
    return await db
      .select()
      .from(productKits)
      .where(eq(productKits.status, 'ACTIVE'))
      .orderBy(desc(productKits.createdAt));
  }

  async getProductKitById(id: string): Promise<SelectProductKit | undefined> {
    const [kit] = await db
      .select()
      .from(productKits)
      .where(eq(productKits.id, id))
      .limit(1);
    return kit;
  }

  async getProductKitBySlug(slug: string): Promise<SelectProductKit | undefined> {
    const [kit] = await db
      .select()
      .from(productKits)
      .where(eq(productKits.slug, slug))
      .limit(1);
    return kit;
  }

  async getProductKitByMissionId(missionId: string): Promise<SelectProductKit | undefined> {
    // Prioriza Kits com status ACTIVE primeiro, depois por data de criação mais recente
    const [kit] = await db
      .select()
      .from(productKits)
      .where(eq(productKits.missionId, missionId))
      .orderBy(
        desc(sql`CASE WHEN ${productKits.status} = 'ACTIVE' THEN 1 ELSE 0 END`),
        desc(productKits.createdAt)
      )
      .limit(1);
    return kit;
  }

  async getProductKitsByCategory(category: string): Promise<SelectProductKit[]> {
    return await db
      .select()
      .from(productKits)
      .where(eq(productKits.category, category))
      .orderBy(desc(productKits.createdAt));
  }

  async getProductKitsByStatus(status: string): Promise<SelectProductKit[]> {
    return await db
      .select()
      .from(productKits)
      .where(eq(productKits.status, status))
      .orderBy(desc(productKits.createdAt));
  }

  async createProductKit(data: InsertProductKit): Promise<SelectProductKit> {
    const [kit] = await db
      .insert(productKits)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return kit;
  }

  async updateProductKit(id: string, data: Partial<InsertProductKit>): Promise<SelectProductKit> {
    const [kit] = await db
      .update(productKits)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productKits.id, id))
      .returning();
    return kit;
  }

  async deleteProductKit(id: string): Promise<void> {
    await db.delete(kitProducts).where(eq(kitProducts.kitId, id));
    await db.delete(productKits).where(eq(productKits.id, id));
  }

  async incrementProductKitViews(id: string): Promise<void> {
    await db
      .update(productKits)
      .set({ views: sql`${productKits.views} + 1` })
      .where(eq(productKits.id, id));
  }

  // Kit Products methods
  async getKitProducts(kitId: string): Promise<SelectKitProduct[]> {
    return await db
      .select()
      .from(kitProducts)
      .where(eq(kitProducts.kitId, kitId))
      .orderBy(kitProducts.sortOrder);
  }

  async addKitProduct(data: InsertKitProduct): Promise<SelectKitProduct> {
    const [product] = await db
      .insert(kitProducts)
      .values({
        ...data,
        price: String(data.price),
        originalPrice: data.originalPrice ? String(data.originalPrice) : undefined,
        rating: data.rating ? String(data.rating) : undefined,
        rankScore: String(data.rankScore),
        taskMatchScore: data.taskMatchScore ? String(data.taskMatchScore) : undefined
      })
      .returning();
    return product;
  }

  async updateKitProduct(id: string, data: Partial<InsertKitProduct>): Promise<SelectKitProduct> {
    const updateData: any = { ...data };
    if (data.price !== undefined) updateData.price = String(data.price);
    if (data.originalPrice !== undefined) updateData.originalPrice = String(data.originalPrice);
    if (data.rating !== undefined) updateData.rating = String(data.rating);
    if (data.rankScore !== undefined) updateData.rankScore = String(data.rankScore);
    if (data.taskMatchScore !== undefined) updateData.taskMatchScore = String(data.taskMatchScore);
    
    const [product] = await db
      .update(kitProducts)
      .set(updateData)
      .where(eq(kitProducts.id, id))
      .returning();
    return product;
  }

  async removeKitProduct(id: string): Promise<void> {
    await db.delete(kitProducts).where(eq(kitProducts.id, id));
  }

  async clearKitProducts(kitId: string): Promise<void> {
    await db.delete(kitProducts).where(eq(kitProducts.kitId, kitId));
  }
}

export const storage = new DatabaseStorage();
