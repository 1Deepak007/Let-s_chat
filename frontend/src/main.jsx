import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { FontProvider } from './contexts/FontContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FontProvider>
      <App />
    </FontProvider>
  </StrictMode>,
)