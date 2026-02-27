import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Trello Clone',
  description:
    'A task management application built with Next.js, TypeScript, and SCSS'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
