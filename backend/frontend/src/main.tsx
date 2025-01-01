import { AuthProvider } from './components/context/AuthContext.tsx'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <AuthProvider>
        <App />
    </AuthProvider>
)
