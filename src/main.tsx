import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    __bootStatus?: (key: string, status: string, msg?: string) => void;
    __bootBridgeReady?: () => void;
  }
}

createRoot(document.getElementById('root')!).render(
  <App />
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
