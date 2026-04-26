import { parseLocalDate, getToday } from '../dateFormatters'

/**
 * Genera array de IDs de slots basado en hora de inicio y cantidad de horas
 * Los IDs son strings como '6am', '7am', '12pm', '1pm', etc.
 * DEBE ser idéntico al backend (pricingCalculator.js)
 * @param {string} startTime - Hora de inicio (HH:MM)
 * @param {number} hours - Cantidad de horas
 * @returns {Array<string>} Array de IDs de slots (ej: ['1pm', '2pm'])
 */
export const generateSlotIds = (startTime, hours) => {
  if (!startTime || !hours || hours <= 0) return []

  const [startHour] = startTime.split(':').map(Number)

  const slotIds = []
  for (let i = 0; i < hours; i++) {
    const hour = startHour + i
    // Convertir hora numérica a formato de ID (6am, 7am, 12pm, 1pm, etc.)
    let slotId
    if (hour < 12) {
      slotId = `${hour}am`
    } else if (hour === 12) {
      slotId = '12pm'
    } else {
      slotId = `${hour - 12}pm`
    }
    slotIds.push(slotId)
  }

  return slotIds
}

export const generateTimeOptions = () => {
  const times = []
  for (let hour = 8; hour <= 22; hour++) {
    times.push(`${hour.toString().padStart(2, '0')}:00`)
    if (hour < 22) {
      times.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  return times
}

/**
 * Filtra las opciones de tiempo según:
 * 1. Si es HOY: no mostrar horas pasadas (hora actual + 30 min de margen)
 * 2. No mostrar horas ocupadas por otras reservas
 *
 * @param {string} selectedDate - Fecha seleccionada (YYYY-MM-DD)
 * @param {Array} occupiedSlots - Array de slots ocupados [{time: "14:00-16:00", ...}]
 * @param {string} mode - 'start' para hora inicio, 'end' para hora fin
 * @param {string} startTime - Hora de inicio seleccionada (solo para mode='end')
 * @returns {Array} Array de objetos {time, disabled, reason}
 */
export const getFilteredTimeOptions = (
  selectedDate,
  occupiedSlots = [],
  mode = 'start',
  startTime = null
) => {
  const allTimes = generateTimeOptions()
  const today = getToday()
  const isToday = selectedDate === today

  // Obtener hora actual en formato local
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinutes = now.getMinutes()

  // Convertir hora actual a minutos desde medianoche (con margen de 30 min)
  const currentTimeInMinutes = currentHour * 60 + currentMinutes + 30 // 30 min de margen

  // Parsear slots ocupados para obtener rangos
  const occupiedRanges = occupiedSlots
    .map((slot) => {
      if (slot.time) {
        const [start, end] = slot.time.split('-')
        return { start, end }
      }
      if (slot.startTime && slot.endTime) {
        return { start: slot.startTime, end: slot.endTime }
      }
      return null
    })
    .filter(Boolean)

  return allTimes.map((time) => {
    const [hour, min] = time.split(':').map(Number)
    const timeInMinutes = hour * 60 + min

    let disabled = false
    let reason = ''

    // 1. Filtrar horas pasadas si es HOY
    if (isToday && timeInMinutes < currentTimeInMinutes) {
      disabled = true
      reason = 'Hora pasada'
    }

    // 2. Para hora de fin: debe ser mayor que hora de inicio
    if (mode === 'end' && startTime) {
      const [startHour, startMin] = startTime.split(':').map(Number)
      const startTimeInMinutes = startHour * 60 + startMin
      if (timeInMinutes <= startTimeInMinutes) {
        disabled = true
        reason = 'Debe ser después de la hora de inicio'
      }
    }

    // 3. Filtrar horas ocupadas
    if (!disabled) {
      for (const range of occupiedRanges) {
        const [rangeStartHour, rangeStartMin] = range.start.split(':').map(Number)
        const [rangeEndHour, rangeEndMin] = range.end.split(':').map(Number)
        const rangeStartMinutes = rangeStartHour * 60 + rangeStartMin
        const rangeEndMinutes = rangeEndHour * 60 + rangeEndMin

        if (mode === 'start') {
          // Para hora de inicio: no puede estar dentro de un rango ocupado
          if (timeInMinutes >= rangeStartMinutes && timeInMinutes < rangeEndMinutes) {
            disabled = true
            reason = 'Horario ocupado'
            break
          }
        } else if (mode === 'end' && startTime) {
          // Para hora de fin: verificar que el rango startTime-time no se solape con ocupados
          const [selStartHour, selStartMin] = startTime.split(':').map(Number)
          const selStartMinutes = selStartHour * 60 + selStartMin

          // Hay solapamiento si: selStart < rangeEnd AND selEnd > rangeStart
          if (selStartMinutes < rangeEndMinutes && timeInMinutes > rangeStartMinutes) {
            disabled = true
            reason = 'Horario ocupado'
            break
          }
        }
      }
    }

    return { time, disabled, reason }
  })
}

export const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime || startTime >= endTime) {
    return 0
  }

  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin

  const durationMinutes = endMinutes - startMinutes
  return durationMinutes / 60
}

