import { atom } from 'nanostores';

/**
 * 커스텀 API 서버 URL (사용자 인증/세션 등)
 * InvokeAI API와 분리하여 관리
 */
export const $apiServerUrl = atom<string | undefined>();
