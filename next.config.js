/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'adneo.cloud' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    typedRoutes: false,
  },
  eslint: {
    // Le lint reste configuré (.eslintrc.json) et lançable via `npm run lint`,
    // mais on ne bloque pas le build de prod sur les violations du code existant.
    // À resserrer progressivement (idéalement via une CI dédiée).
    ignoreDuringBuilds: true,
  },
  // Ensure Prisma files are not excluded from standalone build
  // Note: Prisma directory will be copied separately in Dockerfile

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclure Puppeteer et ses dépendances du bundle webpack
      // Ils seront résolus en tant que modules Node.js natifs au runtime
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
        'puppeteer',
        'puppeteer-core',
        'puppeteer-extra',
        'puppeteer-extra-plugin-stealth',
        'puppeteer-extra-plugin',
        'merge-deep',
        'clone-deep',
      ]
    }
    return config
  },
}

module.exports = nextConfig
// Trigger restart for schema update