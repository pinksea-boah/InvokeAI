import { Box, Spinner, Text, VStack } from '@invoke-ai/ui-library';
import { $authToken } from 'app/store/nanostores/authToken';
import { useAppDispatch } from 'app/store/storeHooks';
import { setUser } from 'app/store/userSlice';
import { useEffect } from 'react';
import { useGetUserInfoQuery } from 'services/api/custom/userApi';

export const OAuthCallback = () => {
  const dispatch = useAppDispatch();

  // URL에서 토큰 추출
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  // 토큰이 있으면 저장
  useEffect(() => {
    if (token) {
      $authToken.set(token);
      // URL에서 토큰 파라미터 제거
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('token');
      newUrl.searchParams.delete('error');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [token]);

  // 사용자 정보 조회 (토큰이 있을 때만)
  const { data: userInfo, isLoading } = useGetUserInfoQuery(undefined, {
    skip: !token,
  });

  // 사용자 정보를 Redux에 저장
  useEffect(() => {
    if (userInfo) {
      // UserInfoResponse를 User 타입으로 변환
      const user = {
        id: userInfo.id,
        email: userInfo.email,
        display_name: userInfo.display_name || undefined,
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

  if (isLoading) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="blackAlpha.50"
        backdropFilter="blur(4px)"
        zIndex={9999}
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text fontSize="lg" color="gray.600">
            로그인 처리 중...
          </Text>
        </VStack>
      </Box>
    );
  }

  return null;
};
