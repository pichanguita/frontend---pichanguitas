import React, { useState } from 'react'
import { X, User, Phone, Mail, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SimpleClientRegistrationModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    notes: '',
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio'
    }

    // Validar teléfono
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'El teléfono es obligatorio'
    } else if (!/^9\d{8}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'El teléfono debe tener 9 dígitos y comenzar con 9'
    }

    // Validar email (opcional, pero si se ingresa debe ser válido)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      // Llamar a onSave con los datos del cliente y esperar resultado
      await onSave(formData)

      // Solo limpiar formulario si la operación fue exitosa
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        notes: '',
      })
      setErrors({})
    } catch {
      // Si hay error (ej: teléfono duplicado), NO limpiar el formulario
      // El error ya se muestra en el componente padre con SweetAlert
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      phoneNumber: '',
      email: '',
      notes: '',
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Registrar Nuevo Cliente</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nombre Completo *
                </div>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Juan Pérez García"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Teléfono *
                </div>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 9)
                  setFormData({ ...formData, phoneNumber: value })
                }}
                placeholder="999888777"
                maxLength="9"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.phoneNumber
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Debe comenzar con 9 y tener 9 dígitos</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email (Opcional)
                </div>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="cliente@email.com"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-primary-500'
                }`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notas (Opcional)
                </div>
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Información adicional del cliente..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                ℹ️ Este cliente estará disponible para seleccionar cuando crees nuevas reservas.
              </p>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
            >
              Registrar Cliente
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SimpleClientRegistrationModal
