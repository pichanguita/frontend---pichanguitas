import Swal from 'sweetalert2'
import { Image, FileText, File } from 'lucide-react'

/**
 * Validación para el paso 1: Información Personal
 */
export const validatePersonalInfo = (formData) => {
  const errors = {}

  if (!formData.firstName.trim()) {
    errors.firstName = 'El nombre es requerido'
  }
  if (!formData.lastName.trim()) {
    errors.lastName = 'El apellido es requerido'
  }
  if (!formData.email.trim()) {
    errors.email = 'El correo electrónico es requerido'
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Correo electrónico inválido'
  }
  if (!formData.phone.trim()) {
    errors.phone = 'El teléfono es requerido'
  } else if (!/^\d{9}$/.test(formData.phone)) {
    errors.phone = 'El teléfono debe tener 9 dígitos'
  }
  if (!formData.dni.trim()) {
    errors.dni = 'El DNI es requerido'
  } else if (!/^\d{8}$/.test(formData.dni)) {
    errors.dni = 'El DNI debe tener 8 dígitos'
  }
  if (!formData.ownerAddress.trim()) {
    errors.ownerAddress = 'La dirección es requerida'
  }
  if (!formData.city.trim()) {
    errors.city = 'La ciudad es requerida'
  }
  if (!formData.department.trim()) {
    errors.department = 'El departamento es requerido'
  }
  if (!formData.district.trim()) {
    errors.district = 'El distrito es requerido'
  }

  return errors
}

/**
 * Validación para el paso 2: Credenciales
 */
export const validateCredentials = (formData) => {
  const errors = {}

  if (!formData.username.trim()) {
    errors.username = 'El nombre de usuario es requerido'
  } else if (formData.username.length < 4) {
    errors.username = 'El usuario debe tener al menos 4 caracteres'
  }
  if (!formData.password.trim()) {
    errors.password = 'La contraseña es requerida'
  } else if (formData.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres'
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = 'La contraseña debe contener mayúsculas, minúsculas y números'
  }
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Las contraseñas no coinciden'
  }

  return errors
}

/**
 * Validación para el paso 3: Información del Negocio
 */
export const validateBusinessInfo = (formData) => {
  const errors = {}

  if (!formData.businessName.trim()) {
    errors.businessName = 'El nombre del negocio es requerido'
  }
  if (!formData.businessAddress.trim()) {
    errors.businessAddress = 'La dirección es requerida'
  }
  if (!formData.sportTypes || formData.sportTypes.length === 0) {
    errors.sportTypes = 'Debes seleccionar al menos un tipo de deporte'
  }

  return errors
}

/**
 * Validación para el paso 4: Detalles Adicionales
 */
export const validateDetails = (formData) => {
  const errors = {}

  if (!formData.reasonToJoin.trim()) {
    errors.reasonToJoin = 'Por favor explica por qué quieres inscribir tu cancha'
  }
  if (!formData.termsAccepted) {
    errors.termsAccepted = 'Debes aceptar los términos y condiciones'
  }

  return errors
}

/**
 * Validación general por paso
 */
export const validateStep = (step, formData) => {
  switch (step) {
    case 1:
      return validatePersonalInfo(formData)
    case 2:
      return validateCredentials(formData)
    case 3:
      return validateBusinessInfo(formData)
    case 4:
      return validateDetails(formData)
    default:
      return {}
  }
}

/**
 * Geocodificación inversa usando Nominatim
 */
export const geocodeReverse = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    )
    const data = await response.json()

    if (data && data.display_name) {
      const address = data.address || {}
      let formattedAddress = ''

      if (address.road) {
        formattedAddress += address.road
        if (address.house_number) {
          formattedAddress += ' ' + address.house_number
        }
      } else if (address.village || address.town || address.city) {
        formattedAddress += address.village || address.town || address.city
      } else {
        formattedAddress = data.display_name.split(',')[0]
      }

      return formattedAddress
    }
  } catch (_error) {
    // Fallo silencioso - la función retorna null y el caller maneja la ausencia
  }
  return null
}

/**
 * Búsqueda de direcciones con Nominatim
 */
