import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "@auth/core/providers/google";
import { db } from "./db";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️ Google OAuth não configurado. Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET");
}

export const authConfig = {
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};