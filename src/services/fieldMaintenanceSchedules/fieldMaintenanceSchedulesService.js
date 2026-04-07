/**
 * FIELD MAINTENANCE SCHEDULES SERVICE
 *
 * Servicio para operaciones de programación de mantenimiento de canchas.
 * Maneja períodos de mantenimiento y bloqueo de horarios.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== API CALLS ====================

/**
 * Obtener todos los programas de mantenimiento desde el backend
 * @param {Object} filters - Filtros opcionales
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de programas de mantenimiento
 */
export const fetchFieldMaintenanceSchedules = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.field_id) queryParams.append('field_id', filters.field_id)
    if (filters.status) queryParams.append('status', filters.status)

    const url = `${API_CONFIG.FIELD_MAINTENANCE_SCHEDULES.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('🔧 Obteniendo programas de mantenimiento')

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener programas de mantenimiento')
    }

    console.log('✅ Programas de mantenimiento obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener programas de mantenimiento:', error)
    throw new Error(error.message || 'Error al obtener programas de mantenimiento')
  }
}

/**
 * Obtener un programa de mantenimiento por ID desde el backend
 * @param {string} maintenanceId - ID del programa de mantenimiento
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Programa de mantenimiento
 */
export const fetchFieldMaintenanceScheduleById = async (maintenanceId, token) => {
  try {
    console.log('🔧 Obteniendo programa de mantenimiento:', maintenanceId)

    const response = await fetch(API_CONFIG.FIELD_MAINTENANCE_SCHEDULES.GET_BY_ID(maintenanceId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener programa de mantenimiento')
    }

    console.log('✅ Programa de mantenimiento obtenido')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener programa de mantenimiento:', error)
    throw new Error(error.message || 'Error al obtener programa de mantenimiento')
  }
}

/**
 * Obtener programas de mantenimiento de una cancha específica desde el backend
 * @param {string} fieldId - ID de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de programas de mantenimiento
 */
export const fetchMaintenanceSchedulesByField = async (fieldId, token) => {
  try {
    console.log('🔧 Obteniendo programas de mantenimiento de la cancha:', fieldId)

    const response = await fetch(API_CONFIG.FIELD_MAINTENANCE_SCHEDULES.GET_BY_FIELD(fieldId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener programas de mantenimiento de la cancha')
    }

    console.log(
      '✅ Programas de mantenimiento de la cancha obtenidos:',
      data.count || data.data?.length
    )

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener programas de mantenimiento de la cancha:', error)
    throw new Error(error.message || 'Error al obtener programas de mantenimiento de la cancha')
  }
}

/**
 * Verificar si hay mantenimiento programado para una fecha
 * @param {string} fieldId - ID de la cancha
 * @param {Object} params - { date }
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} { has_maintenance, maintenance_info }
 */
export const checkMaintenanceDateAPI = async (fieldId, params, token) => {
  try {
    const queryParams = new URLSearchParams()

    if (params.date) queryParams.append('date', params.date)

    const url = `${API_CONFIG.FIELD_MAINTENANCE_SCHEDULES.CHECK_DATE(fieldId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('🔧 Verificando mantenimiento para fecha')

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al verificar mantenimiento')
    }

    console.log('✅ Verificación de mantenimiento completada')

    return data.data || data
  } catch (error) {
    console.error('❌ Error al verificar mantenimiento:', error)
    throw new Error(error.message || 'Error al verificar mantenimiento')
  }
}

/**
 * Crear un nuevo programa de mantenimiento en el backend
 * @param {Object} maintenanceData - Datos del programa de mantenimiento
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Programa de mantenimiento creado
 */
export const createFieldMaintenanceScheduleAPI = async (maintenanceData, token) => {
  try {
    console.log('🔧 Creando programa de mantenimiento')

    const response = await fetch(API_CONFIG.FIELD_MAINTENANCE_SCHEDULES.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(maintenanceData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear programa de mantenimiento')
    }

    console.log('✅ Programa de mantenimiento creado:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al crear programa de mantenimiento:', error)
    throw new Error(error.message || 'Error al crear programa de mantenimiento')
  }
}

/**
 * Actualizar un programa de mantenimiento en el backend
 * @param {string} maintenanceId - ID del programa de mantenimiento
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Programa de mantenimiento actualizado
 */
export const updateFieldMaintenanceScheduleAPI = async (maintenanceId, updates, token) => {
  try {
    console.log('🔧 Actualizando programa de mantenimiento:', maintenanceId)

    const response = await fetch(API_CONFIG.FIELD_MAINTENANCE_SCHEDULES.UPDATE(maintenanceId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar programa de mantenimiento')
    }

    console.log('✅ Programa de mantenimiento actualizado')

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar programa de mantenimiento:', error)
    throw new Error(error.message || 'Error al actualizar programa de mantenimiento')
  }
}

/**
 * Eliminar un programa de mantenimiento en el backend
 * @param {string} maintenanceId - ID del programa de mantenimiento
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteFieldMaintenanceScheduleAPI = async (maintenanceId, token) => {
  try {
    console.log('🔧 Eliminando programa de mantenimiento:', maintenanceId)

    const response = await fetch(API_CONFIG.FIELD_MAINTENANCE_SCHEDULES.DELETE(maintenanceId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar programa de mantenimiento')
    }

    console.log('✅ Programa de mantenimiento eliminado')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar programa de mantenimiento:', error)
    throw new Error(error.message || 'Error al eliminar programa de mantenimiento')
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Verificar si hay mantenimiento activo en una fecha
 * @param {Array} maintenanceSchedules - Array de programas de mantenimiento
 * @param {string} date - Fecha a verificar (YYYY-MM-DD)
 * @returns {boolean} True si hay mantenimiento
 */
export const hasMaintenanceOnDate = (maintenanceSchedules, date) => {
  const checkDate = new Date(date)

  return maintenanceSchedules.some((schedule) => {
    if (schedule.status !== 'scheduled' && schedule.status !== 'in_progress') return false

    const startDate = new Date(schedule.start_date)
    const endDate = new Date(schedule.end_date)

    return checkDate >= startDate && checkDate <= endDate
  })
}

/**
 * Filtrar mantenimientos activos
 * @param {Array} maintenanceSchedules - Array de programas de mantenimiento
 * @returns {Array} Mantenimientos activos
 */
export const getActiveMaintenanceSchedules = (maintenanceSchedules) => {
  return maintenanceSchedules.filter(
    (schedule) => schedule.status === 'scheduled' || schedule.status === 'in_progress'
  )
}
