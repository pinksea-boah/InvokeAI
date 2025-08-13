import { useStore } from '@nanostores/react';
import { $authToken } from 'app/store/nanostores/authToken';
import { resetQueueId } from 'app/store/nanostores/queueId';
import { useAppDispatch } from 'app/store/storeHooks';
import { clearUser } from 'app/store/userSlice';
import { useCallback } from 'react';

import { useLogoutMutation, useEmailLoginMutation } from 'services/api/custom/userApi';
import { allEntitiesDeleted } from 'features/controlLayers/store/canvasSlice';
import {
  paramsReset,
  modelChanged,
  vaeSelected,
  fluxVAESelected,
  refinerModelChanged,
} from 'features/controlLayers/store/paramsSlice';
import {
  imageSelected,
  boardIdSelected,
  galleryViewChanged,
  imageToCompareChanged,
  searchTermChanged,
  boardSearchTextChanged,
} from 'features/gallery/store/gallerySlice';
import { listParamsReset } from 'features/queue/store/queueSlice';
import { generateSessionReset, canvasSessionReset } from 'features/controlLayers/store/canvasStagingAreaSlice';
import { setActiveTab, accordionStateChanged, expanderStateChanged } from 'features/ui/store/uiSlice';
import { api } from 'services/api';

import { canvasReset } from 'features/controlLayers/store/actions';
import { useClearStorage } from 'common/hooks/useClearStorage';
import { changeBoardReset } from 'features/changeBoardModal/store/slice';
import { nodeEditorReset, formReset } from 'features/nodes/store/nodesSlice';
import {
  activeStylePresetIdChanged,
  searchTermChanged as stylePresetSearchTermChanged,
  viewModeChanged,
  showPromptPreviewsChanged,
} from 'features/stylePresets/store/stylePresetSlice';
import { workflowLibrarySearchTermChanged } from 'features/nodes/store/workflowLibrarySlice';

// OAuth 엔드포인트 상수 (API 통신이 아닌 리다이렉트용)
const OAUTH_ENDPOINTS = {
  GOOGLE: '/oauth/google/login',
  DISCORD: '/oauth/discord/login',
} as const;

/**
 * 인증 관련 로직을 담당하는 커스텀 훅
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authToken = useStore($authToken);
  const [logout] = useLogoutMutation();
  const [emailLogin] = useEmailLoginMutation();
  const clearStorage = useClearStorage();

  const isAuthenticated = Boolean(authToken);

  /**
   * Google OAuth 로그인 (리다이렉트 방식)
   */
  const loginWithGoogle = useCallback(() => {
    // 프록시 환경을 고려하여 /editor로 고정
    const currentPath = '/editor';

    const apiBaseUrl = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:8080';
    const oauthUrl = `${apiBaseUrl}${OAUTH_ENDPOINTS.GOOGLE}?redirect_path=${encodeURIComponent(currentPath)}`;
    window.location.href = oauthUrl;
  }, []);

  /**
   * Discord OAuth 로그인 (리다이렉트 방식)
   */
  const loginWithDiscord = useCallback(() => {
    // 프록시 환경을 고려하여 /editor로 고정
    const currentPath = '/editor';

    const apiBaseUrl = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:8080';
    const oauthUrl = `${apiBaseUrl}${OAUTH_ENDPOINTS.DISCORD}?redirect_path=${encodeURIComponent(currentPath)}`;
    window.location.href = oauthUrl;
  }, []);

  /**
   * 이메일 로그인
   */
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await emailLogin({ email, password }).unwrap();
        if (result.status === 'success') {
          $authToken.set(result.access_token);
        }
        return result;
      } catch (error) {
        throw error;
      }
    },
    [emailLogin]
  );

  /**
   * 모든 Redux 상태를 완전히 리셋하는 함수
   */
  const resetAllReduxStates = useCallback(() => {
    // User 상태 초기화
    dispatch(clearUser());

    // Canvas 상태 초기화
    dispatch(allEntitiesDeleted());
    dispatch(canvasReset());

    // Prompt 및 모델 상태 초기화
    dispatch(paramsReset());
    dispatch(modelChanged({ model: null }));
    dispatch(vaeSelected(null));
    dispatch(fluxVAESelected(null));
    dispatch(refinerModelChanged(null));

    // Gallery 상태 초기화
    dispatch(imageSelected(null));
    dispatch(boardIdSelected({ boardId: 'none' }));
    dispatch(galleryViewChanged('images'));
    dispatch(imageToCompareChanged(null));
    dispatch(searchTermChanged(''));
    dispatch(boardSearchTextChanged(''));

    // Queue 상태 초기화
    dispatch(listParamsReset());

    // Canvas Session 상태 초기화
    dispatch(generateSessionReset());
    dispatch(canvasSessionReset());

    // UI 상태 초기화
    dispatch(setActiveTab('generate'));
    dispatch(accordionStateChanged({ id: 'default', isOpen: false }));
    dispatch(expanderStateChanged({ id: 'default', isOpen: false }));

    // Change Board Modal 상태 초기화
    dispatch(changeBoardReset());

    // Nodes/Workflow 상태 초기화
    dispatch(nodeEditorReset());
    dispatch(formReset());

    // Style Preset 상태 초기화
    dispatch(activeStylePresetIdChanged(null));
    dispatch(stylePresetSearchTermChanged(''));
    dispatch(viewModeChanged(false));
    dispatch(showPromptPreviewsChanged(false));

    // Workflow Library 상태 초기화
    dispatch(workflowLibrarySearchTermChanged(''));

    // API 상태 리셋
    dispatch(api.util.resetApiState());
  }, [dispatch]);

  /**
   * 로그아웃
   */
  const handleLogout = useCallback(async () => {
    try {
      // 서버에 로그아웃 요청
      await logout().unwrap();

      // 로컬 토큰 제거
      $authToken.set(undefined);

      // Queue ID 초기화
      resetQueueId();

      // IndexedDB와 localStorage 완전 정리
      clearStorage();

      // 모든 Redux 상태 완전 리셋
      resetAllReduxStates();
    } catch (error) {
      // 로그아웃 실패 시에도 로컬 상태는 정리
      $authToken.set(undefined);
      resetQueueId();

      // IndexedDB와 localStorage 완전 정리
      clearStorage();

      // 모든 Redux 상태 완전 리셋
      resetAllReduxStates();
    }
  }, [logout, dispatch, clearStorage, resetAllReduxStates]);

  return {
    isAuthenticated,
    loginWithGoogle,
    loginWithDiscord,
    loginWithEmail,
    handleLogout,
  };
};
