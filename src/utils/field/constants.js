/**
 * Constantes para la gestión de canchas
 */

export const DISTRICTS = [
  { id: 'abancay', name: 'Abancay' },
  { id: 'andahuaylas', name: 'Andahuaylas' },
  { id: 'chincheros', name: 'Chincheros' },
  { id: 'grau', name: 'Grau' },
  { id: 'cotabambas', name: 'Cotabambas' },
  { id: 'antabamba', name: 'Antabamba' },
  { id: 'aymaraes', name: 'Aymaraes' },
]

export const LOCATION_SUGGESTIONS = {
  abancay: ['Centro', 'Norte', 'Sur', 'Este', 'Oeste'],
  andahuaylas: ['Centro', 'Norte', 'Sur', 'Talavera'],
  chincheros: ['Centro', 'Uranmarca', 'Cocharcas'],
  grau: ['Chuquibambilla', 'Curasco', 'Mamara'],
  cotabambas: ['Tambobamba', 'Cotabambas', 'Coyllurqui'],
  antabamba: ['Centro', 'Oropesa', 'Pachaconas'],
  aymaraes: ['Chalhuanca', 'Capaya', 'Caraybamba'],
}

export const getLocationSuggestions = (districtId) => {
  return LOCATION_SUGGESTIONS[districtId] || []
}
