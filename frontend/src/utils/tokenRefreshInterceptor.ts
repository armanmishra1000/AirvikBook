import { UserLoginService } from '../services/userLogin.service';
import { isSuccessResponse } from '../types/userLogin.types';
import { AUTH_CONFIG } from '../lib/config';

class TokenRefreshInterceptor {
  private static isRefreshing = false;
  private static refreshPromise: Promise<any> | null = null;

  static async interceptRequest(requestFn: () => Promise<any>): Promise<any> {
    try {
      // Check if token is expired before making request
      if (UserLoginService.isTokenExpired()) {
        console.log('Token expired, refreshing before request...');
        await this.refreshToken();
      }

      // Make the original request
      const response = await requestFn();
      
      // If request fails with 401, try to refresh token and retry
      if (response && !response.success && response.code === 'TOKEN_EXPIRED') {
        console.log('Request failed with TOKEN_EXPIRED, refreshing and retrying...');
        await this.refreshToken();
        return await requestFn();
      }

      return response;
    } catch (error) {
      console.error('Request interceptor error:', error);
      throw error;
    }
  }

  private static async refreshToken(): Promise<void> {
    if (this.isRefreshing) {
      // Wait for existing refresh to complete
      await this.refreshPromise;
      return;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performRefresh();

    try {
      await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private static async performRefresh(): Promise<void> {
    const result = await UserLoginService.refreshToken();
    
    if (!isSuccessResponse(result)) {
      // Refresh failed, redirect to login
      UserLoginService.clearAuthData();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Token refresh failed');
    }
  }
}

export default TokenRefreshInterceptor;
