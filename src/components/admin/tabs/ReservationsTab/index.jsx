import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import useBookingStore from '../../../../store/bookingStore'
import useFieldStore from '../../../../store/modules/fieldStore'
import useAuthStore from '../../../../store/authStore'
import { useMonthlyStats, TIME_PERIODS } from '../../../../hooks'
import { ReservationFilters } from './ReservationFilters'
import { MonthlyStats } from './MonthlyStats'
import { ReservationsTable } from './ReservationsTable'
import CalendarView from '../../../CalendarView'
import { DEFAULT_VALUES, BUTTON_TEXTS } from '../../../../constants'

/**
 * Tab de Reservas
 *
 * Antes: ~700 líneas dentro de AdminPanel.jsx
 * Ahora: ~150 líneas divididas en componentes reutilizables
 */
export const ReservationsTab = ({ onOpenBookingModal, onDateClick }) => {
  // Estados locales para filtros
  const [selectedFieldFilter, setSelectedFieldFilter] = useState(DEFAULT_VALUES.ALL)
  const [filterDepartment, setFilterDepartment] = useState(DEFAULT_VALUES.ALL)
  const [filterProvince, setFilterProvince] = useState(DEFAULT_VALUES.ALL)
  const [filterDistrict, setFilterDistrict] = useState(DEFAULT_VALUES.ALL)
  const [filterPhone, setFilterPhone] = useState('')
  const [timePeriod, setTimePeriod] = useState(TIME_PERIODS.ALL_TIME)

  // Stores
  const { existingReservations } = useBookingStore()
  const { fields } = useFieldStore() // ✅ USAR fieldStore en vez de bookingStore
  const { user } = useAuthStore()

  // Determinar qué canchas puede ver el usuario según permisos (base)
  const baseFieldIds = useMemo(() => {
    if (user?.role === 'admin' && user?.adminType === 'field') {
      // Admin de cancha ve solo sus canchas
      return user?.managedFields || []
    }
    // Super admin o admin general ven todas
    return fields.map((f) => f.id)
  }, [user?.role, user?.adminType, user?.managedFields, fields])

  // Aplicar TODOS los filtros (cancha específica + geográficos) para obtener los IDs finales
  const userFieldIds = useMemo(() => {
    // Empezar con las canchas base según permisos
    let filteredFields = fields.filter((f) => baseFieldIds.includes(f.id))

    // Aplicar filtro de cancha específica (convertir a número para comparación)
    if (selectedFieldFilter !== DEFAULT_VALUES.ALL) {
      const selectedId = parseInt(selectedFieldFilter, 10)
      filteredFields = filteredFields.filter((f) => f.id === selectedId)
    }

    // Aplicar filtro por departamento
    if (filterDepartment !== DEFAULT_VALUES.ALL) {
      filteredFields = filteredFields.filter((f) => f.departamento === filterDepartment)
    }

    // Aplicar filtro por provincia
    if (filterProvince !== DEFAULT_VALUES.ALL) {
      filteredFields = filteredFields.filter((f) => f.provincia === filterProvince)
    }

    // Aplicar filtro por distrito
    if (filterDistrict !== DEFAULT_VALUES.ALL) {
      filteredFields = filteredFields.filter((f) => f.distrito === filterDistrict)
    }

    return filteredFields.map((f) => f.id)
  }, [fields, baseFieldIds, selectedFieldFilter, filterDepartment, filterProvince, filterDistrict])

  // Filtrar canchas visibles (memoizado para evitar re-renders)
  const visibleFields = useMemo(() => {
    if (user?.role === 'super_admin' || (user?.role === 'admin' && user?.adminType === 'general')) {
      return fields
    }
    if (user?.role === 'admin' && user?.adminType === 'field') {
      const managedFieldIds = user?.managedFields || []
      return fields.filter((field) => managedFieldIds.includes(field.id))
    }
    return []
  }, [user?.role, user?.adminType, user?.managedFields, fields])

  // Hook para calcular estadísticas (reemplaza ~100 líneas de código duplicado)
  const monthlyStats = useMonthlyStats(existingReservations, userFieldIds, fields, timePeriod)

  // Nombre de la cancha seleccionada para mostrar en el título
  // También incluye información de filtros geográficos activos
  const selectedFieldName = useMemo(() => {
    const parts = []

    // Nombre de cancha específica
    if (selectedFieldFilter !== DEFAULT_VALUES.ALL) {
      const selectedId = parseInt(selectedFieldFilter, 10)
      const field = visibleFields.find((f) => f.id === selectedId)
      if (field) parts.push(field.name)
    }

    // Filtros geográficos activos
    if (filterDistrict !== DEFAULT_VALUES.ALL) {
      parts.push(filterDistrict)
    } else if (filterProvince !== DEFAULT_VALUES.ALL) {
      parts.push(filterProvince)
    } else if (filterDepartment !== DEFAULT_VALUES.ALL) {
      parts.push(filterDepartment)
    }

    return parts.length > 0 ? parts.join(' - ') : null
  }, [selectedFieldFilter, filterDepartment, filterProvince, filterDistrict, visibleFields])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Botón Nueva Reserva */}
      <div className="flex justify-end">
        <button
          onClick={onOpenBookingModal}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{BUTTON_TEXTS.NEW_RESERVATION}</span>
        </button>
      </div>

      {/* Filtros */}
      <ReservationFilters
        selectedFieldFilter={selectedFieldFilter}
        filterDepartment={filterDepartment}
        filterProvince={filterProvince}
        filterDistrict={filterDistrict}
        filterPhone={filterPhone}
        visibleFields={visibleFields}
        onFilterChange={{
          setSelectedFieldFilter,
          setFilterDepartment,
          setFilterProvince,
          setFilterDistrict,
          setFilterPhone,
        }}
      />

      {/* Estadísticas con filtro de tiempo */}
      <MonthlyStats
        stats={monthlyStats}
        selectedFieldName={selectedFieldName}
        timePeriod={timePeriod}
        onTimePeriodChange={setTimePeriod}
      />

      {/* Calendario de reservas */}
      <CalendarView
        onDateClick={onDateClick}
        fieldFilter={selectedFieldFilter}
        filteredFieldIds={userFieldIds}
      />

      {/* Tabla de todas las reservas */}
      <ReservationsTable
        reservations={existingReservations}
        fields={fields}
        filters={{
          selectedFieldFilter,
          filterDepartment,
          filterProvince,
          filterDistrict,
          filterPhone,
        }}
        userFieldIds={userFieldIds}
      />
    </motion.div>
  )
}
