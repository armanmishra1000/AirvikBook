'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ActiveSession,
  isSuccessResponse,
  LOGIN_ERROR_CODES
} from '../../types/userLogin.types';

// =====================================================
// SESSION MANAGEMENT COMPONENT
// =====================================================
// Brand-compliant component using ONLY airvik-* tokens

interface SessionManagerProps {
  className?: string;
  showCurrentSessionFirst?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  className = '',
  showCurrentSessionFirst = true,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const { getSessions, logoutFromDevice, logoutFromAllDevices, authState } = useAuth();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogoutLoading, setIsLogoutLoading] = useState<string | null>(null);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, []);

  // =====================================================
  // SESSION LOADING & MANAGEMENT
  // =====================================================

  const loadSessions = async () => {
    try {
      const result = await getSessions();
      
      if (isSuccessResponse(result) && mountedRef.current) {
        let sessionList = result.data.sessions;
        
        // Sort sessions - current session first if requested
        if (showCurrentSessionFirst) {
          sessionList = sessionList.sort((a, b) => {
            if (a.isCurrent && !b.isCurrent) return -1;
            if (!a.isCurrent && b.isCurrent) return 1;
            return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
          });
        }
        
        setSessions(sessionList);
        setError(null);
      } else if (mountedRef.current) {
        setError(result.error || 'Failed to load sessions');
      }
    } catch (error) {
      if (mountedRef.current) {
        setError('Network error while loading sessions');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Initial load
  useEffect(() => {
    loadSessions();
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      autoRefreshRef.current = setInterval(loadSessions, refreshInterval);
      
      return () => {
        if (autoRefreshRef.current) {
          clearInterval(autoRefreshRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval]);

  // =====================================================
  // SESSION ACTIONS
  // =====================================================

  const handleLogoutFromDevice = async (sessionId: string) => {
    setIsLogoutLoading(sessionId);
    
    try {
      const result = await logoutFromDevice(sessionId);
      
      if (isSuccessResponse(result)) {
        // Remove the session from local state
        setSessions(prev => prev.filter(session => session.id !== sessionId));
      } else {
        setError(result.error || 'Failed to logout from device');
      }
    } catch (error) {
      setError('Network error during logout');
    } finally {
      setIsLogoutLoading(null);
    }
  };

  const handleLogoutFromAllDevices = async () => {
    setShowLogoutAllConfirm(false);
    setIsLogoutLoading('all');
    
    try {
      const result = await logoutFromAllDevices();
      
      if (isSuccessResponse(result)) {
        // Clear all sessions since user is logged out
        setSessions([]);
        // The auth context will handle the global logout state
      } else {
        setError(result.error || 'Failed to logout from all devices');
      }
    } catch (error) {
      setError('Network error during logout');
    } finally {
      setIsLogoutLoading(null);
    }
  };

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  const formatLastActivity = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getDeviceIcon = (deviceName: string): JSX.Element => {
    const name = deviceName.toLowerCase();
    
    if (name.includes('iphone') || name.includes('android')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4zm2.5 10a.5.5 0 000 1h3a.5.5 0 000-1h-3z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (name.includes('ipad') || name.includes('tablet')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zM5 4a1 1 0 011-1h8a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4zm4.5 11a.5.5 0 000 1h1a.5.5 0 000-1h-1z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // Default to desktop/laptop
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1h-4v1h2a1 1 0 110 2H6a1 1 0 110-2h2v-1H4a1 1 0 01-1-1V4zm1 1v6h12V5H4z" clipRule="evenodd" />
      </svg>
    );
  };

  // =====================================================
  // RENDER COMPONENT
  // =====================================================

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse space-y-space-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-radius-md w-1/3" />
          <div className="space-y-space-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-radius-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-space-6">
        <div>
          <h2 className="text-h3 font-sf-pro text-airvik-black dark:text-airvik-white">
            Active Sessions
          </h2>
          <p className="text-body text-gray-600 dark:text-gray-400 mt-space-1">
            Manage your active sessions across devices
          </p>
        </div>
        
        {sessions.length > 1 && (
          <button
            onClick={() => setShowLogoutAllConfirm(true)}
            disabled={isLogoutLoading === 'all'}
            className="px-space-4 py-space-2 bg-error text-airvik-white rounded-radius-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-normal font-sf-pro text-button"
          >
            {isLogoutLoading === 'all' ? 'Logging Out...' : 'Logout All Devices'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-space-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-radius-md p-space-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-error mr-space-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-body text-error">{error}</p>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="text-center py-space-12">
          <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-space-4">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1h-4v1h2a1 1 0 110 2H6a1 1 0 110-2h2v-1H4a1 1 0 01-1-1V4zm1 1v6h12V5H4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-h5 font-sf-pro text-gray-900 dark:text-gray-100 mb-space-2">
            No Active Sessions
          </h3>
          <p className="text-body text-gray-500 dark:text-gray-400">
            You don't have any active sessions at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-space-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`relative border rounded-radius-lg p-space-4 transition-all duration-normal hover:shadow-md
                ${session.isCurrent 
                  ? 'border-airvik-blue bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 bg-airvik-white dark:bg-gray-800'
                }`}
            >
              {/* Current Session Badge */}
              {session.isCurrent && (
                <div className="absolute top-space-2 right-space-2">
                  <span className="inline-flex items-center px-space-2 py-space-1 rounded-radius-full text-caption font-sf-pro font-medium bg-airvik-blue text-airvik-white">
                    Current Session
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-space-4 flex-1">
                  {/* Device Icon */}
                  <div className="flex-shrink-0 mt-space-1">
                    <div className={`p-space-2 rounded-radius-md ${session.isCurrent ? 'bg-airvik-blue text-airvik-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      {getDeviceIcon(session.deviceInfo.deviceName)}
                    </div>
                  </div>

                  {/* Session Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-space-2 mb-space-1">
                      <h4 className="text-h6 font-sf-pro text-airvik-black dark:text-airvik-white truncate">
                        {session.deviceInfo.deviceName}
                      </h4>
                    </div>
                    
                    <div className="space-y-space-1 text-body text-gray-600 dark:text-gray-400">
                      <p>Last activity: {formatLastActivity(session.lastActivity)}</p>
                      {session.ipAddress && (
                        <p>IP Address: {session.ipAddress}</p>
                      )}
                      {session.location && (
                        <p>Location: {session.location}</p>
                      )}
                      <p className="text-caption">
                        Started: {new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                {!session.isCurrent && (
                  <div className="flex-shrink-0 ml-space-4">
                    <button
                      onClick={() => handleLogoutFromDevice(session.id)}
                      disabled={isLogoutLoading === session.id}
                      className="px-space-3 py-space-2 text-caption border border-gray-300 dark:border-gray-600 rounded-radius-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-normal font-sf-pro"
                    >
                      {isLogoutLoading === session.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin h-3 w-3 mr-space-1 border border-gray-400 border-t-transparent rounded-radius-full" />
                          Logging out...
                        </div>
                      ) : (
                        'Logout'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-space-8 p-space-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-radius-md">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-airvik-blue mt-space-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-space-3">
            <h4 className="text-label font-sf-pro text-airvik-blue mb-space-1">
              Security Notice
            </h4>
            <p className="text-body text-airvik-blue">
              We'll send you an email notification when someone logs into your account from a new device. 
              If you see any unfamiliar sessions, logout from them immediately and consider changing your password.
            </p>
          </div>
        </div>
      </div>

      {/* Logout All Confirmation Modal */}
      {showLogoutAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-space-4">
          <div className="bg-airvik-white dark:bg-gray-800 rounded-radius-lg p-space-6 max-w-md w-full">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-radius-full bg-red-100 dark:bg-red-900/20 mb-space-4">
                <svg className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h3 className="text-h4 font-sf-pro text-airvik-black dark:text-airvik-white mb-space-2">
                Logout from All Devices?
              </h3>
              
              <p className="text-body text-gray-600 dark:text-gray-400 mb-space-6">
                This will end all active sessions across all your devices. You'll need to log in again on each device.
              </p>
              
              <div className="flex space-x-space-4">
                <button
                  onClick={() => setShowLogoutAllConfirm(false)}
                  className="flex-1 px-space-4 py-space-2 border border-gray-300 dark:border-gray-600 rounded-radius-md text-airvik-black dark:text-airvik-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-normal font-sf-pro text-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutFromAllDevices}
                  className="flex-1 px-space-4 py-space-2 bg-error text-airvik-white rounded-radius-md hover:bg-red-700 transition-colors duration-normal font-sf-pro text-button"
                >
                  Logout All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionManager;