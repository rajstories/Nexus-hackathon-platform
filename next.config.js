/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  output: 'standalone',
  
  // Azure App Service configuration
  compress: true,
  poweredByHeader: false,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID,
  },
  
  // Webpack configuration for server-side modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  
  // Image optimization for Azure
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
  },
  
  // External packages for server components
  serverExternalPackages: ['mongoose', 'mssql', '@azure/storage-blob'],
};