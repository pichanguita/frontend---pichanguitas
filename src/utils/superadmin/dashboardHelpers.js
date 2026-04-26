import L from 'leaflet'
import {
  FIELD_CATEGORY,
  FIELD_CATEGORY_HEX,
  FIELD_CATEGORY_LABELS,
  FIELD_CATEGORY_TAILWIND,
  getFieldCategory,
} from '@/constants'

/**
 * Items de la leyenda del mapa — se deriva dinámicamente de FIELD_CATEGORY
 * para mantener una única fuente de verdad (labels + colores).
 */
export const MAP_LEGEND_ITEMS = [
  FIELD_CATEGORY.ACTIVE,
  FIELD_CATEGORY.MAINTENANCE,
  FIELD_CATEGORY.PENDING,
  FIELD_CATEGORY.REJECTED,
  FIELD_CATEGORY.CLOSED,
].map((category) => ({
  category,
  label: FIELD_CATEGORY_LABELS[category],
  colorClass: FIELD_CATEGORY_TAILWIND[category].dot,
}))

/**
 * Determina el color hex del marcador según la categoría efectiva de la cancha.
 * Usa la prioridad `approvalStatus > status` definida en getFieldCategory.
 * @param {Object} field - Cancha con approvalStatus y status
 * @returns {string} Color hex para el marcador SVG
 */
export const getFieldMarkerColor = (field) => FIELD_CATEGORY_HEX[getFieldCategory(field)]

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
        closedFields: 0,
        pendingFields: 0,
        rejectedFields: 0,
        totalReservations: 0,
        revenue: 0,
        sports: new Set(),
      }
    }

    stats[field.distrito].totalFields++

    // Categoría efectiva con prioridad approvalStatus > status — sin doble conteo
    const category = getFieldCategory(field)
    if (category === FIELD_CATEGORY.ACTIVE) {
      stats[field.distrito].activeFields++
    } else if (category === FIELD_CATEGORY.MAINTENANCE) {
      stats[field.distrito].maintenanceFields++
    } else if (category === FIELD_CATEGORY.CLOSED) {
      stats[field.distrito].closedFields++
    } else if (category === FIELD_CATEGORY.PENDING) {
      stats[field.distrito].pendingFields++
    } else if (category === FIELD_CATEGORY.REJECTED) {
      stats[field.distrito].rejectedFields++
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

/**
 * Agrega canchas por categoría efectiva (prioridad approvalStatus > status).
 * @param {Array} fields
 * @returns {Record<string, number>} contadores por clave de FIELD_CATEGORY
 */
export const countFieldsByCategory = (fields) => {
  const base = Object.values(FIELD_CATEGORY).reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {})
  if (!Array.isArray(fields)) return base
  fields.forEach((field) => {
    const category = getFieldCategory(field)
    base[category] = (base[category] || 0) + 1
  })
  return base
}

export const calculateKPIs = (fields, existingReservations) => {
  const emptyCounts = countFieldsByCategory([])
  if (!Array.isArray(fields)) {
    return {
      totalFields: 0,
      activeFields: 0,
      maintenanceFields: 0,
      closedFields: 0,
      pendingFields: 0,
      rejectedFields: 0,
      categoryCounts: emptyCounts,
      totalReservations: 0,
      todayReservations: 0,
      totalRevenue: 0,
      totalPending: 0,
    }
  }

  const categoryCounts = countFieldsByCategory(fields)

  if (!Array.isArray(existingReservations)) {
    return {
      totalFields: fields.length,
      activeFields: categoryCounts[FIELD_CATEGORY.ACTIVE],
      maintenanceFields: categoryCounts[FIELD_CATEGORY.MAINTENANCE],
      closedFields: categoryCounts[FIELD_CATEGORY.CLOSED],
      pendingFields: categoryCounts[FIELD_CATEGORY.PENDING],
      rejectedFields: categoryCounts[FIELD_CATEGORY.REJECTED],
      categoryCounts,
      totalReservations: 0,
      todayReservations: 0,
      totalRevenue: 0,
      totalPending: 0,
    }
  }

  const totalFields = fields.length
  const activeFields = categoryCounts[FIELD_CATEGORY.ACTIVE]
  const maintenanceFields = categoryCounts[FIELD_CATEGORY.MAINTENANCE]
  const closedFields = categoryCounts[FIELD_CATEGORY.CLOSED]
  const pendingFields = categoryCounts[FIELD_CATEGORY.PENDING]
  const rejectedFields = categoryCounts[FIELD_CATEGORY.REJECTED]
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
    maintenanceFields,
    closedFields,
    pendingFields,
    rejectedFields,
    categoryCounts,
    totalReservations,
    todayReservations,
    totalRevenue,
    totalPending,
  }
}
