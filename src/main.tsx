import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.tsx'

const container = document.getElementById('root')!
const tree = (
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>
)

// index.html ships prerendered markup (see scripts/prerender.mjs); 404.html
// does not, so fall back to a plain client render there.
if (container.firstElementChild) hydrateRoot(container, tree)
else createRoot(container).render(tree)
