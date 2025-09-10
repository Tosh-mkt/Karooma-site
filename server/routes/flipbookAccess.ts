import type { Express } from 'express';
import { storage } from '../storage';
import { extractUserInfo, requireFlipbookAccess } from '../middleware/flipbookAuth';

export function registerFlipbookAccessRoutes(app: Express) {
  // Check if user has access to specific flipbook
  app.get('/api/flipbook/:flipbookId/access', extractUserInfo, async (req, res) => {
    try {
      const { flipbookId } = req.params;
      
      if (!req.user || !req.user.email) {
        return res.json({ 
          hasAccess: false, 
          requireAuth: true,
          message: 'Login necessário' 
        });
      }

      // Admins have access to everything
      if (req.user.isAdmin) {
        return res.json({ 
          hasAccess: true, 
          isAdmin: true,
          message: 'Acesso administrativo' 
        });
      }

      const hasAccess = await storage.isEmailAuthorizedForFlipbook(req.user.email, flipbookId);
      
      res.json({ 
        hasAccess,
        userEmail: req.user.email,
        flipbookId,
        message: hasAccess ? 'Acesso autorizado' : 'Acesso negado'
      });
    } catch (error) {
      console.error('Error checking flipbook access:', error);
      res.status(500).json({ 
        hasAccess: false, 
        error: 'Erro ao verificar acesso' 
      });
    }
  });

  // Admin routes for managing authorized users
  app.get('/api/admin/flipbook-users', extractUserInfo, async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const users = await storage.getAllAuthorizedUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching authorized users:', error);
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  });

  app.get('/api/admin/flipbook-users/:flipbookId', extractUserInfo, async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const { flipbookId } = req.params;
      const users = await storage.getAuthorizedUsers(flipbookId);
      res.json(users);
    } catch (error) {
      console.error('Error fetching authorized users for flipbook:', error);
      res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  });

  app.post('/api/admin/flipbook-users', extractUserInfo, async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const { email, flipbookId, notes, expiresAt } = req.body;
      
      if (!email || !flipbookId) {
        return res.status(400).json({ 
          error: 'Email e flipbookId são obrigatórios' 
        });
      }

      const authorizedUser = await storage.addAuthorizedUser({
        email: email.toLowerCase().trim(),
        flipbookId,
        addedByAdmin: req.user.id || 'admin',
        notes,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true
      });

      res.status(201).json({
        success: true,
        user: authorizedUser,
        message: `Usuário ${email} autorizado para o flipbook ${flipbookId}`
      });
    } catch (error) {
      console.error('Error adding authorized user:', error);
      res.status(500).json({ error: 'Erro ao adicionar usuário' });
    }
  });

  app.delete('/api/admin/flipbook-users/:email/:flipbookId', extractUserInfo, async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Acesso negado' });
      }

      const { email, flipbookId } = req.params;
      
      await storage.removeAuthorizedUser(email, flipbookId);
      
      res.json({
        success: true,
        message: `Acesso removido para ${email} no flipbook ${flipbookId}`
      });
    } catch (error) {
      console.error('Error removing authorized user:', error);
      res.status(500).json({ error: 'Erro ao remover usuário' });
    }
  });

  // Protected flipbook routes
  app.get('/api/flipbook/organizacao/data', 
    extractUserInfo,
    requireFlipbookAccess('organizacao'),
    async (req, res) => {
      try {
        // Return flipbook data - this could come from database or static data
        res.json({
          flipbookId: 'organizacao',
          title: 'Organização da Casa - Sistema Simples que Funciona',
          userEmail: req.user?.email,
          hasAccess: true,
          pages: 8 // Number of pages in the flipbook
        });
      } catch (error) {
        console.error('Error serving flipbook data:', error);
        res.status(500).json({ error: 'Erro ao carregar flipbook' });
      }
    }
  );
}