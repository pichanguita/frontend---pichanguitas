/**
 * REGISTRATION REQUESTS SERVICE
 * Servicio para operaciones de solicitudes de registro.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Obtener todas las solicitudes de registro desde el backend
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de solicitudes
 */
export const fetchRegistrationRequests = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.status) queryParams.append('status', filters.status)
    if (filters.request_type) queryParams.append('request_type', filters.request_type)

    const url = `${API_CONFIG.REGISTRATION_REQUESTS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener solicitudes')
    }

    return data.data || []
  } catch (error) {
    throw new Error(error.message || 'Error al obtener solicitudes')
  }
}

/**
 * Obtener una solicitud de registro por ID desde el backend
 * @param {string} requestId - ID de la solicitud
 * @returns {Promise<Object>} Solicitud
 */
export const fetchRegistrationRequestById = async (requestId) => {
  try {
    const response = await fetch(API_CONFIG.REGISTRATION_REQUESTS.GET_BY_ID(requestId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener solicitud')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al obtener solicitud')
  }
}

/**
 * Crear una nueva solicitud de registro en el backend (JSON puro, sin archivos)
 * @param {Object} requestData - Datos de la solicitud
 * @param {string} token - Token de autenticación (opcional para registro público)
 * @returns {Promise<Object>} Solicitud creada
 */
export const createRegistrationRequestAPI = async (requestData, token = null) => {
  try {
    const headers = token ? getAuthHeaders(token) : API_CONFIG.DEFAULT_HEADERS

    const response = await fetch(API_CONFIG.REGISTRATION_REQUESTS.CREATE, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear solicitud')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al crear solicitud')
  }
}

/**
 * Crear una nueva solicitud de registro CON archivos usando FormData
 * @param {Object} requestData - Datos de la solicitud
 * @param {Array} files - Array de archivos File objects
 * @param {string} token - Token de autenticación (opcional)
 * @returns {Promise<Object>} Solicitud creada
 */
export const createRegistrationRequestWithFilesAPI = async (
  requestData,
  files = [],
  token = null
) => {
  try {
    const formData = new FormData()

    // Campos escalares + arrays (sportTypes se envía repitiendo la clave)
    Object.entries(requestData).forEach(([key, value]) => {
      if (value === null || value === undefined) return
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item))
      } else {
        formData.append(key, value)
      }
    })

    // Archivos: el fieldname diferencia documents vs photos para que el
    // backend asigne el kind correcto en registration_request_files.
    files.forEach((fileObj) => {
      if (!fileObj.file) return
      const fieldname = fileObj.kind === 'photo' ? 'photos' : 'documents'
      formData.append(fieldname, fileObj.file, fileObj.file.name)
    })

    const headers = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const response = await fetch(API_CONFIG.REGISTRATION_REQUESTS.CREATE_WITH_FILES, {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear solicitud')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al crear solicitud')
  }
}

/**
 * Aprobar una solicitud de registro en el backend
 * @param {string} requestId - ID de la solicitud
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Solicitud aprobada
 */
export const approveRegistrationRequestAPI = async (requestId, token) => {
  try {
    const response = await fetch(API_CONFIG.REGISTRATION_REQUESTS.APPROVE(requestId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al aprobar solicitud')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al aprobar solicitud')
  }
}

/**
 * Rechazar una solicitud de registro en el backend
 * @param {string} requestId - ID de la solicitud
 * @param {string} rejection_reason - Motivo del rechazo
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Solicitud rechazada
 */
export const rejectRegistrationRequestAPI = async (requestId, rejection_reason, token) => {
  try {
    const response = await fetch(API_CONFIG.REGISTRATION_REQUESTS.REJECT(requestId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ rejection_reason }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al rechazar solicitud')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al rechazar solicitud')
  }
}

/**
 * Obtener estadísticas de solicitudes de registro desde el backend
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Estadísticas de solicitudes
 */
export const fetchRegistrationRequestStatsAPI = async (token) => {
  try {
    const response = await fetch(API_CONFIG.REGISTRATION_REQUESTS.GET_STATS, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener estadísticas')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al obtener estadísticas')
  }
}
