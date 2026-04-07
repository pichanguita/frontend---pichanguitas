/**
 * Módulo: Acciones de Disponibilidad
 *
 * Gestiona la disponibilidad de campos
 * NOTA: La lógica de slots ocupados para usuarios no autenticados
 * se maneja en useFieldAvailability.js con la API pública
 */

import useGeographyStore from '../modules/geographyStore'
import useFieldStore from '../modules/fieldStore'
import { calculateAvailableFields } from '../../utils/booking-store/fieldUpdateHelper'

export const createAvailabilityActions = (set, get) => ({
  /**
   * Actualiza los campos disponibles según los filtros seleccionados
   * (distrito, tipos de deporte, fecha)
   */
  updateAvailableFields: () => {
    const geographyState = useGeographyStore.getState()
    const bookingState = get()
    const { selectedSportTypes, selectedDate, selectedDistrict } = bookingState

    const filtered = calculateAvailableFields({
      selectedDistrict: selectedDistrict || geographyState.selectedDistrict,
      selectedSportTypes,
      selectedDate,
      fieldStore: useFieldStore.getState(),
    })

    set({ availableFields: filtered })
  },
})
