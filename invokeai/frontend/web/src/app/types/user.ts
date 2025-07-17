// 사용자 티어 타입
export type UserTier = 'free' | 'pro' | 'enterprise';

// 사용자 프로필 정보 (Google OAuth 응답 기반)
export interface UserProfile {
  locale?: string | null;
  picture?: string; // Google 프로필 이미지 URL
  given_name?: string; // 이름
  family_name?: string; // 성
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
}

// 사용자 엔티티
export interface User {
  id: string;
  email: string;
  display_name: string;
  profile?: UserProfile;
  permissions: string[];
  oauth_provider?: string; // 'email', 'google', 'discord'
  email_verified?: boolean; // 이메일 인증 상태
  user_tier?: UserTier; // 'free', 'pro', 'enterprise'
  user_type?: string; // 'individual', 'organization'
  is_active?: boolean; // 계정 활성화 상태
  total_workflows?: number; // 생성한 워크플로우 수
  total_generations?: number; // 생성 이미지 수
  timezone?: string; // 사용자 시간대
  created_at?: string; // 백엔드 필드명과 일치
  updated_at?: string; // 백엔드 필드명과 일치
}
