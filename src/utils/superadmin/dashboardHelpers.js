import L from 'leaflet'
import { FIELD_STATUS, FIELD_APPROVAL_STATUS } from '@/constants'

export const COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
]

// Colores hex para marcadores del mapa (necesarios para SVG de Leaflet)
export const MAP_MARKER_HEX = {
  [FIELD_STATUS.AVAILABLE]: '#22c55e',
  [FIELD_STATUS.MAINTENANCE]: '#f59e0b',
  [FIELD_STATUS.CLOSED]: '#ef4444',
  approvalPending: '#3b82f6',
  approvalRejected: '#ef4444',
  default: '#ef4444',
}

// Items de la leyenda del mapa (label + color Tailwind)
export const MAP_LEGEND_ITEMS = [
  { label: 'Disponible (Aprobada)', colorClass: 'bg-green-500' },
  { label: 'En Mantenimiento', colorClass: 'bg-amber-500' },
  { label: 'Pendiente de Aprobación', colorClass: 'bg-blue-500' },
  { label: 'Rechazada / Cerrada', colorClass: 'bg-red-500' },
]

/**
 * Determina el color hex del marcador según el estado de aprobación y operativo.
 * Prioridad: approvalStatus > status operativo.
 * @param {Object} field - Cancha con approvalStatus y status
 * @returns {string} Color hex para el marcador SVG
 */
export const getFieldMarkerColor = (field) => {
  if (field.approvalStatus === FIELD_APPROVAL_STATUS.PENDING) return MAP_MARKER_HEX.approvalPending
  if (field.approvalStatus === FIELD_APPROVAL_STATUS.REJECTED) return MAP_MARKER_HEX.approvalRejected
  if (field.status === FIELD_STATUS.AVAILABLE) return MAP_MARKER_HEX[FIELD_STATUS.AVAILABLE]
  if (field.status === FIELD_STATUS.MAINTENANCE) return MAP_MARKER_HEX[FIELD_STATUS.MAINTENANCE]
  return MAP_MARKER_HEX.default
}

// Formatear moneda con comas y decimales: 2936 -> "2,936.00"
export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export const districtCenters = {
  // Apurímac
  ABANCAY: [-13.6339, -72.8814],
  ANDAHUAYLAS: [-13.6555, -73.3871],
  AYMARAES: [-14.2833, -73.2167],
  CHINCHEROS: [-13.5092, -73.7233],
  GRAU: [-14.0264, -72.6639],
  CHACOCHE: [-13.62, -72.895],
  TAMBURCO: [-13.628, -72.873],
  // Lima
  ATE: [-12.0553, -76.9347],
  'LA MOLINA': [-12.0868, -76.935],
}

export const createCustomIcon = (color, _status) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <svg width="32" height="42" viewBox="0 0 32 42" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <!-- Pin shape -->
        <path d="M16 0 C7.163 0 0 7.163 0 16 C0 24 16 42 16 42 C16 42 32 24 32 16 C32 7.163 24.837 0 16 0 Z"
              fill="${color}"
              stroke="white"
              stroke-width="2"/>
        <!-- Inner circle with icon -->
        <circle cx="16" cy="14" r="8" fill="white" fill-opacity="0.3"/>
        <text x="16" y="18" text-anchor="middle" font-size="12" fill="white">⚽</text>
      </svg>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  })
}

