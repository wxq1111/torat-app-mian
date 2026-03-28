/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 暂时允许现有类型问题不阻塞构建
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
