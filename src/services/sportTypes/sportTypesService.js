/**
 * SPORT TYPES SERVICE
 * Servicio para operaciones CRUD de tipos de deportes.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Obtener todos los tipos de deportes desde el backend
 * @returns {Promise<Array>} Array de tipos de deportes
 */
export const fetchSportTypes = async () => {
  try {
    const response = await fetch(API_CONFIG.SPORT_TYPES.GET_ALL, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener tipos de deportes')
    }

    return data.data || []
  } catch (error) {
    throw new Error(error.message || 'Error al obtener tipos de deportes')
  }
}

/**
 * Obtener un tipo de deporte por ID desde el backend
 * @param {string} sportTypeId - ID del tipo de deporte
 * @returns {Promise<Object>} Tipo de deporte
 */
export const fetchSportTypeById = async (sportTypeId) => {
  try {
    const response = await fetch(API_CONFIG.SPORT_TYPES.GET_BY_ID(sportTypeId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener tipo de deporte')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al obtener tipo de deporte')
  }
}

/**
 * Crear un nuevo tipo de deporte en el backend
 * @param {Object} sportTypeData - Datos del tipo de deporte
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Tipo de deporte creado
 */
export const createSportTypeAPI = async (sportTypeData, token) => {
  try {
    const response = await fetch(API_CONFIG.SPORT_TYPES.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(sportTypeData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear tipo de deporte')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al crear tipo de deporte')
  }
}

/**
 * Actualizar un tipo de deporte en el backend
 * @param {string} sportTypeId - ID del tipo de deporte
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Tipo de deporte actualizado
 */
export const updateSportTypeAPI = async (sportTypeId, updates, token) => {
  try {
    const response = await fetch(API_CONFIG.SPORT_TYPES.UPDATE(sportTypeId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar tipo de deporte')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar tipo de deporte')
  }
}

/**
 * Reordenar los tipos de deportes en el backend.
 * @param {Array<number>} orderedIds - IDs en el nuevo orden deseado
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Lista de tipos de deportes ya ordenada
 */
export const reorderSportTypesAPI = async (orderedIds, token) => {
  try {
    const response = await fetch(API_CONFIG.SPORT_TYPES.REORDER, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ orderedIds }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al reordenar tipos de deportes')
    }

    return data.data || []
  } catch (error) {
    throw new Error(error.message || 'Error al reordenar tipos de deportes')
  }
}

/**
 * Obtener la cantidad de canchas asociadas a un tipo de deporte.
 * Se usa para mostrar un mensaje informativo previo a la eliminación.
 * @param {string|number} sportTypeId - ID del tipo de deporte
 * @param {string} token - Token de autenticación
 * @returns {Promise<number>} Cantidad de canchas asociadas
 */
export const fetchSportTypeFieldsCount = async (sportTypeId, token) => {
  try {
    const response = await fetch(API_CONFIG.SPORT_TYPES.GET_FIELDS_COUNT(sportTypeId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener conteo de canchas')
    }

    return data.data?.count ?? 0
  } catch (error) {
    throw new Error(error.message || 'Error al obtener conteo de canchas')
  }
}

/**
 * Eliminar un tipo de deporte (soft delete) en el backend
 * @param {string} sportTypeId - ID del tipo de deporte
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteSportTypeAPI = async (sportTypeId, token) => {
  try {
    const response = await fetch(API_CONFIG.SPORT_TYPES.DELETE(sportTypeId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar tipo de deporte')
    }

    return true
  } catch (error) {
    throw new Error(error.message || 'Error al eliminar tipo de deporte')
  }
}
