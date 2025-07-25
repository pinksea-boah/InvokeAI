import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { $authToken } from 'app/store/nanostores/authToken';
import { useAppSelector } from 'app/store/storeHooks';
import { useCallback } from 'react';

// OAuth 엔드포인트 상수
const OAUTH_ENDPOINTS = {
  GOOGLE: '/api/auth/google',
} as const;

export const LoginModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const authToken = useStore($authToken);
  const user = useAppSelector((state) => state.user?.user ?? null);

  const isAuthenticated = Boolean(authToken);

  // OAuth 로그인 - 새 창으로 리다이렉트
  const loginWithGoogle = useCallback(() => {
    const apiBaseUrl = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:8080';
    // const redirectUrl = encodeURIComponent(window.location.origin);
    const oauthUrl = `${apiBaseUrl}${OAUTH_ENDPOINTS.GOOGLE}`;

    window.location.href = oauthUrl;
  }, []);

  // 로그아웃 처리
  const handleLogout = useCallback(() => {
    // 토큰 제거
    $authToken.set(undefined);
    // 페이지 새로고침으로 상태 초기화
    window.location.reload();
  }, []);

  // 인증 버튼 클릭 핸들러
  const handleAuth = useCallback(() => {
    if (isAuthenticated) {
      handleLogout();
    } else {
      onOpen();
    }
  }, [isAuthenticated, handleLogout, onOpen]);

  return (
    <>
      {/* 인증 버튼 */}
      <Button
        onClick={handleAuth}
        variant="ghost"
        size="sm"
        color="base.50"
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
        {isAuthenticated ? user?.display_name || user?.email?.split('@')[0] || 'Log out' : 'Log in'}
      </Button>

      {/* 로그인 모달 */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent maxW="400px" bg="white" borderRadius="16px">
          <ModalHeader textAlign="center" pb={4}>
            <Text fontSize="xl" fontWeight="bold" color="white">
              로그인
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex flexDir="column" gap={4}>
              <Text textAlign="center" color="gray.600" fontSize="sm">
                계정에 로그인하여 모든 기능을 이용하세요
              </Text>

              {/* Google Sign Up Button */}
              <Button
                onClick={loginWithGoogle}
                w="full"
                h="52px"
                bg="white"
                transition="all 0.3s"
                borderRadius="16px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={3}
                boxShadow="lg"
                _hover={{
                  bg: 'gray.50',
                  boxShadow: 'xl',
                  transform: 'scale(1.02)',
                }}
                _active={{ transform: 'scale(0.98)' }}
                border="1px solid"
                borderColor="gray.200"
                position="relative"
                overflow="hidden"
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <Text color="gray.800" fontWeight="medium" fontSize="sm">
                  Continue with Google
                </Text>
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
