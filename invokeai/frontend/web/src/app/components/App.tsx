import { Box } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { GlobalHookIsolator } from 'app/components/GlobalHookIsolator';
import { GlobalModalIsolator } from 'app/components/GlobalModalIsolator';
import { $didStudioInit, type StudioInitAction } from 'app/hooks/useStudioInitAction';
import type { PartialAppConfig } from 'app/types/invokeai';
import Loading from 'common/components/Loading/Loading';
import { useClearStorage } from 'common/hooks/useClearStorage';
import { AppContent } from 'features/ui/components/AppContent';
import React, { memo, useCallback, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import AppErrorBoundaryFallback from './AppErrorBoundaryFallback';
import ThemeLocaleProvider from './ThemeLocaleProvider';
import { useAppDispatch } from 'app/store/storeHooks';
import { setUser, setUserError } from 'app/store/userSlice';
import { $authToken } from 'app/store/nanostores/authToken';
import { useGetUserInfoQuery } from 'services/api/custom/userApi';
import { useRefreshTokenMutation } from 'services/api/custom/sessionApi';
import type { User } from 'app/types/user';
const DEFAULT_CONFIG = {};

interface Props {
  config?: PartialAppConfig;
  studioInitAction?: StudioInitAction;
}

const App = ({ config = DEFAULT_CONFIG, studioInitAction }: Props) => {
  const didStudioInit = useStore($didStudioInit);
  const clearStorage = useClearStorage();
  const dispatch = useAppDispatch();
  const authToken = useStore($authToken);
  const [refreshToken] = useRefreshTokenMutation();

  // 조건부로 사용자 정보 조회 (authToken이 있을 때만)
  const { data: userInfo, error: userInfoError } = useGetUserInfoQuery(undefined, {
    skip: !authToken, // authToken이 없으면 쿼리 스킵
  });

  // 최초 마운트 시 refresh token으로 access token 발급
  useEffect(() => {
    if (!authToken) {
      refreshToken()
        .unwrap()
        .then((result) => {
          if (result.status === 'success') {
            if (import.meta.env.MODE === 'development') {
              // eslint-disable-next-line no-console
              console.log('accessToken 발급 성공', result.access_token);
            }
            $authToken.set(result.access_token);
          }
        })
        .catch((error) => {
          if (import.meta.env.MODE === 'development') {
            // eslint-disable-next-line no-console
            console.error('accessToken 발급 실패', error);
          }
        });
    }
  }, [authToken, refreshToken]);

  // 사용자 정보를 Redux에 설정
  useEffect(() => {
    if (userInfo) {
      if (import.meta.env.MODE === 'development') {
        // eslint-disable-next-line no-console
        console.log('유저데이터성공', userInfo);
      }
      // UserInfoResponse를 User 타입으로 변환
      const user: User = {
        id: userInfo.id,
        email: userInfo.email,
        display_name: userInfo.display_name,
        profile: userInfo.profile,
        permissions: userInfo.permissions,
        oauth_provider: userInfo.oauth_provider,
        email_verified: userInfo.email_verified,
        user_tier: userInfo.user_tier,
        user_type: userInfo.user_type,
        is_active: userInfo.is_active,
        total_workflows: userInfo.total_workflows,
        total_generations: userInfo.total_generations,
        timezone: userInfo.timezone,
        created_at: userInfo.created_at,
        updated_at: userInfo.updated_at,
      };
      dispatch(setUser(user));
    }
  }, [userInfo, dispatch]);

  // 사용자 정보 조회 에러 처리
  useEffect(() => {
    if (userInfoError) {
      const errorMessage =
        'data' in userInfoError && userInfoError.data ? String(userInfoError.data) : '유저 정보 조회 실패';
      dispatch(setUserError(errorMessage));
    }
  }, [userInfoError, dispatch]);

  const handleReset = useCallback(() => {
    clearStorage();
    location.reload();
    return false;
  }, [clearStorage]);

  return (
    <ErrorBoundary onReset={handleReset} FallbackComponent={AppErrorBoundaryFallback}>
      <ThemeLocaleProvider>
        <Box id="invoke-app-wrapper" w="100dvw" h="100dvh" position="relative" overflow="hidden">
          <AppContent />
          {!didStudioInit && <Loading />}
        </Box>
        <GlobalHookIsolator config={config} studioInitAction={studioInitAction} />
        <GlobalModalIsolator />
      </ThemeLocaleProvider>
    </ErrorBoundary>
  );
};

export default memo(App);
