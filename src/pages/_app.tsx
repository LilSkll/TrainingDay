/**
 * Корневой компонент приложения (Pages Router).
 *  Здесь подключаются все глобальные провайдеры.
 */
import Head from 'next/head';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { AppThemeProvider } from '@/theme/ThemeContext';
import { APP_NAME } from '@/lib/constants';
import '@/styles/globals.css';

// Inter инлайнится и оптимизируется через next/font.
// Класс вешается на <html> вручную, чтобы были доступны обе темы.
const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Класс шрифта + lang на корневом html. */}
      <style>{`html { font-family: var(--font-inter), system-ui, sans-serif; }`}</style>
      <Head>
        <title>{APP_NAME}</title>
        <meta
          name="description"
          content="Персональный ИИ-тренер, который создаёт тренировочные программы под ваши цели и уровень подготовки."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      {/* className нужен, чтобы CSS-переменная шрифта была доступна глобально. */}
      <div className={inter.variable}>
        <AppThemeProvider>
          <Component {...pageProps} />
        </AppThemeProvider>
      </div>
    </>
  );
}
