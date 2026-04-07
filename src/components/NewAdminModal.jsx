import React, { useState } from 'react'
import { X, User, Mail, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'

const NewAdminModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

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

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres'
    }

    // Validar username
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido'
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Solo se permiten letras, números y guiones bajos'
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un email válido'
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos una mayúscula, una minúscula y un número'
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await onSave({
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      })

      // Cerrar modal solo si el usuario se creó exitosamente
      handleClose()
    } catch (error) {
      Swal.fire({
        title: 'Error al crear usuario',
        text: error.message || 'No se pudo crear el usuario. Por favor, intenta nuevamente.',
        icon: 'error',
        confirmButtonColor: '#22c55e',
        showCloseButton: true,
        allowEscapeKey: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
    setErrors({})
    setIsLoading(false)
    setShowPassword(false)
    setShowConfirmPassword(false)
    onClose()
  }

  const generateUsername = () => {
    if (formData.name.trim()) {
      const username = formData.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 15)

      setFormData((prev) => ({
        ...prev,
        username: username,
      }))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-secondary-200">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-secondary-900">
                    Nuevo Administrador
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary-600">
                    Crear una nueva cuenta de administrador
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors duration-200"
                disabled={isLoading}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Nombre completo */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-secondary-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`
                        block w-full pl-8 sm:pl-10 pr-3 py-2 border rounded-lg focus:outline-none transition-colors duration-200 text-sm sm:text-base
                        ${
                          errors.name
                            ? 'border-red-300 focus:border-red-500 bg-red-50'
                            : 'border-secondary-300 focus:border-primary-500'
                        }
                      `}
                      placeholder="Ej: Carlos Ramírez"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-secondary-700">
                      Nombre de Usuario *
                    </label>
                    <button
                      type="button"
                      onClick={generateUsername}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      disabled={isLoading || !formData.name.trim()}
                    >
                      Generar automáticamente
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-secondary-400 text-sm">@</span>
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`
                        block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none transition-colors duration-200
                        ${
                          errors.username
                            ? 'border-red-300 focus:border-red-500 bg-red-50'
                            : 'border-secondary-300 focus:border-primary-500'
                        }
                      `}
                      placeholder="carlosramirez"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-secondary-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`
                        block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none transition-colors duration-200
                        ${
                          errors.email
                            ? 'border-red-300 focus:border-red-500 bg-red-50'
                            : 'border-secondary-300 focus:border-primary-500'
                        }
                      `}
                      placeholder="carlos@canchasapurimac.com"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-secondary-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`
                        block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none transition-colors duration-200
                        ${
                          errors.password
                            ? 'border-red-300 focus:border-red-500 bg-red-50'
                            : 'border-secondary-300 focus:border-primary-500'
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
                        <EyeOff className="h-4 w-4 text-secondary-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-secondary-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-secondary-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`
                        block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none transition-colors duration-200
                        ${
                          errors.confirmPassword
                            ? 'border-red-300 focus:border-red-500 bg-red-50'
                            : 'border-secondary-300 focus:border-primary-500'
                        }
                      `}
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-secondary-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-secondary-400" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Permisos info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-1">
                        Permisos de Administrador
                      </h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Gestionar canchas y reservas</li>
                        <li>• Ver analíticas del sistema</li>
                        <li>• Administrar pagos</li>
                        <li>• Configurar sistema</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base order-2 sm:order-1"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base order-1 sm:order-2
                      ${
                        isLoading
                          ? 'bg-secondary-200 text-secondary-500 cursor-not-allowed'
                          : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                      }
                    `}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Creando...</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Crear Administrador</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default NewAdminModal
