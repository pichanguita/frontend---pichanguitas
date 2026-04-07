import React from 'react'
import { Award } from 'lucide-react'

/**
 * Panel de resumen del período
 */
const SummaryPanel = ({ selectedPeriod, occupancyRate, incomeGrowth }) => {
  const getPeriodLabel = (period) => {
    switch (period) {
      case 'day':
        return 'Hoy'
      case 'week':
        return 'Últimos 7 días'
      case 'month':
        return 'Último mes'
      case 'year':
        return 'Último año'
      default:
        return 'Período'
    }
  }

  const calculateEfficiency = () => {
    return Math.round((occupancyRate + (incomeGrowth > 0 ? 20 : 0)) / 1.2)
  }

  return (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-primary-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-primary-900 flex items-center gap-2">
            <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            Resumen del Período
          </h3>
          <p className="text-sm sm:text-base text-primary-700 mt-1">
            {getPeriodLabel(selectedPeriod)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs sm:text-sm text-primary-700">Eficiencia operativa</p>
          <p className="text-xl sm:text-2xl font-bold text-primary-900">{calculateEfficiency()}%</p>
        </div>
      </div>
    </div>
  )
}

export default SummaryPanel
