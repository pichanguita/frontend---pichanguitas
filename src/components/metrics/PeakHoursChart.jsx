import React from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

/**
 * Gráfico de horarios más demandados
 */
const PeakHoursChart = ({ peakHours }) => {
  if (!peakHours || peakHours.length === 0) {
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5 md:p-6">
        <h3 className="text-base sm:text-lg font-bold text-secondary-900 mb-3 sm:mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          Horarios más Demandados
        </h3>
        <p className="text-secondary-500 text-center py-6 sm:py-8 text-sm">
          No hay datos de horarios disponibles
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5 md:p-6"
    >
      <h3 className="text-base sm:text-lg font-bold text-secondary-900 mb-3 sm:mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
        Horarios más Demandados
      </h3>

      <div className="space-y-2 sm:space-y-3">
        {peakHours.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <span
                className={`
                w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0
                ${
                  index === 0
                    ? 'bg-gold-100 text-gold-600'
                    : index === 1
                      ? 'bg-silver-100 text-silver-600'
                      : index === 2
                        ? 'bg-bronze-100 text-bronze-600'
                        : 'bg-secondary-100 text-secondary-600'
                }
              `}
              >
                {index + 1}
              </span>
              <span className="font-medium text-secondary-900 text-xs sm:text-sm truncate">
                {item.hour}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-16 sm:w-32 bg-secondary-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / peakHours[0].count) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  className="h-2 rounded-full bg-primary-600"
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-secondary-700 w-8 sm:w-12 text-right">
                {item.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default PeakHoursChart
