import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express } from "express";
import { storage } from "./storage";

export function setupGoogleAuth(app: Express) {
  // Verificar se as credenciais Google estão configuradas
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("⚠️ Google OAuth não configurado. Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET");
    return;
  }

  // Configurar estratégia Google OAuth
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const googleId = profile.id;
      const email = profile.emails?.[0]?.value;
      const firstName = profile.name?.givenName;
      const lastName = profile.name?.familyName;
      const profileImageUrl = profile.photos?.[0]?.value;

      if (!email) {
        return done(new Error("Email not provided by Google"), undefined);
      }

      // Verificar se usuário já existe
      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Criar novo usuário
        const userData = {
          id: `google-${googleId}`,
          email,
          firstName: firstName || "",
          lastName: lastName || "",
          profileImageUrl,
          provider: "google" as const,
          providerId: googleId,
          isAdmin: false
        };

        user = await storage.createUser(userData);
      } else {
        // Atualizar dados do usuário se necessário
        if (!user.providerId || !user.profileImageUrl) {
          await storage.updateUser(user.id, {
            providerId: googleId,
            provider: "google",
            profileImageUrl: profileImageUrl || user.profileImageUrl
          });
        }
      }

      return done(null, user);
    } catch (error) {
      console.error("Error in Google OAuth strategy:", error);
      return done(error, undefined);
    }
  }));

  // Rotas do Google OAuth
  app.get("/api/auth/google", (req, res, next) => {
    const loginType = req.query.type as string;
    
    // Salvar tipo de login na sessão para usar no callback
    (req.session as any).loginType = loginType || 'user';
    
    passport.authenticate("google", {
      scope: ["profile", "email"]
    })(req, res, next);
  });

  app.get("/api/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login?error=google_auth_failed" }),
    async (req, res) => {
      try {
        const user = req.user as any;
        const loginType = (req.session as any).loginType || 'user';

        if (loginType === 'admin' && !user.isAdmin) {
          return res.redirect("/login?error=admin_access_denied");
        }

        // Salvar usuário na sessão
        (req.session as any).user = user;

        // Limpar tipo de login da sessão
        delete (req.session as any).loginType;

        // Redirecionar baseado no tipo de usuário
        const redirectUrl = user.isAdmin ? "/admin/dashboard" : "/";
        res.redirect(redirectUrl);
      } catch (error) {
        console.error("Error in Google OAuth callback:", error);
        res.redirect("/login?error=callback_failed");
      }
    }
  );

  console.log("✅ Google OAuth configurado");
}