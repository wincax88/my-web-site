import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    if (isServer) {
      // 外部化 ws 和相关模块，避免 webpack 打包原生依赖
      config.externals = config.externals || [];
      config.externals.push({
        ws: 'commonjs ws',
        bufferutil: 'commonjs bufferutil',
        'utf-8-validate': 'commonjs utf-8-validate',
      });
    } else {
      // 客户端配置：确保 lunr 正确打包
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
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

export default withMDX(nextConfig);
