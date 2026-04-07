import React from 'react'
import { Eye, EyeOff } from 'lucide-react'

/**
 * Paso 2: Credenciales de Acceso
 */
const CredentialsStep = ({
  formData,
  errors,
  showPassword,
  showConfirmPassword,
  onInputChange,
  onTogglePassword,
  onToggleConfirmPassword,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-xl font-semibold text-secondary-900">Credenciales de Acceso</h2>

      {/* Nombre de Usuario */}
      <div>
        <label className="block mb-2 text-sm font-medium text-secondary-700">
          Nombre de Usuario
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={onInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.username ? 'border-red-500' : 'border-secondary-300'
          }`}
          placeholder="juanperez"
        />
        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
      </div>

      {/* Contraseña */}
      <div>
        <label className="block mb-2 text-sm font-medium text-secondary-700">Contraseña</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 pr-10 ${
              errors.password ? 'border-red-500' : 'border-secondary-300'
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute transform -translate-y-1/2 right-3 top-1/2 text-secondary-500 hover:text-secondary-700"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        <p className="mt-1 text-xs text-secondary-500">
          Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
        </p>
      </div>

      {/* Confirmar Contraseña */}
      <div>
        <label className="block mb-2 text-sm font-medium text-secondary-700">
          Confirmar Contraseña
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 pr-10 ${
              errors.confirmPassword ? 'border-red-500' : 'border-secondary-300'
            }`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={onToggleConfirmPassword}
            className="absolute transform -translate-y-1/2 right-3 top-1/2 text-secondary-500 hover:text-secondary-700"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>
    </div>
  )
}

export default CredentialsStep
