import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { MediConnectProvider } from './context/MediConnectContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MediConnectProvider>
      <App />
    </MediConnectProvider>
  </StrictMode>,
)
