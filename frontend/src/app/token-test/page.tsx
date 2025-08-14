'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTokenExpiration } from '../../hooks/useTokenExpiration';
import { 
  isAccessTokenExpired, 
  getTokenExpirationTime, 
  getTimeUntilExpiration, 
  isTokenExpiringSoon,
  logTokenStatus 
} from '../../utils/tokenTestUtils';

// =====================================================
// TOKEN TEST PAGE
// =====================================================
// Development page to test token expiration handling

export default function TokenTestPage() {
  const { authState } = useAuth();
  const { handleTokenExpiration } = useTokenExpiration();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Update token info every 30 seconds
  useEffect(() => {
    const updateTokenInfo = () => {
      const info = {
        isExpired: isAccessTokenExpired(),
        expirationTime: getTokenExpirationTime(),
        timeUntilExpiration: getTimeUntilExpiration(),
        isExpiringSoon: isTokenExpiringSoon(),
        isAuthenticated: authState.isAuthenticated,
        hasAccessToken: !!sessionStorage.getItem('airvik_access_token'),
        hasRefreshToken: !!localStorage.getItem('airvik_refresh_token')
      };
      setTokenInfo(info);
    };

    updateTokenInfo();
    const interval = setInterval(updateTokenInfo, 30000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [authState.isAuthenticated]);

  const handleTestTokenExpiration = async () => {
    await handleTokenExpiration('TEST_EXPIRED', 'Test token expiration triggered');
  };

  const handleLogTokenStatus = () => {
    logTokenStatus();
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Token Test Page</h1>
          <p className="text-gray-600">Please log in to test token functionality</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Token Test Page</h1>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Token Status */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">Token Status</h2>
            {tokenInfo && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Is Authenticated:</span>
                  <span className={tokenInfo.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                    {tokenInfo.isAuthenticated ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Has Access Token:</span>
                  <span className={tokenInfo.hasAccessToken ? 'text-green-600' : 'text-red-600'}>
                    {tokenInfo.hasAccessToken ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Has Refresh Token:</span>
                  <span className={tokenInfo.hasRefreshToken ? 'text-green-600' : 'text-red-600'}>
                    {tokenInfo.hasRefreshToken ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Is Expired:</span>
                  <span className={tokenInfo.isExpired ? 'text-red-600' : 'text-green-600'}>
                    {tokenInfo.isExpired ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Is Expiring Soon:</span>
                  <span className={tokenInfo.isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}>
                    {tokenInfo.isExpiringSoon ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Time Until Expiration:</span>
                  <span className={tokenInfo.timeUntilExpiration !== null ? 'text-blue-600' : 'text-gray-600'}>
                    {tokenInfo.timeUntilExpiration !== null 
                      ? `${tokenInfo.timeUntilExpiration} minutes` 
                      : 'Unknown'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Expiration Time:</span>
                  <span className="text-sm text-gray-600">
                    {tokenInfo.expirationTime 
                      ? tokenInfo.expirationTime.toLocaleString() 
                      : 'Unknown'
                    }
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Test Actions */}
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">Test Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleLogTokenStatus}
                className="w-full px-4 py-2 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
              >
                Log Token Status to Console
              </button>
              
              <button
                onClick={handleTestTokenExpiration}
                className="w-full px-4 py-2 text-white transition-colors bg-red-600 rounded hover:bg-red-700"
              >
                Test Token Expiration Handler
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 mt-8 rounded-lg bg-blue-50">
          <h2 className="mb-4 text-xl font-semibold">How to Test Token Expiration</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p>1. <strong>Monitor Token Status:</strong> Watch the token status panel to see when your token expires</p>
            <p>2. <strong>Test Automatic Refresh:</strong> The system should automatically refresh tokens 13 minutes before expiration</p>
            <p>3. <strong>Test Manual Expiration:</strong> Use the "Test Token Expiration Handler" button to simulate expiration</p>
            <p>4. <strong>Check Console:</strong> Use "Log Token Status" to see detailed token information in the browser console</p>
            <p>5. <strong>Verify Logout:</strong> When tokens expire and refresh fails, you should be automatically logged out</p>
          </div>
        </div>
      </div>
    </div>
  );
}
