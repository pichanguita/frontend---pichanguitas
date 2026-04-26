import { getToken } from '../config/api.config'

/**
 * Descarga un archivo de un endpoint autenticado (Authorization: Bearer ...).
 * Devuelve el blob y una URL temporal para usar en <img>, <a> o window.open.
 * Recuerda liberar la URL con URL.revokeObjectURL cuando ya no se use.
 */
export const fetchAuthenticatedBlob = async (url) => {
  const token = getToken()
  if (!token) {
    throw new Error('Sesión no válida. Inicia sesión nuevamente para ver el archivo.')
  }
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(`No se pudo cargar el archivo (${response.status})`)
  }
  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)
  return { blob, blobUrl }
}

/**
 * Dispara una descarga clásica (<a download>) para un endpoint autenticado.
 */
export const downloadAuthenticatedFile = async (url, filename) => {
  const { blobUrl } = await fetchAuthenticatedBlob(url)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename || 'archivo'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
}

