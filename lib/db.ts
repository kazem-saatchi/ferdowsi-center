import { PrismaClient } from "@prisma/client";

declare global {
  // This is necessary to avoid TypeScript errors
  // with using `globalThis` in different files
  var prisma: PrismaClient | undefined;
}

// Check if we are in production mode
const prisma =
  globalThis.prisma ||
  new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'],  // Keeps detailed logs to help diagnose issues
  });

// Prevent multiple instances of Prisma Client from being created in development mode
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export const db = prisma;
