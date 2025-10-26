import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "@auth/core/providers/google";
import { db } from "./db";

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
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};