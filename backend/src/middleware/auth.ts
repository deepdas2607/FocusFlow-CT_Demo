import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request type so we can attach the decoded user to it.
// This allows downstream route handlers to access req.user without TypeScript errors.
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

// This middleware runs before any protected route handler.
// It checks whether the incoming request has a valid JWT token.
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // The client sends the token in the Authorization header as: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided. Please log in.' });
    return;
  }

  // Extract the token by removing the "Bearer " prefix
  const token = authHeader.split(' ')[1];

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({ error: 'Server configuration error: JWT secret missing.' });
    return;
  }

  try {
    // Verify the token and decode its payload
    const decoded = jwt.verify(token, jwtSecret) as { userId: number; email: string };

    // Attach the decoded user info to the request so route handlers can use it
    req.user = decoded;

    // Call next() to pass control to the actual route handler
    next();
  } catch (error) {
    // Token is invalid or expired
    res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

