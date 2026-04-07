/**
 * Custom Hook: useAvailableFields
 *
 * Gestiona el estado y la lógica para la vista de canchas disponibles
 */

import { useState, useMemo } from 'react'
import useBookingStore from '../store/bookingStore'
import useAuthStore from '../store/authStore'
import {
  filterAvailableFields,
  extractSportTypes,
  generateTimeSlots,
  isSlotAvailable as checkSlotAvailability,
  getFieldReservationCount as getReservationCount,
} from '../utils/fields/fieldUtils'

export const useAvailableFields = () => {
  const { fields, existingReservations, addReservation } = useBookingStore()
  const { user } = useAuthStore()

  // Estado de filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSport, setSelectedSport] = useState('all')

  // Estado de reserva
  const [selectedField, setSelectedField] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [duration, setDuration] = useState(1)

  // Canchas filtradas
  const availableFields = useMemo(() => {
    return filterAvailableFields(fields, searchTerm, selectedSport)
  }, [fields, searchTerm, selectedSport])

  // Tipos de deporte únicos
  const sportTypes = useMemo(() => {
    return extractSportTypes(fields)
  }, [fields])

  // Slots de tiempo
  const timeSlots = useMemo(() => {
    return generateTimeSlots()
  }, [])

  // Helper: verificar disponibilidad de slot
  const isSlotAvailable = (fieldId, date, time) => {
    return checkSlotAvailability(fieldId, date, time, existingReservations)
  }

  // Helper: contar reservas del usuario en una cancha
  const getFieldReservationCount = (fieldId) => {
    return getReservationCount(fieldId, user?.id, existingReservations)
  }

  // Acción: seleccionar cancha
  const handleFieldSelection = (field) => {
    setSelectedField(field)
    setSelectedDate('')
    setSelectedTimeSlot('')
    setDuration(1)
  }

  // Acción: limpiar selección
  const clearSelection = () => {
    setSelectedField(null)
    setSelectedDate('')
    setSelectedTimeSlot('')
    setDuration(1)
  }

  return {
    // Estado de filtros
    searchTerm,
    setSearchTerm,
    selectedSport,
    setSelectedSport,

    // Estado de reserva
    selectedField,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    duration,
    setDuration,

    // Datos procesados
    availableFields,
    sportTypes,
    timeSlots,

    // Helpers
    isSlotAvailable,
    getFieldReservationCount,

    // Acciones
    handleFieldSelection,
    clearSelection,
    addReservation,

    // Usuario
    user,
  }
}
