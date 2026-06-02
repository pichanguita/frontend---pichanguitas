import React from 'react'
import { FIELD_CATEGORY, FIELD_CATEGORY_LABELS, FIELD_CATEGORY_TAILWIND } from '@/constants'

const DISTRICT_STAT_ROWS = [
  { key: 'activeFields', category: FIELD_CATEGORY.ACTIVE },
  { key: 'pendingFields', category: FIELD_CATEGORY.PENDING },
  { key: 'rejectedFields', category: FIELD_CATEGORY.REJECTED },
  { key: 'maintenanceFields', category: FIELD_CATEGORY.MAINTENANCE },
]

const DistrictStatsPanel = ({ districtStats, selectedDistrict, onDistrictClick }) => {
  // Click sobre el distrito ya seleccionado → deseleccionar (volver a "all")
  const handleCardClick = (districtName) => {
    const nextDistrict = selectedDistrict === districtName ? 'all' : districtName
    onDistrictClick(nextDistrict)
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Estadísticas por Distrito
      </h3>
      <div className="space-y-2 sm:space-y-3 max-h-[400px] md:max-h-[500px] overflow-y-auto pr-1 -mr-1">
        {districtStats.map((stat) => (
          <div
            key={stat.name}
            onClick={() => handleCardClick(stat.name)}
            className={`p-3 rounded-lg cursor-pointer transition ${
              selectedDistrict === stat.name
                ? 'bg-primary-50 border-2 border-primary-500'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-900">{stat.name}</span>
              <span className="text-primary-600 font-bold">{stat.totalFields}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
              {DISTRICT_STAT_ROWS.map((row) => (
                <div key={row.key} className="flex justify-between">
                  <span className="text-gray-600">{FIELD_CATEGORY_LABELS[row.category]}:</span>
                  <span className={`font-medium ${FIELD_CATEGORY_TAILWIND[row.category].text}`}>
                    {stat[row.key] || 0}
                  </span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-gray-600">Reservas:</span>
                <span className="text-blue-600 font-medium">{stat.totalReservations}</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      stat.totalFields > 0 ? (stat.activeFields / stat.totalFields) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DistrictStatsPanel
