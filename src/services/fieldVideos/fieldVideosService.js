/**
 * FIELD VIDEOS SERVICE
 *
 * Servicio para operaciones de videos de canchas.
 * Maneja videos promocionales, recorridos virtuales y demos de las canchas.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== API CALLS ====================

/**
 * Obtener todos los videos desde el backend
 * @param {Object} filters - Filtros opcionales
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de videos
 */
export const fetchFieldVideos = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.field_id) queryParams.append('field_id', filters.field_id)

    const url = `${API_CONFIG.FIELD_VIDEOS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('🎬 Obteniendo videos')

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener videos')
    }

    console.log('✅ Videos obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener videos:', error)
    throw new Error(error.message || 'Error al obtener videos')
  }
}

/**
 * Obtener un video por ID desde el backend
 * @param {string} videoId - ID del video
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Video
 */
export const fetchFieldVideoById = async (videoId, token) => {
  try {
    console.log('🎬 Obteniendo video:', videoId)

    const response = await fetch(API_CONFIG.FIELD_VIDEOS.GET_BY_ID(videoId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener video')
    }

    console.log('✅ Video obtenido')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener video:', error)
    throw new Error(error.message || 'Error al obtener video')
  }
}

/**
 * Obtener videos de una cancha específica desde el backend
 * @param {string} fieldId - ID de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de videos
 */
export const fetchVideosByField = async (fieldId, token) => {
  try {
    console.log('🎬 Obteniendo videos de la cancha:', fieldId)

    const response = await fetch(API_CONFIG.FIELD_VIDEOS.GET_BY_FIELD(fieldId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener videos de la cancha')
    }

    console.log('✅ Videos de la cancha obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener videos de la cancha:', error)
    throw new Error(error.message || 'Error al obtener videos de la cancha')
  }
}

/**
 * Crear un nuevo video en el backend
 * @param {Object} videoData - Datos del video
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Video creado
 */
export const createFieldVideoAPI = async (videoData, token) => {
  try {
    console.log('🎬 Creando video')

    const response = await fetch(API_CONFIG.FIELD_VIDEOS.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(videoData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear video')
    }

    console.log('✅ Video creado:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al crear video:', error)
    throw new Error(error.message || 'Error al crear video')
  }
}

/**
 * Actualizar un video en el backend
 * @param {string} videoId - ID del video
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Video actualizado
 */
export const updateFieldVideoAPI = async (videoId, updates, token) => {
  try {
    console.log('🎬 Actualizando video:', videoId)

    const response = await fetch(API_CONFIG.FIELD_VIDEOS.UPDATE(videoId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar video')
    }

    console.log('✅ Video actualizado')

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar video:', error)
    throw new Error(error.message || 'Error al actualizar video')
  }
}

/**
 * Eliminar un video en el backend
 * @param {string} videoId - ID del video
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteFieldVideoAPI = async (videoId, token) => {
  try {
    console.log('🎬 Eliminando video:', videoId)

    const response = await fetch(API_CONFIG.FIELD_VIDEOS.DELETE(videoId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar video')
    }

    console.log('✅ Video eliminado')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar video:', error)
    throw new Error(error.message || 'Error al eliminar video')
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Extraer ID de video de YouTube desde URL
 * @param {string} url - URL de YouTube
 * @returns {string|null} ID del video o null
 */
export const extractYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

/**
 * Generar URL de thumbnail de YouTube
 * @param {string} videoId - ID del video de YouTube
 * @param {string} quality - Calidad (default, mqdefault, hqdefault, sddefault, maxresdefault)
 * @returns {string} URL del thumbnail
 */
export const getYouTubeThumbnail = (videoId, quality = 'hqdefault') => {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

/**
 * Filtrar videos por tipo
 * @param {Array} videos - Array de videos
 * @param {string} videoType - Tipo de video (promotional, virtual_tour, demo, etc.)
 * @returns {Array} Videos filtrados
 */
export const filterVideosByType = (videos, videoType) => {
  return videos.filter((video) => video.video_type === videoType)
}
