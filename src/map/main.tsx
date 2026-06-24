/**
 * main.tsx — точка входа окна Карты (отдельная вкладка/окно браузера).
 * Открывается через window.open('/map.html') из главного PFD.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import { MapApp } from './MapApp';

const rootEl = document.getElementById('map-root');
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <MapApp />
    </React.StrictMode>,
  );
}
