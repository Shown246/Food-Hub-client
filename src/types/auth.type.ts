export interface ProviderProfile {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  logoUrl: string | null;
  openingHours: string | null;
  acceptingOrders: boolean;
}

export interface CurrentUserData {
  user: AuthUser;
  providerProfile: ProviderProfile | null;
}

export interface SessionIdentityData {
  user: Pick<
    AuthUser,
    "id" | "fullName" | "profileImageUrl" | "email" | "role" | "status"
  >;
  providerProfile: Pick<ProviderProfile, "id" | "name" | "logoUrl"> | null;
}

export interface AuthUser {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  defaultDeliveryAddress: string | null;
  emailVerified?: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface ILoginResponse {
  success: true;
  user: AuthUser | null;
  providerProfile: ProviderProfile | null;
  token?: string;                     // Use this for authentication
  accessToken?: string | null;        // Present only if using OAuth login
  refreshToken?: string | null;       // Present only if using OAuth login
}

export interface ISignupResponse {
  success: true;
  user?: Partial<AuthUser> | null;
  providerProfile?: ProviderProfile | null;
  token?: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  requireVerification?: boolean;
  emailVerified?: boolean;
  verificationEmailSent?: boolean;
  message?: string;
  email?: string;
}

export interface IVerifyEmailResponse {
  success: boolean;
  message?: string;
  data?: {
    verified: boolean;
    email: string;
    message: string;
  };
}

export interface IResendVerificationResponse {
  success: boolean;
  message?: string;
  data?: {
    sent: boolean;
    message: string;
  };
}
