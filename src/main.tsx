import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './utils/AuthContext'
import { FaceRecognitionProvider } from './utils/Providers/FaceRecognitionProvider'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <FaceRecognitionProvider>
        <App />
        <Toaster position="top-right" />
      </FaceRecognitionProvider>
    </AuthProvider>
  </StrictMode>,
)
