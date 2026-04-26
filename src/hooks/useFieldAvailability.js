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
  const [publicDaySchedules, setPublicDaySchedules] = useState({})
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
        const daySchedule = availability.daySchedule || null

        setPublicOccupiedSlots((prev) => ({
          ...prev,
          [cacheKey]: occupiedSlots,
        }))
        setPublicDaySchedules((prev) => ({
          ...prev,
          [cacheKey]: daySchedule,
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
    setPublicDaySchedules({})
  }, [selectedDate])

  /**
   * Devuelve el día de la semana en inglés (monday..sunday) para una fecha YYYY-MM-DD.
   */
  const getDayOfWeekKey = useCallback((dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr + 'T12:00:00')
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase()
  }, [])

  /**
   * Enriquecer un field con el schedule del día obtenido del endpoint público.
   * Si el field ya trae schedule (ej. obtenido vía getFieldById autenticado), lo respeta.
   * @param {Object} field
   * @returns {Object} field con `schedule` poblado para el día si hay info
   */
  const getEffectiveField = useCallback(
    (field) => {
      if (!field) return field
      if (field.schedule) return field
      const cacheKey = `${field.id}-${selectedDate}`
      const daySchedule = publicDaySchedules[cacheKey]
      if (!daySchedule) return field
      const dayKey = daySchedule.dayOfWeek || getDayOfWeekKey(selectedDate)
      if (!dayKey) return field
      return {
        ...field,
        schedule: { [dayKey]: daySchedule },
      }
    },
    [publicDaySchedules, selectedDate, getDayOfWeekKey]
  )

  /**
   * Obtiene el schedule del día para una cancha específica (si está disponible en cache).
   */
  const getDayScheduleForField = useCallback(
    (fieldId) => {
      const cacheKey = `${fieldId}-${selectedDate}`
      return publicDaySchedules[cacheKey] || null
    },
    [publicDaySchedules, selectedDate]
  )

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
      const effectiveField = getEffectiveField(field)
      const effectiveReservations = getEffectiveReservations(field.id)
      return shouldShowField(
        effectiveField,
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
    getEffectiveField,
  ])

  /**
   * Wrapper para isTimeSlotAvailable con dependencias inyectadas
   */
  const checkTimeSlotAvailability = useCallback(
    (field, timeRangeId) => {
      const effectiveField = getEffectiveField(field)
      const effectiveReservations = getEffectiveReservations(field.id)
      return isTimeSlotAvailable(
        effectiveField,
        timeRangeId,
        selectedDate,
        timeRanges,
        effectiveReservations
      )
    },
    [selectedDate, timeRanges, getEffectiveReservations, getEffectiveField]
  )

  /**
   * Wrapper para getFieldAllAvailableHours con dependencias inyectadas
   */
  const getFieldAllAvailable = useCallback(
    (field) => {
      const effectiveField = getEffectiveField(field)
      const effectiveReservations = getEffectiveReservations(field.id)
      return getFieldAllAvailableHours(
        effectiveField,
        selectedDate,
        timeRanges,
        effectiveReservations
      )
    },
    [selectedDate, timeRanges, getEffectiveReservations, getEffectiveField]
  )

  /**
   * Wrapper para getFieldAvailableHoursInRange con dependencias inyectadas
   */
  const getFieldAvailableInRange = useCallback(
    (field) => {
      const effectiveField = getEffectiveField(field)
      const effectiveReservations = getEffectiveReservations(field.id)
      return getFieldAvailableHoursInRange(
        effectiveField,
        startTime,
        endTime,
        selectedDate,
        timeRanges,
        effectiveReservations
      )
    },
    [startTime, endTime, selectedDate, timeRanges, getEffectiveReservations, getEffectiveField]
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
    getDayScheduleForField,
  }
}

export default useFieldAvailability