export const searchAddress = async (searchQuery) => {
  if (!searchQuery.trim()) {
    return []
  }

  try {
    const query = searchQuery.includes('Perú') ? searchQuery : `${searchQuery}, Perú`

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=pe`
    )
    const data = await response.json()

    if (data && data.length > 0) {
      return data
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Sin resultados',
        text: 'No se encontraron resultados para tu búsqueda. Intenta con otra dirección.',
        confirmButtonColor: '#22c55e',
      })
      return []
    }
  } catch (error) {
    console.error('Error al buscar dirección:', error)
    Swal.fire({
      icon: 'error',
      title: 'Error en la búsqueda',
      text: 'Ocurrió un error al buscar la dirección. Intenta nuevamente.',
      confirmButtonColor: '#ef4444',
    })
    return []
  }
}

/**
 * Obtener ubicación actual del usuario
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no disponible'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        resolve({ latitude, longitude })
      },
      (error) => {
        let message = 'No se pudo obtener tu ubicación'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permiso de geolocalización denegado'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Información de ubicación no disponible'
            break
          case error.TIMEOUT:
            message = 'Tiempo de espera agotado'
            break
        }

        reject(new Error(message))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    )
  })
}

/**
 * Validar tamaño de archivo
 */
export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxBytes) {
    Swal.fire({
      icon: 'error',
      title: 'Archivo muy grande',
      text: `El archivo debe ser menor a ${maxSizeMB}MB`,
      confirmButtonColor: '#ef4444',
    })
    return false
  }
  return true
}

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Obtener icono según tipo de archivo
 */
export const getFileIcon = (type) => {
  if (type.startsWith('image/')) return Image
  if (type.includes('pdf')) return FileText
  return File
}

/**
 * Procesar archivo para subida
 * Guarda tanto la metadata como el archivo File real
 */
export const processFile = (file) => {
  return {
    id: Date.now() + Math.random(),
    name: file.name,
    size: file.size,
    type: file.type,
    file: file, // ⭐ Guardar el objeto File real para subirlo después
  }
}

/**
 * Leer archivo como DataURL (para imágenes)
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}

/**
 * Preparar datos del formulario para envío a la API
 * No incluye archivos File, solo metadata
 */
export const prepareRegistrationData = (formData) => {
  // Preparar metadata de documentos y fotos (sin objetos File ni base64)
  const documentsMetadata = (formData.documents || []).map((doc) => ({
    id: doc.id,
    name: doc.name,
    size: doc.size,
    type: doc.type,
    // No incluir doc.file ni doc.data
  }))

  const photosMetadata = (formData.photos || []).map((photo) => ({
    id: photo.id,
    name: photo.name,
    size: photo.size,
    type: photo.type,
    // No incluir photo.file ni photo.data
  }))

  // Preparar documentos adicionales en formato JSON
  const additionalDocuments = {
    sportTypes: formData.sportTypes || [],
    businessRuc: formData.businessRuc || '',
    businessPhone: formData.businessPhone || '',
    businessReference: formData.businessReference || '',
    businessCoordinates: {
      latitude: formData.businessLatitude || formData.businessCoordinates?.[0],
      longitude: formData.businessLongitude || formData.businessCoordinates?.[1],
    },
    credentials: {
      username: formData.username,
      password: btoa(formData.password), // Codificación básica para almacenamiento temporal
    },
    experience: formData.experience || '',
    reasonToJoin: formData.reasonToJoin || '',
    addressReferences: formData.addressReferences || '',
    // Solo metadata de documentos y fotos
    documentsCount: documentsMetadata.length,
    photosCount: photosMetadata.length,
    documentsMetadata: documentsMetadata,
    photosMetadata: photosMetadata,
  }

  // Retornar datos en el formato que espera la API del backend
  return {
    name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim(),
    dni: formData.dni?.trim() || null,
    field_name: formData.businessName.trim(),
    address: formData.businessAddress.trim(),
    department: formData.department.trim(),
    province: formData.city.trim(), // city se mapea a province
    district: formData.district.trim(),
    documents: additionalDocuments,
  }
}

/**
 * Mostrar mensaje de error
 */
export const showErrorMessage = (errorMessage) => {
  return Swal.fire({
    icon: 'error',
    title: 'Error al enviar solicitud',
    text: errorMessage || 'Hubo un problema al enviar tu solicitud. Por favor intenta nuevamente.',
    confirmButtonColor: '#ef4444',
    showCloseButton: true,
    allowEscapeKey: true,
  })
}

/**
 * Mostrar errores de validación del formulario (toast no invasivo)
 * @param {Object} errors - Objeto con los errores de validación
 * @param {number} step - Paso actual del formulario
 */
export const showValidationErrors = (errors, _step) => {
  const errorMessages = Object.values(errors)
  const errorList = errorMessages.map((msg) => `• ${msg}`).join('<br>')

  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'warning',
    title: 'Campos incompletos',
    html: `<div class="text-left text-sm">${errorList}</div>`,
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    },
  })
}

/**
 * Mostrar mensaje de éxito
 */
export const showSuccessMessage = () => {
  return Swal.fire({
    icon: 'success',
    title: '¡Solicitud Enviada!',
    html: `
      <div class="text-left">
        <p class="mb-3">Tu solicitud de inscripción de cancha ha sido enviada exitosamente.</p>
        <div class="bg-blue-50 p-3 rounded-lg">
          <p class="text-sm text-blue-800 mb-2"><strong>¿Qué sigue?</strong></p>
          <ul class="text-sm text-blue-700 space-y-1">
            <li>• El administrador revisará tu solicitud de inscripción</li>
            <li>• Una vez aprobada, tu cancha estará disponible en la plataforma</li>
          </ul>
        </div>
      </div>
    `,
    confirmButtonColor: '#22c55e',
    confirmButtonText: 'Entendido',
    showCloseButton: true,
    allowEscapeKey: true,
  })
}

/**
 * Coordenadas por defecto (Apurímac)
 */
export const DEFAULT_COORDINATES = {
  lat: -13.6343,
  lng: -72.8748,
}
