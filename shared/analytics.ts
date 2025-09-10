// Tipos e schemas para sistema de analytics

export interface ConversionData {
  postId?: string;
  flipbookTheme: string;
  email: string;
  source: string;
  timestamp: Date;
  userAgent?: string;
  referrer?: string;
  ipAddress?: string;
}

export interface ModalTriggerData {
  triggerType: 'time' | 'scroll' | 'manual';
  postId?: string;
  themeId: string;
  delaySeconds?: number;
  scrollPercent?: number;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConversionMetrics {
  totalConversions: number;
  conversionsByTheme: Record<string, number>;
  conversionsByPost: Record<string, number>;
  conversionsBySource: Record<string, number>;
  dailyConversions: Array<{
    date: string;
    count: number;
  }>;
  averageTimeToConvert?: number; // em segundos
}

export interface ThemePerformance {
  themeId: string;
  themeName: string;
  totalTriggers: number;
  totalConversions: number;
  conversionRate: number;
  averageScrollPercent?: number;
  averageDelaySeconds?: number;
  topPosts: Array<{
    postId: string;
    postTitle?: string;
    conversions: number;
  }>;
}

export interface PostConversionReport {
  postId: string;
  postTitle?: string;
  postCategory?: string;
  totalViews?: number;
  modalTriggers: number;
  conversions: number;
  conversionRate: number;
  mainTheme: string;
  topSources: Array<{
    source: string;
    conversions: number;
  }>;
}