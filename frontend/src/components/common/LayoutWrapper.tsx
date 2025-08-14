'use client';

import React from 'react';
import { Header } from './Header';
import { FloatingLogout } from './FloatingLogout';
import { useLogoutShortcut } from '../../hooks/useLogoutShortcut';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  useLogoutShortcut(); // Enable keyboard shortcut

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <FloatingLogout />
    </div>
  );
};
