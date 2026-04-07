/**
 * Helper para actualización de campos disponibles
 *
 * Gestiona el filtrado y actualización de campos según criterios de búsqueda
 */

/**
 * Calcula los campos disponibles según filtros seleccionados
 * @param {Object} params - Parámetros de filtrado
 * @returns {Array} - Lista de campos disponibles
 */
export const calculateAvailableFields = ({
  selectedDistrict,
  selectedSportTypes, // Ahora es un array de deportes
  selectedDate,
  fieldStore,
}) => {
  // Verificar que todos los filtros estén seleccionados
  // selectedSportTypes debe tener al menos un deporte
  if (
    !selectedDistrict ||
    !selectedSportTypes ||
    selectedSportTypes.length === 0 ||
    !selectedDate
  ) {
    return []
  }

  // Filtrar campos usando fieldStore con múltiples deportes
  return fieldStore.filterAvailableFields({
    district: selectedDistrict,
    sportTypes: selectedSportTypes, // Pasar array de deportes
    date: selectedDate,
  })
}

/**
 * Calcula los horarios disponibles para un campo específico
 * @param {Object} params - Parámetros de cálculo
 * @returns {Array} - Lista de horarios disponibles
 */
export const calculateAvailableTimes = ({
  selectedField,
  selectedDate,
  timeSlots,
  existingReservations,
}) => {
  // Validar parámetros requeridos
  if (!selectedDate || !selectedField) {
    return []
  }

  // Filtrar horarios que no tienen reservas
  return timeSlots.filter((timeSlot) => {
    const reservation = existingReservations.find(
      (res) =>
        res.fieldId === selectedField.id && res.date === selectedDate && res.time === timeSlot
    )
    return !reservation
  })
}
