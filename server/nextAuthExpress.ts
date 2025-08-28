import { ExpressAuth } from "@auth/express"
import { authConfig } from "./auth"
import type { Express, Request, Response } from "express"

export function setupNextAuth(app: Express) {
  // Setup NextAuth with Express - simplified config to avoid type issues
  const expressConfig = {
    providers: authConfig.providers,
    secret: authConfig.secret,
    session: {
      strategy: "jwt" as const,
      maxAge: 30 * 24 * 60 * 60 // 30 days
    },
    callbacks: {
      jwt: authConfig.callbacks?.jwt,
      session: authConfig.callbacks?.session
    }
  }
  
  app.use("/api/auth/*", ExpressAuth(expressConfig))
  
  // Custom session endpoint - simplified for now
  app.get("/api/auth/session", async (req: Request, res: Response) => {
    try {
      // Session will be available through NextAuth middleware
      // For now, return null until middleware is properly configured
      res.json(null)
    } catch (error) {
      console.error("Session error:", error)
      res.json(null)
    }
  })
}