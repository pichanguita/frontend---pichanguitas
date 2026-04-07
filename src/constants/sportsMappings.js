/**
 * Mapeo y estandarización de nombres de deportes
 * Este archivo centraliza la nomenclatura de deportes para consistencia
 */

/**
 * Nombres estandarizados de deportes
 * Mapea nombres antiguos/variantes a nombres estandarizados
 */
export const SPORT_NAME_MAPPINGS = {
  // Fútbol variantes
  Fútbol: 'Fútbol',
  Futbol: 'Fútbol',
  Football: 'Fútbol',
  Soccer: 'Fútbol',

  // Fútbol 5
  'Fútbol 6 VS 6': 'Fútbol 5',
  'Futbol 6 VS 6': 'Fútbol 5',
  'Fútbol 5': 'Fútbol 5',
  Futsal: 'Fútbol 5',
  'Fútbol Sala': 'Fútbol 5',

  // Fútbol 11
  'Fútbol 11 VS 11': 'Fútbol 11',
  'Futbol 11 VS 11': 'Fútbol 11',
  'Fútbol 11': 'Fútbol 11',
  'Fútbol Campo': 'Fútbol 11',

  // Básquetbol
  Básquet: 'Básquetbol',
  Basquet: 'Básquetbol',
  Básquetbol: 'Básquetbol',
  Baloncesto: 'Básquetbol',
  Basketball: 'Básquetbol',

  // Vóleibol
  Vóley: 'Vóleibol',
  Voley: 'Vóleibol',
  Vóleibol: 'Vóleibol',
  Voleibol: 'Vóleibol',
  Volleyball: 'Vóleibol',

  // Pádel
  Pádel: 'Pádel',
  Padel: 'Pádel',
  Paddle: 'Pádel',

  // Tenis
  Tenis: 'Tenis',
  Tennis: 'Tenis',

  // Ajedrez
  Ajedrez: 'Ajedrez',
  Chess: 'Ajedrez',
}

/**
 * Lista de deportes estandarizados con iconos
 */
export const STANDARDIZED_SPORTS = [
  {
    id: 1,
    name: 'Ajedrez',
    displayName: 'Ajedrez',
    icon: '♟️',
    category: 'mental',
    description: 'Juego de estrategia mental',
  },
  {
    id: 2,
    name: 'Básquetbol',
    displayName: 'Básquetbol',
    icon: '🏀',
    category: 'equipo',
    description: 'Deporte de canasta en equipo',
  },
  {
    id: 3,
    name: 'Fútbol 5',
    displayName: 'Fútbol 5',
    icon: '⚽',
    category: 'equipo',
    description: 'Fútbol sala o futsal (5 vs 5)',
    aliases: ['Futsal', 'Fútbol Sala', 'Fútbol 6 VS 6'],
  },
  {
    id: 4,
    name: 'Fútbol',
    displayName: 'Fútbol',
    icon: '⚽',
    category: 'equipo',
    description: 'Fútbol tradicional',
  },
  {
    id: 5,
    name: 'Fútbol 11',
    displayName: 'Fútbol 11',
    icon: '⚽',
    category: 'equipo',
    description: 'Fútbol de campo completo (11 vs 11)',
    aliases: ['Fútbol Campo', 'Fútbol 11 VS 11'],
  },
  {
    id: 6,
    name: 'Pádel',
    displayName: 'Pádel',
    icon: '🎾',
    category: 'raqueta',
    description: 'Deporte de raqueta en parejas',
  },
  {
    id: 7,
    name: 'Tenis',
    displayName: 'Tenis',
    icon: '🎾',
    category: 'raqueta',
    description: 'Deporte de raqueta individual o dobles',
  },
  {
    id: 8,
    name: 'Vóleibol',
    displayName: 'Vóleibol',
    icon: '🏐',
    category: 'equipo',
    description: 'Deporte de red en equipo',
  },
]

/**
 * Normaliza un nombre de deporte a su versión estandarizada
 * @param {string} sportName - Nombre del deporte (puede estar en cualquier variante)
 * @returns {string} - Nombre estandarizado
 */
export const normalizeSportName = (sportName) => {
  if (!sportName) return ''

  const trimmedName = sportName.trim()

  // Si existe en el mapeo, devolver la versión estandarizada
  if (SPORT_NAME_MAPPINGS[trimmedName]) {
    return SPORT_NAME_MAPPINGS[trimmedName]
  }

  // Si no existe en el mapeo, devolver el nombre original
  return trimmedName
}

/**
 * Obtiene el objeto completo de deporte estandarizado
 * @param {string} sportName - Nombre del deporte
 * @returns {object|null} - Objeto de deporte o null si no se encuentra
 */
export const getStandardizedSport = (sportName) => {
  const normalized = normalizeSportName(sportName)
  return STANDARDIZED_SPORTS.find((sport) => sport.name === normalized) || null
}

/**
 * Obtiene el ícono de un deporte
 * @param {string} sportName - Nombre del deporte
 * @returns {string} - Emoji del ícono
 */
export const getSportIconByName = (sportName) => {
  const sport = getStandardizedSport(sportName)
  return sport ? sport.icon : '⚽'
}

/**
 * Valida si un nombre de deporte es válido
 * @param {string} sportName - Nombre a validar
 * @returns {boolean} - true si es válido
 */
export const isValidSportName = (sportName) => {
  const normalized = normalizeSportName(sportName)
  return STANDARDIZED_SPORTS.some((sport) => sport.name === normalized)
}

/**
 * Obtiene todos los nombres estandarizados
 * @returns {string[]} - Array de nombres estandarizados
 */
export const getAllStandardizedNames = () => {
  return STANDARDIZED_SPORTS.map((sport) => sport.name)
}

/**
 * Busca deportes por texto
 * @param {string} searchText - Texto de búsqueda
 * @returns {object[]} - Array de deportes que coinciden
 */
export const searchSports = (searchText) => {
  if (!searchText || searchText.trim() === '') {
    return STANDARDIZED_SPORTS
  }

  const searchLower = searchText.toLowerCase().trim()

  return STANDARDIZED_SPORTS.filter((sport) => {
    // Buscar en nombre
    if (sport.name.toLowerCase().includes(searchLower)) return true

    // Buscar en display name
    if (sport.displayName.toLowerCase().includes(searchLower)) return true

    // Buscar en descripción
    if (sport.description.toLowerCase().includes(searchLower)) return true

    // Buscar en aliases si existen
    if (sport.aliases) {
      return sport.aliases.some((alias) => alias.toLowerCase().includes(searchLower))
    }

    return false
  })
}

export default {
  SPORT_NAME_MAPPINGS,
  STANDARDIZED_SPORTS,
  normalizeSportName,
  getStandardizedSport,
  getSportIconByName,
  isValidSportName,
  getAllStandardizedNames,
  searchSports,
}
