import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import { LanguageProvider } from './context/LanguageContext'
import { NotFound } from './components/NotFound'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <NotFound />
    </LanguageProvider>
    <Analytics />
  </StrictMode>,
)
