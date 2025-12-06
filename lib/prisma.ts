import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// 在开发环境缓存 Prisma 客户端，避免热重载时重复创建连接
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
