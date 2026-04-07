import React from 'react'
import { MAP_LEGEND_ITEMS } from '@/utils/superadmin/dashboardHelpers'

const MapLegend = () => {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Leyenda</h3>
      <div className="space-y-2">
        {MAP_LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-2 sm:gap-3">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 ${item.colorClass} rounded-full flex-shrink-0`}></div>
            <span className="text-xs sm:text-sm text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MapLegend
