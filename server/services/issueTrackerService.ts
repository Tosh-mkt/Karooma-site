import { storage } from "../storage";
import { notificationService } from "./notificationService";
import type { ProductIssue, InsertProductIssue, SelectKitProduct, SelectProductKit } from "@shared/schema";

export interface IssueDetectionResult {
  created: boolean;
  issueId?: string;
  duplicate?: boolean;
}

export class IssueTrackerService {
  async recordUnavailableProduct(
    kitProduct: SelectKitProduct,
    kit: SelectProductKit
  ): Promise<IssueDetectionResult> {
    const existingIssues = await storage.getProductIssues({
      kitId: kit.id,
      status: 'PENDING'
    });
    
    const duplicate = existingIssues.find(
      i => i.asin === kitProduct.asin && i.issueType === 'UNAVAILABLE'
    );
    
    if (duplicate) {
      console.log(`Issue já existe para ASIN ${kitProduct.asin}, ignorando duplicata`);
      return { created: false, duplicate: true };
    }

    const issue = await storage.createProductIssue({
      kitProductId: kitProduct.id,
      kitId: kit.id,
      asin: kitProduct.asin,
      productTitle: kitProduct.title,
      issueType: 'UNAVAILABLE',
      issueDetails: {
        failedChecks: kitProduct.failedChecks || 0,
        lastAvailableAt: kitProduct.lastCheckedAt?.toISOString()
      },
      status: 'PENDING',
      priority: 3
    });

    console.log(`Issue criada: ${issue.id} - Produto indisponível: ${kitProduct.asin}`);
    return { created: true, issueId: issue.id };
  }

  async recordPriceChange(
    kitProduct: SelectKitProduct,
    kit: SelectProductKit,
    previousPrice: number,
    currentPrice: number
  ): Promise<IssueDetectionResult> {
    const priceChangePercent = Math.abs((currentPrice - previousPrice) / previousPrice * 100);
    
    if (priceChangePercent < 10) {
      return { created: false };
    }

    const existingIssues = await storage.getProductIssues({
      kitId: kit.id,
      status: 'PENDING'
    });
    
    const duplicate = existingIssues.find(
      i => i.asin === kitProduct.asin && i.issueType === 'PRICE_CHANGE'
    );
    
    if (duplicate) {
      return { created: false, duplicate: true };
    }

    const priority = priceChangePercent >= 30 ? 3 : priceChangePercent >= 20 ? 2 : 1;

    const issue = await storage.createProductIssue({
      kitProductId: kitProduct.id,
      kitId: kit.id,
      asin: kitProduct.asin,
      productTitle: kitProduct.title,
      issueType: 'PRICE_CHANGE',
      issueDetails: {
        previousPrice,
        currentPrice,
        priceChangePercent
      },
      status: 'PENDING',
      priority
    });

    console.log(`Issue criada: ${issue.id} - Mudança de preço ${priceChangePercent.toFixed(1)}%: ${kitProduct.asin}`);
    return { created: true, issueId: issue.id };
  }

  async recordDataStale(
    kitProduct: SelectKitProduct,
    kit: SelectProductKit
  ): Promise<IssueDetectionResult> {
    const existingIssues = await storage.getProductIssues({
      kitId: kit.id,
      status: 'PENDING'
    });
    
    const duplicate = existingIssues.find(
      i => i.asin === kitProduct.asin && i.issueType === 'DATA_STALE'
    );
    
    if (duplicate) {
      return { created: false, duplicate: true };
    }

    const issue = await storage.createProductIssue({
      kitProductId: kitProduct.id,
      kitId: kit.id,
      asin: kitProduct.asin,
      productTitle: kitProduct.title,
      issueType: 'DATA_STALE',
      issueDetails: {
        lastAvailableAt: kitProduct.lastCheckedAt?.toISOString()
      },
      status: 'PENDING',
      priority: 1
    });

    console.log(`Issue criada: ${issue.id} - Dados desatualizados: ${kitProduct.asin}`);
    return { created: true, issueId: issue.id };
  }

  async recordLowRating(
    kitProduct: SelectKitProduct,
    kit: SelectProductKit,
    previousRating: number,
    currentRating: number
  ): Promise<IssueDetectionResult> {
    if (currentRating >= 3.5) {
      return { created: false };
    }

    const existingIssues = await storage.getProductIssues({
      kitId: kit.id,
      status: 'PENDING'
    });
    
    const duplicate = existingIssues.find(
      i => i.asin === kitProduct.asin && i.issueType === 'LOW_RATING'
    );
    
    if (duplicate) {
      return { created: false, duplicate: true };
    }

    const priority = currentRating < 3.0 ? 3 : 2;

    const issue = await storage.createProductIssue({
      kitProductId: kitProduct.id,
      kitId: kit.id,
      asin: kitProduct.asin,
      productTitle: kitProduct.title,
      issueType: 'LOW_RATING',
      issueDetails: {
        previousRating,
        currentRating
      },
      status: 'PENDING',
      priority
    });

    console.log(`Issue criada: ${issue.id} - Avaliação baixa ${currentRating}: ${kitProduct.asin}`);
    return { created: true, issueId: issue.id };
  }

  async sendDailyDigest(): Promise<boolean> {
    try {
      const issues = await storage.getProductIssues({ status: 'PENDING' });
      const summary = await storage.getIssuesSummary();
      const pendingCount = await storage.getPendingIssuesCount();

      const unsentIssues = issues.filter(i => !i.emailSent);
      
      if (unsentIssues.length === 0) {
        console.log('Digest diário: nenhuma pendência nova para enviar');
        return true;
      }

      const sent = await notificationService.sendDailyIssueDigest({
        issues: unsentIssues,
        summary,
        pendingCount
      });

      if (sent) {
        const issueIds = unsentIssues.map(i => i.id);
        await storage.markIssuesDigestSent(issueIds);
        console.log(`Digest diário enviado com ${unsentIssues.length} pendência(s)`);
      }

      return sent;
    } catch (error) {
      console.error('Erro ao enviar digest diário:', error);
      return false;
    }
  }

  async getStats(): Promise<{
    pending: number;
    resolvedToday: number;
    byType: { type: string; count: number }[];
  }> {
    const pendingCount = await storage.getPendingIssuesCount();
    const summary = await storage.getIssuesSummary();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allIssues = await storage.getProductIssues({ status: 'RESOLVED' });
    const resolvedToday = allIssues.filter(i => 
      i.resolvedAt && new Date(i.resolvedAt) >= today
    ).length;

    return {
      pending: pendingCount,
      resolvedToday,
      byType: summary
    };
  }
}

export const issueTrackerService = new IssueTrackerService();