// Pin para marcadores de distrito (con etiqueta)
export const createDistrictIcon = (districtName, totalFields) => {
  return L.divIcon({
    className: 'custom-div-icon district-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          font-size: 11px;
          font-weight: 600;
          color: #dc2626;
          white-space: nowrap;
          margin-bottom: -5px;
          border: 2px solid #ef4444;
        ">
          ${districtName}: ${totalFields} canchas
        </div>
        <svg width="24" height="32" viewBox="0 0 32 42" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <path d="M16 0 C7.163 0 0 7.163 0 16 C0 24 16 42 16 42 C16 42 32 24 32 16 C32 7.163 24.837 0 16 0 Z"
                fill="#ef4444"
                stroke="white"
                stroke-width="2"/>
        </svg>
      </div>
    `,
    iconSize: [120, 60],
    iconAnchor: [60, 60],
    popupAnchor: [0, -60],
  })
}

export const getDistrictStats = (
  fields,
  existingReservations,
  selectedDepartment,
  filteredFields
) => {
  if (!Array.isArray(fields) || !Array.isArray(existingReservations)) {
    return []
  }

  const stats = {}
  const fieldsToAnalyze = selectedDepartment === 'all' ? fields : filteredFields

  fieldsToAnalyze.forEach((field) => {
    if (!stats[field.distrito]) {
      stats[field.distrito] = {
        name: field.distrito,
        totalFields: 0,
        activeFields: 0,
        maintenanceFields: 0,
        totalReservations: 0,
        revenue: 0,
        sports: new Set(),
      }
    }

    stats[field.distrito].totalFields++

    if (field.status === FIELD_STATUS.AVAILABLE) {
      stats[field.distrito].activeFields++
    } else if (field.status === FIELD_STATUS.MAINTENANCE) {
      stats[field.distrito].maintenanceFields++
    }

    const fieldReservations = existingReservations.filter((r) => r.fieldId === field.id)
    stats[field.distrito].totalReservations += fieldReservations.length

    // Calcular revenue basado en el precio real de cada reserva
    fieldReservations.forEach((reservation) => {
      // Convertir valores de string (DECIMAL) a número
      const revenue = reservation.totalPrice
        ? parseFloat(reservation.totalPrice)
        : parseFloat(field.pricePerHour) * (parseFloat(reservation.hours) || 1)

      // Solo contar revenue de reservas pagadas
      if (reservation.paymentStatus === 'paid' || reservation.paymentStatus === 'fully_paid') {
        stats[field.distrito].revenue += revenue
      } else if (
        reservation.paymentStatus === 'partial' ||
        reservation.paymentStatus === 'partially_paid'
      ) {
        // Usar advancePayment (lo que ya pagó)
        const advancePaid = reservation.advancePayment ? parseFloat(reservation.advancePayment) : 0
        stats[field.distrito].revenue += advancePaid
      }
    })

    if (field.sportTypes && Array.isArray(field.sportTypes)) {
      field.sportTypes.forEach((sport) => stats[field.distrito].sports.add(sport))
    }
  })

  const result = Object.values(stats).map((stat) => ({
    ...stat,
    sports: stat.sports.size,
  }))

  return result
}

export const getTrendData = (existingReservations, fields) => {
  const last7Days = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const dayReservations = existingReservations.filter((r) => {
      const resDate = new Date(r.date).toISOString().split('T')[0]
      return resDate === dateStr
    })

    last7Days.push({
      día: date.toLocaleDateString('es-PE', { weekday: 'short' }),
      reservas: dayReservations.length,
      ingresos: dayReservations.reduce((sum, r) => {
        // Usar totalPrice si existe, sino calcular con pricePerHour * hours
        const revenue = r.totalPrice
          ? parseFloat(r.totalPrice)
          : (() => {
              const field = fields.find((f) => f.id === r.fieldId)
              const pricePerHour = parseFloat(field?.pricePerHour) || 0
              const hours = parseFloat(r.hours) || 1
              return pricePerHour * hours
            })()

        // Solo contar ingresos de reservas pagadas
        if (r.paymentStatus === 'paid' || r.paymentStatus === 'fully_paid') {
          return sum + revenue
        } else if (r.paymentStatus === 'partial' || r.paymentStatus === 'partially_paid') {
          const advancePaid = r.advancePayment ? parseFloat(r.advancePayment) : 0
          return sum + advancePaid
        }
        return sum
      }, 0),
    })
  }

  return last7Days
}

export const calculateKPIs = (fields, existingReservations) => {
  if (!Array.isArray(fields)) {
    return {
      totalFields: 0,
      activeFields: 0,
      totalReservations: 0,
      todayReservations: 0,
      totalRevenue: 0,
      totalPending: 0,
    }
  }
  if (!Array.isArray(existingReservations)) {
    return {
      totalFields: fields.length,
      activeFields: 0,
      totalReservations: 0,
      todayReservations: 0,
      totalRevenue: 0,
      totalPending: 0,
    }
  }

  const totalFields = fields.length
  const activeFields = fields.filter((f) => f.status === FIELD_STATUS.AVAILABLE).length
  const totalReservations = existingReservations.length

  const todayReservations = existingReservations.filter((r) => {
    const today = new Date().toISOString().split('T')[0]
    const resDate = new Date(r.date).toISOString().split('T')[0]
    return resDate === today
  }).length

  const totalRevenue = existingReservations.reduce((sum, r) => {
    // Convertir totalPrice de string a número (viene como DECIMAL de PostgreSQL)
    const revenue = r.totalPrice
      ? parseFloat(r.totalPrice)
      : (() => {
          const field = fields.find((f) => f.id === r.fieldId)
          const pricePerHour = parseFloat(field?.pricePerHour) || 0
          const hours = parseFloat(r.hours) || 1
          return pricePerHour * hours
        })()

    // 'fully_paid' o 'paid' = pagado completo
    if (r.paymentStatus === 'paid' || r.paymentStatus === 'fully_paid') {
      return sum + revenue
    } else if (r.paymentStatus === 'partial' || r.paymentStatus === 'partially_paid') {
      // Si está parcialmente pagado, usar advancePayment (lo que ya pagó)
      const advancePaid = r.advancePayment ? parseFloat(r.advancePayment) : 0
      return sum + advancePaid
    }
    return sum
  }, 0)

  const totalPending = existingReservations.reduce((sum, r) => {
    // 'fully_paid' o 'paid' no tiene monto pendiente
    if (r.paymentStatus === 'paid' || r.paymentStatus === 'fully_paid') {
      return sum
    }

    // Convertir totalPrice y remainingPayment de string a número
    const totalPrice = r.totalPrice
      ? parseFloat(r.totalPrice)
      : (() => {
          const field = fields.find((f) => f.id === r.fieldId)
          const pricePerHour = parseFloat(field?.pricePerHour) || 0
          const hours = parseFloat(r.hours) || 1
          return pricePerHour * hours
        })()

    if (r.paymentStatus === 'partial' || r.paymentStatus === 'partially_paid') {
      // Usar remainingPayment (el backend ya lo calcula)
      return sum + (r.remainingPayment ? parseFloat(r.remainingPayment) : 0)
    } else {
      // 100% pendiente si no ha pagado nada (paymentStatus null, 'pending', etc.)
      return sum + totalPrice
    }
  }, 0)

  return {
    totalFields,
    activeFields,
    totalReservations,
    todayReservations,
    totalRevenue,
    totalPending,
  }
}
