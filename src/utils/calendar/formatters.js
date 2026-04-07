/**
 * Utilidades de formateo para el calendario
 */

export const formatDate = (date) => {
  return date.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatTime = (timeSlot) => {
  return timeSlot.replace('-', ' - ')
}

export const isToday = (date) => {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}
