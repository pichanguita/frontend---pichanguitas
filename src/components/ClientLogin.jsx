import React from 'react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import { useClientLogin } from '../hooks/useClientLogin'
import { LoginForm, RegisterForm } from './client-login'
import { APP_CONFIG } from '../config/app.config'

const ClientLogin = ({ defaultMode = 'login' }) => {
  const authStore = useAuthStore()
  const {
    isLoginMode,
    setIsLoginMode,
    showPassword,
    setShowPassword,
    isLoading,
    loginData,
    setLoginData,
    registerData,
    setRegisterData,
    errors,
    handleLoginSubmit,
    handleRegisterSubmit,
  } = useClientLogin(authStore, defaultMode)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md"
    >
      {/* Logo/Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="inline-block bg-white p-3 sm:p-4 rounded-full shadow-lg mb-3 sm:mb-4">
          <div className="text-3xl sm:text-4xl">⚽</div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Canchas Apurímac</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {isLoginMode ? 'Inicia sesión para reservar' : 'Crea tu cuenta'}
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
        {/* Toggle Login/Register */}
        <div className="flex gap-2 mb-4 sm:mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setIsLoginMode(true)}
            className={`flex-1 py-2 px-3 sm:px-4 rounded-lg font-medium transition-all text-sm sm:text-base ${
              isLoginMode
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`flex-1 py-2 px-3 sm:px-4 rounded-lg font-medium transition-all text-sm sm:text-base ${
              !isLoginMode
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Formularios */}
        {isLoginMode ? (
          <LoginForm
            loginData={loginData}
            setLoginData={setLoginData}
            errors={errors}
            isLoading={isLoading}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onSubmit={handleLoginSubmit}
          />
        ) : (
          <RegisterForm
            registerData={registerData}
            setRegisterData={setRegisterData}
            errors={errors}
            isLoading={isLoading}
            onSubmit={handleRegisterSubmit}
          />
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-gray-600 text-xs sm:text-sm mt-4 sm:mt-6">
        ¿Necesitas ayuda? Contáctanos al {APP_CONFIG.CONTACT_PHONE}
      </p>
    </motion.div>
  )
}

export default ClientLogin
