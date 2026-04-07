import React from 'react'
import { motion } from 'framer-motion'
import {
  CalendarIcon,
  Clock,
  DollarSign,
  Activity,
  TrendingUp,
  MapPin,
  BarChart3,
} from 'lucide-react'
import { MONTH_NAMES } from '../../utils/calendar/constants'
import { FIELD_STATUS } from '@/constants'

const MonthStats = ({ monthStats, currentDate, fields }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 shadow-custom"
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-bold text-secondary-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          <span className="hidden sm:inline">
            Resumen del Mes - {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <span className="sm:hidden">Resumen - {MONTH_NAMES[currentDate.getMonth()]}</span>
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total de Reservas */}
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-500" />
            {monthStats.incomeGrowth > 0 && (
              <span className="text-xs text-green-600 font-semibold">
                +{monthStats.incomeGrowth}%
              </span>
            )}
          </div>
          <p className="text-xl sm:text-2xl font-bold text-secondary-900">
            {monthStats.totalReservations}
          </p>
          <p className="text-xs text-secondary-600">Reservas Totales</p>
        </div>

        {/* Horas Alquiladas */}
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-secondary-900">
            {monthStats.totalHours}h
          </p>
          <p className="text-xs text-secondary-600">Horas Alquiladas</p>
        </div>

        {/* Ingresos Generados */}
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-500" />
            {monthStats.incomeGrowth !== 0 && (
              <span
                className={`text-xs font-semibold ${
                  monthStats.incomeGrowth > 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {monthStats.incomeGrowth > 0 ? '+' : ''}
                {monthStats.incomeGrowth}%
              </span>
            )}
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-secondary-900">
            S/ {monthStats.totalIncome.toLocaleString()}
          </p>
          <p className="text-xs text-secondary-600">Ingresos del Mes</p>
        </div>

        {/* Tasa de Ocupación */}
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-secondary-900">
            {monthStats.occupancyRate}%
          </p>
          <p className="text-xs text-secondary-600">Ocupación</p>
        </div>

        {/* Promedio Diario */}
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-indigo-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-secondary-900">
            {monthStats.avgReservationsPerDay}
          </p>
          <p className="text-xs text-secondary-600">Promedio/Día</p>
        </div>

        {/* Canchas Activas */}
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-500" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-secondary-900">
            {fields.filter((f) => f.status === FIELD_STATUS.AVAILABLE).length}
          </p>
          <p className="text-xs text-secondary-600">Canchas Activas</p>
        </div>
      </div>
    </motion.div>
  )
}

export default MonthStats
