import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import {
  calculateSelectedTimeRanges,
  isTimeSlotAvailable,
  getFieldAllAvailableHours,
  getFieldAvailableHoursInRange,
  shouldShowField,
} from '../utils/bookingHelpers'
import { fetchPublicFieldAvailability } from '../services/booking/reservationService'

/**
 * Hook personalizado para manejar la disponibilidad de campos
 * Obtiene slots ocupados desde la API pública para usuarios no autenticados
 * @param {Object} params - Parámetros del hook
 * @returns {Object} Funciones y valores relacionados con disponibilidad
 */
const useFieldAvailability = ({
  availableFields,
  selectedDate,
  startTime,
  endTime,
  timeRanges,
  existingReservations,
  selectedDistrict,
  selectedSportTypes = [],
}) => {
  const [publicOccupiedSlots, setPublicOccupiedSlots] = useState({})
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
  const fetchedFieldsRef = useRef(new Set())

  /**
   * Verifica si se puede buscar campos (todos los filtros completados)
   */
  const canSearchFields = useMemo(() => {
    return !!(
      selectedDistrict &&
      selectedSportTypes.length > 0 &&
      selectedDate &&
      startTime &&
      endTime
    )
  }, [selectedDistrict, selectedSportTypes, selectedDate, startTime, endTime])

  /**
   * Obtener slots ocupados de la API pública para un campo específico
   */
  const fetchFieldAvailability = useCallback(
    async (fieldId) => {
      if (!selectedDate || !fieldId) return

      const cacheKey = `${fieldId}-${selectedDate}`

      if (fetchedFieldsRef.current.has(cacheKey)) {
        return
      }

      try {
        fetchedFieldsRef.current.add(cacheKey)
        const availability = await fetchPublicFieldAvailability(fieldId, selectedDate)
        const occupiedSlots = availability.occupiedSlots || []

        setPublicOccupiedSlots((prev) => ({
          ...prev,
          [cacheKey]: occupiedSlots,
        }))
      } catch (_error) {
        // Error silencioso - los slots se mostrarán como disponibles
      }
    },
    [selectedDate]
  )

  /**
   * Cargar disponibilidad para todos los campos visibles
   */
  useEffect(() => {
    if (!canSearchFields || !selectedDate || availableFields.length === 0) return

    setIsLoadingAvailability(true)

    const loadAllAvailability = async () => {
      for (const field of availableFields) {
        await fetchFieldAvailability(field.id)
      }
      setIsLoadingAvailability(false)
    }

    loadAllAvailability()
  }, [canSearchFields, selectedDate, availableFields, fetchFieldAvailability])

  // Limpiar cache cuando cambia la fecha
  useEffect(() => {
    fetchedFieldsRef.current.clear()
    setPublicOccupiedSlots({})
  }, [selectedDate])

  /**
   * Combinar reservas existentes (autenticados) con slots públicos (no autenticados)
   */
  const getEffectiveReservations = useCallback(
    (fieldId) => {
      if (existingReservations && existingReservations.length > 0) {
        return existingReservations
      }

      const cacheKey = `${fieldId}-${selectedDate}`
      const occupiedSlots = publicOccupiedSlots[cacheKey] || []

      if (occupiedSlots.length === 0) {
        return []
      }

      const fakeReservations = occupiedSlots.map((slot, index) => ({
        id: `public-${fieldId}-${index}`,
        fieldId: fieldId,
        date: selectedDate,
        startTime: slot.startTime?.substring(0, 5) || '',
        endTime: slot.endTime?.substring(0, 5) || '',
        status: 'confirmed',
      }))

      return fakeReservations
    },
    [existingReservations, publicOccupiedSlots, selectedDate]
  )

  /**
   * Calcula los horarios seleccionados en el rango
   */
  const selectedTimeRangesIds = useMemo(() => {
    return calculateSelectedTimeRanges(startTime, endTime, timeRanges)
  }, [startTime, endTime, timeRanges])

  /**
   * Filtra campos que tienen al menos 1 hora disponible
   */
  const visibleFields = useMemo(() => {
    if (!canSearchFields) return []

    return availableFields.filter((field) => {
      const effectiveReservations = getEffectiveReservations(field.id)
      return shouldShowField(
        field,
        startTime,
        endTime,
        selectedDate,
        timeRanges,
        effectiveReservations
      )
    })
  }, [
    canSearchFields,
    availableFields,
    startTime,
    endTime,
    selectedDate,
    timeRanges,
    getEffectiveReservations,
  ])

  /**
   * Wrapper para isTimeSlotAvailable con dependencias inyectadas
   */
  const checkTimeSlotAvailability = useCallback(
    (field, timeRangeId) => {
      const effectiveReservations = getEffectiveReservations(field.id)
      return isTimeSlotAvailable(
        field,
        timeRangeId,
        selectedDate,
        timeRanges,
        effectiveReservations
      )
    },
    [selectedDate, timeRanges, getEffectiveReservations]
  )

  /**
   * Wrapper para getFieldAllAvailableHours con dependencias inyectadas
   */
  const getFieldAllAvailable = useCallback(
    (field) => {
      const effectiveReservations = getEffectiveReservations(field.id)
      return getFieldAllAvailableHours(field, selectedDate, timeRanges, effectiveReservations)
    },
    [selectedDate, timeRanges, getEffectiveReservations]
  )

  /**
   * Wrapper para getFieldAvailableHoursInRange con dependencias inyectadas
   */
  const getFieldAvailableInRange = useCallback(
    (field) => {
      const effectiveReservations = getEffectiveReservations(field.id)
      return getFieldAvailableHoursInRange(
        field,
        startTime,
        endTime,
        selectedDate,
        timeRanges,
        effectiveReservations
      )
    },
    [startTime, endTime, selectedDate, timeRanges, getEffectiveReservations]
  )

  return {
    canSearchFields,
    visibleFields,
    selectedTimeRangesIds,
    isLoadingAvailability,
    checkTimeSlotAvailability,
    getFieldAllAvailable,
    getFieldAvailableInRange,
    calculateSelectedTimeRanges: () => selectedTimeRangesIds,
    fetchFieldAvailability,
  }
}

export default useFieldAvailability
