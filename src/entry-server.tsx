import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { Analytics } from '@vercel/analytics/react';
import App from './App';

// Rendered by scripts/prerender.mjs at build time. It must produce the same
// tree as src/main.tsx, otherwise hydration would throw the markup away.
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>
  );
}
