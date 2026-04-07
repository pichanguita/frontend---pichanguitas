/**
 * BLACKLIST SERVICE
 *
 * Servicio para gestionar la lista negra de clientes.
 * Maneja bloqueos temporales y permanentes.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Genera un ID único para una entrada de blacklist
 * @returns {string} ID único
 */
const generateBlacklistId = () => {
  return `blacklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Añade un cliente a la lista negra
 * @param {Object} blacklistData - Datos del bloqueo
 * @param {string} blockedBy - ID de quien bloquea
 * @returns {Object} Entrada de blacklist creada
 */
export const addToBlacklist = (blacklistData, blockedBy) => {
  const newEntry = {
    id: generateBlacklistId(),
    phoneNumber: blacklistData.phoneNumber,
    customerName: blacklistData.customerName,
    reason: blacklistData.reason,
    blockedBy,
    blockedAt: new Date().toISOString(),
    blockedUntil: blacklistData.blockedUntil || null, // null = permanente
    reservationsMissed: blacklistData.reservationsMissed || 0,
    notes: blacklistData.notes || '',
    isActive: true,
  }

  return newEntry
}

/**
 * Remueve un cliente de la lista negra
 * @param {Object} entry - Entrada de blacklist
 * @param {string} removedBy - ID de quien remueve
 * @returns {Object} Entrada actualizada
 */
export const removeFromBlacklist = (entry, removedBy) => {
  return {
    ...entry,
    isActive: false,
    removedBy,
    removedAt: new Date().toISOString(),
  }
}

/**
 * Actualiza una entrada de blacklist
 * @param {Object} entry - Entrada actual
 * @param {Object} updates - Datos a actualizar
 * @returns {Object} Entrada actualizada
 */
export const updateBlacklistEntry = (entry, updates) => {
  return {
    ...entry,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Verifica si un teléfono está en la lista negra
 * @param {Array} blacklist - Array de blacklist
 * @param {string} phoneNumber - Teléfono a verificar
 * @returns {boolean} true si está bloqueado
 */
export const isPhoneBlacklisted = (blacklist, phoneNumber) => {
  const now = new Date()

  return blacklist.some((entry) => {
    if (!entry.isActive) return false
    if (entry.phoneNumber !== phoneNumber) return false

    // Verificar si el bloqueo temporal ha expirado
    if (entry.blockedUntil) {
      const until = new Date(entry.blockedUntil)
      if (now > until) return false
    }

    return true
  })
}

/**
 * Obtiene la entrada de blacklist para un teléfono
 * @param {Array} blacklist - Array de blacklist
 * @param {string} phoneNumber - Teléfono a buscar
 * @returns {Object|null} Entrada encontrada
 */
export const getBlacklistEntry = (blacklist, phoneNumber) => {
  const now = new Date()

  return (
    blacklist.find((entry) => {
      if (!entry.isActive) return false
      if (entry.phoneNumber !== phoneNumber) return false

      if (entry.blockedUntil) {
        const until = new Date(entry.blockedUntil)
        if (now > until) return false
      }

      return true
    }) || null
  )
}

/**
 * Filtra entradas activas de blacklist
 * @param {Array} blacklist - Array de blacklist
 * @returns {Array} Entradas activas
 */
export const getActiveBlacklistEntries = (blacklist) => {
  const now = new Date()

  return blacklist.filter((entry) => {
    if (!entry.isActive) return false

    if (entry.blockedUntil) {
      const until = new Date(entry.blockedUntil)
      if (now > until) return false
    }

    return true
  })
}

/**
 * Filtra entradas expiradas de blacklist
 * @param {Array} blacklist - Array de blacklist
 * @returns {Array} Entradas expiradas
 */
export const getExpiredBlacklistEntries = (blacklist) => {
  const now = new Date()

  return blacklist.filter((entry) => {
    if (!entry.isActive) return false
    if (!entry.blockedUntil) return false

    const until = new Date(entry.blockedUntil)
    return now > until
  })
}

/**
 * Limpia automáticamente entradas expiradas
 * @param {Array} blacklist - Array de blacklist
 * @returns {Array} Blacklist limpia
 */
export const cleanExpiredEntries = (blacklist) => {
  const now = new Date()

  return blacklist.map((entry) => {
    if (!entry.isActive) return entry
    if (!entry.blockedUntil) return entry

    const until = new Date(entry.blockedUntil)
    if (now > until) {
      return {
        ...entry,
        isActive: false,
        autoRemovedAt: new Date().toISOString(),
      }
    }

    return entry
  })
}

// ==================== API CALLS ====================

/**
 * Obtener todos los registros de lista negra desde el backend
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de registros de lista negra
 */
export const fetchBlacklist = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active)

    const url = `${API_CONFIG.BLACKLIST.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('🚫 Obteniendo lista negra:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener lista negra')
    }

    console.log('✅ Lista negra obtenida:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener lista negra:', error)
    throw new Error(error.message || 'Error al obtener lista negra')
  }
}

