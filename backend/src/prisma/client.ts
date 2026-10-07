import { PrismaClient } from '@prisma/client';

// Create a single Prisma client instance for the entire application.
// This prevents creating too many database connections.
const prisma = new PrismaClient();

export default prisma;

