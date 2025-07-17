import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { $authToken } from 'app/store/nanostores/authToken';
import { $apiServerUrl } from 'app/store/nanostores/apiServerUrl';
import type { RefreshTokenResponse, LogoutResponse } from './sessionSchema';

/**
 * 세션 API - 토큰 및 세션 관리
 * 인증과 분리하여 세션 라이프사이클만 담당
 */
export const sessionApi = createApi({
  reducerPath: 'sessionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: $apiServerUrl.get() || 'http://localhost:8080',
    credentials: 'include', // HTTP-only 쿠키 포함
    prepareHeaders: (headers) => {
      const token = $authToken.get();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
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
