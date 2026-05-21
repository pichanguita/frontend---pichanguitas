import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * GET público: lista los tutoriales activos para la landing y el panel admin.
 * Devuelve [{id, slug, title, description, video_url, sort_order, is_active}].
 */
export const fetchVideoTutorials = async () => {
  const response = await fetch(API_CONFIG.VIDEO_TUTORIALS.GET_ALL, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Error al obtener tutoriales')
  }
  return data.data || []
}

/**
 * PUT autenticado: actualiza title, description y/o video_url.
 * Solo envía campos definidos.
 */
export const updateVideoTutorial = async (slug, payload) => {
  const body = {}
  if (payload.title !== undefined) body.title = payload.title
  if (payload.description !== undefined) body.description = payload.description
  if (payload.video_url !== undefined) body.video_url = payload.video_url

  const response = await fetch(API_CONFIG.VIDEO_TUTORIALS.UPDATE(slug), {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message || 'Error al actualizar tutorial')
  }
  return data.data
}
