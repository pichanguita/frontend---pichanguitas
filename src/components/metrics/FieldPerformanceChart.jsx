import React from 'react'
import { motion } from 'framer-motion'
import { Target } from 'lucide-react'

/**
 * Gráfico de rendimiento por cancha
 */
const FieldPerformanceChart = ({ fieldPerformance, formatCurrency }) => {
  if (!fieldPerformance || fieldPerformance.length === 0) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5 md:p-6">
        <h3 className="text-base sm:text-lg font-bold text-secondary-900 mb-3 sm:mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          Rendimiento por Cancha
        </h3>
        <p className="text-secondary-500 text-center py-6 sm:py-8 text-sm">
          No hay datos de rendimiento disponibles
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5 md:p-6"
    >
      <h3 className="text-base sm:text-lg font-bold text-secondary-900 mb-3 sm:mb-4 flex items-center gap-2">
        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
        Rendimiento por Cancha
      </h3>

      <div className="space-y-2 sm:space-y-3">
        {fieldPerformance.slice(0, 5).map((field, index) => (
          <div key={index} className="border-b border-secondary-100 pb-2 sm:pb-3 last:border-0">
            <div className="flex items-center justify-between mb-2 gap-2">
              <span className="font-medium text-secondary-900 text-xs sm:text-sm truncate">
                {field.name}
              </span>
              <span className="text-xs sm:text-sm font-bold text-primary-600 flex-shrink-0">
                {formatCurrency(field.income)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs">
              <div>
                <span className="text-secondary-500">Reservas:</span>
                <span className="ml-1 font-medium text-secondary-700">{field.reservations}</span>
              </div>
              <div>
                <span className="text-secondary-500">Ocupación:</span>
                <span className="ml-1 font-medium text-secondary-700">{field.occupancy}%</span>
              </div>
              <div>
                <span className="text-secondary-500">Promedio:</span>
                <span className="ml-1 font-medium text-secondary-700">
                  {field.reservations > 0
                    ? formatCurrency(field.income / field.reservations)
                    : 'S/ 0'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default FieldPerformanceChart
