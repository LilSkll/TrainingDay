/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Разрешаем MUI/Emotion корректно работать с Next.js App Router.
  // Никаких внешних БД / API на MVP не подключаем — всё хранится локально.
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
};

module.exports = nextConfig;
