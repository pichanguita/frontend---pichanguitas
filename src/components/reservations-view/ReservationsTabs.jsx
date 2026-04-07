import React from 'react'
import { Calendar, Clock } from 'lucide-react'

const ReservationsTabs = ({ activeTab, onTabChange, activeCount, historyCount }) => {
  return (
    <div className="border-b border-gray-200 bg-white rounded-t-xl">
      <nav className="flex gap-6 px-6">
        <button
          onClick={() => onTabChange('activas')}
          className={`py-4 px-2 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'activas'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Calendar className="w-5 h-5" />
          Próximas Reservas
          {activeCount > 0 && (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('historial')}
          className={`py-4 px-2 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'historial'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Clock className="w-5 h-5" />
          Historial
          {historyCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {historyCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  )
}

export default ReservationsTabs
