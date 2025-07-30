import { useStore } from '@nanostores/react';
import { $authToken } from 'app/store/nanostores/authToken';
import { resetQueueId } from 'app/store/nanostores/queueId';
import { useAppDispatch } from 'app/store/storeHooks';
import { clearUser } from 'app/store/userSlice';
import { useCallback } from 'react';
import { useLogoutMutation } from 'services/api/custom/userApi';

// OAuth 엔드포인트 상수
const OAUTH_ENDPOINTS = {
  GOOGLE: '/oauth/google/login',
} as const;

/**
 * 인증 관련 로직을 담당하는 커스텀 훅
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authToken = useStore($authToken);
  const [logout] = useLogoutMutation();

  const isAuthenticated = Boolean(authToken);

  /**
   * Google OAuth 로그인
   */
  const loginWithGoogle = useCallback(() => {
    const apiBaseUrl = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:8080';
    const oauthUrl = `${apiBaseUrl}${OAUTH_ENDPOINTS.GOOGLE}`;
    /* eslint-disable no-console */

    console.log('🚀 useAuth - Google 로그인 시작:', oauthUrl);
    window.location.href = oauthUrl;
  }, []);

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
    handleLogout,
  };
};
