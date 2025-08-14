'use client';

import { useEffect } from 'react';
import { TokenTestUtils } from '../../utils/tokenTestUtils';

interface TokenTestProviderProps {
  children: React.ReactNode;
}

/**
 * Development component that sets up token testing utilities
 * Only active in development mode
 */
export const TokenTestProvider: React.FC<TokenTestProviderProps> = ({ children }) => {
  useEffect(() => {
    // Only setup test environment in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode detected - setting up token test environment');
      TokenTestUtils.setupEnhancedTestEnvironment();
    }
  }, []);

  return <>{children}</>;
};

export default TokenTestProvider;
