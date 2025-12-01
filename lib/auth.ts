import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// 从环境变量获取管理员凭证
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('请输入邮箱和密码');
        }

        // 检查环境变量是否配置
        if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
          console.error('未配置管理员凭证环境变量');
          throw new Error('系统配置错误');
        }

        // 验证邮箱
        if (credentials.email !== ADMIN_EMAIL) {
          throw new Error('邮箱或密码错误');
        }

        // 验证密码（使用 bcrypt 比较哈希）
        const isValid = await bcrypt.compare(
          credentials.password,
          ADMIN_PASSWORD_HASH
        );

        if (!isValid) {
          throw new Error('邮箱或密码错误');
        }

        // 返回用户信息
        return {
          id: '1',
          email: ADMIN_EMAIL,
          name: 'Admin',
          role: 'admin',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 小时
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// 辅助函数：生成密码哈希（用于设置环境变量）
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// 辅助函数：验证密码
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
