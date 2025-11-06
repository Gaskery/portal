/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Segurança - Headers HTTP
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // HSTS - Force HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // Prevenir Clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          },
          // XSS Protection
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },

  // Configurações de imagens
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },

  // Webpack config (se necessário)
  webpack: (config) => {
    return config;
  },

  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_APP_NAME: 'Portal Microsoft 365',
  },
};

export default nextConfig;
