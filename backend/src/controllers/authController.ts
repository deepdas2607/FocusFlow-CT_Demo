import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { AuthenticatedRequest } from '../middleware/auth';

// Number of salt rounds for bcrypt hashing.
// Higher = more secure but slower. 10 is a good balance.
const SALT_ROUNDS = 10;

// POST /api/auth/register
// Creates a new user account.
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
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    // Hash the password before storing it in the database
    // We NEVER store plain-text passwords
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the user record in the database
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        // Create default preferences for the new user at the same time
        preferences: {
          create: {
            notificationsEnabled: true,
            productivityReminders: true,
            sessionReminders: true,
            weeklySummary: true,
          },
        },
      },
      // Only return the fields we need - never return passwordHash
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

// POST /api/auth/login
// Authenticates an existing user and returns a JWT.
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { preferences: true },
    });

    if (!user) {
      // Use a generic error message so we don't reveal whether the email exists
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Compare the provided password with the stored hash
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Generate a JWT token for this user
    const token = generateToken(user.id, user.email);

    // Return user data without the password hash
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

// GET /api/auth/me
// Returns the currently authenticated user's data.
// This is useful for the frontend to restore session after page refresh.
export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }

  try {
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

// Helper function: creates a signed JWT token.
// The token contains userId and email as the payload.
// It expires in 7 days so users stay logged in.
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

