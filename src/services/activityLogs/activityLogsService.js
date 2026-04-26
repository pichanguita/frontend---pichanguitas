import { API_CONFIG, getAuthHeaders } from '../../config/api.config'

/**
 * Obtener logs de actividad de un usuario desde el backend.
 * @param {number} userId - ID del usuario
 * @param {Object} [options]
 * @param {string} [options.type] - Filtrar por entity_type (login/reservation/field/settings)
 * @param {number} [options.limit]
 * @returns {Promise<{ items: Array, counts: Object }>}
 */
export const fetchUserActivityLogs = async (userId, { type = null, limit = 200 } = {}) => {
  const params = new URLSearchParams()
  if (type) params.append('type', type)
  if (limit) params.append('limit', String(limit))

  const qs = params.toString() ? `?${params.toString()}` : ''
  const url = `${API_CONFIG.ACTIVITY_LOGS.GET_BY_USER(userId)}${qs}`

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  const data = await res.json()

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'No se pudo obtener el registro de actividad')
  }

  return {
    items: data.data || [],
    counts: data.counts || { login: 0, reservation: 0, field: 0, settings: 0, total: 0 },
  }
}
