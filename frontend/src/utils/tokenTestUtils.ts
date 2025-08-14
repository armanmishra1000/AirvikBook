
// =====================================================
// TOKEN TEST UTILITIES
// =====================================================
// Utilities to help test token refresh functionality during development

import { UserLoginService } from '../services/userLogin.service';

/**
 * Utility functions for testing token expiration scenarios
 * These functions help simulate and test token expiration handling
 */

/**
 * Check if the current access token is expired
 */
export const isAccessTokenExpired = (): boolean => {
  return UserLoginService.isTokenExpired();
};

/**
 * Get token expiration time (for debugging)
 */
export const getTokenExpirationTime = (): Date | null => {
  try {
    const token = sessionStorage.getItem('airvik_access_token');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return new Date(exp);
  } catch {
    return null;
  }
};

/**
 * Get time until token expires (in minutes)
 */
export const getTimeUntilExpiration = (): number | null => {
  const expirationTime = getTokenExpirationTime();
  if (!expirationTime) return null;

  const now = new Date();
  const timeUntilExpiration = expirationTime.getTime() - now.getTime();
  return Math.ceil(timeUntilExpiration / (1000 * 60)); // Convert to minutes
};

/**
 * Check if token will expire soon (within 5 minutes)
 */
export const isTokenExpiringSoon = (): boolean => {
  const timeUntilExpiration = getTimeUntilExpiration();
  return timeUntilExpiration !== null && timeUntilExpiration <= 5;
};

/**
 * Log current token status for debugging
 */
export const logTokenStatus = (): void => {
  const isExpired = isAccessTokenExpired();
  const expirationTime = getTokenExpirationTime();
  const timeUntilExpiration = getTimeUntilExpiration();
  const isExpiringSoon = isTokenExpiringSoon();

  console.log('=== Token Status ===');
  console.log('Is Expired:', isExpired);
  console.log('Expiration Time:', expirationTime);
  console.log('Time Until Expiration (minutes):', timeUntilExpiration);
  console.log('Is Expiring Soon:', isExpiringSoon);
  console.log('===================');
};

export class TokenTestUtils {
  /**
   * Manually trigger token refresh for testing
   */
  static async testTokenRefresh(): Promise<boolean> {
    try {
      const { UserLoginService } = await import('../services/userLogin.service');
      const result = await UserLoginService.refreshToken();
      
      if (result.success && result.data) {
        console.log('✅ Manual token refresh test: SUCCESS');
        console.log('New access token:', result.data.accessToken.substring(0, 20) + '...');
        return true;
      } else {
        console.log('❌ Manual token refresh test: FAILED');
        console.log('Error:', result.error);
        console.log('Code:', result.code);
        return false;
      }
    } catch (error) {
      console.log('❌ Manual token refresh test: ERROR');
      console.error(error);
      return false;
    }
  }

  /**
   * Check current token status
   */
  static checkTokenStatus(): {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    accessTokenExpiry?: Date;
    isExpired: boolean;
  } {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof sessionStorage === 'undefined' || typeof localStorage === 'undefined') {
        return {
          hasAccessToken: false,
          hasRefreshToken: false,
          isExpired: true
        };
      }

      const accessToken = sessionStorage.getItem('airvik_access_token');
      const refreshToken = localStorage.getItem('airvik_refresh_token');
      
