import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, KeyRound } from 'lucide-react'
import Swal from 'sweetalert2'
import {
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
} from '../services/auth/passwordResetService'

/**
 * Pagina de recuperacion de contrasena
 * Ruta /forgot-password -> formulario de email
 * Ruta /reset-password/:token -> formulario de nueva contrasena
 */
const ResetPasswordPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  // Si hay token en la URL, mostrar formulario de nueva contrasena
  // Si no, mostrar formulario de solicitar email
  return token ? <ResetForm token={token} navigate={navigate} /> : <ForgotForm navigate={navigate} />
}

/**
 * Formulario "Olvidé mi contrasena" - pide el email
 */
const ForgotForm = ({ navigate }) => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Ingresa tu correo electrónico')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresa un correo válido')
      return
    }

    setIsLoading(true)
    try {
      const result = await requestPasswordReset(email.trim())

      if (result.success) {
        setSent(true)
      } else {
        setError(result.error || 'Error al enviar la solicitud')
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <PageWrapper>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Revisa tu correo</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-2">
            Si <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
          </p>
          <p className="text-gray-500 text-xs sm:text-sm mb-6">
            Revisa también tu carpeta de spam. El enlace expira en 1 hora.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm sm:text-base"
          >
            Volver al inicio de sesión
          </button>
        </motion.div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                className={`block w-full pl-10 pr-3 py-2.5 border-2 rounded-xl focus:outline-none transition-colors text-sm sm:text-base ${
                  error ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-green-500'
                }`}
                placeholder="tu@correo.com"
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar enlace de recuperación'
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link to="/login" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </motion.div>
    </PageWrapper>
  )
}

/**
 * Formulario para registrar nueva contrasena (llega desde el email)
 */
const ResetForm = ({ token, navigate }) => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [userName, setUserName] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const verify = async () => {
      try {
        const result = await verifyResetToken(token)
        if (result.success) {
          setTokenValid(true)
          setUserName(result.data?.name || '')
        } else {
          setTokenValid(false)
        }
      } catch {
        setTokenValid(false)
      } finally {
        setIsVerifying(false)
      }
    }
    verify()
  }, [token])

  const validate = () => {
    const newErrors = {}
    if (!password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres'
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const result = await resetPassword(token, password)

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Contraseña restablecida!',
          text: 'Ya puedes iniciar sesión con tu nueva contraseña.',
          confirmButtonColor: '#16a34a',
        }).then(() => navigate('/login'))
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.error || 'No se pudo restablecer la contraseña.',
          confirmButtonColor: '#16a34a',
        })
      }
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'Intenta nuevamente.',
        confirmButtonColor: '#16a34a',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <PageWrapper>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </PageWrapper>
    )
  }

  if (!tokenValid) {
    return (
      <PageWrapper>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Enlace inválido o expirado</h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6">
            Este enlace ya fue utilizado o ha expirado. Solicita uno nuevo.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm sm:text-base"
            >
              Solicitar nuevo enlace
            </button>
            <Link to="/login" className="block text-sm text-green-600 hover:text-green-700 font-medium">
              Volver al inicio de sesión
            </Link>
          </div>
        </motion.div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Nueva contraseña
          </h2>
          {userName && (
            <p className="text-gray-600 text-sm sm:text-base">
              Hola <strong>{userName}</strong>, ingresa tu nueva contraseña.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nueva contrasena */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: ''}) }}
                className={`block w-full pl-10 pr-10 py-2.5 border-2 rounded-xl focus:outline-none transition-colors text-sm sm:text-base ${
                  errors.password ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-green-500'
                }`}
                placeholder="Mínimo 6 caracteres"
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />{errors.password}
              </p>
            )}
          </div>

          {/* Confirmar contrasena */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckCircle className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors({...errors, confirmPassword: ''}) }}
                className={`block w-full pl-10 pr-10 py-2.5 border-2 rounded-xl focus:outline-none transition-colors text-sm sm:text-base ${
                  errors.confirmPassword ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-gray-200 focus:border-green-500'
                }`}
                placeholder="Repite tu contraseña"
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                {showConfirm ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />{errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar nueva contraseña'
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link to="/login" className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </motion.div>
    </PageWrapper>
  )
}

/**
 * Wrapper de la pagina con fondo
 */
const PageWrapper = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
    {children}
  </div>
)

export default ResetPasswordPage
