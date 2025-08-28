import { ExpressAuth } from "@auth/express"
import { authConfig } from "./auth"
import type { Express, Request, Response } from "express"

export function setupNextAuth(app: Express) {
  // Setup NextAuth with Express
  app.use("/api/auth/*", ExpressAuth(authConfig))
  
  // Custom session endpoint
  app.get("/api/auth/session", async (req: Request, res: Response) => {
    try {
      // Get session from NextAuth
      const session = req.auth || null
      res.json(session)
    } catch (error) {
      console.error("Session error:", error)
      res.json(null)
    }
  })

  // Middleware to add auth to req
  app.use((req: Request & { auth?: any }, res: Response, next: Function) => {
    // This will be populated by NextAuth middleware
    next()
  })
}