import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

// Number of salt rounds for bcrypt hashing.
// Salt rounds determine the computational difficulty (work factor) of calculating the hash.
// 10 rounds means 2^10 (1024) iterations, balancing robust brute-force defense with fast server response (~100ms).
const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * 
 * Creates a brand new user account in FocusFlow:
 * 1. Validates presence of name, email, and password (min 6 chars).
 * 2. Normalizes email to lowercase and trims whitespace to prevent duplicate registration tricks.
 * 3. Checks if an account with that email already exists in PostgreSQL (returns 409 Conflict if so).
 * 4. Hashes the plaintext password with bcrypt (SALT_ROUNDS = 10). We NEVER store plaintext passwords.
 * 5. Inserts the user and creates default preferences in a single relational transaction via Prisma.
 * 6. Generates a signed JWT token containing userId and email so the user is instantly authenticated.
 * 7. Returns 201 Created with the JWT and safe user object (excluding passwordHash).
 */
export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body;

  // Basic input validation
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  try {
    // Check if a user with this email already exists
    // Case-insensitive lookup via normalized email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    // Hash the password before storing it in the database
    // Salt is generated automatically and embedded in the returned bcrypt hash string
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the user record in the database along with default notification preferences
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        // Nested relation write: Prisma creates the UserPreferences row linked to this user's id
        preferences: {
          create: {
            notificationsEnabled: true,
            productivityReminders: true,
            sessionReminders: true,
            weeklySummary: true,
          },
        },
      },
      // Explicit projection: Select only safe fields to return, guaranteeing passwordHash is never leaked
      select: {
        id: true,
        name: true,
        email: true,
        occupation: true,
        interests: true,
        preferredFocusDuration: true,
        createdAt: true,
        preferences: true,
      },
    });

    // Generate a JWT token for the new user so they are immediately logged in
    const token = generateToken(newUser.id, newUser.email);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

/**
 * POST /api/auth/login
 * 
 * Authenticates an existing user and issues a fresh JWT:
 * 1. Validates that email and password are provided.
 * 2. Looks up the user record by normalized lowercase email.
 * 3. Compares the supplied password against the stored bcrypt hash using bcrypt.compare().
 *    Notice that if the user does NOT exist or the password does NOT match, we return the
 *    identical status code (401) and error message ('Invalid email or password.').
 *    This prevents "Account Enumeration Attacks" where attackers probe which emails are registered.
 * 4. Signs and returns a 7-day JWT along with the user profile (destructuring away passwordHash).
 */
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    // Look up user by lowercase trimmed email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { preferences: true },
    });

    if (!user) {
      // Intentionally generic message to avoid leaking whether the email exists
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Compare the plaintext candidate password with the stored bcrypt hash
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Generate a fresh JWT token
    const token = generateToken(user.id, user.email);

    // Destructure out passwordHash so it is omitted from the JSON response
    const { passwordHash, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

/**
 * GET /api/auth/me
 * 
 * Returns the currently authenticated user's profile and preferences.
 * Protected by `requireAuth` middleware, which attaches `req.user.userId`.
 * The frontend calls this endpoint on startup to validate its cached localStorage token
 * and reconstruct the React authentication state without requiring the user to re-login.
 */
export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  try {
    // Fetch profile and preferences by primary key
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        occupation: true,
        interests: true,
        preferredFocusDuration: true,
        createdAt: true,
        preferences: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

/**
 * Helper: generateToken
 * 
 * Signs a JSON Web Token (JWT) using HMAC SHA-256 (HS256) with the secret key in process.env.JWT_SECRET.
 * Payload includes:
 * - userId: database primary key of the user (used to identify caller in requireAuth)
 * - email: user's email address
 * Expiration is set to 7 days ('7d') so users stay comfortably logged in across browser restarts.
 */
function generateToken(userId: number, email: string): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }

  return jwt.sign(
    { userId, email },
    jwtSecret,
    { expiresIn: '7d' }
  );
}


