import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import AdminRegistration from './components/AdminRegistration'
import ClientPanel from './components/ClientPanel'
import MyReservations from './components/MyReservations'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ToastNotification from './components/ToastNotification'
import BadgeUnlockedNotification from './components/BadgeUnlockedNotification'
import { APP_CONFIG } from '@/config/app.config'
import { installAuthInterceptor } from '@/utils/authInterceptor'
import { useSessionWatcher } from '@/hooks'
// import './utils/testNotifications' // Desactivado - solo activar para pruebas

// Instalar interceptor global que detecta tokens expirados (401/403) y
// fuerza logout + redirect al login en cualquier petición autenticada.
installAuthInterceptor()

function App() {
  // Vigilancia proactiva de expiración de sesión (sin depender de peticiones):
  // expulsa al login en el instante exacto en que vence el JWT.
  useSessionWatcher()

  // Limpiar localStorage una sola vez al cargar
  useEffect(() => {
    const currentVersion = localStorage.getItem('app-version')

    if (currentVersion !== APP_CONFIG.STORAGE_VERSION) {
      console.log('🔄 Limpiando localStorage y actualizando versión...')
      localStorage.clear()
      localStorage.setItem('app-version', APP_CONFIG.STORAGE_VERSION)
      window.location.reload()
    }
  }, [])

  return (
    <Router>
      <ToastNotification />
      <BadgeUnlockedNotification />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/register" element={<AdminRegistration />} />
        <Route path="/cliente" element={<ClientPanel />} />
        <Route path="/mis-reservas" element={<MyReservations />} />
        <Route path="/forgot-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
