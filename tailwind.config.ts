import type { Config } from 'tailwindcss';

/**
 * Конфиг TailwindCSS.
 *
 * Внимание: стили MUI и Tailwind намеренно разделены.
 *  - MUI используем для всех интерактивных компонентов (кнопки, поля, карточки).
 *  - Tailwind — для утилитарной вёрстки (отступы, flex, типографикаhero-секции),
 *    при этом мы intentionally отключаем базовый reset (preflight: false),
 *    чтобы он не конфликтовал с CssBaseline из MUI.
 */
const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  corePlugins: {
    // MUI уже сбрасывает дефолтные стили через CssBaseline.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
