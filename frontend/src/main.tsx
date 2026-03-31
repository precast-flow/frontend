import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/themes/glassmorphism.css'
import App from './App.tsx'

document.documentElement.dataset.uiTemplate = 'glass'
document.documentElement.setAttribute('data-ui-template', 'glass')
try {
  localStorage.removeItem('ui-template')
} catch {
  /* ignore */
}

const originalWarn = console.warn.bind(console)
console.warn = (...args: unknown[]) => {
  const first = args[0]
  if (
    typeof first === 'string' &&
    first.includes('THREE.THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.')
  ) {
    return
  }
  originalWarn(...args)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
