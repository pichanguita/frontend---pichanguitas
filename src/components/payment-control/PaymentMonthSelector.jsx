import React from 'react'
import { Calendar, RefreshCw } from 'lucide-react'
import { getMonthName } from '../../utils/payment/paymentUtils'

const PaymentMonthSelector = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onRefresh,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-4">
        <Calendar className="w-5 h-5 text-gray-500" />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Mes:</label>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {getMonthName(month)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Año:</label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onRefresh}
          className="ml-auto px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>
    </div>
  )
}

export default PaymentMonthSelector
