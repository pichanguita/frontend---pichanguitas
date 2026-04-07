/**
 * FIELD SERVICE
 *
 * Servicio para operaciones CRUD de canchas.
 * Maneja creación, actualización, eliminación y validación de canchas.
 * Conecta con las APIs del backend.
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Procesa las propiedades del campo del backend
 * NOTA: El backend YA transforma a camelCase, solo necesitamos procesar imágenes y coordenadas
 * @param {Object} field - Campo desde el backend (ya en camelCase)
 * @returns {Object} Campo procesado
 */
const transformFieldFromAPI = (field) => {
  if (!field) return null

  // Convertir rutas relativas de imágenes a URLs absolutas
  const baseURL = API_CONFIG.BASE_URL
  const customImages = (field.images || []).map((imageUrl) => {
    // Si la URL ya es absoluta (empieza con http), retornarla tal cual
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    // Si es una ruta relativa, convertirla a URL absoluta
    return `${baseURL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
  })

  // Convertir latitude/longitude a array coordinates para Leaflet si no existen
  const coordinates =
    field.coordinates ||
    (field.latitude && field.longitude
      ? [parseFloat(field.latitude), parseFloat(field.longitude)]
      : null)

  return {
    ...field,
    // Asegurar tipos correctos
    pricePerHour: parseFloat(field.pricePerHour) || 0,
    rating: parseFloat(field.rating) || 0,
    totalReviews: parseInt(field.totalReviews) || 0,
    capacity: parseInt(field.capacity) || 0,
    // Mantener imágenes y mapear a customImages para compatibilidad
    customImages,
    // Convertir coordenadas a formato Leaflet [lat, lng]
    coordinates,
  }
}

/**
 * Genera un ID único para una cancha
 * @returns {string} ID único
 */
const generateFieldId = () => {
  return `campo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Valida los datos de una cancha
 * @param {Object} fieldData - Datos de la cancha
 * @returns {Object} { valid, errors }
 */
export const validateField = (fieldData) => {
  const errors = []

  if (!fieldData.name || fieldData.name.trim() === '') {
    errors.push('El nombre de la cancha es obligatorio')
  }

  if (!fieldData.departamento) {
    errors.push('El departamento es obligatorio')
  }

  if (!fieldData.provincia) {
    errors.push('La provincia es obligatoria')
  }

  if (!fieldData.distrito) {
    errors.push('El distrito es obligatorio')
  }

  if (!fieldData.sportType) {
    errors.push('El tipo de deporte es obligatorio')
  }

  if (fieldData.requiresAdvancePayment && (!fieldData.pricePerHour || fieldData.pricePerHour <= 0)) {
    errors.push('El precio por hora debe ser mayor a 0 cuando se requiere pago adelantado')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Crea una nueva cancha
 * @param {Object} fieldData - Datos de la cancha
 * @param {string} createdBy - ID del usuario que crea
 * @returns {Object} Cancha creada
 */
export const createField = (fieldData, createdBy = null) => {
  const validation = validateField(fieldData)

  if (!validation.valid) {
    throw new Error(`Validación fallida: ${validation.errors.join(', ')}`)
  }

  const newField = {
    id: generateFieldId(),
    ...fieldData,
    status: 'available',
    isActive: true,
    approvalStatus: 'pending',
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return newField
}

/**
 * Actualiza una cancha existente
 * @param {Object} field - Cancha actual
 * @param {Object} updates - Datos a actualizar
 * @returns {Object} Cancha actualizada
 */
export const updateField = (field, updates) => {
  const updatedField = {
    ...field,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  // Validar después de actualizar
  const validation = validateField(updatedField)

  if (!validation.valid) {
    throw new Error(`Validación fallida: ${validation.errors.join(', ')}`)
  }

  return updatedField
}

/**
 * Marca una cancha como eliminada (soft delete)
 * @param {Object} field - Cancha a eliminar
 * @returns {Object} Cancha actualizada
 */
export const deleteField = (field) => {
  return {
    ...field,
    isActive: false,
    deletedAt: new Date().toISOString(),
  }
}

/**
 * Aprueba una cancha
 * @param {Object} field - Cancha a aprobar
 * @param {string} approvedBy - ID del aprobador
 * @returns {Object} Cancha aprobada
 */
export const approveField = (field, approvedBy) => {
  return {
    ...field,
    approvalStatus: 'approved',
    approvedBy,
    approvedAt: new Date().toISOString(),
    status: 'available',
  }
}

/**
 * Rechaza una cancha
 * @param {Object} field - Cancha a rechazar
 * @param {string} rejectedBy - ID del que rechaza
 * @param {string} reason - Razón del rechazo
 * @returns {Object} Cancha rechazada
 */
export const rejectField = (field, rejectedBy, reason) => {
  return {
    ...field,
    approvalStatus: 'rejected',
    rejectedBy,
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason,
    status: 'maintenance',
  }
}

/**
 * Filtra canchas por administrador
 * @param {Array} fields - Array de canchas
 * @param {string} adminId - ID del administrador
 * @returns {Array} Canchas filtradas
 */
export const filterFieldsByAdmin = (fields, adminId) => {
  return fields.filter((f) => f.adminId === adminId || f.createdBy === adminId)
}

/**
 * Filtra canchas por estado de aprobación
 * @param {Array} fields - Array de canchas
 * @param {string} approvalStatus - Estado (pending, approved, rejected)
 * @returns {Array} Canchas filtradas
 */
export const filterFieldsByApprovalStatus = (fields, approvalStatus) => {
  return fields.filter((f) => f.approvalStatus === approvalStatus)
}

/**
 * Busca cancha por ID
 * @param {Array} fields - Array de canchas
 * @param {string} fieldId - ID de la cancha
 * @returns {Object|null} Cancha encontrada
 */
export const findFieldById = (fields, fieldId) => {
  return fields.find((f) => f.id === fieldId) || null
}

// ==================== API CALLS ====================

/**
 * Obtener todas las canchas desde el backend
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de canchas
 */
export const fetchFields = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.admin_id) queryParams.append('admin_id', filters.admin_id)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.approval_status) queryParams.append('approval_status', filters.approval_status)
    if (filters.sport_type) queryParams.append('sport_type', filters.sport_type)
    if (filters.departamento) queryParams.append('departamento', filters.departamento)
    if (filters.provincia) queryParams.append('provincia', filters.provincia)
    if (filters.distrito) queryParams.append('distrito', filters.distrito)
    if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active)
    if (filters.search) queryParams.append('search', filters.search)

    const url = `${API_CONFIG.FIELDS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener canchas')
    }

    // Transformar campos de snake_case a camelCase
    const fields = (data.data || []).map(transformFieldFromAPI)

    return fields
  } catch (error) {
    console.error('❌ Error al obtener canchas:', error)
    throw new Error(error.message || 'Error al obtener canchas')
  }
}

/**
 * Obtener una cancha por ID desde el backend
 * @param {string} fieldId - ID de la cancha
 * @returns {Promise<Object>} Cancha
 */
export const fetchFieldById = async (fieldId) => {
  try {
    const response = await fetch(API_CONFIG.FIELDS.GET_BY_ID(fieldId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener cancha')
    }

    // Transformar campos de snake_case a camelCase
    return transformFieldFromAPI(data.data)
  } catch (error) {
    console.error('❌ Error al obtener cancha:', error)
    throw new Error(error.message || 'Error al obtener cancha')
  }
}

/**
 * Crear una nueva cancha en el backend
 * @param {Object} fieldData - Datos de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Cancha creada
 */
export const createFieldAPI = async (fieldData, token) => {
  try {
    // Validar y sanitizar coordenadas
    const latitude = fieldData.coordinates ? parseFloat(fieldData.coordinates[1]) : null
    const longitude = fieldData.coordinates ? parseFloat(fieldData.coordinates[0]) : null

    // Validar rangos de coordenadas GPS
    if (latitude !== null && (latitude < -90 || latitude > 90)) {
      throw new Error('Latitud inválida. Debe estar entre -90 y 90 grados.')
    }
    if (longitude !== null && (longitude < -180 || longitude > 180)) {
      throw new Error('Longitud inválida. Debe estar entre -180 y 180 grados.')
    }

    // Transformar a snake_case para el backend
    const backendData = {
      admin_id: fieldData.adminId,
      name: fieldData.name,
      location: fieldData.location,
      departamento: fieldData.departamento,
      provincia: fieldData.provincia,
      distrito: fieldData.distrito,
      district_id: fieldData.districtId ? parseInt(fieldData.districtId) : null,
      address: fieldData.address,
      phone: fieldData.phone,
      latitude: latitude,
      longitude: longitude,
      price_per_hour: fieldData.pricePerHour,
      status: fieldData.status,
      approval_status: fieldData.approvalStatus,
      field_type: fieldData.fieldType,
      sport_type: fieldData.sportType,
      sport_ids: fieldData.sportIds || [], // Array de IDs de todos los deportes
      capacity: fieldData.capacity,
      requires_advance_payment: fieldData.requiresAdvancePayment || false,
      advance_payment_amount: fieldData.advancePaymentAmount || 0,
      is_active: fieldData.isActive !== undefined ? fieldData.isActive : true,
      is_multi_sport: fieldData.isMultiSport,

      // Dimensiones de la cancha
      dimensions: fieldData.dimensions
        ? {
            length: fieldData.dimensions.length || null,
            width: fieldData.dimensions.width || null,
            area: fieldData.dimensions.area || null,
            surface_type: fieldData.dimensions.surfaceType || null,
          }
        : null,

      // Amenities/Servicios
      amenities: fieldData.amenities || [],

      // Equipamiento (ya viene en snake_case desde buildFieldObject)
      equipment: fieldData.equipment || null,
    }

    const response = await fetch(API_CONFIG.FIELDS.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(backendData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear cancha')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al crear cancha')
  }
}

/**
 * Actualizar una cancha en el backend
 * @param {string} fieldId - ID de la cancha
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Cancha actualizada
 */
export const updateFieldAPI = async (fieldId, updates, token) => {
  try {
    const response = await fetch(API_CONFIG.FIELDS.UPDATE(fieldId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar cancha')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar cancha')
  }
}

/**
 * Eliminar una cancha (soft delete) en el backend
 * @param {string} fieldId - ID de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteFieldAPI = async (fieldId, token) => {
  try {
    const response = await fetch(API_CONFIG.FIELDS.DELETE(fieldId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar cancha')
    }

    return true
  } catch (error) {
    throw new Error(error.message || 'Error al eliminar cancha')
  }
}

/**
 * Aprobar una cancha en el backend
 * @param {string} fieldId - ID de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Cancha aprobada
 */
export const approveFieldAPI = async (fieldId, token) => {
  try {
    const response = await fetch(API_CONFIG.FIELDS.APPROVE(fieldId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al aprobar cancha')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al aprobar cancha')
  }
}

/**
 * Rechazar una cancha en el backend
 * @param {string} fieldId - ID de la cancha
 * @param {string} rejection_reason - Motivo del rechazo
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Cancha rechazada
 */
export const rejectFieldAPI = async (fieldId, rejection_reason, token) => {
  try {
    const response = await fetch(API_CONFIG.FIELDS.REJECT(fieldId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ rejection_reason }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al rechazar cancha')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al rechazar cancha')
  }
}
