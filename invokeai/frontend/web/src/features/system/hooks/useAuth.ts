import { useStore } from '@nanostores/react';
import { $authToken } from 'app/store/nanostores/authToken';
import { resetQueueId } from 'app/store/nanostores/queueId';
import { useAppDispatch } from 'app/store/storeHooks';
import { clearUser } from 'app/store/userSlice';
import { useCallback } from 'react';
import { useLogoutMutation, useEmailLoginMutation } from 'services/api/custom/userApi';

// OAuth 엔드포인트 상수 (API 통신이 아닌 리다이렉트용)
const OAUTH_ENDPOINTS = {
  GOOGLE: '/oauth/google/login',
  DISCORD: '/oauth/discord/login',
} as const;

/**
 * 인증 관련 로직을 담당하는 커스텀 훅
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authToken = useStore($authToken);
  const [logout] = useLogoutMutation();
  const [emailLogin] = useEmailLoginMutation();

  const isAuthenticated = Boolean(authToken);

  /**
   * Google OAuth 로그인 (리다이렉트 방식)
   */
  const loginWithGoogle = useCallback(() => {
    // 프록시 환경을 고려하여 /editor로 고정
    const currentPath = '/editor';
    console.log('🔗 useAuth - 리다이렉트 경로:', currentPath);

    const apiBaseUrl = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:8080';
    const oauthUrl = `${apiBaseUrl}${OAUTH_ENDPOINTS.GOOGLE}?redirect_path=${encodeURIComponent(currentPath)}`;
    /* eslint-disable no-console */
    console.log('🚀 useAuth - Google OAuth 리다이렉트:', oauthUrl);
    window.location.href = oauthUrl;
  }, []);

  /**
   * Discord OAuth 로그인 (리다이렉트 방식)
   */
  const loginWithDiscord = useCallback(() => {
    // 프록시 환경을 고려하여 /editor로 고정
    const currentPath = '/editor';
    console.log('🔗 useAuth - 리다이렉트 경로:', currentPath);

    const apiBaseUrl = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:8080';
    const oauthUrl = `${apiBaseUrl}${OAUTH_ENDPOINTS.DISCORD}?redirect_path=${encodeURIComponent(currentPath)}`;
    /* eslint-disable no-console */
    console.log('🚀 useAuth - Discord OAuth 리다이렉트:', oauthUrl);
    window.location.href = oauthUrl;
  }, []);

  /**
   * 이메일 로그인 (실제 API 호출)
   */
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await emailLogin({ email, password }).unwrap();
        console.log('✅ useAuth - 이메일 로그인 성공:', result);

        // 토큰 저장
        if (result.access_token) {
          $authToken.set(result.access_token);
          console.log('✅ useAuth - 토큰 저장 완료');
        }

        return result;
      } catch (error) {
        console.error('❌ useAuth - 이메일 로그인 실패:', error);
        throw error;
      }
    },
    [emailLogin]
  );

  /**
   * 로그아웃 처리
   */
  const handleLogout = useCallback(async () => {
    console.log('🚪 useAuth - 로그아웃 시작');
    try {
      // 서버에 로그아웃 요청
      await logout().unwrap();
      console.log('✅ useAuth - 서버 로그아웃 성공');
    } catch (error) {
      console.error('❌ useAuth - 서버 로그아웃 실패:', error);
    } finally {
      // 로컬 토큰 제거
      $authToken.set(undefined);
      console.log('✅ useAuth - 로컬 토큰 제거 완료');

      // Queue ID 초기화
      resetQueueId();
      console.log('✅ useAuth - Queue ID 초기화 완료');

      // Redux 상태 초기화
      dispatch(clearUser());
      console.log('✅ useAuth - Redux 상태 초기화 완료');

      // 페이지 새로고침으로 상태 초기화
      window.location.reload();
    }
  }, [logout, dispatch]);

  return {
    isAuthenticated,
    loginWithGoogle,
    loginWithDiscord,
    loginWithEmail,
    handleLogout,
  };
};
