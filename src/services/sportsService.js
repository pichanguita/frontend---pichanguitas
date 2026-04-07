/**
 * SportsService - Lógica de negocio para manejo de deportes
 * Separa la lógica de la UI para mejor mantenibilidad y testing
 */

import { normalizeSportName, getSportIconByName } from '../constants/sportsMappings'

/**
 * Verifica si todas las opciones de deportes están seleccionadas (multideporte)
 * @param {string[]} selectedSports - Array de deportes seleccionados
 * @param {Array} availableSports - Array de deportes disponibles
 * @returns {boolean} - true si todos están seleccionados
 */
export const isMultiSport = (selectedSports, availableSports) => {
  if (!selectedSports || !availableSports) return false
  return selectedSports.length === availableSports.length
}

/**
 * Toggle de un deporte en la lista de seleccionados
 * @param {string[]} currentSports - Array actual de deportes seleccionados
 * @param {string} sportName - Nombre del deporte a toggle
 * @returns {string[]} - Nuevo array con el deporte agregado o removido
 */
export const toggleSport = (currentSports, sportName) => {
  const newSports = [...currentSports]
  const index = newSports.indexOf(sportName)

  if (index > -1) {
    // Remover si existe
    newSports.splice(index, 1)
  } else {
    // Agregar si no existe
    newSports.push(sportName)
  }

  return newSports
}

/**
 * Selecciona todos los deportes disponibles
 * @param {Array} availableSports - Array de deportes disponibles
 * @returns {string[]} - Array con nombres de todos los deportes
 */
export const selectAllSports = (availableSports) => {
  if (!availableSports || availableSports.length === 0) return []

  return availableSports.map((sport) => (typeof sport === 'string' ? sport : sport.name))
}

/**
 * Deselecciona todos los deportes
 * @returns {string[]} - Array vacío
 */
export const deselectAllSports = () => {
  return []
}

/**
 * Genera un resumen de la selección de deportes
 * @param {string[]} selectedSports - Array de deportes seleccionados
 * @param {boolean} isMultiSport - Si es cancha multideportiva
 * @returns {string} - Resumen en texto
 */
export const getSportSelectionSummary = (selectedSports, isMultiSport) => {
  const count = selectedSports.length

  if (count === 0) {
    return 'Ningún deporte seleccionado'
  }

  const sportWord = count === 1 ? 'deporte' : 'deportes'
  const selectedWord = count === 1 ? 'seleccionado' : 'seleccionados'

  let summary = `${count} ${sportWord} ${selectedWord}`

  if (isMultiSport) {
    summary += ' - Cancha Multideportiva'
  }

  return summary
}

/**
 * Valida que al menos un deporte esté seleccionado
 * @param {string[]} selectedSports - Array de deportes seleccionados
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateSportSelection = (selectedSports) => {
  if (!selectedSports || selectedSports.length === 0) {
    return {
      isValid: false,
      error: 'Debes seleccionar al menos un deporte',
    }
  }

  return {
    isValid: true,
    error: null,
  }
}

/**
 * Obtiene el nombre del deporte desde un objeto o string
 * Normaliza el nombre usando el mapeo estandarizado
 * @param {string|object} sport - Deporte como string o objeto
 * @returns {string} - Nombre estandarizado del deporte
 */
export const getSportName = (sport) => {
  const rawName = typeof sport === 'string' ? sport : sport?.name || ''
  return normalizeSportName(rawName)
}

/**
 * Obtiene el ícono del deporte desde un objeto o string
 * Si el objeto no tiene ícono, busca en el mapeo estandarizado
 * @param {string|object} sport - Deporte como string o objeto
 * @param {string} defaultIcon - Ícono por defecto
 * @returns {string} - Ícono del deporte
 */
export const getSportIcon = (sport, defaultIcon = '⚽') => {
  // Si es objeto y tiene ícono, usarlo
  if (typeof sport === 'object' && sport?.icon) {
    return sport.icon
  }

  // Si es string, buscar en el mapeo estandarizado
  const sportName = getSportName(sport)
  return getSportIconByName(sportName) || defaultIcon
}

/**
 * Filtra deportes por texto de búsqueda
 * @param {Array} sports - Array de deportes
 * @param {string} searchText - Texto a buscar
 * @returns {Array} - Deportes filtrados
 */
export const filterSportsBySearch = (sports, searchText) => {
  if (!searchText || searchText.trim() === '') return sports

  const searchLower = searchText.toLowerCase().trim()

  return sports.filter((sport) => {
    const name = getSportName(sport).toLowerCase()
    return name.includes(searchLower)
  })
}

/**
 * Ordena deportes alfabéticamente
 * @param {Array} sports - Array de deportes
 * @returns {Array} - Deportes ordenados
 */
export const sortSportsAlphabetically = (sports) => {
  return [...sports].sort((a, b) => {
    const nameA = getSportName(a)
    const nameB = getSportName(b)
    return nameA.localeCompare(nameB)
  })
}

export default {
  isMultiSport,
  toggleSport,
  selectAllSports,
  deselectAllSports,
  getSportSelectionSummary,
  validateSportSelection,
  getSportName,
  getSportIcon,
  filterSportsBySearch,
  sortSportsAlphabetically,
}
