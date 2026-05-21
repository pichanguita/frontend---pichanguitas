import { API_CONFIG } from '@/config/api.config'

/**
 * Obtiene el catálogo de amenidades activas desde el backend.
 * Es un endpoint público (no requiere token): se usa tanto en forms
 * de admin como en el render al cliente.
 * @returns {Promise<Array<{key:string,label:string,icon_name:string,color_class:string}>>}
 */
export const fetchAmenitiesCatalog = async () => {
  const response = await fetch(API_CONFIG.AMENITIES_CATALOG.GET_ALL, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener catálogo de amenidades')
  }
  return data.data || []
}
