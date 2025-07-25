import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { $apiServerUrl } from 'app/store/nanostores/apiServerUrl';
import { $authToken } from 'app/store/nanostores/authToken';

import type { AuthResponse, LoginRequest, UserInfoResponse } from './userSchema';

/**
 * 사용자 API - 인증 및 사용자 관리
 */
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: $apiServerUrl.get() || 'http://localhost:8080',
    credentials: 'include', // 쿠키 포함
    prepareHeaders: (headers) => {
      const token = $authToken.get();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
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
     * 로그인
     */
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/oauth/google/login',
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
export const { useGetUserInfoQuery, useLazyGetUserInfoQuery, useLoginMutation, useLogoutMutation } = userApi;
