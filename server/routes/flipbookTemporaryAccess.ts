import type { Express } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

// Schema para validação
const grantTemporaryAccessSchema = z.object({
  email: z.string().email(),
  flipbookId: z.string(),
  source: z.string().default('lead-magnet'),
  expiresInDays: z.number().min(1).max(365).default(30),
  notes: z.string().optional()
});

export function registerFlipbookTemporaryAccessRoutes(app: Express) {
  // Conceder acesso temporário a flipbook (para lead magnets)
  app.post('/api/flipbook-access/grant-temporary', async (req, res) => {
    try {
      const validatedData = grantTemporaryAccessSchema.parse(req.body);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + validatedData.expiresInDays);
      
      const authorizedUser = await storage.addAuthorizedUser({
        email: validatedData.email.toLowerCase().trim(),
        flipbookId: validatedData.flipbookId,
        addedByAdmin: 'system-lead-magnet',
        notes: validatedData.notes || `Acesso concedido via ${validatedData.source}`,
        expiresAt,
        isActive: true
      });

      res.status(201).json({
        success: true,
        message: `Acesso temporário concedido para ${validatedData.email}`,
        expiresAt: expiresAt.toISOString(),
        flipbookId: validatedData.flipbookId
      });
    } catch (error) {
      console.error('Error granting temporary flipbook access:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Dados inválidos',
          details: error.errors
        });
      }
      
      res.status(500).json({
        error: 'Erro ao conceder acesso temporário'
      });
    }
  });

  // Verificar acesso temporário
  app.get('/api/flipbook-access/check-temporary/:email/:flipbookId', async (req, res) => {
    try {
      const { email, flipbookId } = req.params;
      
      const hasAccess = await storage.isEmailAuthorizedForFlipbook(
        email.toLowerCase().trim(),
        flipbookId
      );

      res.json({
        hasAccess,
        email,
        flipbookId,
        message: hasAccess ? 'Acesso autorizado' : 'Acesso negado ou expirado'
      });
    } catch (error) {
      console.error('Error checking temporary access:', error);
      res.status(500).json({
        error: 'Erro ao verificar acesso'
      });
    }
  });

  // Estender acesso temporário
  app.patch('/api/flipbook-access/extend/:email/:flipbookId', async (req, res) => {
    try {
      const { email, flipbookId } = req.params;
      const { additionalDays = 30 } = req.body;
      
      // Primeiro remove o acesso existente
      await storage.removeAuthorizedUser(email.toLowerCase().trim(), flipbookId);
      
      // Depois cria um novo com prazo estendido
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + additionalDays);
      
      const authorizedUser = await storage.addAuthorizedUser({
        email: email.toLowerCase().trim(),
        flipbookId,
        addedByAdmin: 'system-extension',
        notes: `Acesso estendido por ${additionalDays} dias`,
        expiresAt,
        isActive: true
      });

      res.json({
        success: true,
        message: `Acesso estendido até ${expiresAt.toLocaleDateString('pt-BR')}`,
        expiresAt: expiresAt.toISOString()
      });
    } catch (error) {
      console.error('Error extending access:', error);
      res.status(500).json({
        error: 'Erro ao estender acesso'
      });
    }
  });
}