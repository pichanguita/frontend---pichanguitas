import { useState } from 'react'

/**
 * Hook personalizado para manejar la lógica del calendario de reservas
 * @param {string} selectedDate - Fecha seleccionada en formato ISO
 * @returns {Object} Estado y funciones del calendario
 */
const useBookingCalendar = (selectedDate) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // Constantes del calendario
  const monthNames = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  /**
   * Genera el calendario del mes actual con información de cada día
   * @returns {Array} Array de objetos con información de cada día
   */
  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const prevLastDay = new Date(currentYear, currentMonth, 0)
    const firstDayIndex = firstDay.getDay()
    const lastDayIndex = lastDay.getDay()
    const nextDays = 7 - lastDayIndex - 1

    const dates = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Días del mes anterior
    for (let x = firstDayIndex; x > 0; x--) {
      const day = prevLastDay.getDate() - x + 1
      dates.push({
        day,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, day),
      })
    }

    // Días del mes actual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(currentYear, currentMonth, i)
      dates.push({
        day: i,
        isCurrentMonth: true,
        date,
        isToday: date.getTime() === today.getTime(),
        isPast: date < today,
        isSelected: selectedDate === date.toISOString().split('T')[0],
      })
    }

    // Días del mes siguiente
    for (let j = 1; j <= nextDays; j++) {
      dates.push({
        day: j,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, j),
      })
    }

    return dates
  }

  /**
   * Navega al mes anterior
   */
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  /**
   * Navega al mes siguiente
   */
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  return {
    // Estado
    currentMonth,
    currentYear,
    monthNames,
    weekDays,

    // Funciones
    generateCalendar,
    goToPreviousMonth,
    goToNextMonth,
    setCurrentMonth,
    setCurrentYear,
  }
}

export default useBookingCalendar
