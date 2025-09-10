import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        email?: string;
        isAdmin?: boolean;
        id?: string;
      };
    }
  }
}

export interface FlipbookAuthRequest extends Request {
  flipbookId?: string;
}

/**
 * Middleware to check if user has access to specific flipbook
 * @param flipbookId - ID do flipbook (ex: 'organizacao', 'bem-estar')
 */
export function requireFlipbookAccess(flipbookId: string) {
  return async (req: FlipbookAuthRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.email) {
        return res.status(401).json({ 
          message: 'Login necessário para acessar este conteúdo.',
          requireAuth: true,
          flipbookId
        });
      }

      // Admins have access to everything
      if (req.user.isAdmin) {
        req.flipbookId = flipbookId;
        return next();
      }

      // Check if user's email is authorized for this flipbook
      const isAuthorized = await storage.isEmailAuthorizedForFlipbook(req.user.email, flipbookId);
      
      if (!isAuthorized) {
        return res.status(403).json({ 
          message: 'Você não tem permissão para acessar este flipbook.',
          requireAccess: true,
          flipbookId,
          userEmail: req.user.email
        });
      }

      // User is authorized
      req.flipbookId = flipbookId;
      next();
    } catch (error) {
      console.error('Flipbook auth error:', error);
      res.status(500).json({ 
        message: 'Erro ao verificar permissões de acesso.',
        error: 'internal_error'
      });
    }
  };
}

/**
 * Middleware to extract user info from session/auth
 * This should be called before requireFlipbookAccess
 */
export function extractUserInfo(req: Request, res: Response, next: NextFunction) {
  // For now, we'll extract from query params or headers
  // In production, this would come from your auth system
  
  // Check if admin override (only in development)
  if (process.env.NODE_ENV === 'development' && req.query.admin === 'true') {
    req.user = {
      email: 'admin@karooma.com',
      isAdmin: true,
      id: 'admin'
    };
    return next();
  }

  // Extract from query params (temporary - replace with real auth)
  const email = req.query.email as string;
  if (email) {
    req.user = {
      email,
      isAdmin: false,
      id: 'user_' + email.replace('@', '_').replace('.', '_')
    };
  }

  next();
}