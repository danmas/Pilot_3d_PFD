import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Сообщаем загрузочному экрану что React приложение готово
declare global {
  interface Window {
    __bootStatus?: (key: string, status: string, msg?: string) => void;
    __bootBridgeReady?: () => void;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// React отрендерился — скрываем boot screen
requestAnimationFrame(() => {
  if (window.__bootStatus) {
    window.__bootStatus('app', 'done', 'App loaded');
  }
  if (window.__bootBridgeReady) {
    window.__bootBridgeReady();
  }
});
