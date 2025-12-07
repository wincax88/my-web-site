#!/usr/bin/env node

/**
 * 构建包装脚本
 * 在运行 next build 之前修复 next.config.js 中的 basePath 配置
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'next.config.js');

// 删除 CloudBase Framework 可能创建的 next.config.js
// Next.js 会优先使用 next.config.js（如果存在），但我们使用 next.config.mjs（ES Module）
// 所以如果检测到 CloudBase Framework 创建的简单 next.config.js，直接删除它
function fixConfig() {
  const mjsConfigPath = path.join(__dirname, '..', 'next.config.mjs');
  
  // 确保 next.config.mjs 存在
  if (!fs.existsSync(mjsConfigPath)) {
    console.error('❌ next.config.mjs 不存在！');
    process.exit(1);
  }
  
  // 如果存在 next.config.js，检查并处理
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf8').trim();
      
      // 检查是否是 CloudBase Framework 创建的简单配置文件
      // 通常格式为: module.exports = { basePath: '/' }
      const isSimpleConfig = 
        content === "module.exports = { basePath: '/' }" ||
        content === 'module.exports = { basePath: "/" }' ||
        (content.includes("basePath: '/'") && content.split('\n').length <= 3) ||
        (content.includes('basePath: "/"') && content.split('\n').length <= 3);
      
      if (isSimpleConfig) {
        console.log('🔧 检测到 CloudBase Framework 创建的 next.config.js，正在删除...');
        fs.unlinkSync(configPath);
        console.log('✅ 已删除 next.config.js（Next.js 将使用 next.config.mjs）');
      } else if (content.includes("basePath: '/'") || content.includes('basePath: "/"')) {
        // 如果文件包含错误的 basePath，尝试修复
        console.log('🔧 检测到错误的 basePath 配置，正在修复...');
        const fixed = content.replace(/basePath:\s*['"]\/['"]/g, "basePath: ''");
        fs.writeFileSync(configPath, fixed, 'utf8');
        console.log('✅ 已修复 next.config.js 中的 basePath 配置');
      } else {
        console.log('⚠️  检测到自定义的 next.config.js，保留原样');
      }
    } catch (error) {
      console.error('⚠️  处理 next.config.js 时出错:', error.message);
      // 如果出错，尝试删除文件（可能是 CloudBase Framework 创建的损坏文件）
      try {
        if (fs.existsSync(configPath)) {
          const content = fs.readFileSync(configPath, 'utf8');
          // 如果是简单配置，删除它
          if (content.trim().length < 100 && content.includes('basePath')) {
            fs.unlinkSync(configPath);
            console.log('✅ 已删除可能有问题的 next.config.js');
          }
        }
      } catch (e) {
        // 忽略删除错误
      }
    }
  } else {
    console.log('✅ next.config.js 不存在，Next.js 将使用 next.config.mjs');
  }
}

// 修复配置
fixConfig();

// 运行实际的构建命令
try {
  console.log('🚀 开始构建...');
  execSync('next build', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
} catch (error) {
  console.error('❌ 构建失败');
  process.exit(1);
}

