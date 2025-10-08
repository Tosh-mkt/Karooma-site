import { ExpressAuth } from "@auth/express"
import { authConfig } from "./auth"
import type { Express, Request, Response } from "express"

export function setupNextAuth(app: Express) {
  // Setup NextAuth with Express - use all routes under /api/auth/*
  app.use("/api/auth/*", ExpressAuth(authConfig))
}