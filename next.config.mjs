import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  outputFileTracingRoot: path.join(process.cwd()),
};

export default nextConfig;
