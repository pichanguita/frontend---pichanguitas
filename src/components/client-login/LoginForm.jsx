import React from 'react'
import { Phone, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import InputField from './InputField'

const LoginForm = ({
  loginData,
  setLoginData,
  errors,
  isLoading,
  showPassword,
  setShowPassword,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
      <InputField
        label="Teléfono"
        type="tel"
        value={loginData.phone}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '')
          if (value.length <= 9) {
            setLoginData({ ...loginData, phone: value })
          }
        }}
        placeholder="999888777"
        Icon={Phone}
        error={errors.phone}
        maxLength={9}
      />

      <InputField
        label="Contraseña"
        value={loginData.password}
        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
        placeholder="••••••••"
        Icon={Lock}
        error={errors.password}
        showPasswordToggle
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword(!showPassword)}
      />

      <div className="text-right">
        <Link to="/forgot-password" className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 sm:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  )
}

export default LoginForm
