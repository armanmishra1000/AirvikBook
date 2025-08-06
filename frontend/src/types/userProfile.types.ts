// =====================================================
// USER PROFILE TYPES - LOCAL INTERFACES ONLY
// =====================================================
// CRITICAL: NEVER import from shared/contracts/
// All types must be defined locally to avoid build failures

// =====================================================
// API RESPONSE WRAPPER TYPES
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  message?: string;
  details?: any;
}

// Type Guards for API Response Safety
export const isSuccessResponse = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } => {
  return response.success === true && response.data !== undefined;
};

export const isErrorResponse = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false; error: string } => {
  return response.success === false && response.error !== undefined;
};

// =====================================================
// REQUEST TYPES
// =====================================================

export interface ProfileUpdateRequest {
  fullName?: string;
  mobileNumber?: string;
  bio?: string;
  dateOfBirth?: string; // ISO date string
  gender?: string;
  nationality?: string;
  occupation?: string;
  website?: string;
  location?: string;
}

export interface PrivacyUpdateRequest {
  profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  showEmail?: boolean;
  showPhone?: boolean;
  allowGoogleSync?: boolean;
}

export interface GoogleConnectionRequest {
  googleToken: string;
}

export interface ProfilePictureUploadRequest {
  picture: File; // Image file (jpg, jpeg, png, webp)
}

// =====================================================
// RESPONSE DATA TYPES
// =====================================================

export interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  showEmail: boolean;
  showPhone: boolean;
  allowGoogleSync: boolean;
}

export interface ConnectedAccount {
  connected: boolean;
  email?: string;
  connectedAt?: string;
  disconnectedAt?: string;
}

export interface ConnectedAccounts {
  google?: ConnectedAccount;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  mobileNumber?: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  occupation?: string;
  website?: string;
  location?: string;
  googleId?: string;
  profilePictureSource?: 'UPLOAD' | 'GOOGLE' | 'DEFAULT';
  privacy: PrivacySettings;
  connectedAccounts: ConnectedAccounts;
  lastUpdated: string;
}

export interface ProfileUpdateResponse {
  user: UserProfile;
  changesApplied: string[];
}

export interface PrivacyUpdateResponse {
  privacy: PrivacySettings;
  updatedAt: string;
}

