import React from 'react';
import { createRoot } from 'react-dom/client';
import Admin from './pages/Admin';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Admin />
    </React.StrictMode>
  );
} 