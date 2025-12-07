#!/usr/bin/env node

/**
 * 修复 next.config.js 文件中的 basePath 配置
 * CloudBase Framework 会自动创建 next.config.js 并设置 basePath: '/'
 * 这个脚本确保 basePath 被设置为空字符串 ''
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'next.config.js');

if (!fs.existsSync(configPath)) {
  console.log('next.config.js 不存在，跳过修复');
  process.exit(0);
}

try {
  let content = fs.readFileSync(configPath, 'utf8');
  
  // 检查是否包含错误的 basePath: '/' 或 basePath: "/"
  if (content.includes("basePath: '/'") || content.includes('basePath: "/"')) {
    console.log('检测到错误的 basePath 配置，正在修复...');
    
    // 替换错误的 basePath 配置
    content = content.replace(/basePath:\s*['"]\/['"]/g, "basePath: ''");
    
    // 如果文件中没有 basePath 配置，添加它
    if (!content.includes('basePath:')) {
      // 尝试在 module.exports 或 export default 之前添加
      if (content.includes('module.exports = {')) {
        content = content.replace(
          'module.exports = {',
          "module.exports = {\n  basePath: '',"
        );
      } else if (content.includes('const nextConfig = {')) {
        content = content.replace(
          'const nextConfig = {',
          "const nextConfig = {\n  basePath: '',"
        );
      }
    }
    
    fs.writeFileSync(configPath, content, 'utf8');
    console.log('✅ 已修复 next.config.js 中的 basePath 配置');
  } else {
    console.log('✅ next.config.js 配置正确，无需修复');
  }
} catch (error) {
  console.error('❌ 修复 next.config.js 时出错:', error.message);
  process.exit(1);
}

