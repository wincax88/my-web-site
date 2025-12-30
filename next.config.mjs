import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// next-intl 配置文件路径
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  basePath: '', // 明确设置为空字符串，避免 CloudBase Framework 自动创建错误的配置
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // 图片优化配置
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 天缓存
  },
  // 增加请求体大小限制以支持大文件上传（100MB）
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 客户端配置：确保 lunr 正确打包
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    // 确保不覆盖 next-intl 的别名
    if (
      config.resolve &&
      config.resolve.alias &&
      !config.resolve.alias['next-intl/config']
    ) {
      // 如果 next-intl 的别名不存在，说明插件可能没有正确设置
      // 这里我们手动设置（但通常不应该需要）
      const filePath = path.resolve(
        config.context || process.cwd(),
        './i18n/request.ts'
      );
      config.resolve.alias['next-intl/config'] = filePath;
    }
    return config;
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
          properties: {
            className: ['anchor'],
          },
        },
      ],
      [
        rehypePrettyCode,
        {
          theme: {
            light: 'github-light',
            dark: 'github-dark',
          },
        },
      ],
    ],
  },
});

export default withNextIntl(withMDX(nextConfig));
