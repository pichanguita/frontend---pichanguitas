import React, { useState, useEffect } from 'react'
import { X, User, Mail, Shield, AlertCircle, Edit3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'

const EditUserModal = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: '',
    isActive: true,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        role: user.role || '',
        isActive: user.isActive !== undefined ? user.isActive : true,
      })
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await onSave(user.id, {
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        isActive: formData.isActive,
      })

      Swal.fire({
        title: '¡Usuario actualizado!',
        text: `Los datos de ${formData.name} han sido actualizados correctamente`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        showCloseButton: true,
        allowEscapeKey: true,
      })

      handleClose()
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.message,
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
      role: '',
      isActive: true,
    })
    setErrors({})
    setIsLoading(false)
    onClose()
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'admin':
        return 'bg-primary-100 text-primary-800 border-primary-200'
      default:
        return 'bg-secondary-100 text-secondary-800 border-secondary-200'
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrador'
      case 'admin':
        return 'Administrador'
      default:
        return role.charAt(0).toUpperCase() + role.slice(1)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary-900">Editar Usuario</h3>
                  <p className="text-sm text-secondary-600">Modificar información del usuario</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 transition-colors duration-200 rounded-lg hover:bg-secondary-100"
                disabled={isLoading}
              >
                <X className="w-5 h-5 text-secondary-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Current Role Display */}
              <div className="p-4 mb-6 rounded-lg bg-secondary-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm font-medium text-secondary-700">Rol actual:</p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(user.role)}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  {user.role === 'super_admin' && (
                    <div className="text-right">
                      <Shield className="w-5 h-5 text-red-600" />
                      <p className="mt-1 text-xs text-red-600">No editable</p>
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre completo */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-secondary-700">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="w-4 h-4 text-secondary-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`
                        block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none transition-colors duration-200
                        ${
                          errors.name
                            ? 'border-red-300 focus:border-red-500 bg-red-50'
                            : 'border-secondary-300 focus:border-primary-500'
                        }
                      `}
                      placeholder="Nombre completo"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <p className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-secondary-700">
                    Nombre de Usuario *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-sm text-secondary-400">@</span>
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
                      placeholder="username"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.username && (
                    <p className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-secondary-700">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="w-4 h-4 text-secondary-400" />
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
                      placeholder="email@example.com"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="flex items-center mt-1 text-sm text-red-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Estado del usuario */}
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 bg-white rounded text-primary-600 border-secondary-300 focus:ring-primary-500"
                      disabled={isLoading || user.role === 'super_admin'}
                    />
                    <div>
                      <span className="text-sm font-medium text-secondary-900">Usuario activo</span>
                      <p className="text-xs text-secondary-600">
                        Los usuarios inactivos no pueden iniciar sesión
                      </p>
                    </div>
                  </label>
                </div>

                {/* Información adicional */}
                <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-amber-900">
                        Información importante
                      </h4>
                      <ul className="space-y-1 text-xs text-amber-700">
                        <li>• Los cambios se aplicarán inmediatamente</li>
                        <li>• El rol de Super Administrador no se puede modificar</li>
                        <li>• Para cambiar contraseña, contacta al usuario</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="p-4 rounded-lg bg-secondary-50">
                  <h4 className="mb-3 text-sm font-medium text-secondary-800">
                    Información del registro
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-xs text-secondary-600">
                    <div className="flex justify-between">
                      <span>ID de Usuario:</span>
                      <span className="font-mono">{user.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Creado:</span>
                      <span>{new Date(user.createdAt).toLocaleDateString('es-PE')}</span>
                    </div>
                    {user.lastLogin && (
                      <div className="flex justify-between">
                        <span>Último login:</span>
                        <span>{new Date(user.lastLogin).toLocaleDateString('es-PE')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end pt-4 space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 font-medium transition-colors duration-200 rounded-lg text-secondary-700 bg-secondary-100 hover:bg-secondary-200"
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
                      ${
                        isLoading
                          ? 'bg-secondary-200 text-secondary-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      }
                    `}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 rounded-full border-secondary-400 border-t-transparent animate-spin"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" />
                        <span>Guardar Cambios</span>
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

export default EditUserModal
