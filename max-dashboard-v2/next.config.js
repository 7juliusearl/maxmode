/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep static export for Cloudflare Pages
  output: 'export',
  images: { unoptimized: true },
  // Skip API routes in export (they'll be handled by Cloudflare Pages Functions)
  distDir: '.next',
}

module.exports = nextConfig
