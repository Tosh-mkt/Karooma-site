import { ExpressAuth } from "@auth/express"
import { authConfig } from "./auth"
import type { Express } from "express"

export function setupNextAuth(app: Express) {
  // Setup NextAuth with Express - handle all auth routes
  app.use("/api/auth/*", async (req, res, next) => {
    try {
      return await ExpressAuth(authConfig)(req, res, next);
    } catch (error) {
      console.error("[NextAuth Error]:", error);
      next(error);
    }
  });
}