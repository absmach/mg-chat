import type { Domain } from "@absmach/magistrala-sdk";

export interface UserInfo {
  id?: string;
  username?: string;
  // biome-ignore lint/style/useNamingConvention: This is from an external library
  first_name?: string;
  // biome-ignore lint/style/useNamingConvention: This is from an external library
  last_name?: string;
  email?: string;
  role?: UserRole;
  image?: string;
}

export interface AccessToken {
  accessToken: string;
  accessTokenExpiry: number;
}
export interface RefreshToken {
  refreshToken: string;
  refreshTokenExpiry: number;
}
export interface Tokens extends AccessToken, RefreshToken {}

export interface Session extends AccessToken {
  user: UserInfo;
  domain?: Domain;
  error?: string;
  expires: string;
}

export interface User extends Tokens {
  user: UserInfo;
  domain?: Domain;
  error?: string;
}

export enum UserRole {
  Admin = "admin",
  User = "user",
}
