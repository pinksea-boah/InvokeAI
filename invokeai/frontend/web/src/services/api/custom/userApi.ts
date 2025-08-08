import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { $apiServerUrl } from 'app/store/nanostores/apiServerUrl';
import { $authToken } from 'app/store/nanostores/authToken';

import type { AuthResponse, LoginRequest, UserInfoResponse } from './userSchema';

/**
 * 동적 baseQuery 생성 함수
 */
const createUserBaseQuery = () => {
  // 환경 변수에서 직접 가져오기 (main.tsx보다 먼저 로드되므로)
  const apiServerUrl =
    import.meta.env.VITE_API_SERVER_URL ||
    (import.meta.env.VITE_MODE === 'development' ? 'http://localhost:8080' : 'https://pinksea.ai');

  console.log('🔧 userApi - baseQuery 생성:', {
    apiServerUrl,
    viteMode: import.meta.env.VITE_MODE,
    viteApiServerUrl: import.meta.env.VITE_API_SERVER_URL,
  });

  return fetchBaseQuery({
    baseUrl: apiServerUrl,
    credentials: 'include', // 쿠키 포함
    prepareHeaders: (headers) => {
      const token = $authToken.get();
      const currentApiServerUrl = $apiServerUrl.get() || apiServerUrl;

      /* eslint-disable no-console */
      console.log('🔐 userApi - prepareHeaders 호출:', {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : null,
        apiServerUrl: currentApiServerUrl,
      });
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      /* eslint-disable no-console */
      console.log('📋 userApi - 최종 헤더:', {
        authorization: headers.get('Authorization'),
        contentType: headers.get('Content-Type'),
      });

      return headers;
    },
  });
};

/**
 * 사용자 API - 인증 및 사용자 관리
 */
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: createUserBaseQuery(),
  tagTypes: ['Auth', 'User'],
  endpoints: (builder) => ({
    /**
     * 사용자 정보 조회
     */
    getUserInfo: builder.query<UserInfoResponse, void>({
      query: () => '/api/users/me',
      providesTags: ['User'],
    }),

    /**
     * 이메일 로그인 (실제 API 호출)
     */
    emailLogin: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/email/email-login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth', 'User'],
    }),

    /**
     * 로그아웃
     */
    logout: builder.mutation<{ status: string }, void>({
      query: () => ({
        url: '/session/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
  }),
});

// Auto-generated hooks
export const { useGetUserInfoQuery, useEmailLoginMutation, useLogoutMutation } = userApi;
