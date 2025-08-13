'use client';

import { useEffect } from 'react';

// =====================================================
// TOKEN TEST PROVIDER
// =====================================================
// Client-side component to setup test utilities in development

export function TokenTestProvider() {
  useEffect(() => {
    // Only import and setup test utilities in development
    if (process.env.NODE_ENV === 'development') {
      import('../../utils/tokenTestUtils').then(({ TokenTestUtils }) => {
        TokenTestUtils.setupTestEnvironment();
      }).catch((error) => {
        console.warn('Failed to setup token test utilities:', error);
      });
    }
  }, []);

  return null; // This component doesn't render anything
}

export default TokenTestProvider;
