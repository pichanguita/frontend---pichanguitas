/**
 * Generación de horarios — fuente única (sin horas de negocio hardcodeadas).
 *
 * El dominio base es el día completo (24 h). Cada cancha lo acota con su
 * `schedule` (openTime/closeTime por día). Así, las opciones que se muestran al
 * reservar reflexionan SIEMPRE el horario real configurado de cada cancha.
 */

/** Granularidad del selector de horas en la reserva manual (admin). */
export const SLOT_INTERVAL_MINUTES = 30

/**
 * ID canónico de slot por hora. DEBE ser idéntico al backend
 * (utils/pricingCalculator.js → generateSlotIds) para que el cálculo de
 * precios especiales coincida: 0..11 → '{h}am', 12 → '12pm', 13..23 → '{h-12}pm'.
 * @param {number} hour - Hora 0..23
 * @returns {string}
 */
export const slotIdForHour = (hour) => {
  if (hour < 12) return `${hour}am`
  if (hour === 12) return '12pm'
  return `${hour - 12}pm`
}

/** Etiqueta legible en formato 12 h: 0 → '12:00 AM', 13 → '1:00 PM'. */
const hourLabel = (hour) => {
  const period = hour < 12 ? 'AM' : 'PM'
  const h12 = hour % 12 === 0 ? 12 : hour % 12
  return `${h12}:00 ${period}`
}

/** Formatea (hora, minuto) a 'HH:MM'. */
const hhmm = (hour, minute = 0) =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

/** Convierte 'HH:MM' o 'HH:MM:SS' a minutos desde medianoche; null si inválido. */
export const toMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null
  const [h, m] = timeStr.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

/**
 * Rangos horarios de 1 h para el día completo (24 slots).
 * Usado como dominio del filtro público (multi-cancha); cada cancha se acota
 * luego con su schedule mediante isTimeSlotAvailable.
 * @returns {Array<{id:string,label:string,startTime:string,endTime:string}>}
 */
export const generateHourlyTimeRanges = () => {
  const ranges = []
  for (let hour = 0; hour < 24; hour++) {
    ranges.push({
      id: slotIdForHour(hour),
      label: hourLabel(hour),
      startTime: hhmm(hour),
      endTime: hhmm((hour + 1) % 24),
    })
  }
  return ranges
}

/**
 * Opciones 'HH:MM' del día completo al intervalo indicado.
 * Las cotas reales (apertura/cierre) las aplica el consumidor mediante el
 * schedule de la cancha; aquí no se hardcodea ninguna hora de negocio.
 * @param {number} intervalMinutes
 * @returns {string[]}
 */
export const generateDayTimeOptions = (intervalMinutes = SLOT_INTERVAL_MINUTES) => {
  const times = []
  const step = intervalMinutes > 0 ? intervalMinutes : SLOT_INTERVAL_MINUTES
  for (let min = 0; min < 24 * 60; min += step) {
    times.push(hhmm(Math.floor(min / 60), min % 60))
  }
  return times
}

/**
 * Rangos horarios de 1 h que la cancha tiene ABIERTOS en su schedule semanal
 * (unión de horas abiertas en algún día). Usado por la configuración de Precios
 * Especiales para ofrecer solo horas operativas de la cancha.
 * Convención: sin schedule o día abierto sin límites → día completo.
 * @param {Object|null} schedule - { monday:{isOpen,openTime,closeTime}, ... }
 * @returns {Array<{id:string,label:string,startTime:string,endTime:string}>}
 */
export const generateScheduleTimeRanges = (schedule) => {
  const allRanges = generateHourlyTimeRanges()
  if (!schedule || typeof schedule !== 'object') return allRanges

  const openHours = new Set()
  let hasAnyOpenDay = false

  for (const day of Object.values(schedule)) {
    if (!day || day.isOpen === false) continue
    hasAnyOpenDay = true

    const openMin = toMinutes(day.openTime)
    const closeMin = toMinutes(day.closeTime)

    // Día abierto sin límites horarios → todas las horas.
    if (openMin == null || closeMin == null) {
      for (let h = 0; h < 24; h++) openHours.add(h)
      continue
    }

    const startHour = Math.floor(openMin / 60)
    // Hora final exclusiva: la hora que contiene el cierre (23:59 → hasta 24).
    const endHour = Math.ceil(closeMin / 60)
    for (let h = startHour; h < endHour; h++) openHours.add(((h % 24) + 24) % 24)
  }

  if (!hasAnyOpenDay) return allRanges

  return allRanges.filter((range) => openHours.has(toMinutes(range.startTime) / 60))
}
