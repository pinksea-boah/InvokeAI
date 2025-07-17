import ReactDOM from 'react-dom/client';

import InvokeAIUI from './app/components/InvokeAIUI';
import { $apiServerUrl } from './app/store/nanostores/apiServerUrl';

// InvokeAI API URL (기존 백엔드)
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// 커스텀 API 서버 URL (개발 중)
const customApiServerUrl = import.meta.env.VITE_API_SERVER_URL || 'http://localhost:8080';
$apiServerUrl.set(customApiServerUrl);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<InvokeAIUI apiUrl={apiUrl} />);
