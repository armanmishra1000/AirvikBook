import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/common/Toast';
import ErrorBoundary from '../components/common/ErrorBoundary';
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
      <body className="antialiased font-sf-pro" suppressHydrationWarning={true}>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <main className="min-h-screen bg-white dark:bg-airvik-midnight">
                {children}
              </main>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}