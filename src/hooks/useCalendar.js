import { useState, useMemo, useEffect, useCallback } from 'react'
import useBookingStore from '../store/bookingStore'
import useFieldStore from '../store/modules/fieldStore'
import useAuthStore from '../store/authStore'
import { calculateMonthStats, getMonthData, getWeekData } from '../utils/calendar/calculators'
import { isToday } from '../utils/calendar/formatters'

/**
 * Hook personalizado para manejar la lógica del calendario
 * Ahora carga reservas del mes desde la BD
 * @param {string} fieldFilter - ID de cancha específica o 'all'
 * @param {Array|null} filteredFieldIds - Array de IDs de canchas filtradas (incluye filtros geográficos)
 */
export const useCalendar = (fieldFilter = 'all', filteredFieldIds = null) => {
  const { existingReservations, loadReservations } = useBookingStore()
  const { fields } = useFieldStore()
  const { user } = useAuthStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [viewMode, setViewMode] = useState('month')
  const [isLoading, setIsLoading] = useState(false)

  // Cargar reservas del mes actual desde la BD (incluye días de overflow del calendario)
  const loadMonthReservations = useCallback(async () => {
    setIsLoading(true)
    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()

      // Calcular el primer día VISIBLE del calendario (puede ser del mes anterior)
      // El calendario muestra 42 días (6 semanas). El primer día visible es el domingo
      // de la semana donde cae el día 1 del mes.
      const firstDayOfMonth = new Date(year, month, 1)
      const dayOfWeek = firstDayOfMonth.getDay() // 0=domingo, 6=sábado
      const firstVisibleDay = new Date(year, month, 1 - dayOfWeek)

      // El último día visible es 41 días después del primero (42 días total)
      const lastVisibleDay = new Date(firstVisibleDay)
      lastVisibleDay.setDate(firstVisibleDay.getDate() + 41)

      // Formatear fechas para la API
      const formatDate = (date) => {
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
      }

      const dateFrom = formatDate(firstVisibleDay)
      const dateTo = formatDate(lastVisibleDay)

      // Cargar reservas del rango visible del calendario
      await loadReservations({
        date_from: dateFrom,
        date_to: dateTo,
      })
    } catch (error) {
      console.error('Error cargando reservas del mes:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentDate, loadReservations])

  // Cargar reservas cuando cambie el mes
  useEffect(() => {
    loadMonthReservations()
  }, [loadMonthReservations])

  // Filtrar reservas - usa filteredFieldIds si está disponible (incluye filtros geográficos)
  const filteredReservations = useMemo(() => {
    // Si se pasó un array (incluso vacío), respetar el filtro: array vacío = cero reservas.
    // Solo cuando filteredFieldIds es null/undefined se aplica el fallback por fieldFilter.
    if (Array.isArray(filteredFieldIds)) {
      if (filteredFieldIds.length === 0) return []
      const allowedIds = new Set(filteredFieldIds.map((id) => parseInt(id, 10)))
      return existingReservations.filter((r) => allowedIds.has(parseInt(r.fieldId, 10)))
    }
    // Fallback al comportamiento anterior (solo fieldFilter)
    if (fieldFilter === 'all') return existingReservations
    const selectedId = parseInt(fieldFilter, 10)
    return existingReservations.filter((r) => parseInt(r.fieldId, 10) === selectedId)
  }, [existingReservations, fieldFilter, filteredFieldIds])

  // Obtener reservas de una fecha
  const getReservationsForDate = (date) => {
    // Formatear la fecha del calendario como YYYY-MM-DD en hora local
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    return filteredReservations.filter((r) => {
      if (!r.date) return false
      // Normalizar la fecha de la reserva (puede venir como ISO completo o solo fecha)
      const resDate = r.date.split('T')[0]
      return resDate === dateStr
    })
  }

  // Calcular estadísticas del mes
  const monthStats = useMemo(
    () => calculateMonthStats(currentDate, filteredReservations, fields),
    [currentDate, filteredReservations, fields]
  )

  // Datos del mes
  const monthData = useMemo(
    () => getMonthData(currentDate, getReservationsForDate),
    [currentDate, filteredReservations]
  )

  // Datos de la semana
  const weekData = useMemo(
    () => getWeekData(currentDate, getReservationsForDate, isToday),
    [currentDate, filteredReservations]
  )

  // Navegación
  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (viewMode === 'week') {
        newDate.setDate(prev.getDate() + direction * 7)
      } else {
        newDate.setMonth(prev.getMonth() + direction)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(null)
  }

  const handleDateClick = (dayData) => {
    setSelectedDate(dayData)
    if (dayData.reservations.length > 0) {
      setViewMode('day')
    }
  }

  return {
    currentDate,
    selectedDate,
    viewMode,
    monthStats,
    monthData,
    weekData,
    fields,
    user,
    isLoading,
    setViewMode,
    navigateMonth,
    goToToday,
    handleDateClick,
    refreshReservations: loadMonthReservations,
  }
}
