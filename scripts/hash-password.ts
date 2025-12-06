/**
 * 密码哈希生成脚本
 *
 * 使用方法:
 * npx ts-node scripts/hash-password.ts "your-password"
 *
 * 或者直接在 Node.js 环境中运行:
 * node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 12).then(console.log)"
 */

import bcrypt from 'bcryptjs';

async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, 12);
  return hash;
}

const password = process.argv[2];

if (!password) {
  console.log('使用方法: npx ts-node scripts/hash-password.ts "your-password"');
  console.log('\n或者在 Node.js 中运行:');
  console.log(
    "node -e \"const bcrypt = require('bcryptjs'); bcrypt.hash('your-password', 12).then(console.log)\""
  );
  process.exit(1);
}

hashPassword(password).then((hash) => {
  // 使用 Base64 编码哈希值，避免 $ 字符被 Next.js dotenv-expand 扩展
  const hashB64 = Buffer.from(hash).toString('base64');

  console.log('\n密码哈希生成成功！');
  console.log('\n将以下内容添加到 .env 文件中:');
  console.log('----------------------------------------');
  console.log(`ADMIN_PASSWORD_HASH_B64="${hashB64}"`);
  console.log('----------------------------------------');
  console.log('\n注意: 哈希值已 Base64 编码，以避免 $ 字符导致的环境变量扩展问题');
  console.log('\n同时需要设置以下环境变量:');
  console.log('ADMIN_EMAIL="your-admin-email@example.com"');
  console.log('NEXTAUTH_SECRET="your-random-secret-key"');
  console.log('NEXTAUTH_URL="http://localhost:3000" (或生产环境 URL)');
});
