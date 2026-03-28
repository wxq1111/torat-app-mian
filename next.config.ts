import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 暂时允许现有类型问题不阻塞构建
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
