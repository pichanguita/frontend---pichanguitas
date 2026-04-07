import { useState, useEffect } from 'react'
import { Eye, EyeOff, Shield, User, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import Swal from 'sweetalert2'

const AdminLogin = ({ onLoginSuccess }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { login, isBlocked, loginAttempts, security } = useAuthStore()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar errores cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const result = await login(formData)

      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: `Hola ${result.user}`,
        timer: 1500,
        showConfirmButton: false,
        showCloseButton: true,
        allowEscapeKey: true,
      }).then(() => {
        if (onLoginSuccess) onLoginSuccess()
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Autenticación',
        text: error.message,
        confirmButtonColor: '#22c55e',
        showCloseButton: true,
        allowEscapeKey: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const remainingAttempts = security.maxLoginAttempts - loginAttempts

  // Debug logs removed for production

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-md relative"
    >
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-2">
          Panel de Administración
        </h2>
        <p className="text-sm sm:text-base text-secondary-600">
          Ingresa tus credenciales para acceder
        </p>
      </div>

      {/* Security Status */}
      {loginAttempts > 0 && !isBlocked && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            <p className="text-amber-800 text-xs sm:text-sm">
              <strong>{remainingAttempts}</strong> intento{remainingAttempts !== 1 ? 's' : ''}{' '}
              restante{remainingAttempts !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Username Field */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Usuario o Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className={`
                  block w-full pl-9 sm:pl-10 pr-3 py-2 sm:py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 text-sm sm:text-base
                  ${
                    errors.username
                      ? 'border-red-300 focus:border-red-500 bg-red-50'
                      : 'border-secondary-200 focus:border-primary-500 bg-white'
                  }
                `}
              placeholder="admin o admin@canchasapurimac.com"
              disabled={isLoading}
            />
          </div>
          {errors.username && (
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {errors.username}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">Contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`
                  block w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 text-sm sm:text-base
                  ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 bg-red-50'
                      : 'border-secondary-200 focus:border-primary-500 bg-white'
                  }
                `}
              placeholder="••••••••"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-400 hover:text-secondary-600" />
              ) : (
                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-400 hover:text-secondary-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Forgot password */}
        <div className="text-right -mt-2">
          <Link to="/forgot-password" className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`
              w-full py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base
              ${
                isLoading
                  ? 'bg-secondary-200 text-secondary-500 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
              }
            `}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Verificando...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Iniciar Sesión</span>
            </>
          )}
        </button>
      </form>

      {/* Register Link */}
      <div className="mt-4 sm:mt-6 text-center">
        <p className="text-sm sm:text-base text-secondary-600">
          ¿No tienes una cuenta?{' '}
          <button
            onClick={() => navigate('/admin/register')}
            className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Inscribir mi cancha
          </button>
        </p>
      </div>

      {/* Security Features */}
      <div className="mt-4 sm:mt-6 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-secondary-500">
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Sesión segura</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Encriptación SSL</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Protección anti-fuerza bruta</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AdminLogin
