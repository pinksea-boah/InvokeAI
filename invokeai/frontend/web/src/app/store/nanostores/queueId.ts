import { atom } from 'nanostores';

export const DEFAULT_QUEUE_ID = 'default';

export const $queueId = atom<string>(DEFAULT_QUEUE_ID);

/**
 * 사용자별 Queue ID 생성
 * @param userId 사용자 ID
 * @returns 사용자별 Queue ID
 */
export const getUserQueueId = (userId: string): string => {
  console.log('🔧 getUserQueueId - userId:', userId);
  return `${userId}`;
};

/**
 * 현재 사용자의 Queue ID 설정
 * @param userId 사용자 ID
 */
export const setUserQueueId = (userId: string): void => {
  const userQueueId = getUserQueueId(userId);
  $queueId.set(userQueueId);
  /* eslint-disable no-console */
  console.log('🔧 Queue ID 설정:', { userId, userQueueId });
};

/**
 * 인증되지 않은 상태로 Queue ID 초기화
 */
export const resetQueueId = (): void => {
  $queueId.set(DEFAULT_QUEUE_ID);
  console.log('🔧 Queue ID 초기화:', DEFAULT_QUEUE_ID);
};
