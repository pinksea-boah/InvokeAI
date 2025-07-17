// Session API Schema - 세션 및 토큰 관리

/**
 * 토큰 갱신 응답
 */
export interface RefreshTokenResponse {
  status: 'success' | 'error';
  access_token: string;
  expires_in?: number;
  token_type?: 'Bearer';
  message?: string;
}

/**
 * 로그아웃 응답
 */
export interface LogoutResponse {
  status: 'success';
  message: string;
}
