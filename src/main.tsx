import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './corrections.css'
import AppModern from './AppModern.tsx'
import PowerProvider from './PowerProvider.tsx'
createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <PowerProvider>
      <AppModern />
    </PowerProvider>
  </StrictMode>,
)
