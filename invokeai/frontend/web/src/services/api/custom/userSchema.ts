// User API Schema - 사용자 정의 API 타입들

/**
 * 인증 관련 응답 타입
 */
export interface AuthResponse {
  status: 'success' | 'error';
  access_token: string;
  refresh_token?: string;
  message?: string;
}

/**
 * 기본 API 응답 래퍼
 */
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

/**
 * 사용자 정보 응답
 */
export interface UserInfoResponse {
  id: string;
  email: string;
  display_name: string;
  profile?: {
    locale?: string | null;
    picture?: string;
    given_name?: string;
    family_name?: string;
    avatar?: string;
    bio?: string;
    preferences?: {
      theme?: 'light' | 'dark' | 'system';
      language?: string;
      notifications?: boolean;
    };
    settings?: {
      autoSave?: boolean;
      showTips?: boolean;
    };
  };
  permissions: string[];
  oauth_provider?: string;
  email_verified?: boolean;
  user_tier?: 'free' | 'pro' | 'enterprise';
  user_type?: string;
  is_active?: boolean;
  total_workflows?: number;
  total_generations?: number;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * 에러 응답
 */
export interface ErrorResponse {
  status: 'error';
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * 로그인 요청
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 회원가입 요청
 */
export interface RegisterRequest {
  email: string;
  password: string;
  display_name: string;
}
