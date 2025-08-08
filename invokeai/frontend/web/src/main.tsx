import ReactDOM from 'react-dom/client';

import InvokeAIUI from './app/components/InvokeAIUI';
import { $apiServerUrl } from './app/store/nanostores/apiServerUrl';

// InvokeAI API URL (기존 백엔드) - /invokeai 경로 추가
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/invokeai';

// 커스텀 API 서버 URL - 환경에 따라 설정
const customApiServerUrl =
  import.meta.env.VITE_API_SERVER_URL ||
  (import.meta.env.VITE_MODE === 'development' ? 'http://localhost:8080' : 'https://pinksea.ai');
$apiServerUrl.set(customApiServerUrl);

console.log('🚀 main.tsx - API 서버 URL 설정:', {
  viteMode: import.meta.env.VITE_MODE,
  viteApiServerUrl: import.meta.env.VITE_API_SERVER_URL,
  customApiServerUrl,
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<InvokeAIUI apiUrl={apiUrl} />);
