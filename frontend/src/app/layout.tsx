import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../components/common/Toast';
import ErrorBoundary from '../components/common/ErrorBoundary';
import TokenTestProvider from '../components/dev/TokenTestProvider';
import { LayoutWrapper } from '../components/common/LayoutWrapper';
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
              <TokenTestProvider />
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}