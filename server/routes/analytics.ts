import type { Express } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

// Schema para validação de dados de conversão
const conversionDataSchema = z.object({
  postId: z.string().optional(),
  flipbookTheme: z.string(),
  email: z.string().email(),
  source: z.string(),
  timestamp: z.string().datetime(),
  userAgent: z.string().optional(),
  referrer: z.string().optional()
});

const modalTriggerSchema = z.object({
  trigger_type: z.enum(['time', 'scroll', 'manual']),
  post_id: z.string().optional(),
  theme_id: z.string(),
  delay_seconds: z.number().optional(),
  scroll_percent: z.number().optional()
});

export function registerAnalyticsRoutes(app: Express) {
  // Endpoint para rastrear conversões
  app.post('/api/analytics/conversion', async (req, res) => {
    try {
      const validatedData = conversionDataSchema.parse(req.body);
      
      // Salvar analytics de conversão
      await storage.trackConversion({
        postId: validatedData.postId,
        flipbookTheme: validatedData.flipbookTheme,
        email: validatedData.email,
        source: validatedData.source,
        timestamp: new Date(validatedData.timestamp),
        userAgent: validatedData.userAgent,
        referrer: validatedData.referrer,
        ipAddress: req.ip
      });

      res.json({ success: true, message: 'Conversão registrada' });
    } catch (error) {
      console.error('Error tracking conversion:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      res.status(500).json({ error: 'Erro ao registrar conversão' });
    }
  });

  // Endpoint para rastrear triggers do modal
  app.post('/api/analytics/modal-trigger', async (req, res) => {
    try {
      const validatedData = modalTriggerSchema.parse(req.body);
      
      await storage.trackModalTrigger({
        triggerType: validatedData.trigger_type,
        postId: validatedData.post_id,
        themeId: validatedData.theme_id,
        delaySeconds: validatedData.delay_seconds,
        scrollPercent: validatedData.scroll_percent,
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({ success: true, message: 'Trigger registrado' });
    } catch (error) {
      console.error('Error tracking modal trigger:', error);
      res.status(500).json({ error: 'Erro ao registrar trigger' });
    }
  });

  // Endpoint para obter métricas de conversão
  app.get('/api/analytics/conversion-metrics', async (req, res) => {
    try {
      const { 
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate = new Date().toISOString(),
        flipbookTheme,
        postId 
      } = req.query;

      const metrics = await storage.getConversionMetrics({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        flipbookTheme: flipbookTheme as string,
        postId: postId as string
      });

      res.json(metrics);
    } catch (error) {
      console.error('Error getting conversion metrics:', error);
      res.status(500).json({ error: 'Erro ao obter métricas' });
    }
  });

  // Endpoint para obter métricas por tema
  app.get('/api/analytics/theme-performance', async (req, res) => {
    try {
      const { 
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate = new Date().toISOString()
      } = req.query;

      const performance = await storage.getThemePerformance({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      });

      res.json(performance);
    } catch (error) {
      console.error('Error getting theme performance:', error);
      res.status(500).json({ error: 'Erro ao obter performance dos temas' });
    }
  });

  // Endpoint para relatório de conversão por post
  app.get('/api/analytics/post-conversion-report', async (req, res) => {
    try {
      const { 
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate = new Date().toISOString(),
        limit = 50
      } = req.query;

      const report = await storage.getPostConversionReport({
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
        limit: parseInt(limit as string)
      });

      res.json(report);
    } catch (error) {
      console.error('Error getting post conversion report:', error);
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  });
}