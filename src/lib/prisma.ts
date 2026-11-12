import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Uses a driver adapter (node-postgres) instead of Prisma's native query
// engine binary. The native engine has to be bundled per-platform and,
// with a custom generator output path, Next.js's serverless file tracer
// doesn't reliably pick it up for deployment (confirmed: it built fine but
// was missing at runtime on Vercel - "could not locate the Query Engine for
// runtime rhel-openssl-3.0.x"). A driver adapter is pure JS/TCP, so there's
// no binary to go missing, on Vercel or anywhere else.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // Supabase's pooler requires TLS; skip CA verification rather than bundle
  // their chain - standard pragmatic default for hosted Postgres providers
  // from serverless/edge environments.
  ssl: { rejectUnauthorized: false },
});

// Standard Next.js singleton pattern: avoids exhausting the Postgres
// connection pool by creating a new PrismaClient on every hot-reload in dev.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
