import { useStore } from '@nanostores/react';
import { $authToken } from 'app/store/nanostores/authToken';
import { $baseUrl } from 'app/store/nanostores/baseUrl';
import { $isDebugging } from 'app/store/nanostores/isDebugging';
import { useAppStore } from 'app/store/storeHooks';
import { useAssertSingleton } from 'common/hooks/useAssertSingleton';
import type { MapStore } from 'nanostores';
import { useEffect, useMemo } from 'react';
import { selectQueueStatus } from 'services/api/endpoints/queue';
import { setEventListeners } from 'services/events/setEventListeners';
import type { AppSocket } from 'services/events/types';
import type { ManagerOptions, SocketOptions } from 'socket.io-client';
import { io } from 'socket.io-client';

import { $isConnected, $lastProgressEvent, $socket, $socketOptions } from './stores';

// Inject socket options and url into window for debugging
declare global {
  interface Window {
    $socketOptions?: MapStore<Partial<ManagerOptions & SocketOptions>>;
  }
}

/**
 * Initializes the socket.io connection and sets up event listeners.
 */
export const useSocketIO = () => {
  useAssertSingleton('useSocketIO');
  const store = useAppStore();
  const baseUrl = useStore($baseUrl);
  const authToken = useStore($authToken);
  const addlSocketOptions = useStore($socketOptions);

  const socketUrl = useMemo(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    // 백엔드 URL을 동적으로 가져오기
    const backendUrl = baseUrl || window.location.origin;
    const url = new URL(backendUrl);
    return `${wsProtocol}://${url.hostname}:${url.port || (wsProtocol === 'wss' ? '443' : '80')}`;
  }, [baseUrl]);

  const socketOptions = useMemo(() => {
    const options: Partial<ManagerOptions & SocketOptions> = {
      timeout: 60000,
      path: baseUrl ? '/ws/socket.io' : `${window.location.pathname}ws/socket.io`,
      autoConnect: false, // achtung! removing this breaks the dynamic middleware
      forceNew: true,
    };

    if (authToken) {
      options.auth = { token: authToken };
      options.extraHeaders = { Authorization: `Bearer ${authToken}` };
      options.transports = ['websocket', 'polling'];
    }

    return { ...options, ...addlSocketOptions };
  }, [authToken, addlSocketOptions, baseUrl]);

  useEffect(() => {
    // 디버깅: Socket.IO 연결 정보 출력
    console.log('🔌 Socket.IO 연결 시도:', {
      socketUrl,
      hasAuthToken: !!authToken,
      tokenPreview: authToken ? `${authToken.substring(0, 20)}...` : null,
      socketOptions: {
        path: socketOptions.path,
        auth: socketOptions.auth,
        transports: socketOptions.transports,
      },
    });

    const socket: AppSocket = io(socketUrl, socketOptions);
    $socket.set(socket);

    setEventListeners({ socket, store, setIsConnected: $isConnected.set });

    socket.connect();

    if ($isDebugging.get() || import.meta.env.MODE === 'development') {
      window.$socketOptions = $socketOptions;
      // This is only enabled manually for debugging, console is allowed.
      /* eslint-disable-next-line no-console */
      console.log('Socket initialized', socket);
    }

    const unsubscribeQueueStatusListener = store.subscribe(() => {
      const queueStatusData = selectQueueStatus(store.getState()).data;
      if (!queueStatusData || queueStatusData.queue.in_progress === 0) {
        $lastProgressEvent.set(null);
      }
    });

    return () => {
      if ($isDebugging.get() || import.meta.env.MODE === 'development') {
        window.$socketOptions = undefined;
        // This is only enabled manually for debugging, console is allowed.
        /* eslint-disable-next-line no-console */
        console.log('Socket teardown', socket);
      }
      unsubscribeQueueStatusListener();
      socket.disconnect();
    };
  }, [socketOptions, socketUrl, store]);
};
