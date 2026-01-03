import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Tailwind CSS - Système de design principal
import './styles/tailwind.css'
// Styles legacy (migration progressive)
import './index.css'
import './corrections.css'
import './styles/theme.css'
import './styles/forms.css'
import './styles/modals.css'
import './styles/components.css'
// Nouveau design moderne épuré (CommercePilot style)
import './styles/modern-design.css'
import AppModern from './AppModern.tsx'
import PowerProvider from './PowerProvider.tsx'
createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <PowerProvider>
      <AppModern />
    </PowerProvider>
  </StrictMode>,
)
