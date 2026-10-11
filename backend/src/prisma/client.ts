import { PrismaClient } from '@prisma/client';

/**
 * Shared PrismaClient Singleton
 *
 * WHY THIS IS CRUCIAL:
 * In a Node.js backend, each `new PrismaClient()` creates an internal connection pool
 * to the PostgreSQL database. If multiple controller files instantiated their own client,
 * the application would rapidly exhaust the database's available socket connections,
 * causing queries to fail with P1001 errors.
 *
 * By exporting this single shared `prisma` instance, all controllers share the same
 * managed connection pool across the application lifecycle.
 */
const prisma = new PrismaClient();

export default prisma;