export interface ProfilePictureUpload {
  profilePicture: string;
  profilePictureSource: string;
  uploadedAt: string;
  fileSize: number;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface ProfilePictureSync {
  profilePicture: string;
  profilePictureSource: string;
  syncedAt: string;
  googlePictureUrl: string;
}

export interface ProfilePictureStatus {
  hasPicture: boolean;
  pictureUrl?: string;
  pictureSource?: string;
  lastUpdated?: string;
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface GoogleConnectionResponse {
  connectedAccounts: ConnectedAccounts;
  profileUpdates?: {
    profilePicture?: string;
    fullName?: string;
  };
}

export interface GoogleDisconnectionResponse {
  connectedAccounts: ConnectedAccounts;
  profileChanges: {
    profilePictureSource: string;
    googleSyncDisabled: boolean;
  };
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

export type GetProfileApiResponse = ApiResponse<UserProfile>;
export type UpdateProfileApiResponse = ApiResponse<ProfileUpdateResponse>;
export type UpdatePrivacyApiResponse = ApiResponse<PrivacyUpdateResponse>;
export type UploadPictureApiResponse = ApiResponse<ProfilePictureUpload>;
export type SyncPictureApiResponse = ApiResponse<ProfilePictureSync>;
export type DeletePictureApiResponse = ApiResponse<{ deleted: boolean }>;
export type PictureStatusApiResponse = ApiResponse<ProfilePictureStatus>;
export type ConnectGoogleApiResponse = ApiResponse<GoogleConnectionResponse>;
export type DisconnectGoogleApiResponse = ApiResponse<GoogleDisconnectionResponse>;

// =====================================================
// FORM TYPES
// =====================================================

export interface ProfileFormData {
  fullName: string;
  mobileNumber: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  occupation: string;
  website: string;
  location: string;
}

export interface ProfileFormErrors {
  fullName?: string;
  mobileNumber?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  occupation?: string;
  website?: string;
  location?: string;
  general?: string;
}

export interface ProfileFormState {
  data: ProfileFormData;
  errors: ProfileFormErrors;
  isSubmitting: boolean;
  isValid: boolean;
  hasChanges: boolean;
}

export interface PrivacyFormData {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
  showEmail: boolean;
  showPhone: boolean;
  allowGoogleSync: boolean;
}

export interface PrivacyFormErrors {
  profileVisibility?: string;
  showEmail?: string;
  showPhone?: string;
  allowGoogleSync?: string;
  general?: string;
}

export interface PrivacyFormState {
  data: PrivacyFormData;
  errors: PrivacyFormErrors;
  isSubmitting: boolean;
  isValid: boolean;
  hasChanges: boolean;
}

// =====================================================
// COMPONENT PROPS TYPES
// =====================================================

export interface ProfileFormProps {
  initialData?: UserProfile;
  onSubmit: (data: ProfileUpdateRequest) => Promise<void>;
  isLoading: boolean;
  error?: string;
  className?: string;
}

export interface PrivacyFormProps {
  initialData?: PrivacySettings;
  onSubmit: (data: PrivacyUpdateRequest) => Promise<void>;
  isLoading: boolean;
  error?: string;
  className?: string;
}

export interface ProfilePictureUploadProps {
  currentPicture?: string;
  onUpload: (file: File) => Promise<void>;
  onSyncGoogle: () => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading: boolean;
  error?: string;
  className?: string;
}

export interface GoogleConnectionProps {
  isConnected: boolean;
  googleEmail?: string;
  onConnect: (token: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  isLoading: boolean;
  error?: string;
  className?: string;
}

export interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface ProfileFieldProps {
  label: string;
  value?: string;
  isEditable?: boolean;
  onEdit?: () => void;
  className?: string;
}

// =====================================================
// ERROR TYPES
// =====================================================

export const PROFILE_ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
  INVALID_PRIVACY_SETTING: 'INVALID_PRIVACY_SETTING',
  GOOGLE_NOT_CONNECTED: 'GOOGLE_NOT_CONNECTED',
  GOOGLE_ACCOUNT_EXISTS: 'GOOGLE_ACCOUNT_EXISTS',
  NO_ALTERNATIVE_AUTH: 'NO_ALTERNATIVE_AUTH',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  PROFILE_UPDATE_FAILED: 'PROFILE_UPDATE_FAILED',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
} as const;

export type ProfileErrorCode = typeof PROFILE_ERROR_CODES[keyof typeof PROFILE_ERROR_CODES];

export interface ProfileError {
  code: ProfileErrorCode;
  message: string;
  details?: any;
}

// =====================================================
// VALIDATION TYPES
// =====================================================

export interface ProfileValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ProfileValidationRules {
  fullName: ProfileValidationRule;
  mobileNumber: ProfileValidationRule;
  bio: ProfileValidationRule;
  website: ProfileValidationRule;
  dateOfBirth: ProfileValidationRule;
  gender: ProfileValidationRule;
  nationality: ProfileValidationRule;
  occupation: ProfileValidationRule;
  location: ProfileValidationRule;
}

export interface ProfileValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// =====================================================
// STATE MANAGEMENT TYPES
// =====================================================

export interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
}

export interface ProfileContextValue {
  // State
  profileState: ProfileState;
  
  // Profile Actions
  getProfile: () => Promise<GetProfileApiResponse>;
  updateProfile: (data: ProfileUpdateRequest) => Promise<UpdateProfileApiResponse>;
  updatePrivacy: (data: PrivacyUpdateRequest) => Promise<UpdatePrivacyApiResponse>;
  
  // Profile Picture Actions
  uploadPicture: (file: File) => Promise<UploadPictureApiResponse>;
  syncPictureFromGoogle: () => Promise<SyncPictureApiResponse>;
  deletePicture: () => Promise<DeletePictureApiResponse>;
  getPictureStatus: () => Promise<PictureStatusApiResponse>;
  
  // Google Integration Actions
  connectGoogle: (token: string) => Promise<ConnectGoogleApiResponse>;
  disconnectGoogle: () => Promise<DisconnectGoogleApiResponse>;
  
  // Form Management
  startEditing: () => void;
  cancelEditing: () => void;
  saveChanges: () => Promise<void>;
  
  // Utilities
  validateProfileData: (data: ProfileFormData) => ProfileValidationResult;
  validatePrivacyData: (data: PrivacyFormData) => ProfileValidationResult;
  clearProfileError: () => void;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface ProfilePictureDimensions {
  width: number;
  height: number;
}

export interface ProfilePictureInfo {
  url: string;
  source: 'UPLOAD' | 'GOOGLE' | 'DEFAULT';
  dimensions?: ProfilePictureDimensions;
  fileSize?: number;
  uploadedAt?: string;
}

export interface ProfilePrivacyInfo {
  isPublic: boolean;
  showEmail: boolean;
  showPhone: boolean;
  allowGoogleSync: boolean;
}

export interface ProfileConnectionInfo {
  hasGoogleAccount: boolean;
  googleEmail?: string;
  connectedAt?: string;
}

// =====================================================
// END OF USER PROFILE TYPES
// =====================================================
