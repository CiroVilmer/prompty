/**
 * Database client placeholder.
 *
 * Replace the contents of this file with your preferred ORM:
 *
 * Prisma:
 *   import { PrismaClient } from "@prisma/client";
 *   const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
 *   export const db = globalForPrisma.prisma ?? new PrismaClient();
 *   if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
 *
 * Drizzle (PostgreSQL + postgres.js):
 *   import { drizzle } from "drizzle-orm/postgres-js";
 *   import postgres from "postgres";
 *   const client = postgres(process.env.DATABASE_URL!);
 *   export const db = drizzle(client);
 */

export const db = {
  /** Stub — replace with a real ORM client */
  _stub: true as const,
};
