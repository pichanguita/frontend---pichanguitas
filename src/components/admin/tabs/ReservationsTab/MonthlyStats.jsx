import {
  Clock,
  DollarSign,
  Calendar,
  Activity,
  TrendingUp,
  CheckCircle,
  Filter,
} from 'lucide-react'
import { formatCurrency } from '../../../../utils/stringHelpers'
import { TIME_PERIOD_LABELS } from '../../../../hooks/useMonthlyStats'

/**
 * Componente de estadísticas con filtro de tiempo
 */
export const MonthlyStats = ({ stats, selectedFieldName, timePeriod, onTimePeriodChange }) => {
  const formatDateRange = () => {
    if (!stats.startDate && !stats.endDate) return 'Histórico completo'

    const options = { day: 'numeric', month: 'short', year: 'numeric' }
    const start = stats.startDate?.toLocaleDateString('es-PE', options)
    const end = stats.endDate?.toLocaleDateString('es-PE', options)

    if (start && end) return `${start} - ${end}`
    if (start) return `Desde ${start}`
    return ''
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-6">
      {/* Header con filtro */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-600" />
            Estadísticas
            {selectedFieldName && (
              <span className="text-sm font-normal text-primary-600">({selectedFieldName})</span>
            )}
          </h2>
          <p className="text-sm text-secondary-500 mt-1">{formatDateRange()}</p>
        </div>

        {/* Selector de período */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-secondary-400" />
          <select
            value={timePeriod}
            onChange={(e) => onTimePeriodChange(e.target.value)}
            className="px-3 py-2 border border-secondary-300 rounded-lg text-sm font-medium text-secondary-700 bg-white hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 cursor-pointer"
          >
            {Object.entries(TIME_PERIOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de estadísticas */}
      {stats.totalReservations > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Total Reservas */}
          <StatCard
            title="Total Reservas"
            value={stats.totalReservations}
            icon={Calendar}
            gradient="from-purple-50 to-purple-100"
            borderColor="border-purple-200"
            textColor="text-purple-700"
            valueColor="text-purple-900"
            iconBg="bg-purple-200"
            iconColor="text-purple-700"
          />

          {/* Completadas */}
          <StatCard
            title="Completadas"
            value={stats.completedReservations}
            icon={CheckCircle}
            gradient="from-emerald-50 to-emerald-100"
            borderColor="border-emerald-200"
            textColor="text-emerald-700"
            valueColor="text-emerald-900"
            iconBg="bg-emerald-200"
            iconColor="text-emerald-700"
          />

          {/* Confirmadas/Pendientes */}
          <StatCard
            title="Confirmadas"
            value={stats.confirmedReservations}
            icon={Activity}
            gradient="from-amber-50 to-amber-100"
            borderColor="border-amber-200"
            textColor="text-amber-700"
            valueColor="text-amber-900"
            iconBg="bg-amber-200"
            iconColor="text-amber-700"
          />

          {/* Horas Alquiladas */}
          <StatCard
            title="Horas"
            value={`${stats.hoursRented}h`}
            icon={Clock}
            gradient="from-blue-50 to-blue-100"
            borderColor="border-blue-200"
            textColor="text-blue-700"
            valueColor="text-blue-900"
            iconBg="bg-blue-200"
            iconColor="text-blue-700"
          />

          {/* Ingresos */}
          <StatCard
            title="Ingresos"
            value={`S/ ${formatCurrency(stats.totalIncome, false)}`}
            icon={DollarSign}
            gradient="from-green-50 to-green-100"
            borderColor="border-green-200"
            textColor="text-green-700"
            valueColor="text-green-900"
            iconBg="bg-green-200"
            iconColor="text-green-700"
          />

          {/* Ocupación */}
          {stats.occupancyRate > 0 && (
            <StatCard
              title="Ocupación"
              value={`${stats.occupancyRate}%`}
              icon={TrendingUp}
              gradient="from-orange-50 to-orange-100"
              borderColor="border-orange-200"
              textColor="text-orange-700"
              valueColor="text-orange-900"
              iconBg="bg-orange-200"
              iconColor="text-orange-700"
            />
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-secondary-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No hay reservas en este período</p>
          <p className="text-sm mt-1">Prueba seleccionando otro rango de tiempo</p>
        </div>
      )}
    </div>
  )
}

/**
 * Componente reutilizable para cada tarjeta de estadística
 */
const StatCard = ({
  title,
  value,
  icon: Icon,
  gradient,
  borderColor,
  textColor,
  valueColor,
  iconBg,
  iconColor,
}) => {
  return (
    <div className={`bg-gradient-to-r ${gradient} rounded-lg p-4 border ${borderColor}`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className={`${textColor} text-xs font-medium truncate`}>{title}</p>
          <h3 className={`text-xl font-bold ${valueColor} mt-1 truncate`}>{value}</h3>
        </div>
        <div className={`p-2 ${iconBg} rounded-lg flex-shrink-0 ml-2`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
    </div>
  )
}
