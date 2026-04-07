/**
 * TIME RANGE HELPERS
 * Utilidades para convertir rangos de tiempo del frontend al formato backend
 */

/**
 * Convierte array de timeRange IDs a start_time y end_time
 * @param {Array<string>} selectedTimeRanges - IDs de rangos seleccionados (ej: '6am', '10pm')
 * @param {Array<Object>} timeRanges - Todos los rangos disponibles
 * @returns {Object} { start_time, end_time, hours }
 */
export const convertTimeRangesToStartEnd = (selectedTimeRanges, timeRanges) => {
  if (!selectedTimeRanges || selectedTimeRanges.length === 0) {
    return { start_time: null, end_time: null, hours: 0 }
  }

  // Obtener los objetos de timeRange correspondientes
  const selectedRangeObjects = selectedTimeRanges
    .map((id) => timeRanges.find((tr) => tr.id === id))
    .filter(Boolean)

  if (selectedRangeObjects.length === 0) {
    throw new Error('Rangos de tiempo no encontrados')
  }

  // Ordenar CRONOLÓGICAMENTE por startTime (no por ID)
  // Esto previene el bug donde start_time > end_time
  const sortedRanges = [...selectedRangeObjects].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  )

  const firstRange = sortedRanges[0]
  const lastRange = sortedRanges[sortedRanges.length - 1]

  return {
    start_time: firstRange.startTime, // Ej: "08:00"
    end_time: lastRange.endTime, // Ej: "11:00"
    hours: selectedTimeRanges.length, // Ej: 3
  }
}

/**
 * Valida que los rangos sean consecutivos
 * @param {Array<string>} selectedTimeRanges - IDs de rangos seleccionados (ej: '6am', '10pm')
 * @param {Array<Object>} timeRanges - Todos los rangos disponibles (necesario para ordenar)
 * @returns {boolean} true si son consecutivos
 */
export const areTimeRangesConsecutive = (selectedTimeRanges, timeRanges) => {
  if (selectedTimeRanges.length <= 1) return true
  if (!timeRanges || timeRanges.length === 0) return false

  // Obtener índices de los rangos seleccionados en el array original (que está ordenado cronológicamente)
  const indices = selectedTimeRanges
    .map((id) => timeRanges.findIndex((tr) => tr.id === id))
    .filter((idx) => idx !== -1)
    .sort((a, b) => a - b) // Aquí SÍ son números (índices)

  // Verificar que los índices sean consecutivos
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) {
      return false
    }
  }

  return true
}
