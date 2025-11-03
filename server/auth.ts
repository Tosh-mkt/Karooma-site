import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "@auth/core/providers/google";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import type { Session, User } from "@auth/core/types";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️ Google OAuth não configurado. Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET");
}

// Generate a secret if not provided (for development)
const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 
  (process.env.NODE_ENV === 'development' ? 'development-secret-key-change-in-production' : undefined);

if (!secret) {
  throw new Error('Please define NEXTAUTH_SECRET or AUTH_SECRET environment variable');
}

export const authConfig = {
  trustHost: true,
  secret,
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, user }: { session: Session; user: User }) {
      if (session.user) {
        session.user.id = user.id;
        
        // Auto-promote admin users based on email
        const isAdminEmail = user.email?.includes('@karooma.life') || user.email?.includes('admin');
        if (isAdminEmail && user.email) {
          // Update user to admin if not already
          await db.update(users).set({ isAdmin: true }).where(eq(users.email, user.email));
          (session.user as any).isAdmin = true;
        }
      }
      return session;
    },
  },
};