// Configuração de tags de afiliado por marketplace
const AFFILIATE_TAGS: Record<string, string> = {
  "www.amazon.com.br": "karoom-20"
};

// Tag padrão para marketplace Brasil
const DEFAULT_TAG = "karoom-20";
const DEFAULT_MARKETPLACE = "www.amazon.com.br";

/**
 * Extrai o ASIN de uma URL da Amazon
 * Suporta formatos: /dp/ASIN, /gp/product/ASIN, /product/ASIN
 */
export function extractASINFromUrl(url: string): string | null {
  if (!url) return null;
  
  const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})|\/product\/([A-Z0-9]{10})/i);
  
  if (!asinMatch) return null;
  
  return asinMatch[1] || asinMatch[2] || asinMatch[3];
}

/**
 * Detecta o marketplace a partir da URL
 */
export function detectMarketplace(url: string): string {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes("amazon")) {
      return parsedUrl.hostname;
    }
  } catch (e) {
    // URL inválida
  }
  return DEFAULT_MARKETPLACE;
}

/**
 * Obtém a tag de afiliado para um marketplace
 */
export function getAffiliateTag(marketplace: string): string {
  return AFFILIATE_TAGS[marketplace] || DEFAULT_TAG;
}

/**
 * Gera link de afiliado a partir de uma URL de produto Amazon
 * 
 * @param url - URL do produto na Amazon (ex: https://www.amazon.com.br/dp/B09NCKFBGQ)
 * @param customTag - Tag customizada (opcional, usa a configurada por marketplace)
 * @returns URL com tag de afiliado ou null se ASIN não encontrado
 */
export function gerarLinkAfiliadoAPartirDaURL(url: string, customTag?: string): string | null {
  if (!url) return null;

  const asin = extractASINFromUrl(url);
  if (!asin) return null;

  const marketplace = detectMarketplace(url);
  const tag = customTag || getAffiliateTag(marketplace);

  return `https://${marketplace}/dp/${asin}?tag=${tag}`;
}

/**
 * Gera link de afiliado a partir do ASIN diretamente
 * 
 * @param asin - ASIN do produto (10 caracteres)
 * @param marketplace - Marketplace (padrão: www.amazon.com.br)
 * @param customTag - Tag customizada (opcional)
 * @returns URL com tag de afiliado
 */
export function gerarLinkAfiliadoPorASIN(
  asin: string, 
  marketplace: string = DEFAULT_MARKETPLACE,
  customTag?: string
): string {
  const tag = customTag || getAffiliateTag(marketplace);
  return `https://${marketplace}/dp/${asin}?tag=${tag}`;
}

/**
 * Valida se um ASIN tem formato válido
 */
export function isValidASIN(asin: string): boolean {
  return /^[A-Z0-9]{10}$/i.test(asin);
}

/**
 * Interface para dados de produto JSON
 */
export interface ProductJsonInput {
  asin: string;
  title: string;
  imageUrl: string;
  productUrl: string;
  price: number;
  brand?: string;
  category?: string;
  originalPrice?: number | null;
  rating?: number;
  reviewCount?: number;
  isPrime?: boolean;
  isAvailable?: boolean;
}

/**
 * Valida e processa dados de produto JSON
 * Gera automaticamente o affiliateLink a partir do productUrl
 */
export function processProductJson(input: ProductJsonInput): ProductJsonInput & { affiliateLink: string } {
  // Validar ASIN
  if (!isValidASIN(input.asin)) {
    throw new Error(`ASIN inválido: ${input.asin}. Deve ter 10 caracteres alfanuméricos.`);
  }
  
  // Gerar link afiliado
  const affiliateLink = gerarLinkAfiliadoAPartirDaURL(input.productUrl);
  
  if (!affiliateLink) {
    // Se não conseguir extrair da URL, gerar pelo ASIN
    const marketplace = detectMarketplace(input.productUrl);
    return {
      ...input,
      affiliateLink: gerarLinkAfiliadoPorASIN(input.asin, marketplace)
    };
  }
  
  return {
    ...input,
    affiliateLink
  };
}

/**
 * Calcula score de recomendação baseado na fórmula:
 * Score = (1/SalesRank)*0.4 + (Rating*ReviewCount)*0.4 + (Prime?1:0)*0.2
 */
export function calculateRecommendationScore(
  salesRank?: number,
  rating?: number,
  reviewCount?: number,
  isPrime?: boolean
): number {
  let score = 0;
  
  // Componente de ranking (40%)
  if (salesRank && salesRank > 0) {
    // Normalizar: quanto menor o rank, maior o score
    score += (1 / salesRank) * 100 * 0.4;
  }
  
  // Componente de avaliação (40%)
  if (rating && reviewCount) {
    // Normalizar: rating 0-5 * log(reviewCount) para balancear
    const ratingScore = rating * Math.log10(reviewCount + 1);
    score += ratingScore * 0.4;
  }
  
  // Componente Prime (20%)
  if (isPrime) {
    score += 1 * 0.2;
  }
  
  return Math.round(score * 100) / 100;
}
