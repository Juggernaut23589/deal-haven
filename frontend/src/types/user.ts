// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole = 'buyer' | 'seller' | 'admin' | 'moderator' | 'BUYER' | 'SELLER' | 'ADMIN' | 'MODERATOR';

export type UserStatus = 'active' | 'suspended' | 'banned' | 'pending_verification';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

// ─── Address ─────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverImageUrl: string | null;
  location: string | null;
  website: string | null;
  phoneNumber: string | null;
  isPhoneVerified: boolean;
  dateOfBirth: string | null;
  gender: string | null;
  preferredCurrency: string;
  preferredLanguage: string;
  notificationPreferences: NotificationPreferences;
  updatedAt: string;
}

export interface NotificationPreferences {
  emailOnMessage: boolean;
  emailOnOffer: boolean;
  emailOnOrderUpdate: boolean;
  emailOnPriceAlert: boolean;
  emailOnNewListing: boolean;
  pushOnMessage: boolean;
  pushOnOffer: boolean;
  pushOnOrderUpdate: boolean;
}

// ─── Seller Profile ───────────────────────────────────────────────────────────

export interface SellerProfile {
  id: string;
  userId: string;
  storefrontName: string;
  storefrontSlug: string;
  tagline: string | null;
  description: string | null;
  bannerImageUrl: string | null;
  logoUrl: string | null;
  verificationStatus: VerificationStatus;
  isVerified: boolean;
  isStarSeller: boolean;
  businessType: 'individual' | 'business';
  businessName: string | null;
  businessLicenseUrl: string | null;
  taxId: string | null;
  rating: number;
  reviewCount: number;
  totalSales: number;
  totalRevenue: number;
  activeListingCount: number;
  policies: StorefrontPolicies;
  shippingFromLocation: string | null;
  averageShipDays: number | null;
  responseTimeHours: number | null;
  responseRate: number | null;
  cancellationRate: number | null;
  acceptsCustomOrders: boolean;
  customOrderDescription: string | null;
  memberSince: string;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorefrontPolicies {
  returnPolicy: string | null;
  shippingPolicy: string | null;
  customOrderPolicy: string | null;
  paymentMethods: string[];
}

// ─── Core User ────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  username: string;
  roles: UserRole[];
  status: UserStatus;
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  profile: UserProfile;
  sellerProfile: SellerProfile | null;
  addresses: Address[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

/**
 * Authenticated user as stored in the auth store (no sensitive fields).
 */
export type AuthenticatedUser = Omit<User, 'addresses'> & {
  isSeller: boolean;
  isAdmin: boolean;
  isModerator: boolean;
};

/**
 * Public-facing user data visible to other users.
 */
export interface PublicUser {
  id: string;
  username: string;
  profile: Pick<
    UserProfile,
    'displayName' | 'avatarUrl' | 'location' | 'bio'
  >;
  sellerProfile: Pick<
    SellerProfile,
    | 'storefrontName'
    | 'storefrontSlug'
    | 'rating'
    | 'reviewCount'
    | 'totalSales'
    | 'isVerified'
    | 'isStarSeller'
    | 'memberSince'
    | 'responseTimeHours'
  > | null;
  isSeller: boolean;
  memberSince: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: AuthenticatedUser;
  tokens: TokenPair;
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
  asSeller?: boolean;
}

export interface UpdateProfilePayload {
  username?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  city?: string;
  state?: string;
  location?: string;
  website?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  preferredCurrency?: string;
  preferredLanguage?: string;
}

export interface UpdateNotificationPreferencesPayload
  extends Partial<NotificationPreferences> {}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}
