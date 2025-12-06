# 使用官方 Node.js 运行时作为基础镜像
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
# 检查 https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
# 了解为什么可能需要 libc6-compat
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制依赖文件
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# 复制 Prisma schema（postinstall 脚本需要）
COPY prisma ./prisma
# 安装依赖
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 生成 Prisma Client
RUN npx prisma generate

# 构建 Next.js 应用
# 注意：构建时需要 DATABASE_URL，但不会真正连接数据库
# 提供一个占位符连接字符串用于构建
ENV DATABASE_URL="mysql://user:password@localhost:3306/db"
RUN \
  if [ -f yarn.lock ]; then yarn build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物（standalone 模式包含所有必要的文件）
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制 Prisma schema 和生成的 Client（standalone 模式可能不包含）
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# 确保 node_modules 目录存在（standalone 模式应该已经创建了）
# 如果 standalone 模式未包含 Prisma Client，则从 builder 阶段复制
RUN mkdir -p node_modules/@prisma node_modules/.prisma

# 复制 Prisma Client（standalone 模式应该已经包含，但显式复制以确保完整性）
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# 复制国际化消息文件（运行时需要）
COPY --from=builder --chown=nextjs:nodejs /app/messages ./messages

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 启动命令
CMD ["node", "server.js"]

