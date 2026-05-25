// Funciones helper para el formulario de Nueva Cancha

import { INITIAL_FORM_DATA, DEFAULT_SCHEDULE, DEFAULT_RULES } from './fieldConstants'
import { FIELD_APPROVAL_STATUS } from '../../../constants/fieldStatus'

/**
 * Calcula el área de la cancha basándose en largo y ancho
 * @param {number} length - Largo en metros
 * @param {number} width - Ancho en metros
 * @returns {string} Área calculada con 2 decimales
 */
export const calculateArea = (length, width) => {
  if (!length || !width) return ''
  return (parseFloat(length) * parseFloat(width)).toFixed(2)
}

/**
 * Genera un ID único para la cancha
 * @returns {string} ID único basado en timestamp
 */
export const generateFieldId = () => {
  return `campo-${Date.now()}`
}

/**
 * Genera un districtId a partir del nombre del distrito
 * @param {string} distrito - Nombre del distrito
 * @returns {string} ID del distrito en minúsculas sin espacios
 */
export const generateDistrictId = (distrito) => {
  return distrito.toLowerCase().replace(/\s+/g, '')
}

/**
 * Calcula la capacidad estimada basada en el área
 * @param {number} area - Área en metros cuadrados
 * @returns {number} Capacidad estimada
 */
export const calculateCapacity = (area) => {
  if (!area) return 20
  return Math.floor(area / 50) * 10 || 20
}

/**
 * Formatea el número de teléfono para guardar
 * @param {string} phone - Número de teléfono (puede tener espacios: XXX XXX XXX)
 * @returns {string} Teléfono formateado con código de país sin espacios
 */
export const formatPhoneForSave = (phone) => {
  // Eliminar espacios del teléfono formateado
  const cleanPhone = phone.replace(/\s/g, '').trim()
  return `+51 ${cleanPhone}`
}

/**
 * Resetea el formulario a sus valores iniciales
 * @returns {Object} Objeto con valores iniciales del formulario
 */
export const resetFormData = () => {
  return { ...INITIAL_FORM_DATA }
}

/**
 * Construye el objeto de cancha completo para guardar
 * @param {Object} formData - Datos del formulario
 * @param {Array} images - Array de imágenes
 * @param {Array} imageFiles - Array de archivos de imagen
 * @param {Array} videos - Array de videos
 * @param {Array} videoFiles - Array de archivos de video
 * @param {Object} user - Usuario actual
 * @param {Array} availableSports - Array de deportes disponibles con id y name
 * @returns {Object} Objeto de cancha completo
 */
export const buildFieldObject = (
  formData,
  images,
  imageFiles,
  videos,
  videoFiles,
  user = null,
  availableSports = []
) => {
  const amenities = Array.isArray(formData.amenityKeys) ? formData.amenityKeys : []
  const area = parseFloat(formData.dimensions.area) || 0

  // Todas las canchas inician como pendientes.
  // El backend (fieldsController) determina el valor final según el rol del usuario.
  const approvalStatus = FIELD_APPROVAL_STATUS.PENDING

  // Convertir TODOS los nombres de deportes a IDs
  let sportTypeId = null
  let sportIds = []
  if (formData.sportTypes && formData.sportTypes.length > 0) {
    // Convertir cada nombre de deporte a su ID
    sportIds = formData.sportTypes
      .map((sportName) => {
        const sport = availableSports.find((s) => s.name === sportName)
        return sport ? sport.id : null
      })
      .filter((id) => id !== null)

    // El primer deporte como principal (para compatibilidad con campo sport_type)
    sportTypeId = sportIds.length > 0 ? sportIds[0] : null
  }

  // Construir objeto de equipamiento con todos los campos
  const equipmentData = {
    has_jersey_rental: formData.equipment.hasJerseyRental || false,
    jersey_price: formData.equipment.jerseyPrice
      ? parseFloat(formData.equipment.jerseyPrice)
      : null,
    has_ball_rental: formData.equipment.hasBallRental || false,
    ball_rental_price: formData.equipment.ballPrice
      ? parseFloat(formData.equipment.ballPrice)
      : null,
    has_cone_rental: formData.equipment.hasConeRental || false,
    cone_price: formData.equipment.conePrice ? parseFloat(formData.equipment.conePrice) : null,
  }

  return {
    id: generateFieldId(),
    adminId: user?.id || null,
    name: formData.name.trim(),
    location: `${formData.distrito} ${formData.provincia}`,
    departamento: formData.departamento,
    provincia: formData.provincia,
    distrito: formData.distrito,
    districtId: formData.districtId ? parseInt(formData.districtId) : null,
    address: formData.address.trim(),
    phone: formatPhoneForSave(formData.phone),
    pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : 0,
    requiresAdvancePayment: formData.requiresAdvancePayment || false,
    advancePaymentAmount: formData.advancePaymentAmount
      ? parseInt(formData.advancePaymentAmount)
      : 0,
    coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
    status: formData.status,
    approvalStatus: approvalStatus,
    image: images.length > 0 ? images[0].preview : '/images/default-field.jpg',
    images: images.map((img) => ({
      url: img.preview,
      category: img.category,
    })),
    imageFiles: imageFiles,
    videos: videos.map((vid) => vid.preview),
    videoFiles: videoFiles,
    // Dimensiones (valores numéricos puros, sin sufijos de unidad)
    dimensions: {
      length: formData.dimensions.length || null,
      width: formData.dimensions.width || null,
      area: formData.dimensions.area || null,
      surfaceType: formData.dimensions.surfaceType,
    },
    // Equipamiento
    equipment: equipmentData,
    // Horarios y configuración
    schedule: DEFAULT_SCHEDULE,
    maintenanceSchedule: [],
    specialPricing: [],
    amenities: amenities,
    capacity: calculateCapacity(area),
    fieldType: formData.isMultiSport ? 'multisport' : 'single',
    // Deportes - Enviar IDs de todos los deportes
    sportType: sportTypeId,
    sportIds: sportIds, // Array de IDs de todos los deportes seleccionados
    sports: formData.sportTypes, // Array de nombres (para referencia)
    isMultiSport: formData.isMultiSport,
    rules: DEFAULT_RULES,
    isActive: true,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Limpia los errores relacionados con ubicación
 * @param {Object} errors - Objeto de errores actual
 * @returns {Object} Objeto de errores sin errores de ubicación
 */
export const clearLocationErrors = (errors) => {
  const {
    latitude: _latitude,
    longitude: _longitude,
    address: _address,
    departamento: _departamento,
    provincia: _provincia,
    distrito: _distrito,
    ...rest
  } = errors
  return rest
}

/**
 * Determina el tipo de campo del input
 * @param {string} name - Nombre del campo
 * @returns {string} 'nested' | 'location' | 'phone' | 'normal'
 */
export const getFieldType = (name) => {
  if (name.includes('.')) return 'nested'
  if (['departamento', 'provincia', 'distrito'].includes(name)) return 'location'
  if (name === 'phone') return 'phone'
  return 'normal'
}
