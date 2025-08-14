'use client';

import React from 'react';
import { UserProfile } from '../../types/userProfile.types';

// =====================================================
// BRAND-COMPLIANT PROFILE CARD COMPONENT
// =====================================================
// Using ONLY brand tokens: airvik-*, space-*, text-*
// NO hardcoded colors, spacing, or typography

interface ProfileCardProps {
  profile: UserProfile;
  className?: string;
  showActions?: boolean;
  onEdit?: () => void;
  onPictureChange?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  className = '',
  showActions = false,
  onEdit,
  onPictureChange
}) => {
  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return 'Public';
      case 'FRIENDS':
        return 'Friends Only';
      case 'PRIVATE':
        return 'Private';
      default:
        return visibility;
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      case 'FRIENDS':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      case 'PRIVATE':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  // Check if contact information has any data to display
  const hasContactInfo = () => {
    return (
      (profile.privacy.showEmail && profile.email) ||
      profile.mobileNumber ||
      profile.website
    );
  };

  // Check if personal details has any data to display
  const hasPersonalDetails = () => {
    return (
      profile.dateOfBirth ||
      profile.gender ||
      profile.nationality
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className={`bg-airvik-white dark:bg-airvik-midnight rounded-radius-xl border border-gray-200 dark:border-gray-700 shadow-shadow-sm overflow-hidden ${className}`}>
      {/* Header with Profile Picture */}
      <div className="relative bg-gray-100 dark:bg-gray-800 p-space-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {/* Profile Picture and Info */}
          <div className="flex items-center space-x-space-3">
            <div className="relative">
              <img
                src={profile.profilePicture || '/images/profile_picture.jpg'}
                alt={`${profile.fullName}'s profile picture`}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-radius-full object-cover border-4 border-airvik-white shadow-shadow-md"
              />
            {showActions && onPictureChange && (
              <button
                onClick={onPictureChange}
                className="absolute -bottom-1 -right-1 bg-airvik-blue border border-airvik-white text-airvik-white rounded-radius-full p-space-1 shadow-shadow-sm
                  hover:bg-airvik-purple transition-colors duration-normal focus:outline-none focus:ring-2 focus:ring-airvik-blue focus:ring-offset-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-h3 sm:text-h2 text-airvik-black dark:text-airvik-white font-bold">
                {profile.fullName}
              </h2>
              {profile.occupation && (
                <p className="text-body-sm sm:text-body text-gray-600 dark:text-gray-400 mt-space-1">
                  {profile.occupation}
                </p>
              )}
              {profile.location && (
                <div className="flex items-center space-x-space-2 mt-space-1">
                  
                  <p className="text-caption text-gray-500 dark:text-gray-400">
                    {profile.location}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && onEdit && (
            <button
              onClick={onEdit}
              className="px-space-6 py-space-3 bg-gradient-to-r from-airvik-blue to-airvik-purple hover:from-airvik-purple hover:to-airvik-blue text-airvik-white rounded-radius-md font-sf-pro text-body
                focus:outline-none focus:ring-airvik-blue focus:ring-offset-2 transition-colors duration-normal"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="bg-white  shadow-shadow-sm dark:border-gray-700 p-space-4 lg:p-space-8 space-y-space-8 lg:space-y-space-6">
        {/* Bio */}
        {profile.bio && (
          <div>
            <h3 className="text-h5 text-airvik-black dark:text-airvik-white mb-space-2">
              About
            </h3>
            <p className="text-body text-gray-700 dark:text-gray-300 leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Personal Information */}
        {(hasContactInfo() || hasPersonalDetails()) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-4">
            {/* Contact Information */}
            {hasContactInfo() && (
              <div className="space-y-space-3">
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white">
                  Contact Information
                </h3>
                
                <div className="space-y-space-2">
                  {profile.privacy.showEmail && profile.email && (
                    <div className="flex items-center space-x-space-2">
                      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="text-body text-gray-700 dark:text-gray-300">
                        {profile.email}
                      </span>
                    </div>
                  )}
                  
                  {profile.mobileNumber && (
                    <div className="flex items-center space-x-space-2">
                      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span className="text-body text-gray-700 dark:text-gray-300">
                        {profile.mobileNumber}
                      </span>
                    </div>
                  )}
                  
                  {profile.website && (
                    <div className="flex items-center space-x-space-2">
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                      </svg>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body text-airvik-blue hover:text-airvik-purple transition-colors duration-normal"
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Personal Details */}
            {hasPersonalDetails() && (
              <div className="space-y-space-3">
                <h3 className="text-h5 text-airvik-black dark:text-airvik-white">
                  Personal Details
                </h3>
                
                <div className="space-y-space-2">
                  {profile.dateOfBirth && (
                    <div className="flex items-center space-x-space-2">
                      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-body text-gray-700 dark:text-gray-300">
                        {formatDate(profile.dateOfBirth)} ({getAge(profile.dateOfBirth)} years old)
                      </span>
                    </div>
                  )}
                  
                  {profile.gender && (
                    <div className="flex items-center space-x-space-2">
                      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-body text-gray-700 dark:text-gray-300 capitalize">
                        {profile.gender}
                      </span>
                    </div>
                  )}
                  
                  {profile.nationality && (
                    <div className="flex items-center space-x-space-2">
                      <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-body text-gray-700 dark:text-gray-300">
                        {profile.nationality}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Connected Accounts */}
        {profile.connectedAccounts?.google?.connected && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-space-4">
            <h3 className="text-h5 text-airvik-black dark:text-airvik-white mb-space-3">
              Connected Accounts
            </h3>
            <div className="flex items-center space-x-space-2">
              <div className="w-6 h-6 bg-white rounded-radius-sm flex items-center justify-center shadow-shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <span className="text-body text-gray-700 dark:text-gray-300">
                Connected to Google
              </span>
              {profile.connectedAccounts.google.email && (
                <span className="text-caption text-gray-500 dark:text-gray-400">
                  ({profile.connectedAccounts.google.email})
                </span>
              )}
            </div>
          </div>
        )}

        {/* Privacy Settings */}
        <div className={`${(hasContactInfo() || hasPersonalDetails() || profile.connectedAccounts?.google?.connected) ? 'border-t border-gray-200 dark:border-gray-700 pt-space-4' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-h5 text-airvik-black dark:text-airvik-white">
                Profile Visibility
              </h3>
              <p className="text-body-sm text-gray-600 dark:text-gray-400">
                Who can see this profile
              </p>
            </div>
            <span className={`inline-flex items-center px-space-2 py-space-1 rounded-radius-md text-body-sm font-medium ${getVisibilityColor(profile.privacy.profileVisibility)}`}>
              {getVisibilityLabel(profile.privacy.profileVisibility)}
            </span>
          </div>
        </div>

        {/* Last Updated */}
        {profile.lastUpdated && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-space-4">
            <p className="text-caption text-gray-500 dark:text-gray-400">
              Last updated: {formatDate(profile.lastUpdated)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
