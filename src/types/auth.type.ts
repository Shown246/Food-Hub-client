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

export interface AuthUser {
  id: string;
  fullName: string;
  profileImageUrl: string | null;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  defaultDeliveryAddress: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface ILoginResponse {
  success: true;
  user: AuthUser | null;
  providerProfile: ProviderProfile | null;
  token: string;                     // Use this for authentication
  accessToken: string | null;        // Present only if using OAuth login
  refreshToken: string | null;       // Present only if using OAuth login
}