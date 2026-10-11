import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// =========================================================================
// TYPESCRIPT INTERFACE EXTENSION
// =========================================================================
// Standard Express Request objects do not have a 'user' property.
// By extending Request into AuthenticatedRequest, TypeScript knows that after
// requireAuth executes successfully, downstream controllers can safely access
// req.user.userId and req.user.email without TypeScript type errors.
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

// =========================================================================
// AUTHENTICATION GUARD MIDDLEWARE
// =========================================================================
// How it works:
// 1. Intercepts incoming requests before they reach the controller.
// 2. Checks the 'Authorization' header for the pattern 'Bearer <token>'.
// 3. Verifies the cryptographic signature of the token against our secret key.
// 4. If valid, attaches the decoded user data to req.user and calls next().
// 5. If missing or invalid, halts execution immediately with an HTTP 401 error.
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // Step 1: Read the Authorization header sent by the client
  const authHeader = req.headers.authorization;

  // Step 2: Validate the format — must exist and start with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided. Please log in.' });
    return;
  }

  // Step 3: Extract the raw token string (everything after 'Bearer ')
  const token = authHeader.split(' ')[1];

  // Step 4: Ensure the server has a JWT_SECRET configured in environment variables
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({ error: 'Server configuration error: JWT secret missing.' });
    return;
  }

  try {
    // Step 5: Verify the token signature and expiration date
    // If the token was tampered with or has expired, jwt.verify throws an exception
    const decoded = jwt.verify(token, jwtSecret) as { userId: number; email: string };

    // Step 6: Attach decoded user credentials to the request for controllers to use
    req.user = decoded;

    // Step 7: Call next() to allow execution to proceed to the controller
    next();
  } catch (error) {
    // Token is expired, malformed, or signed with an incorrect secret
    res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

