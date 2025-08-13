
// =====================================================
// TOKEN TEST UTILITIES
// =====================================================
// Utilities to help test token refresh functionality during development

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
   * Setup test environment
   */
  static setupTestEnvironment(): void {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('🧪 Test environment setup skipped - not in browser environment');
      return;
    }

    console.log('🧪 Setting up token refresh test environment...');
    this.logAuthState();
    
    // Add test functions to window for easy access
    (window as any).testTokenRefresh = this.testTokenRefresh;
    (window as any).checkTokenStatus = this.checkTokenStatus;
    (window as any).expireAccessToken = this.expireAccessToken;
    (window as any).clearRefreshToken = this.clearRefreshToken;
    (window as any).logAuthState = this.logAuthState;
    
    console.log('✅ Test environment ready!');
    console.log('Available test functions:');
    console.log('- window.testTokenRefresh() - Test manual token refresh');
    console.log('- window.checkTokenStatus() - Check current token status');
    console.log('- window.expireAccessToken() - Manually expire access token');
    console.log('- window.clearRefreshToken() - Clear refresh token');
    console.log('- window.logAuthState() - Log current auth state');
  }
}

// Note: Test environment setup is now handled by TokenTestProvider component

export default TokenTestUtils;
