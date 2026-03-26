
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

import './styles/index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <HelmetProvider>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <App />
    </BrowserRouter>
  </HelmetProvider>
);

// ── Registro del Service Worker (PWA) ─────────────────────────────
// Se registra después de que carga la app para no bloquear el LCP.
// En desarrollo, usa el modo 'development' de Vite que no activa el SW.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.info('[PWA] Service Worker registrado:', reg.scope);
      })
      .catch((err) => {
        console.warn('[PWA] Error al registrar el Service Worker:', err);
      });
  });
}