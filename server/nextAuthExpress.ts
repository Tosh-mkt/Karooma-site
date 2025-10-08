import { ExpressAuth } from "@auth/express"
import { authConfig } from "./auth"
import type { Express } from "express"

export function setupNextAuth(app: Express) {
  // Setup NextAuth with Express - use direct middleware mounting
  // The :nextauth* param format is handled internally by ExpressAuth
  app.use("/api/auth/*", ExpressAuth(authConfig));
}