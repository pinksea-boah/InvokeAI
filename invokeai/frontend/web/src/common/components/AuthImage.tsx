/**
 * AuthImage 컴포넌트 사용 예시:
 *
 * // 기본 사용법
 * <AuthImage src="/api/v1/images/123" alt="인증이 필요한 이미지" />
 *
 * // 로딩 및 에러 상태 처리
 * <AuthImage
 *   src="/api/v1/images/123"
 *   alt="인증이 필요한 이미지"
 *   loadingFallback={<div>로딩 중...</div>}
 *   errorFallback={<div>이미지 로드 실패</div>}
 *   authFallback={<div>인증 필요</div>}
 *   onLoad={() => console.log('이미지 로드 완료')}
 *   onAuthError={(error) => console.error('인증 에러:', error)}
 * />
 *
 * // 일반 이미지 (인증 불필요)
 * <AuthImage src="/public/image.jpg" alt="일반 이미지" />
 */

import type { ImageProps } from '@invoke-ai/ui-library';
import { Image } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { $authToken } from 'app/store/nanostores/authToken';
import { isAuthRequiredImageUrl, loadAuthImageAsDataUrl } from 'common/util/authImageUtils';
import { memo, useEffect, useState, forwardRef } from 'react';

interface AuthImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  authFallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  onLoad?: () => void;
  onAuthError?: (error: Error) => void;
}

/**
 * 인증이 필요한 이미지를 처리하는 커스텀 이미지 컴포넌트
 * 인증이 필요한 URL인 경우 fetch → blob → data URL 방식으로 로드합니다.
 */
export const AuthImage = memo(
  forwardRef<HTMLImageElement, AuthImageProps>(
    ({ src, authFallback, loadingFallback, errorFallback, onLoad, onAuthError, ...props }, ref) => {
      const authToken = useStore($authToken);

      // src가 undefined나 빈 문자열인 경우 처리
      if (!src) {
        return null;
      }

      // 인증이 필요한 URL인지 확인
      const needsAuth = isAuthRequiredImageUrl(src);

      // 상태 초기화
      const [imageSrc, setImageSrc] = useState<string>('');
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState<Error | null>(null);

      useEffect(() => {
        // 인증이 필요하지 않은 URL인 경우 일반적인 방식으로 처리
        if (!needsAuth) {
          setImageSrc(src);
          setError(null);
          setIsLoading(false);
          return;
        }

        // 인증이 필요한 URL이지만 토큰이 없는 경우 로딩 상태 유지
        if (!authToken) {
          setIsLoading(true);
          setError(null);
          setImageSrc('');
          return;
        }

        // 인증이 필요한 URL이고 토큰이 있는 경우 data URL로 변환
        setIsLoading(true);
        setError(null);
        setImageSrc('');

        let isCancelled = false;

        loadAuthImageAsDataUrl(src)
          .then((dataUrl) => {
            if (isCancelled) return;
            setImageSrc(dataUrl);
            setIsLoading(false);
            onLoad?.();
          })
          .catch((err) => {
            if (isCancelled) return;
            console.error('Error loading authenticated image:', err);
            setError(err);
            setIsLoading(false);
            onAuthError?.(err);
          });

        return () => {
          isCancelled = true;
        };
      }, [src, authToken, needsAuth, onLoad, onAuthError]);

      // 로딩 중인 경우
      if (isLoading) {
        return loadingFallback ? <>{loadingFallback}</> : authFallback ? <>{authFallback}</> : null;
      }

      // 에러가 있는 경우
      if (error) {
        return errorFallback ? <>{errorFallback}</> : authFallback ? <>{authFallback}</> : null;
      }

      // 이미지 소스가 없으면 아무것도 렌더링하지 않음
      if (!imageSrc) {
        return null;
      }

      return <Image ref={ref} src={imageSrc} {...props} />;
    }
  )
);

AuthImage.displayName = 'AuthImage';
