export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  user?: UserInfo;
}
