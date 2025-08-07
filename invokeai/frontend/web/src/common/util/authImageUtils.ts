/**
 * 인증 이미지 유틸리티 사용 예시:
 * 
 * // 1. data URL 방식으로 이미지 로드 (권장)
 * const dataUrl = await loadAuthImageAsDataUrl('/api/v1/images/123');
 * 
 * // 2. HTMLImageElement로 직접 로드
 * const imageElement = await loadAuthImage('/api/v1/images/123');
 * 
 * // 3. 데이터 URL로 변환
 * const dataUrl = await imageUrlToDataUrl('/api/v1/images/123');
 * 
 * // 4. 인증 필요 여부 확인
 * const needsAuth = isAuthRequiredImageUrl('/api/v1/images/123');
 */

import { $authToken } from 'app/store/nanostores/authToken';

/**
 * 이미지 URL이 인증이 필요한 API 엔드포인트인지 확인합니다.
 * @param url 이미지 URL
 * @returns 인증이 필요한지 여부
 */
export const isAuthRequiredImageUrl = (url: string): boolean => {
  // API 엔드포인트 패턴 확인
  const authRequiredPatterns = [
    '/invokeai/api/v1/images/',
    '/api/v1/images/',
    '/images/i/',
    '/thumbnail'
  ];
  
  return authRequiredPatterns.some(pattern => url.includes(pattern));
};

/**
 * 인증이 필요한 이미지 URL을 fetch → blob → data URL 방식으로 로드합니다.
 * @param url 이미지 URL
 * @returns Promise<string> data URL 또는 원본 URL
 */
export const loadAuthImageAsDataUrl = async (url: string): Promise<string> => {
  const authToken = $authToken.get();
  
  // 인증이 필요하지 않은 경우 원본 URL 반환
  if (!authToken || !isAuthRequiredImageUrl(url)) {
    return url;
  }

  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to load image: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading authenticated image:', error);
    throw error;
  }
};

/**
 * 인증이 필요한 이미지 URL을 인증 헤더와 함께 로드합니다.
 * @param url 이미지 URL
 * @returns Promise<HTMLImageElement>
 */
export const loadAuthImage = async (url: string): Promise<HTMLImageElement> => {
  const authToken = $authToken.get();
  
  if (!authToken || !isAuthRequiredImageUrl(url)) {
    // 인증이 필요하지 않은 경우 일반적인 방식으로 로드
    return new Promise((resolve, reject) => {
      const imageElement = new Image();
      imageElement.onload = () => resolve(imageElement);
      imageElement.onerror = (error) => reject(error);
      imageElement.crossOrigin = authToken ? 'use-credentials' : 'anonymous';
      imageElement.src = url;
    });
  }

  // 인증이 필요한 경우 data URL 방식 사용
  const dataUrl = await loadAuthImageAsDataUrl(url);

  return new Promise((resolve, reject) => {
    const imageElement = new Image();
    imageElement.onload = () => resolve(imageElement);
    imageElement.onerror = (error) => reject(error);
    imageElement.src = dataUrl;
  });
};

/**
 * 이미지 URL을 인증 헤더와 함께 데이터 URL로 변환합니다.
 * @param url 이미지 URL
 * @returns Promise<string> 데이터 URL
 */
export const imageUrlToDataUrl = async (url: string): Promise<string> => {
  const authToken = $authToken.get();
  
  if (!authToken || !isAuthRequiredImageUrl(url)) {
    // 인증이 필요하지 않은 경우 일반적인 방식으로 로드
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // 인증이 필요한 경우 인증 헤더와 함께 fetch
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to load image: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}; 