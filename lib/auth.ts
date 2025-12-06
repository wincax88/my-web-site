import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        // 在函数内部读取环境变量，确保运行时获取
        const adminEmail = process.env.ADMIN_EMAIL;
        // 密码哈希使用 Base64 编码存储，避免 $ 字符被 dotenv-expand 扩展
        const adminPasswordHashB64 = process.env.ADMIN_PASSWORD_HASH_B64;
        const adminPasswordHash = adminPasswordHashB64
          ? Buffer.from(adminPasswordHashB64, 'base64').toString('utf-8')
          : undefined;

        console.log('[Auth] 登录尝试:', credentials?.email);
        console.log('[Auth] ADMIN_EMAIL 配置:', adminEmail ? '已设置' : '未设置');
        console.log('[Auth] ADMIN_PASSWORD_HASH 配置:', adminPasswordHash ? '已设置' : '未设置');

        if (!credentials?.email || !credentials?.password) {
          throw new Error('请输入邮箱和密码');
        }

        // 检查环境变量是否配置
        if (!adminEmail || !adminPasswordHash) {
          console.error('[Auth] 未配置管理员凭证环境变量');
          throw new Error('系统配置错误');
        }

        // 验证邮箱
        if (credentials.email !== adminEmail) {
          console.log('[Auth] 邮箱不匹配:', credentials.email, '!==', adminEmail);
          throw new Error('邮箱或密码错误');
        }

        // 验证密码（使用 bcrypt 比较哈希）
        const isValid = await bcrypt.compare(
          credentials.password,
          adminPasswordHash
        );

        if (!isValid) {
          console.log('[Auth] 密码验证失败');
          throw new Error('邮箱或密码错误');
        }

        console.log('[Auth] 登录成功');
        // 返回用户信息
        return {
          id: '1',
          email: adminEmail,
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
