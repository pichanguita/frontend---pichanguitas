import React from 'react'

const DistrictStatsPanel = ({ districtStats, selectedDistrict, onDistrictClick }) => {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Estadísticas por Distrito
      </h3>
      <div className="space-y-2 sm:space-y-3">
        {districtStats.map((stat) => (
          <div
            key={stat.name}
            onClick={() => onDistrictClick(stat.name)}
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
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Activas:</span>
                <span className="text-green-600 font-medium">{stat.activeFields}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reservas:</span>
                <span className="text-blue-600 font-medium">{stat.totalReservations}</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${(stat.activeFields / stat.totalFields) * 100}%` }}
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
