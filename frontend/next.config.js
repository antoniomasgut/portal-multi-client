/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // necessari per al Dockerfile multi-stage
  reactStrictMode: true,
  i18n: {
    locales: ['ca', 'es', 'en'],
    defaultLocale: 'ca',
  },
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
