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
  console.log('🔍 ===== EXTRAINDO INFO DO USUÁRIO (extractUserInfo) =====');
  console.log('📍 URL:', req.method, req.path);
  console.log('🔑 Session existe?', !!req.session);
  console.log('👤 Session user:', req.session ? JSON.stringify((req.session as any).user, null, 2) : 'não disponível');
  
  // Extract user from session (set by login)
  if (req.session && (req.session as any).user) {
    const sessionUser = (req.session as any).user;
    req.user = {
      email: sessionUser.email,
      isAdmin: sessionUser.isAdmin || false,
      id: sessionUser.id
    };
    console.log('✅ Usuário extraído da sessão:', JSON.stringify(req.user, null, 2));
    console.log('=========================================================\n');
    return next();
  }

  // Check if admin override (only in development)
  if (process.env.NODE_ENV === 'development' && req.query.admin === 'true') {
    req.user = {
      email: 'admin@karooma.life',
      isAdmin: true,
      id: 'admin'
    };
    console.log('🔓 Admin override ativado (dev mode)');
    console.log('=========================================================\n');
    return next();
  }

  // Extract from query params (fallback - replace with real auth)
  const email = req.query.email as string;
  if (email) {
    req.user = {
      email,
      isAdmin: false,
      id: 'user_' + email.replace('@', '_').replace('.', '_')
    };
    console.log('📧 Usuário extraído de query params:', email);
  } else {
    console.log('⚠️ Nenhum usuário encontrado na sessão');
  }

  console.log('=========================================================\n');
  next();
}