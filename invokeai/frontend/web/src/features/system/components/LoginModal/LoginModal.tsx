import { Button } from '@invoke-ai/ui-library';
import { useAuth } from 'features/system/hooks/useAuth';
import { useCallback } from 'react';

export const LoginModal = () => {
  const { isAuthenticated, handleLogout } = useAuth();

  // 환경에 따른 로그인 URL 생성
  const getLoginUrl = useCallback(() => {
    // VITE_MODE 환경 변수 사용
    const isDevelopment = import.meta.env.VITE_MODE === 'development';

    console.log('🔍 LoginModal - 환경 확인:', {
      viteMode: import.meta.env.VITE_MODE,
      isDevelopment,
    });

    if (isDevelopment) {
      return 'http://localhost:3000/login';
    } else {
      return 'https://pinksea.ai/login';
    }
  }, []);

  // 인증 버튼 클릭 핸들러
  const handleAuth = useCallback(() => {
    if (isAuthenticated) {
      handleLogout();
    } else {
      // 모달 대신 외부 로그인 페이지로 이동
      window.location.href = getLoginUrl();
    }
  }, [isAuthenticated, handleLogout, getLoginUrl]);

  return (
    <>
      {/* 인증 버튼 */}
      <Button
        onClick={handleAuth}
        variant="ghost"
        size="sm"
        color="base.300"
        _hover={{
          bg: 'base.200',
          color: 'base.50',
        }}
        px={3}
        py={2}
        borderRadius="md"
        border="1px solid"
        borderColor="base.300"
        bg="whiteAlpha.200"
        backdropFilter="blur(8px)"
      >
        {isAuthenticated ? 'Log out' : 'Log in'}
      </Button>
    </>
  );
};
