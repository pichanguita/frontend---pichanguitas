import React, { useState, useEffect } from 'react'
import { Shield, User, Building, UserPlus, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import AdminLogin from '../components/AdminLogin'
import ClientLogin from '../components/ClientLogin'
import AdminRegistration from '../components/AdminRegistration'
import useAuthStore from '../store/authStore'
import { USER_ROLES } from '@/constants'
import { APP_CONFIG } from '@/config/app.config'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'admin') // 'admin', 'client', 'register-field', 'register-client'

  // Redirección automática basada en autenticación y rol
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirigir según el rol del usuario
      if (user.role === USER_ROLES.SUPER_ADMIN || user.role === USER_ROLES.ADMIN) {
        navigate('/admin', { replace: true })
      } else if (user.role === USER_ROLES.CUSTOMER) {
        navigate('/cliente', { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate])

  const tabs = [
    { id: 'admin', label: 'Admin', icon: Shield, description: 'SuperAdmin y Administradores' },
    { id: 'client', label: 'Cliente', icon: User, description: 'Acceso para clientes' },
    {
      id: 'register-field',
      label: 'Inscribir Cancha',
      icon: Building,
      description: 'Registra tu cancha deportiva',
    },
    {
      id: 'register-client',
      label: 'Registrarse',
      icon: UserPlus,
      description: 'Crear cuenta de cliente',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-4 sm:py-8 md:py-12 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Botón Volver */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 px-3 py-2 sm:px-4 text-sm sm:text-base text-secondary-700 bg-white hover:bg-secondary-50 border-2 border-secondary-200 hover:border-primary-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">Volver al inicio</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary-900 mb-2">
            Bienvenido a Canchas Apurímac
          </h1>
          <p className="text-sm sm:text-base text-secondary-600">Selecciona el tipo de acceso</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isRegisterField = tab.id === 'register-field'
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center transition-all ${
                  isRegisterField
                    ? `${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-2xl sm:scale-110'
                          : 'bg-gradient-to-r from-orange-400 to-amber-400 text-white hover:from-orange-500 hover:to-amber-500 shadow-xl hover:scale-105 border-2 sm:border-4 border-orange-300'
                      } p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl font-bold min-w-[140px] sm:min-w-[160px]`
                    : `${
                        activeTab === tab.id
                          ? 'bg-primary-600 text-white shadow-lg sm:scale-105'
                          : 'bg-white text-secondary-700 hover:bg-primary-50 border-2 border-secondary-200'
                      } p-3 sm:p-4 rounded-lg sm:rounded-xl min-w-[120px] sm:min-w-[140px]`
                }`}
              >
                <Icon
                  className={`${isRegisterField ? 'w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10' : 'w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8'} mb-1 sm:mb-2 ${
                    isRegisterField
                      ? 'text-white'
                      : activeTab === tab.id
                        ? 'text-white'
                        : 'text-primary-600'
                  }`}
                />
                <span
                  className={`font-semibold text-xs sm:text-sm ${isRegisterField ? 'md:text-base' : ''}`}
                >
                  {tab.label}
                </span>
                <span
                  className={`text-xs mt-1 hidden sm:block ${
                    isRegisterField
                      ? 'text-orange-50 font-medium'
                      : activeTab === tab.id
                        ? 'text-primary-100'
                        : 'text-secondary-500'
                  }`}
                >
                  {tab.description}
                </span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-md mx-auto"
        >
          {activeTab === 'admin' && <AdminLogin />}
          {activeTab === 'client' && <ClientLogin defaultMode="login" />}
          {activeTab === 'register-field' && <AdminRegistration />}
          {activeTab === 'register-client' && <ClientLogin defaultMode="register" />}
        </motion.div>

        {/* Info Footer */}
        <div className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-secondary-600 px-4">
          <p className="mb-2">¿Necesitas ayuda?</p>
          <p>
            Contacta con nosotros:{' '}
            <span className="font-semibold text-primary-600">{APP_CONFIG.CONTACT_PHONE}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
