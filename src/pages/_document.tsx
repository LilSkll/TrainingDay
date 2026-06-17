/**
 * Документ: <html>, базовые мета-теги.
 *  Шрифт подключается в _app.tsx через next/font — здесь этого делать нельзя.
 */
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ru">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