      let accessTokenExpiry: Date | undefined;
      let isExpired = false;
      
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          accessTokenExpiry = new Date(payload.exp * 1000);
          isExpired = Date.now() >= accessTokenExpiry.getTime();
        } catch {
          isExpired = true;
        }
      }
      
      return {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenExpiry,
        isExpired
      };
    } catch (error) {
      console.error('Error checking token status:', error);
      return {
        hasAccessToken: false,
        hasRefreshToken: false,
        isExpired: true
      };
    }
  }

  /**
   * Manually expire access token for testing
   */
  static expireAccessToken(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
        console.log('🔧 Cannot expire token - not in browser environment');
        return;
      }

      const accessToken = sessionStorage.getItem('airvik_access_token');
      if (accessToken) {
        // Modify the token to make it expired
        const parts = accessToken.split('.');
        const payload = JSON.parse(atob(parts[1]));
        payload.exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
        parts[1] = btoa(JSON.stringify(payload));
        const expiredToken = parts.join('.');
        sessionStorage.setItem('airvik_access_token', expiredToken);
        console.log('🔧 Manually expired access token for testing');
      }
    } catch (error) {
      console.error('Error expiring access token:', error);
    }
  }

  /**
   * Clear refresh token for testing failed refresh
   */
  static clearRefreshToken(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        console.log('🔧 Cannot clear refresh token - not in browser environment');
        return;
      }

      localStorage.removeItem('airvik_refresh_token');
      console.log('🔧 Cleared refresh token for testing');
    } catch (error) {
      console.error('Error clearing refresh token:', error);
    }
  }

  /**
   * Log current authentication state
   */
  static logAuthState(): void {
    const status = this.checkTokenStatus();
    console.log('🔍 Current Authentication State:');
    console.log('- Has Access Token:', status.hasAccessToken);
    console.log('- Has Refresh Token:', status.hasRefreshToken);
    console.log('- Access Token Expiry:', status.accessTokenExpiry);
    console.log('- Is Expired:', status.isExpired);
    
    if (status.accessTokenExpiry) {
      const timeUntilExpiry = status.accessTokenExpiry.getTime() - Date.now();
      const minutesUntilExpiry = Math.floor(timeUntilExpiry / 1000 / 60);
      console.log('- Minutes Until Expiry:', minutesUntilExpiry);
    }
  }

  /**
   * Comprehensive test of the entire token refresh system
   */
  static async runComprehensiveTest(): Promise<void> {
    console.log('🧪 Running comprehensive token refresh system test...');
    
    const results = {
      tokenStatus: false,
      refreshCapability: false,
      profileLoad: false,
      errorHandling: false
    };

    try {
      // Test 1: Check token status
      console.log('\n📋 Test 1: Token Status Check');
      const status = this.checkTokenStatus();
      console.log('Token Status:', status);
      results.tokenStatus = status.hasAccessToken && status.hasRefreshToken;

      // Test 2: Test token refresh capability
      console.log('\n🔄 Test 2: Token Refresh Capability');
      const refreshResult = await this.testTokenRefresh();
      results.refreshCapability = refreshResult;

      // Test 3: Test profile loading
      console.log('\n👤 Test 3: Profile Loading');
      try {
        const { UserProfileService } = await import('../services/userProfile.service');
        const profileResult = await UserProfileService.getProfile(true);
        results.profileLoad = profileResult.success;
        console.log('Profile Load Result:', profileResult.success ? 'SUCCESS' : 'FAILED');
        if (!profileResult.success) {
          console.log('Profile Error:', profileResult.error);
        }
      } catch (error) {
        console.log('Profile Load Error:', error);
        results.profileLoad = false;
      }

      // Test 4: Test error handling with expired token
      console.log('\n⚠️ Test 4: Error Handling');
      try {
        // Manually expire token
        this.expireAccessToken();
        console.log('Token manually expired for testing');
        
        // Try to load profile with expired token
        const { UserProfileService } = await import('../services/userProfile.service');
        const expiredResult = await UserProfileService.getProfile(true);
        
        if (expiredResult.success) {
          console.log('✅ Error handling: SUCCESS - Token was automatically refreshed');
          results.errorHandling = true;
        } else {
          console.log('❌ Error handling: FAILED - Token refresh did not work');
          results.errorHandling = false;
        }
      } catch (error) {
        console.log('❌ Error handling: EXCEPTION', error);
        results.errorHandling = false;
      }

      // Summary
      console.log('\n📊 Test Summary:');
      console.log('Token Status:', results.tokenStatus ? '✅ PASS' : '❌ FAIL');
      console.log('Refresh Capability:', results.refreshCapability ? '✅ PASS' : '❌ FAIL');
      console.log('Profile Loading:', results.profileLoad ? '✅ PASS' : '❌ FAIL');
      console.log('Error Handling:', results.errorHandling ? '✅ PASS' : '❌ FAIL');

      const allPassed = Object.values(results).every(result => result);
      console.log('\n🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

    } catch (error) {
      console.error('❌ Comprehensive test failed:', error);
    }
  }

  /**
   * Setup enhanced test environment
   */
  static setupEnhancedTestEnvironment(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('🧪 Test environment setup skipped - not in browser environment');
      return;
    }

    console.log('🧪 Setting up enhanced token refresh test environment...');
    this.logAuthState();
    
    // Add test functions to window for easy access
    (window as any).testTokenRefresh = this.testTokenRefresh;
    (window as any).checkTokenStatus = this.checkTokenStatus;
    (window as any).expireAccessToken = this.expireAccessToken;
    (window as any).clearRefreshToken = this.clearRefreshToken;
    (window as any).logAuthState = this.logAuthState;
    (window as any).simulatePageRefresh = this.simulatePageRefresh;
    (window as any).testTokenRefreshFlow = this.testTokenRefreshFlow;
    (window as any).runComprehensiveTest = this.runComprehensiveTest;
    
    console.log('✅ Enhanced test environment ready!');
    console.log('Available test functions:');
    console.log('- window.testTokenRefresh() - Test manual token refresh');
    console.log('- window.checkTokenStatus() - Check current token status');
    console.log('- window.expireAccessToken() - Manually expire access token');
    console.log('- window.clearRefreshToken() - Clear refresh token');
    console.log('- window.logAuthState() - Log current auth state');
    console.log('- window.simulatePageRefresh() - Simulate page refresh scenario');
    console.log('- window.testTokenRefreshFlow() - Test complete token refresh flow');
    console.log('- window.runComprehensiveTest() - Run comprehensive system test');
  }

  /**
   * Simulate page refresh scenario
   */
  static async simulatePageRefresh(): Promise<void> {
    console.log('🧪 Simulating page refresh scenario...');
    
    // Check current state
    this.logAuthState();
    
    // Try to load profile (this should trigger token refresh if needed)
    try {
      const { UserProfileService } = await import('../services/userProfile.service');
      const result = await UserProfileService.getProfile(true); // Force cache bust
      
      if (result.success) {
        console.log('✅ Page refresh simulation: SUCCESS');
        console.log('Profile loaded successfully after refresh');
      } else {
        console.log('❌ Page refresh simulation: FAILED');
        console.log('Error:', result.error);
        console.log('Code:', result.code);
      }
    } catch (error) {
      console.log('❌ Page refresh simulation: ERROR');
      console.error(error);
    }
  }

  /**
   * Test token refresh flow
   */
  static async testTokenRefreshFlow(): Promise<void> {
    console.log('🧪 Testing complete token refresh flow...');
    
    // Step 1: Check current state
    this.logAuthState();
    
    // Step 2: Try to refresh token
    const refreshResult = await this.testTokenRefresh();
    
    if (refreshResult) {
      // Step 3: Try to load profile
      const { UserProfileService } = await import('../services/userProfile.service');
      const profileResult = await UserProfileService.getProfile(true);
      
      if (profileResult.success) {
        console.log('✅ Complete flow test: SUCCESS');
      } else {
        console.log('❌ Complete flow test: PROFILE_LOAD_FAILED');
        console.log('Profile error:', profileResult.error);
      }
    } else {
      console.log('❌ Complete flow test: REFRESH_FAILED');
    }
  }
}

// Note: Test environment setup is now handled by TokenTestProvider component

export default TokenTestUtils;
