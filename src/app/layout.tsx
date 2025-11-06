/**
 * Root Layout - Portal Microsoft 365
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Portal Microsoft 365',
  description: 'Sistema de Gestão de Licenças Microsoft 365',
  keywords: ['Microsoft 365', 'Gestão', 'Licenças', 'Suporte'],
  authors: [{ name: 'Sua Empresa' }],
  robots: 'noindex, nofollow', // Prevenir indexação em dev
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