/**
 * Obtener un registro de lista negra por ID desde el backend
 * @param {string} blacklistId - ID del registro
 * @returns {Promise<Object>} Registro de lista negra
 */
export const fetchBlacklistById = async (blacklistId) => {
  try {
    console.log('🚫 Obteniendo registro de lista negra:', blacklistId)

    const response = await fetch(API_CONFIG.BLACKLIST.GET_BY_ID(blacklistId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener registro de lista negra')
    }

    console.log('✅ Registro de lista negra obtenido')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener registro de lista negra:', error)
    throw new Error(error.message || 'Error al obtener registro de lista negra')
  }
}

/**
 * Verificar si un identificador está en lista negra
 * @param {string} identifier - Email o teléfono
 * @returns {Promise<Object>} { is_blacklisted, reason, blocked_until }
 */
export const checkBlacklistAPI = async (identifier) => {
  try {
    console.log('🚫 Verificando lista negra:', identifier)

    const response = await fetch(API_CONFIG.BLACKLIST.CHECK(identifier), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al verificar lista negra')
    }

    console.log(
      '✅ Verificación completada:',
      data.is_blacklisted ? 'En lista negra' : 'No bloqueado'
    )

    return data.data || data
  } catch (error) {
    console.error('❌ Error al verificar lista negra:', error)
    throw new Error(error.message || 'Error al verificar lista negra')
  }
}

/**
 * Agregar un usuario a la lista negra en el backend
 * @param {Object} blacklistData - Datos del registro
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Registro de lista negra creado
 */
export const addToBlacklistAPI = async (blacklistData, token) => {
  try {
    console.log('🚫 Agregando a lista negra')

    const response = await fetch(API_CONFIG.BLACKLIST.ADD, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(blacklistData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al agregar a lista negra')
    }

    console.log('✅ Usuario agregado a lista negra:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al agregar a lista negra:', error)
    throw new Error(error.message || 'Error al agregar a lista negra')
  }
}

/**
 * Actualizar un registro de lista negra en el backend
 * @param {string} blacklistId - ID del registro
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Registro actualizado
 */
export const updateBlacklistAPI = async (blacklistId, updates, token) => {
  try {
    console.log('🚫 Actualizando registro de lista negra:', blacklistId)

    const response = await fetch(API_CONFIG.BLACKLIST.UPDATE(blacklistId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar registro')
    }

    console.log('✅ Registro actualizado')

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar registro:', error)
    throw new Error(error.message || 'Error al actualizar registro')
  }
}

/**
 * Desbloquear un usuario en el backend
 * @param {string} blacklistId - ID del registro
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Registro actualizado
 */
export const unblockBlacklistAPI = async (blacklistId, token) => {
  try {
    console.log('🚫 Desbloqueando usuario:', blacklistId)

    const response = await fetch(API_CONFIG.BLACKLIST.UNBLOCK(blacklistId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al desbloquear usuario')
    }

    console.log('✅ Usuario desbloqueado')

    return data.data
  } catch (error) {
    console.error('❌ Error al desbloquear usuario:', error)
    throw new Error(error.message || 'Error al desbloquear usuario')
  }
}

/**
 * Eliminar un registro de lista negra en el backend
 * @param {string} blacklistId - ID del registro
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteBlacklistAPI = async (blacklistId, token) => {
  try {
    console.log('🚫 Eliminando registro de lista negra:', blacklistId)

    const response = await fetch(API_CONFIG.BLACKLIST.DELETE(blacklistId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar registro')
    }

    console.log('✅ Registro eliminado')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar registro:', error)
    throw new Error(error.message || 'Error al eliminar registro')
  }
}

/**
 * Obtener estadísticas de lista negra desde el backend
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Estadísticas de lista negra
 */
export const fetchBlacklistStatsAPI = async (token) => {
  try {
    console.log('🚫 Obteniendo estadísticas de lista negra')

    const response = await fetch(API_CONFIG.BLACKLIST.GET_STATS, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener estadísticas')
    }

    console.log('✅ Estadísticas obtenidas')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error)
    throw new Error(error.message || 'Error al obtener estadísticas')
  }
}
