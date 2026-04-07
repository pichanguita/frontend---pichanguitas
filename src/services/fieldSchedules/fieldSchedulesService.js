/**
 * FIELD SCHEDULES SERVICE
 *
 * Servicio para operaciones CRUD de horarios de canchas.
 * Maneja la configuración de días y horas disponibles para cada cancha.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== API CALLS ====================

/**
 * Obtener todos los horarios de canchas desde el backend
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.field_id - ID de la cancha
 * @param {string} filters.day_of_week - Día de la semana (0-6)
 * @param {boolean} filters.is_active - Filtrar por estado activo
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de horarios
 */
export const fetchFieldSchedules = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.field_id) queryParams.append('field_id', filters.field_id)
    if (filters.day_of_week !== undefined) queryParams.append('day_of_week', filters.day_of_week)
    if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active)

    const url = `${API_CONFIG.FIELD_SCHEDULES.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('📅 Obteniendo horarios de canchas:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener horarios')
    }

    console.log('✅ Horarios obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener horarios:', error)
    throw new Error(error.message || 'Error al obtener horarios')
  }
}

/**
 * Obtener un horario por ID desde el backend
 * @param {string} scheduleId - ID del horario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Horario
 */
export const fetchFieldScheduleById = async (scheduleId, token) => {
  try {
    console.log('📅 Obteniendo horario:', scheduleId)

    const response = await fetch(API_CONFIG.FIELD_SCHEDULES.GET_BY_ID(scheduleId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener horario')
    }

    console.log('✅ Horario obtenido')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener horario:', error)
    throw new Error(error.message || 'Error al obtener horario')
  }
}

/**
 * Obtener todos los horarios de una cancha específica desde el backend
 * @param {string} fieldId - ID de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de horarios
 */
export const fetchSchedulesByField = async (fieldId, token) => {
  try {
    console.log('📅 Obteniendo horarios de la cancha:', fieldId)

    const response = await fetch(API_CONFIG.FIELD_SCHEDULES.GET_BY_FIELD(fieldId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener horarios de la cancha')
    }

    console.log('✅ Horarios de la cancha obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener horarios de la cancha:', error)
    throw new Error(error.message || 'Error al obtener horarios de la cancha')
  }
}

/**
 * Crear un nuevo horario de cancha en el backend
 * @param {Object} scheduleData - Datos del horario
 * @param {string} scheduleData.field_id - ID de la cancha
 * @param {number} scheduleData.day_of_week - Día de la semana (0=Domingo, 6=Sábado)
 * @param {string} scheduleData.start_time - Hora de inicio (HH:MM)
 * @param {string} scheduleData.end_time - Hora de fin (HH:MM)
 * @param {number} scheduleData.price_per_hour - Precio por hora
 * @param {boolean} scheduleData.is_active - Estado activo
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Horario creado
 */
export const createFieldScheduleAPI = async (scheduleData, token) => {
  try {
    console.log('📅 Creando horario de cancha')

    const response = await fetch(API_CONFIG.FIELD_SCHEDULES.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(scheduleData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear horario')
    }

    console.log('✅ Horario creado:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al crear horario:', error)
    throw new Error(error.message || 'Error al crear horario')
  }
}

/**
 * Crear horarios para toda la semana en el backend
 * @param {Object} weekScheduleData - Datos de los horarios semanales
 * @param {string} weekScheduleData.field_id - ID de la cancha
 * @param {Array} weekScheduleData.schedules - Array de horarios para cada día
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Horarios creados
 */
export const createWeekScheduleAPI = async (weekScheduleData, token) => {
  try {
    console.log('📅 Creando horarios semanales')

    const response = await fetch(API_CONFIG.FIELD_SCHEDULES.CREATE_WEEK, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(weekScheduleData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear horarios semanales')
    }

    console.log('✅ Horarios semanales creados:', data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al crear horarios semanales:', error)
    throw new Error(error.message || 'Error al crear horarios semanales')
  }
}

/**
 * Actualizar un horario de cancha en el backend
 * @param {string} scheduleId - ID del horario
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Horario actualizado
 */
export const updateFieldScheduleAPI = async (scheduleId, updates, token) => {
  try {
    console.log('📅 Actualizando horario:', scheduleId)

    const response = await fetch(API_CONFIG.FIELD_SCHEDULES.UPDATE(scheduleId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar horario')
    }

    console.log('✅ Horario actualizado')

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar horario:', error)
    throw new Error(error.message || 'Error al actualizar horario')
  }
}

/**
 * Eliminar un horario de cancha en el backend
 * @param {string} scheduleId - ID del horario
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteFieldScheduleAPI = async (scheduleId, token) => {
  try {
    console.log('📅 Eliminando horario:', scheduleId)

    const response = await fetch(API_CONFIG.FIELD_SCHEDULES.DELETE(scheduleId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar horario')
    }

    console.log('✅ Horario eliminado')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar horario:', error)
    throw new Error(error.message || 'Error al eliminar horario')
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Obtener horarios activos de una cancha (helper)
 * @param {string} fieldId - ID de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de horarios activos
 */
export const fetchActiveSchedulesByField = async (fieldId, token) => {
  const schedules = await fetchSchedulesByField(fieldId, token)
  return schedules.filter((schedule) => schedule.is_active)
}

/**
 * Obtener horarios por día de la semana (helper)
 * @param {string} fieldId - ID de la cancha
 * @param {number} dayOfWeek - Día de la semana (0-6)
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de horarios
 */
export const fetchSchedulesByDay = async (fieldId, dayOfWeek, token) => {
  return fetchFieldSchedules({ field_id: fieldId, day_of_week: dayOfWeek }, token)
}

/**
 * Agrupar horarios por día de la semana
 * @param {Array} schedules - Array de horarios
 * @returns {Object} Horarios agrupados por día { 0: [], 1: [], ..., 6: [] }
 */
export const groupSchedulesByDay = (schedules) => {
  const grouped = {
    0: [], // Domingo
    1: [], // Lunes
    2: [], // Martes
    3: [], // Miércoles
    4: [], // Jueves
    5: [], // Viernes
    6: [], // Sábado
  }

  schedules.forEach((schedule) => {
    if (schedule.day_of_week !== undefined && schedule.day_of_week !== null) {
      grouped[schedule.day_of_week].push(schedule)
    }
  })

  return grouped
}

/**
 * Validar si hay conflictos de horarios
 * @param {Array} existingSchedules - Horarios existentes
 * @param {Object} newSchedule - Nuevo horario a validar
 * @returns {boolean} True si hay conflicto
 */
export const hasScheduleConflict = (existingSchedules, newSchedule) => {
  return existingSchedules.some((schedule) => {
    // Mismo día y horarios superpuestos
    if (schedule.day_of_week === newSchedule.day_of_week) {
      const existingStart = schedule.start_time
      const existingEnd = schedule.end_time
      const newStart = newSchedule.start_time
      const newEnd = newSchedule.end_time

      // Verificar superposición
      return newStart < existingEnd && newEnd > existingStart
    }
    return false
  })
}
