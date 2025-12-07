import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { getSession } from '@auth/express';
import { authConfig } from '../auth';

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
 * Supports Express session, NextAuth session, and X-User-Auth header
 */
export async function extractUserInfo(req: Request, res: Response, next: NextFunction) {
  console.log('🔍 ===== EXTRAINDO INFO DO USUÁRIO (extractUserInfo) =====');
  console.log('📍 URL:', req.method, req.path);
  
  // 0. Try X-User-Auth header (for mobile browsers where cookies don't work)
  const userAuthHeader = req.headers['x-user-auth'] as string;
  if (userAuthHeader) {
    try {
      const headerUser = JSON.parse(userAuthHeader);
      if (headerUser.id && headerUser.email) {
        // Validate user exists in database
        const dbUser = await storage.getUserByEmail(headerUser.email);
        if (dbUser && dbUser.id === headerUser.id) {
          req.user = {
            email: dbUser.email || undefined,
            isAdmin: dbUser.isAdmin || false,
            id: dbUser.id
          };
          console.log('✅ Usuário extraído do header X-User-Auth:', JSON.stringify(req.user, null, 2));
          console.log('=========================================================\n');
          return next();
        } else {
          console.log('⚠️ Header X-User-Auth inválido - usuário não encontrado ou ID não corresponde');
        }
      }
    } catch (e) {
      console.log('⚠️ Erro ao parsear header X-User-Auth:', e);
    }
  }
  
  // 1. First try Express session (traditional login)
  if (req.session && (req.session as any).user) {
    const sessionUser = (req.session as any).user;
    req.user = {
      email: sessionUser.email,
      isAdmin: sessionUser.isAdmin || false,
      id: sessionUser.id
    };
    console.log('✅ Usuário extraído da sessão Express:', JSON.stringify(req.user, null, 2));
    console.log('=========================================================\n');
    return next();
  }

  // 2. Try NextAuth session (Google OAuth)
  try {
    console.log('🔐 Tentando buscar sessão NextAuth...');
    const nextAuthSession = await getSession(req, authConfig);
    console.log('🔐 NextAuth session result:', nextAuthSession ? JSON.stringify(nextAuthSession, null, 2) : 'null');
    
    if (nextAuthSession?.user) {
      const email = nextAuthSession.user.email;
      const isAdminEmail = email?.includes('@karooma.life') || email?.includes('admin');
      
      // Check if user is admin in database
      let isAdmin = isAdminEmail;
      if (email) {
        const dbUser = await storage.getUserByEmail(email);
        console.log('🔐 DB User found:', dbUser ? JSON.stringify({ email: dbUser.email, isAdmin: dbUser.isAdmin }, null, 2) : 'null');
        if (dbUser?.isAdmin) {
          isAdmin = true;
        }
      }
      
      req.user = {
        email: email || undefined,
        isAdmin: isAdmin || (nextAuthSession.user as any).isAdmin || false,
        id: (nextAuthSession.user as any).id
      };
      console.log('✅ Usuário extraído do NextAuth:', JSON.stringify(req.user, null, 2));
      console.log('=========================================================\n');
      return next();
    } else {
      console.log('🔐 NextAuth session não contém user');
    }
  } catch (error) {
    console.log('⚠️ Erro ao verificar NextAuth session:', error);
  }

  // 3. Check if admin override (only in development)
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

  // 4. Extract from query params (fallback)
  const email = req.query.email as string;
  if (email) {
    req.user = {
      email,
      isAdmin: false,
      id: 'user_' + email.replace('@', '_').replace('.', '_')
    };
    console.log('📧 Usuário extraído de query params:', email);
  } else {
    console.log('⚠️ Nenhum usuário encontrado');
  }

  console.log('=========================================================\n');
  next();
}