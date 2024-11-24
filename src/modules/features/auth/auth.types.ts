// src/modules/features/auth/auth.types.ts

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}
