let prismaClient: any;

try {
  const { PrismaClient } = require('@prisma/client');
  const globalForPrisma = globalThis as unknown as {
    prisma: any;
  };
  prismaClient =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaClient;
} catch (e) {
  // Safe mock for build environments without active Prisma binary
  prismaClient = {
    project: {
      create: async () => ({ id: 'demo-project-id', revisions: [{ id: 'rev-1', snapshots: [{ id: 'snap-1' }] }] }),
      findMany: async () => [],
      findUnique: async () => null,
    },
  };
}

export const prisma = prismaClient;
