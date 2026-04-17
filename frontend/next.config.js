/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // necessari per al Dockerfile multi-stage
  reactStrictMode: true,
  // i18n per App Router es gestiona a nivell d'app (Mòdul 10), no aquí
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
}

module.exports = nextConfig
