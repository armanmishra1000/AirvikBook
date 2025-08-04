import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AirVikBook - Hotel Management System',
  description: 'Modern hotel management system with booking, payment, and operations management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sf-pro antialiased">
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  );
}