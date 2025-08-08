import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { $apiServerUrl } from 'app/store/nanostores/apiServerUrl';
import { $authToken } from 'app/store/nanostores/authToken';

import type { LogoutResponse, RefreshTokenResponse } from './sessionSchema';

/**
 * 동적 baseQuery 생성 함수
 */
const createSessionBaseQuery = () => {
  const apiServerUrl = $apiServerUrl.get() || 'http://localhost:8080';
  console.log('🔧 sessionApi - baseQuery 생성:', { apiServerUrl });

  return fetchBaseQuery({
    baseUrl: apiServerUrl,
    credentials: 'include', // HTTP-only 쿠키 포함
    prepareHeaders: (headers) => {
      const token = $authToken.get();
      const currentApiServerUrl = $apiServerUrl.get() || 'http://localhost:8080';

      /* eslint-disable no-console */
      console.log('🔐 sessionApi - prepareHeaders 호출:', {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : null,
        apiServerUrl: currentApiServerUrl,
      });

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        console.log('✅ sessionApi - Authorization 헤더 설정 완료');
      } else {
        console.log('⚠️ sessionApi - 토큰이 없어서 Authorization 헤더 미설정');
      }
      headers.set('Content-Type', 'application/json');

      console.log('📋 sessionApi - 최종 헤더:', {
        authorization: headers.get('Authorization'),
        contentType: headers.get('Content-Type'),
      });

      return headers;
    },
  });
};

/**
 * 세션 API - 토큰 및 세션 관리
 * 인증과 분리하여 세션 라이프사이클만 담당
 */
export const sessionApi = createApi({
  reducerPath: 'sessionApi',
  baseQuery: createSessionBaseQuery(),
  tagTypes: ['Session', 'Token'],
  endpoints: (builder) => ({
    /**
     * Refresh Token으로 Access Token 갱신
     * HTTP-only 쿠키의 refresh token 사용
     */
    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => ({
        url: '/session/refresh-token',
        method: 'POST',
      }),
      invalidatesTags: ['Token'],
    }),

    /**
     * 로그아웃 - 세션 종료 및 토큰 무효화
     */
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Session', 'Token'],
    }),
  }),
});

// Auto-generated hooks
export const { useRefreshTokenMutation, useLogoutMutation } = sessionApi;
