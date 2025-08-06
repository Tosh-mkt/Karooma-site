import { NextFunction, Request, Response } from "express";

// Middleware to check session authentication
export const isSessionAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const sessionUser = (req.session as any).user;
  
  if (!sessionUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  (req as any).sessionUserId = sessionUser.id;
  next();
};

// Middleware to check if user is admin via session
export const isSessionAdmin = (req: Request, res: Response, next: NextFunction) => {
  const sessionUser = (req.session as any).user;
  if (!sessionUser || !sessionUser.isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};