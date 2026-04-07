import React, { useState, useEffect } from 'react'
import { Save, Phone, Mail, MapPin, AlertCircle, Check } from 'lucide-react'
import Swal from 'sweetalert2'
import { API_CONFIG, getAuthHeaders } from '../config/api.config'

const ContactConfigManager = () => {
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    location: 'Perú',
    address: '',
    scheduleWeekdays: 'Lunes - Domingo',
    scheduleHours: '5:00 PM - 12:00 AM',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Validar formato de teléfono peruano (9 dígitos)
  const validatePhone = (phone) => {
    if (!phone) return true // Campo opcional
    const cleaned = phone.replace(/\s/g, '')
    return /^9\d{8}$/.test(cleaned) || /^\d{9}$/.test(cleaned)
  }

  // Validar formato de email
  const validateEmail = (email) => {
    if (!email) return true // Campo opcional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Validar todos los campos
  const validateForm = () => {
    const newErrors = {}

    if (contactInfo.phone && !validatePhone(contactInfo.phone)) {
      newErrors.phone = 'El teléfono debe tener 9 dígitos (ej: 987 654 321)'
    }

    if (contactInfo.email && !validateEmail(contactInfo.email)) {
      newErrors.email = 'El formato del email no es válido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Cargar configuración desde el backend
  useEffect(() => {
    const loadContactConfig = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(API_CONFIG.SITE_CONFIG.GET_BY_KEY('contact_info'))

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            let savedConfig = null

            // Compatibilidad: soportar formato nuevo (directo) y antiguo (en value como string)
            if (data.data.phone || data.data.email || data.data.location) {
              // Formato nuevo: datos directamente en data.data
              savedConfig = {
                phone: data.data.phone || '',
                email: data.data.email || '',
                location: data.data.location || 'Perú',
                address: data.data.address || '',
                scheduleWeekdays: data.data.scheduleWeekdays || 'Lunes - Domingo',
                scheduleHours: data.data.scheduleHours || '5:00 PM - 12:00 AM',
              }
            } else if (data.data.value) {
              // Formato antiguo: datos en value como JSON string
              try {
                savedConfig = typeof data.data.value === 'string'
                  ? JSON.parse(data.data.value)
                  : data.data.value
              } catch (e) {
                console.error('Error parseando configuración antigua:', e)
              }
            }

            if (savedConfig) {
              setContactInfo((prev) => ({
                ...prev,
                ...savedConfig,
              }))
            }
          }
        }
      } catch (error) {
        console.error('Error cargando configuración de contacto:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadContactConfig()
  }, [])

  const handleChange = (field, value) => {
    setContactInfo((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    // Validar antes de guardar
    if (!validateForm()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Datos incorrectos',
        text: 'Por favor corrige los errores antes de guardar',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    try {
      setIsSaving(true)

      // Guardar directamente en value (formato correcto)
      const response = await fetch(API_CONFIG.SITE_CONFIG.UPDATE('contact_info'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          value: contactInfo,
          type: 'json',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar')
      }

      await Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'La información de contacto se ha actualizado correctamente',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Error guardando configuración:', error)
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar la configuración',
        confirmButtonColor: '#22c55e',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-secondary-600">Cargando configuración...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Información de Contacto</h2>
          <p className="text-secondary-600 mt-1">
            Configura los datos de contacto que se mostrarán en el sitio
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-xl shadow-md border border-secondary-200 p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Teléfono */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-secondary-700 mb-2">
              <Phone className="w-4 h-4 text-primary-600" />
              <span>Teléfono de Contacto</span>
            </label>
            <input
              type="tel"
              value={contactInfo.phone}
              onChange={(e) => {
                handleChange('phone', e.target.value)
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }))
              }}
              placeholder="Ej: 987 654 321"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                errors.phone
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-secondary-200 focus:border-primary-500'
              }`}
            />
            {errors.phone ? (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            ) : (
              <p className="text-xs text-secondary-500 mt-1">
                Este número aparecerá en la sección de contacto y footer
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-secondary-700 mb-2">
              <Mail className="w-4 h-4 text-primary-600" />
              <span>Email de Contacto</span>
            </label>
            <input
              type="email"
              value={contactInfo.email}
              onChange={(e) => {
                handleChange('email', e.target.value)
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }))
              }}
              placeholder="Ej: contacto@tusitio.com"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                errors.email
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-secondary-200 focus:border-primary-500'
              }`}
            />
            {errors.email ? (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            ) : (
              <p className="text-xs text-secondary-500 mt-1">
                Email para consultas de clientes
              </p>
            )}
          </div>

          {/* Ubicación */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-secondary-700 mb-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span>Ciudad / Región</span>
            </label>
            <input
              type="text"
              value={contactInfo.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Ej: Apurímac, Perú"
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Dirección */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-secondary-700 mb-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span>Dirección (Opcional)</span>
            </label>
            <input
              type="text"
              value={contactInfo.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Ej: Av. Principal 123"
              className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Horarios de Atención */}
        <div className="mt-6 pt-6 border-t border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Horarios de Atención</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Días de Atención
              </label>
              <input
                type="text"
                value={contactInfo.scheduleWeekdays}
                onChange={(e) => handleChange('scheduleWeekdays', e.target.value)}
                placeholder="Ej: Lunes - Domingo"
                className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Horario
              </label>
              <input
                type="text"
                value={contactInfo.scheduleHours}
                onChange={(e) => handleChange('scheduleHours', e.target.value)}
                placeholder="Ej: 5:00 PM - 12:00 AM"
                className="w-full px-4 py-3 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vista previa */}
      <div className="bg-white rounded-xl shadow-md border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
          <Check className="w-5 h-5 text-green-600" />
          <span>Vista Previa</span>
        </h3>
        <div className="bg-secondary-50 rounded-lg p-4">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-secondary-900">Teléfono</p>
                <p className="text-secondary-600">{contactInfo.phone || '(No configurado)'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-secondary-900">Email</p>
                <p className="text-secondary-600">{contactInfo.email || '(No configurado)'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-secondary-900">Ubicación</p>
                <p className="text-secondary-600">{contactInfo.location || '(No configurado)'}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-secondary-200">
            <p className="text-sm text-secondary-600">
              <span className="font-medium">Horario:</span> {contactInfo.scheduleWeekdays} | {contactInfo.scheduleHours}
            </p>
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Información:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Estos datos aparecerán en la página de inicio y en el footer</li>
              <li>El teléfono se mostrará en la sección "¿Necesitas ayuda?"</li>
              <li>Los horarios se mostrarán en el pie de página</li>
              <li>Los cambios se aplican inmediatamente después de guardar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactConfigManager
