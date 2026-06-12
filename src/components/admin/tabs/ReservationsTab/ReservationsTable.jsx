import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { formatDate, formatWeekday } from '../../../../utils/dateFormatters'
import { formatTimeRange, formatCurrency } from '../../../../utils/stringHelpers'
import {
  RESERVATION_STATUS,
  RESERVATION_STATUS_LABELS,
  PAYMENT_STATUS,
  DEFAULT_VALUES,
  EMPTY_STATES,
} from '../../../../constants'

/**
 * Componente de tabla de reservas con filtros aplicados
 *
 * Optimizado con useMemo y Map para lookups O(1)
 */
export const ReservationsTable = ({ reservations, fields, filters, userFieldIds }) => {
  // Crear Map para lookups O(1) en vez de O(n) con find()
  const fieldsMap = useMemo(() => new Map(fields.map((f) => [f.id, f])), [fields])

  // Convertir userFieldIds a números para comparación segura
  const userFieldIdsAsNumbers = useMemo(
    () => userFieldIds.map((id) => parseInt(id, 10)),
    [userFieldIds]
  )

  // Filtrar y ordenar reservas
  const sortedReservations = useMemo(() => {
    // Filtrar reservas según permisos del usuario (comparación de números)
    let filtered = reservations.filter((reservation) => {
      const resFieldId = parseInt(reservation.fieldId, 10)
      return userFieldIdsAsNumbers.includes(resFieldId)
    })

    // Aplicar filtro por cancha específica
    // Nota: selectedFieldFilter es string (del select HTML), fieldId es número
    if (filters.selectedFieldFilter !== DEFAULT_VALUES.ALL) {
      const selectedId = parseInt(filters.selectedFieldFilter, 10)
      filtered = filtered.filter((r) => parseInt(r.fieldId, 10) === selectedId)
    }

    // Aplicar filtros geográficos
    filtered = filtered.filter((reservation) => {
      const resFieldId = parseInt(reservation.fieldId, 10)
      const field = fieldsMap.get(resFieldId)
      if (!field) return false

      // Filtro por departamento
      if (
        filters.filterDepartment !== DEFAULT_VALUES.ALL &&
        field.departamento !== filters.filterDepartment
      ) {
        return false
      }

      // Filtro por provincia
      if (
        filters.filterProvince !== DEFAULT_VALUES.ALL &&
        field.provincia !== filters.filterProvince
      ) {
        return false
      }

      // Filtro por distrito
      if (
        filters.filterDistrict !== DEFAULT_VALUES.ALL &&
        field.distrito !== filters.filterDistrict
      ) {
        return false
      }

      // Filtro por teléfono
      if (filters.filterPhone !== '') {
        const searchTerm = filters.filterPhone.toLowerCase()
        const matchesPhone = reservation.phoneNumber?.toLowerCase().includes(searchTerm)
        if (!matchesPhone) return false
      }

      return true
    })

    // Ordenar por fecha (más recientes primero)
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [reservations, filters, userFieldIdsAsNumbers, fieldsMap])

  // Estado vacío
  if (sortedReservations.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
      <div className="p-6 border-b border-secondary-200">
        <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary-600" />
          Todas las Reservas
        </h2>
        <p className="text-sm text-secondary-600 mt-1">
          Lista completa de reservas
          {(filters.filterDepartment !== DEFAULT_VALUES.ALL ||
            filters.filterProvince !== DEFAULT_VALUES.ALL ||
            filters.filterDistrict !== DEFAULT_VALUES.ALL ||
            filters.filterPhone !== '') &&
            ' filtradas'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Cancha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Horario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-100">
            {sortedReservations.map((reservation) => (
              <ReservationRow
                key={reservation.id}
                reservation={reservation}
                field={fieldsMap.get(reservation.fieldId)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Componente para cada fila de la tabla
 */
const ReservationRow = ({ reservation, field }) => {
  const timeSlots = reservation.timeSlots || []
  const hours = parseFloat(reservation.hours) || timeSlots.length || 1
  const total = parseFloat(reservation.totalPrice) || (field?.pricePerHour || 0) * hours

  // Construir horario desde startTime y endTime si timeSlots está vacío
  const timeDisplay =
    reservation.time ||
    (reservation.startTime && reservation.endTime
      ? `${reservation.startTime} - ${reservation.endTime}`
      : null)

  // Clase CSS para el badge de estado
  const statusBadgeClass =
    {
      [RESERVATION_STATUS.CONFIRMED]: 'bg-green-100 text-green-800',
      [RESERVATION_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
      [RESERVATION_STATUS.CANCELLED]: 'bg-red-100 text-red-800',
      [RESERVATION_STATUS.COMPLETED]: 'bg-blue-100 text-blue-800',
      [RESERVATION_STATUS.NO_SHOW]: 'bg-orange-100 text-orange-800',
      [RESERVATION_STATUS.REJECTED]: 'bg-red-100 text-red-800',
    }[reservation.status] || 'bg-gray-100 text-gray-800'

  return (
    <tr className="hover:bg-secondary-50 transition-colors">
      {/* Fecha */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-secondary-900">{formatDate(reservation.date)}</div>
        <div className="text-xs text-secondary-500">{formatWeekday(reservation.date)}</div>
      </td>

      {/* Cliente */}
      <td className="px-6 py-4">
        <div>
          <div className="text-sm font-medium text-secondary-900">
            {reservation.customerName || DEFAULT_VALUES.CUSTOMER_NAME}
          </div>
          <div className="text-xs text-secondary-500">{reservation.phoneNumber}</div>
        </div>
      </td>

      {/* Cancha */}
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-secondary-900">
          {field?.name || DEFAULT_VALUES.NOT_AVAILABLE}
        </div>
        <div className="text-xs text-secondary-500">{field?.location || ''}</div>
      </td>

      {/* Ubicación */}
      <td className="px-6 py-4">
        <div className="text-xs text-secondary-600">
          {field?.departamento && <div>{field.departamento}</div>}
          {field?.provincia && <div>{field.provincia}</div>}
          {field?.distrito && <div className="font-medium">{field.distrito}</div>}
        </div>
      </td>

      {/* Horario */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-secondary-900">
          {timeDisplay ? (
            <>
              <div>{timeDisplay}</div>
              <div className="text-xs text-secondary-500">{hours} hora(s)</div>
            </>
          ) : timeSlots.length > 0 ? (
            <>
              <div>{formatTimeRange(timeSlots)}</div>
              <div className="text-xs text-secondary-500">{hours} hora(s)</div>
            </>
          ) : (
            <span className="text-secondary-400">{DEFAULT_VALUES.NOT_SPECIFIED}</span>
          )}
        </div>
      </td>

      {/* Estado */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeClass}`}
        >
          {RESERVATION_STATUS_LABELS[reservation.status] || reservation.status}
        </span>
      </td>

      {/* Total */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-secondary-900">S/ {formatCurrency(total)}</div>
        <div className="text-xs text-secondary-500">
          {reservation.paymentStatus === PAYMENT_STATUS.FULLY_PAID ||
          reservation.paymentStatus === 'paid'
            ? 'Pagado'
            : 'Pendiente'}
        </div>
      </td>
    </tr>
  )
}

/**
 * Estado vacío cuando no hay reservas
 */
const EmptyState = () => (
  <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
    <div className="p-6 border-b border-secondary-200">
      <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-primary-600" />
        Todas las Reservas
      </h2>
    </div>
    <div className="px-6 py-12 text-center text-secondary-500">
      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p>{EMPTY_STATES.NO_RESERVATIONS}</p>
    </div>
  </div>
)
