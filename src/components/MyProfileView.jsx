import React, { useState } from 'react'
import { User, Phone, Mail, Lock, Save, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import Swal from 'sweetalert2'

const MyProfileView = () => {
  const { user, updateUserProfile, changePassword } = useAuthStore()

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  // Estado para datos del perfil
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })

  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})

  // Manejar actualización de perfil
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    // Validaciones
    const newErrors = {}

    if (!profileData.name.trim() || profileData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    }

    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'El correo electrónico no es válido'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await updateUserProfile({
        name: profileData.name.trim(),
        email: profileData.email || null,
      })

      Swal.fire({
        icon: 'success',
        title: '¡Perfil Actualizado!',
        text: 'Tus datos han sido actualizados correctamente',
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: '#22c55e',
      })

      setIsEditingProfile(false)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar el perfil',
        confirmButtonColor: '#22c55e',
      })
    }
  }

  // Manejar cambio de contraseña
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    // Validaciones
    const newErrors = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es obligatoria'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es obligatoria'
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'La contraseña debe tener al menos 8 caracteres'
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)

      Swal.fire({
        icon: 'success',
        title: '¡Contraseña Cambiada!',
        text: 'Tu contraseña ha sido actualizada correctamente',
        timer: 2000,
        showConfirmButton: false,
        confirmButtonColor: '#22c55e',
      })

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setIsChangingPassword(false)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo cambiar la contraseña',
        confirmButtonColor: '#22c55e',
      })
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          Mi Perfil
        </h2>
        <p className="text-sm sm:text-base text-gray-600">Gestiona tu información personal</p>
      </div>

      {/* Información Personal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <span className="text-sm sm:text-base">Información Personal</span>
          </h3>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Editar
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleProfileSubmit} className="space-y-3 sm:space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Juan Pérez"
              />
              {errors.name && (
                <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Teléfono (solo lectura) */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={profileData.phone}
                disabled
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-sm sm:text-base"
              />
              <p className="text-xs text-gray-500 mt-1">El teléfono no se puede modificar</p>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false)
                  setProfileData({
                    name: user?.name || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                  })
                  setErrors({})
                }}
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm sm:text-base"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                Guardar Cambios
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 border-b border-gray-100">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="text-sm sm:text-base font-medium text-gray-900">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3 border-b border-gray-100">
              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-sm sm:text-base font-medium text-gray-900">{user?.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 py-2 sm:py-3">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Correo Electrónico</p>
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  {user?.email || 'No registrado'}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Cambiar Contraseña */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-green-600" />
            Seguridad
          </h3>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Cambiar Contraseña
            </button>
          )}
        </div>

        {isChangingPassword ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Contraseña Actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Actual
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.currentPassword}
                </p>
              )}
            </div>

            {/* Nueva Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Mínimo 8 caracteres"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirmar Nueva Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Repite tu nueva contraseña"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false)
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  })
                  setErrors({})
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Cambiar Contraseña
              </button>
            </div>
          </form>
        ) : (
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Mantén tu cuenta segura cambiando tu contraseña regularmente
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default MyProfileView
