// Funciones de validación para el formulario de Nueva Cancha

import { VALIDATION_LIMITS } from './fieldConstants'

/**
 * Valida todos los campos del formulario
 * @param {Object} formData - Datos del formulario
 * @param {Array} images - Array de imágenes cargadas
 * @returns {Object} Objeto con errores encontrados
 */
export const validateForm = (formData, images) => {
  const newErrors = {}

  // Validar nombre
  if (!formData.name.trim()) {
    newErrors.name = 'El nombre de la cancha es requerido'
  }

  // Validar ubicación geográfica
  if (!formData.departamento || formData.departamento === '') {
    newErrors.departamento = 'El departamento es requerido'
  }

  if (!formData.provincia || formData.provincia === '') {
    newErrors.provincia = 'La provincia es requerida'
  }

  if (!formData.distrito || formData.distrito === '') {
    newErrors.distrito = 'El distrito es requerido'
  }

  // Validar dirección
  if (!formData.address.trim()) {
    newErrors.address = 'La dirección es requerida'
  }

  // Validar teléfono
  if (!formData.phone.trim()) {
    newErrors.phone = 'El teléfono es requerido'
  } else {
    // Quitar espacios para validar
    const phoneDigits = formData.phone.replace(/\s/g, '')
    if (
      phoneDigits.length !== VALIDATION_LIMITS.phone.length ||
      !VALIDATION_LIMITS.phone.pattern.test(phoneDigits)
    ) {
      newErrors.phone = 'El teléfono debe tener exactamente 9 dígitos'
    }
  }

  // Validar precio por hora (siempre obligatorio)
  if (!formData.pricePerHour) {
    newErrors.pricePerHour = 'El precio por hora es obligatorio'
  } else if (
    formData.pricePerHour &&
    (formData.pricePerHour < VALIDATION_LIMITS.price.min ||
      formData.pricePerHour > VALIDATION_LIMITS.price.max)
  ) {
    newErrors.pricePerHour = `El precio debe estar entre S/ ${VALIDATION_LIMITS.price.min} y S/ ${VALIDATION_LIMITS.price.max}`
  }

  // Validar adelanto (requerido solo si requiresAdvancePayment está activo)
  if (formData.requiresAdvancePayment) {
    if (!formData.advancePaymentAmount || formData.advancePaymentAmount < 1) {
      newErrors.advancePaymentAmount = 'El monto de adelanto es requerido y debe ser mayor a 0'
    }
  }

  // Validar latitud
  if (!formData.latitude || formData.latitude === '') {
    newErrors.latitude = 'La latitud es requerida'
  } else if (isNaN(parseFloat(formData.latitude))) {
    newErrors.latitude = 'Latitud debe ser un número'
  } else {
    const lat = parseFloat(formData.latitude)
    if (lat < -90 || lat > 90) {
      newErrors.latitude = 'Latitud debe estar entre -90 y 90 grados'
    }
  }

  // Validar longitud
  if (!formData.longitude || formData.longitude === '') {
    newErrors.longitude = 'La longitud es requerida'
  } else if (isNaN(parseFloat(formData.longitude))) {
    newErrors.longitude = 'Longitud debe ser un número'
  } else {
    const lng = parseFloat(formData.longitude)
    if (lng < -180 || lng > 180) {
      newErrors.longitude = 'Longitud debe estar entre -180 y 180 grados'
    }
  }

  // Validar dimensiones - largo
  if (!formData.dimensions.length) {
    newErrors['dimensions.length'] = 'El largo de la cancha es requerido'
  } else if (formData.dimensions.length < 1) {
    newErrors['dimensions.length'] = 'El largo debe ser mayor a 0 metros'
  }

  // Validar dimensiones - ancho
  if (!formData.dimensions.width) {
    newErrors['dimensions.width'] = 'El ancho de la cancha es requerido'
  } else if (formData.dimensions.width < 1) {
    newErrors['dimensions.width'] = 'El ancho debe ser mayor a 0 metros'
  }

  // Validar imágenes
  if (images.length === 0) {
    newErrors.images = 'Debe subir al menos una foto de la cancha'
  }

  // Validar deportes
  if (formData.sportTypes.length === 0) {
    newErrors.sportTypes = 'Debe seleccionar al menos un deporte'
  }

  return newErrors
}

/**
 * Valida el formato del teléfono
 * @param {string} phone - Número de teléfono
 * @returns {boolean} True si es válido
 */
export const validatePhone = (phone) => {
  return (
    phone.length === VALIDATION_LIMITS.phone.length && VALIDATION_LIMITS.phone.pattern.test(phone)
  )
}

/**
 * Valida el tamaño y tipo de archivo de imagen
 * @param {File} file - Archivo a validar
 * @returns {Object} { isValid: boolean, error: string, message: string }
 */
export const validateImageFile = (file) => {
  // Validar tipo de archivo
  if (!file.type.startsWith(VALIDATION_LIMITS.files.image.acceptedTypes[0])) {
    return {
      isValid: false,
      error: 'INVALID_TYPE',
      message: 'Solo se permiten archivos de imagen (JPG, PNG, WebP)',
    }
  }

  // Validar tamaño
  if (file.size > VALIDATION_LIMITS.files.image.maxSize) {
    return {
      isValid: false,
      error: 'FILE_TOO_LARGE',
      message: 'Las imágenes deben ser menores a 10MB',
    }
  }

  return { isValid: true, error: null, message: null }
}

/**
 * Valida el tamaño y tipo de archivo de video
 * @param {File} file - Archivo a validar
 * @returns {Object} { isValid: boolean, error: string, message: string }
 */
export const validateVideoFile = (file) => {
  // Validar tipo de archivo
  if (!file.type.startsWith(VALIDATION_LIMITS.files.video.acceptedTypes[0])) {
    return {
      isValid: false,
      error: 'INVALID_TYPE',
      message: 'Solo se permiten archivos de video (MP4, WebM, MOV)',
    }
  }

  // Validar tamaño
  if (file.size > VALIDATION_LIMITS.files.video.maxSize) {
    return {
      isValid: false,
      error: 'FILE_TOO_LARGE',
      message: 'Los videos deben ser menores a 20MB',
    }
  }

  return { isValid: true, error: null, message: null }
}

/**
 * Sanitiza un número de teléfono, dejando solo dígitos
 * @param {string} phone - Número de teléfono
 * @returns {string} Solo números
 */
export const sanitizePhone = (phone) => {
  return phone.replace(/\D/g, '')
}

/**
 * Formatea un número de teléfono agregando espacios cada 3 dígitos
 * Formato: XXX XXX XXX
 * @param {string} phone - Número de teléfono (solo dígitos)
 * @returns {string} Teléfono formateado con espacios
 */
export const formatPhone = (phone) => {
  // Eliminar todo lo que no sea número
  const cleaned = phone.replace(/\D/g, '')

  // Limitar a 9 dígitos
  const limited = cleaned.substring(0, 9)

  // Formatear con espacios cada 3 dígitos
  const parts = []
  for (let i = 0; i < limited.length; i += 3) {
    parts.push(limited.substring(i, i + 3))
  }

  return parts.join(' ')
}

/**
 * Obtiene solo los números de un teléfono formateado
 * @param {string} formattedPhone - Teléfono formateado (con espacios)
 * @returns {string} Solo números sin espacios
 */
export const unformatPhone = (formattedPhone) => {
  return formattedPhone.replace(/\s/g, '')
}
