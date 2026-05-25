// Dynamic field images by sport type
// Using optimized sports facility images from Unsplash
// Optimized for mobile with smaller sizes, lower quality, and auto-format

// Parámetros optimizados:
// - w=600 (ancho reducido para móvil)
// - h=400 (alto reducido)
// - q=75 (calidad 75% - balance entre tamaño y calidad)
// - auto=format (formato automático webp para navegadores compatibles)
// - fit=crop (recortar para mantener proporciones)

export const fieldImages = {
  futbol: [
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Soccer field with goal
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Professional soccer field
    'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Soccer field aerial view
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Football stadium field
  ],

  futbol11: [
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Soccer field with goal
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Professional soccer field
    'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Soccer field aerial view
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Football stadium field
  ],

  futsal: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Indoor futsal court
    'https://images.unsplash.com/photo-1546717003-96af0fb2f95b?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Modern futsal facility
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Indoor sports court
  ],

  basquet: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Basketball court
    'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Indoor basketball court
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Modern basketball facility
    'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Professional basketball court
  ],

  voley: [
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Volleyball court
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Indoor volleyball court
    'https://images.unsplash.com/photo-1594736797933-d0b22d64aba9?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Volleyball facility
  ],

  tenis: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Tennis court
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Professional tennis court
    'https://images.unsplash.com/photo-1551016344-4b0c55632d24?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Tennis facility
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Modern tennis court
  ],

  estadio: [
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Large stadium
    'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Football stadium interior
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Stadium field view
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Stadium architecture
  ],

  multiuso: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Multi-sport facility
    'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Indoor multi-sport court
    'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Versatile sports facility
    'https://images.unsplash.com/photo-1546717003-96af0fb2f95b?w=600&h=400&q=75&auto=format&fit=crop&crop=center', // Modern sports complex
  ],
}

// Fallback image for unknown sport types or errors (también optimizado)
export const defaultFieldImage =
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&q=75&auto=format&fit=crop&crop=center'

// Placeholder local garantizado (SVG en data URI, sin red). SIEMPRE carga, por
// lo que nunca dispara el evento `error` del <img>.
export const FIELD_IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">' +
      '<rect width="600" height="400" fill="#0a2424"/>' +
      '<text x="50%" y="50%" fill="#ffd500" font-family="sans-serif" font-size="28"' +
      ' text-anchor="middle" dominant-baseline="middle">Sin Imagen</text></svg>'
  )

/**
 * Handler de error para imágenes de cancha: idempotente y TERMINAL.
 *
 * Degrada a un placeholder local que siempre carga. Como el placeholder no
 * falla, el evento `error` no se vuelve a disparar y el ciclo termina tras un
 * único fallo. Evita el bucle infinito que producía reasignar una URL remota
 * que vuelve a fallar (el listener de React vuelve a ejecutarse en cada error,
 * por lo que anular `e.target.onerror` no es suficiente).
 * @param {Event} e - evento onError del <img>
 */
export const handleFieldImageError = (e) => {
  const img = e.currentTarget
  if (!img || img.src === FIELD_IMAGE_PLACEHOLDER) return
  img.onerror = null
  img.src = FIELD_IMAGE_PLACEHOLDER
}

// Function to get image for a field based on sport type and field ID
export const getFieldImage = (sportType, fieldId) => {
  const sportImages = fieldImages[sportType] || fieldImages.multiuso

  // Use field ID to create a consistent but pseudo-random selection
  // Convert fieldId to string if it's a number
  const fieldIdStr = fieldId != null ? String(fieldId) : ''
  const imageIndex = fieldIdStr
    ? Math.abs(fieldIdStr.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % sportImages.length
    : 0

  return sportImages[imageIndex] || defaultFieldImage
}

// Function to get all images for a sport type (for galleries)
// Prioriza las imágenes personalizadas si existen
export const getSportImages = (sportType, customImages = []) => {
  // Si hay imágenes personalizadas, usarlas primero
  if (customImages && customImages.length > 0) {
    return customImages
  }

  // If sportType is undefined or null, use multiuso
  if (!sportType) {
    return fieldImages.multiuso || [defaultFieldImage]
  }

  // Return the images for the sport type, or multiuso as fallback
  return fieldImages[sportType] || fieldImages.multiuso || [defaultFieldImage]
}

export default fieldImages
