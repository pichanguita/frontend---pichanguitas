/**
 * FIELD EQUIPMENT SERVICE
 *
 * Servicio para operaciones de equipamiento de canchas.
 * Maneja equipos disponibles como balones, redes, marcadores, etc.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== API CALLS ====================

/**
 * Obtener todos los equipamientos desde el backend
 * @param {Object} filters - Filtros opcionales
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de equipamientos
 */
export const fetchFieldEquipment = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.field_id) queryParams.append('field_id', filters.field_id)
    if (filters.is_available !== undefined) queryParams.append('is_available', filters.is_available)

    const url = `${API_CONFIG.FIELD_EQUIPMENT.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('⚙️ Obteniendo equipamientos')

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener equipamientos')
    }

    console.log('✅ Equipamientos obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener equipamientos:', error)
    throw new Error(error.message || 'Error al obtener equipamientos')
  }
}

/**
 * Obtener un equipamiento por ID desde el backend
 * @param {string} equipmentId - ID del equipamiento
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Equipamiento
 */
export const fetchFieldEquipmentById = async (equipmentId, token) => {
  try {
    console.log('⚙️ Obteniendo equipamiento:', equipmentId)

    const response = await fetch(API_CONFIG.FIELD_EQUIPMENT.GET_BY_ID(equipmentId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener equipamiento')
    }

    console.log('✅ Equipamiento obtenido')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener equipamiento:', error)
    throw new Error(error.message || 'Error al obtener equipamiento')
  }
}

/**
 * Obtener equipamientos de una cancha específica desde el backend
 * @param {string} fieldId - ID de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de equipamientos
 */
export const fetchEquipmentByField = async (fieldId, token) => {
  try {
    console.log('⚙️ Obteniendo equipamientos de la cancha:', fieldId)

    const response = await fetch(API_CONFIG.FIELD_EQUIPMENT.GET_BY_FIELD(fieldId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener equipamientos de la cancha')
    }

    console.log('✅ Equipamientos de la cancha obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener equipamientos de la cancha:', error)
    throw new Error(error.message || 'Error al obtener equipamientos de la cancha')
  }
}

/**
 * Crear un nuevo equipamiento en el backend
 * @param {Object} equipmentData - Datos del equipamiento
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Equipamiento creado
 */
export const createFieldEquipmentAPI = async (equipmentData, token) => {
  try {
    console.log('⚙️ Creando equipamiento')

    const response = await fetch(API_CONFIG.FIELD_EQUIPMENT.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(equipmentData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear equipamiento')
    }

    console.log('✅ Equipamiento creado:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al crear equipamiento:', error)
    throw new Error(error.message || 'Error al crear equipamiento')
  }
}

/**
 * Actualizar un equipamiento en el backend
 * @param {string} equipmentId - ID del equipamiento
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Equipamiento actualizado
 */
export const updateFieldEquipmentAPI = async (equipmentId, updates, token) => {
  try {
    console.log('⚙️ Actualizando equipamiento:', equipmentId)

    const response = await fetch(API_CONFIG.FIELD_EQUIPMENT.UPDATE(equipmentId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar equipamiento')
    }

    console.log('✅ Equipamiento actualizado')

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar equipamiento:', error)
    throw new Error(error.message || 'Error al actualizar equipamiento')
  }
}

/**
 * Eliminar un equipamiento en el backend
 * @param {string} equipmentId - ID del equipamiento
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteFieldEquipmentAPI = async (equipmentId, token) => {
  try {
    console.log('⚙️ Eliminando equipamiento:', equipmentId)

    const response = await fetch(API_CONFIG.FIELD_EQUIPMENT.DELETE(equipmentId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar equipamiento')
    }

    console.log('✅ Equipamiento eliminado')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar equipamiento:', error)
    throw new Error(error.message || 'Error al eliminar equipamiento')
  }
}