export const calculateAmounts = (pricePerHour, duration, paymentStatus, advanceAmount = 0) => {
  const totalAmount = pricePerHour * duration

  if (paymentStatus === 'advance') {
    const advance = parseFloat(advanceAmount) || 0
    return {
      totalAmount,
      advanceAmount: advance,
      remainingAmount: totalAmount - advance,
    }
  }

  return {
    totalAmount,
    advanceAmount: 0,
    remainingAmount: totalAmount,
  }
}

export const validateClientData = (formData, _mode) => {
  const errors = {}

  // ✅ Nombre y teléfono son siempre obligatorios
  if (!formData.clientName.trim()) {
    errors.clientName = 'El nombre del cliente es obligatorio'
  }

  if (!formData.clientPhone.trim()) {
    errors.clientPhone = 'El teléfono del cliente es obligatorio'
  } else if (!/^\d{9}$/.test(formData.clientPhone.replace(/\s/g, ''))) {
    errors.clientPhone = 'El teléfono debe tener 9 dígitos'
  }

  // ✅ Email es OPCIONAL - solo validar formato si se ingresó
  if (
    formData.clientEmail.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail.trim())
  ) {
    errors.clientEmail = 'Ingrese un correo electrónico válido'
  }

  // ✅ DNI no existe en la base de datos, no validar

  return errors
}

export const validateReservationData = (formData) => {
  const errors = {}

  if (!formData.fieldId) {
    errors.fieldId = 'Debe seleccionar una cancha'
  }

  if (!formData.date) {
    errors.date = 'Debe seleccionar una fecha'
  } else {
    // ✅ FIX: Usar parseLocalDate para evitar bugs de timezone
    // Funciona igual en desarrollo local y Railway (producción)
    const selectedDate = parseLocalDate(formData.date)
    selectedDate.setHours(0, 0, 0, 0)

    const todayStr = getToday() // YYYY-MM-DD en hora local
    const today = parseLocalDate(todayStr)
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      errors.date = 'La fecha no puede ser anterior a hoy'
    }
  }

  if (!formData.startTime) {
    errors.startTime = 'Debe seleccionar hora de inicio'
  }

  if (!formData.endTime) {
    errors.endTime = 'Debe seleccionar hora de fin'
  }

  if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
    errors.endTime = 'La hora de fin debe ser posterior a la de inicio'
  }

  if (!formData.duration || formData.duration < 1) {
    errors.duration = 'La duración debe ser al menos 1 hora'
  }

  if (formData.paymentStatus === 'advance') {
    if (!formData.advanceAmount || formData.advanceAmount <= 0) {
      errors.advanceAmount = 'Debe ingresar un monto de adelanto válido'
    } else if (parseFloat(formData.advanceAmount) >= formData.totalAmount) {
      errors.advanceAmount = 'El adelanto debe ser menor al monto total'
    }
  }

  if (
    (formData.paymentStatus === 'paid' || formData.paymentStatus === 'advance') &&
    !formData.paymentMethod
  ) {
    errors.paymentMethod = 'Debe seleccionar un método de pago'
  }

  return errors
}

export const checkTimeSlotAvailability = (startTime, endTime, occupiedSlots) => {
  for (const slot of occupiedSlots) {
    const [slotStart, slotEnd] = slot.time.split('-')

    const isOverlapping =
      (startTime >= slotStart && startTime < slotEnd) ||
      (endTime > slotStart && endTime <= slotEnd) ||
      (startTime <= slotStart && endTime >= slotEnd)

    if (isOverlapping) {
      return false
    }
  }
  return true
}

export const formatOccupiedSlots = (reservations, date, fieldId) => {
  // ✅ Convertir fieldId a número para comparación consistente
  const fieldIdNum = parseInt(fieldId)

  const occupied = reservations.filter((res) => {
    // Manejar ambos formatos: camelCase y snake_case
    const resFieldId = res.fieldId || res.field_id
    const resDate = res.date
    const resStatus = res.paymentStatus || res.payment_status || res.status

    return (
      resDate === date &&
      parseInt(resFieldId) === fieldIdNum &&
      resStatus !== 'cancelled' &&
      resStatus !== 'no_show'
    )
  })

  return occupied.map((res) => ({
    time: res.time || `${res.startTime || res.start_time}-${res.endTime || res.end_time}`,
    startTime: res.startTime || res.start_time,
    endTime: res.endTime || res.end_time,
    customerName: res.customerName || res.customer_name || 'Cliente',
    status: res.paymentStatus || res.payment_status || res.status,
  }))
}

export const INITIAL_FORM_DATA = {
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  clientNotes: '',
  fieldId: '',
  date: '',
  startTime: '',
  endTime: '',
  duration: 1,
  paymentStatus: 'pending',
  paymentMethod: '',
  totalAmount: 0,
  advanceAmount: 0,
  remainingAmount: 0,
  adminNotes: '',
  // ✅ Campos para precios especiales (specialPricing)
  originalAmount: 0,
  discountAmount: 0,
  appliedDiscounts: [],
}
