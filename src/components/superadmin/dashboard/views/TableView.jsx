import React, { useState, useMemo } from 'react'
import { FIELD_STATUS, FIELD_APPROVAL_STATUS } from '@/constants'
import { formatCurrency } from '@/utils/superadmin/dashboardHelpers'
import { getReservationRevenue } from '@/utils/reports/calculators/revenueCalculator'
import useFieldStore from '@/store/modules/fieldStore'
import {
  MapPin,
  TrendingUp,
  Calendar,
  DollarSign,
  User,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react'

const TableView = ({ filteredFields, selectedDistrict, existingReservations }) => {
  const { getSportTypeById } = useFieldStore()
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [expandedRow, setExpandedRow] = useState(null)

  // Función para ordenar
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Calcular ingresos por cancha usando el calculador centralizado
  const revenueByField = useMemo(() => {
    const revenues = {}
    filteredFields.forEach((field) => {
      const fieldReservations = existingReservations.filter((r) => r.fieldId === field.id)
      revenues[field.id] = fieldReservations.reduce((sum, res) => {
        return sum + getReservationRevenue(res, field)
      }, 0)
    })
    return revenues
  }, [filteredFields, existingReservations])

  // Calcular totales usando el calculador centralizado
  const totals = useMemo(() => {
    return filteredFields.reduce(
      (acc, field) => {
        const fieldReservations = existingReservations.filter((r) => r.fieldId === field.id)
        acc.reservations += fieldReservations.length
        acc.revenue += revenueByField[field.id] || 0
        return acc
      },
      { reservations: 0, revenue: 0 }
    )
  }, [filteredFields, existingReservations, revenueByField])

  // Ordenar campos
  const sortedFields = [...filteredFields].sort((a, b) => {
    if (!sortConfig.key) return 0
    const aReservations = existingReservations.filter((r) => r.fieldId === a.id).length
    const bReservations = existingReservations.filter((r) => r.fieldId === b.id).length

    let aValue, bValue
    switch (sortConfig.key) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'price':
        aValue = a.pricePerHour
        bValue = b.pricePerHour
        break
      case 'reservations':
        aValue = aReservations
        bValue = bReservations
        break
      case 'revenue':
        // Usar el calculador centralizado para ordenar por ingresos reales
        aValue = revenueByField[a.id] || 0
        bValue = revenueByField[b.id] || 0
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const getStatusConfig = (field) => {
    // Priorizar estado de aprobación
    if (field.approvalStatus === FIELD_APPROVAL_STATUS.PENDING)
      return { label: 'Pendiente', bg: 'bg-blue-500', dot: 'bg-blue-400' }
    if (field.approvalStatus === FIELD_APPROVAL_STATUS.REJECTED)
      return { label: 'Rechazada', bg: 'bg-red-500', dot: 'bg-red-400' }
    // Estado operativo
    switch (field.status) {
      case FIELD_STATUS.AVAILABLE:
        return { label: 'Activa', bg: 'bg-green-500', dot: 'bg-green-400' }
      case FIELD_STATUS.MAINTENANCE:
        return { label: 'Manten.', bg: 'bg-amber-500', dot: 'bg-amber-400' }
      default:
        return { label: 'Cerrada', bg: 'bg-red-500', dot: 'bg-red-400' }
    }
  }

  const SortHeader = ({ label, sortKey, icon: Icon, align = 'left' }) => (
    <th
      onClick={() => handleSort(sortKey)}
      className={`px-2 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer
        hover:bg-gray-100 transition-colors select-none group ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
        <span>{label}</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
          {sortConfig.key === sortKey ? (
            sortConfig.direction === 'asc' ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )
          ) : (
            <ChevronDown className="w-3 h-3 text-gray-300" />
          )}
        </span>
      </div>
    </th>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header compacto con resumen */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Detalle de Canchas
                {selectedDistrict !== 'all' && (
                  <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {selectedDistrict}
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500">{filteredFields.length} canchas registradas</p>
            </div>
          </div>

          {/* Mini resumen */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-gray-600">
                <span className="font-semibold text-gray-900">{totals.reservations}</span> reservas
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              <span className="text-gray-600">
                <span className="font-semibold text-green-600">S/{formatCurrency(totals.revenue)}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla optimizada */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              <SortHeader label="Cancha" sortKey="name" icon={MapPin} />
              <th className="px-2 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Estado
              </th>
              <th className="px-2 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Deportes
              </th>
              <SortHeader label="Precio" sortKey="price" icon={DollarSign} align="right" />
              <SortHeader label="Reservas" sortKey="reservations" icon={Calendar} align="right" />
              <SortHeader label="Ingresos" sortKey="revenue" icon={TrendingUp} align="right" />
              <th className="px-2 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  Admin
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedFields.map((field, index) => {
              const fieldReservations = existingReservations.filter((r) => r.fieldId === field.id)
              const fieldRevenue = revenueByField[field.id] || 0
              const statusConfig = getStatusConfig(field)
              const isExpanded = expandedRow === field.id

              return (
                <tr
                  key={field.id}
                  onClick={() => setExpandedRow(isExpanded ? null : field.id)}
                  className={`
                    cursor-pointer transition-all duration-150
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}
                    ${isExpanded ? 'bg-blue-50/50' : 'hover:bg-gray-50'}
                  `}
                >
                  {/* Cancha + Distrito */}
                  <td className="px-2 py-2.5">
                    <div className="flex items-start gap-2 min-w-[180px]">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{field.name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{field.distrito}</span>
                        </div>
                        {isExpanded && field.address && (
                          <p className="text-xs text-gray-400 mt-1 truncate">{field.address}</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Estado */}
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${statusConfig.dot} animate-pulse`} />
                      <span
                        className={`text-xs font-medium text-white px-2 py-0.5 rounded ${statusConfig.bg}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                  </td>

                  {/* Deportes */}
                  <td className="px-2 py-2.5">
                    <div className="flex flex-wrap gap-1 max-w-[140px]">
                      {field.sportTypes?.slice(0, isExpanded ? undefined : 3).map((sportId) => {
                        const sportType = getSportTypeById(sportId)
                        return (
                          <span
                            key={sportId}
                            className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-medium"
                          >
                            {sportType?.name || sportId}
                          </span>
                        )
                      })}
                      {!isExpanded && field.sportTypes?.length > 3 && (
                        <span className="text-xs text-gray-400 font-medium">
                          +{field.sportTypes.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Precio */}
                  <td className="px-2 py-2.5 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      S/{formatCurrency(field.pricePerHour)}
                    </span>
                  </td>

                  {/* Reservas */}
                  <td className="px-2 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        className={`text-sm font-bold ${fieldReservations.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}
                      >
                        {fieldReservations.length}
                      </span>
                      {fieldReservations.length > 5 && (
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  </td>

                  {/* Ingresos */}
                  <td className="px-2 py-2.5 text-right">
                    <span
                      className={`text-sm font-bold ${fieldRevenue > 0 ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      S/{formatCurrency(fieldRevenue)}
                    </span>
                  </td>

                  {/* Admin */}
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-1.5 min-w-[100px]">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                        ${field.adminName ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400'}`}
                      >
                        {field.adminName ? field.adminName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span
                        className={`text-xs truncate max-w-[80px] ${field.adminName ? 'text-gray-700' : 'text-gray-400 italic'}`}
                      >
                        {field.adminName || 'Sin asignar'}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {filteredFields.length === 0 && (
          <div className="py-12 text-center">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No hay canchas para mostrar</p>
          </div>
        )}
      </div>

      {/* Footer con totales */}
      {filteredFields.length > 0 && (
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Mostrando <span className="font-semibold text-gray-700">{filteredFields.length}</span>{' '}
              canchas
            </span>
            <div className="flex items-center gap-4">
              <span className="text-gray-500">
                Total reservas:{' '}
                <span className="font-bold text-blue-600">{totals.reservations}</span>
              </span>
              <span className="text-gray-500">
                Ingresos:{' '}
                <span className="font-bold text-green-600">S/{formatCurrency(totals.revenue)}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TableView
