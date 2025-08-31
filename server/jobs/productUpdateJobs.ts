import * as cron from 'node-cron';
import ProductUpdateService from '../services/productUpdateService';

export class ProductUpdateJobs {
  private updateService: ProductUpdateService;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.updateService = new ProductUpdateService();
  }

  /**
   * Inicia todos os jobs de atualização
   */
  startAllJobs(): void {
    console.log('Iniciando jobs de atualização de produtos...');

    // Job para produtos de alta frequência (a cada 30 minutos)
    const highFreqJob = cron.schedule('*/30 * * * *', async () => {
      console.log('Executando atualização de produtos - alta frequência');
      try {
        await this.updateService.updateProductsByFrequency('high');
      } catch (error) {
        console.error('Erro na atualização de alta frequência:', error);
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });

    // Job para produtos de média frequência (a cada 2 horas)
    const mediumFreqJob = cron.schedule('0 */2 * * *', async () => {
      console.log('Executando atualização de produtos - média frequência');
      try {
        await this.updateService.updateProductsByFrequency('medium');
      } catch (error) {
        console.error('Erro na atualização de média frequência:', error);
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });

    // Job para produtos de baixa frequência (a cada 6 horas)
    const lowFreqJob = cron.schedule('0 */6 * * *', async () => {
      console.log('Executando atualização de produtos - baixa frequência');
      try {
        await this.updateService.updateProductsByFrequency('low');
      } catch (error) {
        console.error('Erro na atualização de baixa frequência:', error);
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });

    // Job para reativação de produtos (1 vez por dia às 3h)
    const reactivationJob = cron.schedule('0 3 * * *', async () => {
      console.log('Executando reativação de produtos inativos');
      try {
        const reactivatedCount = await this.updateService.reactivateProducts();
        console.log(`${reactivatedCount} produtos reativados`);
      } catch (error) {
        console.error('Erro na reativação de produtos:', error);
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });

    // Job para limpeza de dados antigos (1 vez por semana, domingo às 2h)
    const cleanupJob = cron.schedule('0 2 * * 0', async () => {
      console.log('Executando limpeza de dados antigos');
      try {
        await this.cleanupOldData();
      } catch (error) {
        console.error('Erro na limpeza de dados:', error);
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });

    // Armazena referências dos jobs
    this.jobs.set('highFreq', highFreqJob);
    this.jobs.set('mediumFreq', mediumFreqJob);
    this.jobs.set('lowFreq', lowFreqJob);
    this.jobs.set('reactivation', reactivationJob);
    this.jobs.set('cleanup', cleanupJob);

    // Inicia todos os jobs
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`Job ${name} iniciado`);
    });

    console.log('Todos os jobs de atualização foram iniciados');
  }

  /**
   * Para todos os jobs
   */
  stopAllJobs(): void {
    console.log('Parando todos os jobs de atualização...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Job ${name} parado`);
    });

    this.jobs.clear();
    console.log('Todos os jobs foram parados');
  }

  /**
   * Para um job específico
   */
  stopJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      this.jobs.delete(jobName);
      console.log(`Job ${jobName} parado`);
      return true;
    }
    return false;
  }

  /**
   * Inicia um job específico
   */
  startJob(jobName: string): boolean {
    const job = this.jobs.get(jobName);
    if (job) {
      job.start();
      console.log(`Job ${jobName} iniciado`);
      return true;
    }
    return false;
  }

  /**
   * Executa atualização manual imediata
   */
  async runManualUpdate(frequency?: 'high' | 'medium' | 'low'): Promise<any> {
    console.log(`Executando atualização manual${frequency ? ` - ${frequency}` : ''}`);
    
    try {
      if (frequency) {
        return await this.updateService.updateProductsByFrequency(frequency);
      } else {
        // Executa todas as frequências
        const results = {
          high: await this.updateService.updateProductsByFrequency('high'),
          medium: await this.updateService.updateProductsByFrequency('medium'),
          low: await this.updateService.updateProductsByFrequency('low')
        };
        return results;
      }
    } catch (error) {
      console.error('Erro na atualização manual:', error);
      throw error;
    }
  }

  /**
   * Obtém status dos jobs
   */
  getJobsStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    
    this.jobs.forEach((job, name) => {
      // Note: ScheduledTask doesn't expose running status directly
      status[name] = this.jobs.has(name);
    });

    return status;
  }

  /**
   * Limpeza de dados antigos
   */
  private async cleanupOldData(): Promise<void> {
    // Implementar limpeza de logs antigos, cache expirado, etc.
    console.log('Limpeza de dados antigos executada');
  }

  /**
   * Obtém estatísticas dos produtos para relatórios
   */
  async getUpdateStats(): Promise<any> {
    return await this.updateService.getProductStats();
  }
}

// Singleton instance
let jobsInstance: ProductUpdateJobs | null = null;

export function getProductUpdateJobs(): ProductUpdateJobs {
  if (!jobsInstance) {
    jobsInstance = new ProductUpdateJobs();
  }
  return jobsInstance;
}

export function initializeProductJobs(): void {
  const jobs = getProductUpdateJobs();
  
  // Só inicia os jobs em produção ou se explicitamente habilitado
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON_JOBS === 'true') {
    jobs.startAllJobs();
  } else {
    console.log('Jobs de atualização não iniciados (desenvolvimento). Use ENABLE_CRON_JOBS=true para habilitar.');
  }
}

export default ProductUpdateJobs;