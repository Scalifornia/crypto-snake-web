import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ensureAppLocaleFallbacks } from './i18n/localeFallbacks';
import './styles/global.css';

ensureAppLocaleFallbacks();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
