import React from 'react'

const CalendarLegend = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary-100 border border-primary-200 rounded flex-shrink-0"></div>
          <span className="text-blue-800">Reserva programada</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border border-red-200 rounded flex-shrink-0"></div>
          <span className="text-blue-800">Reserva cancelada</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary-50 border border-primary-200 rounded flex-shrink-0"></div>
          <span className="text-blue-800">Día actual</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-blue-700">
            <span className="hidden sm:inline">
              💡 <strong>Tip:</strong>
            </span>{' '}
            Haz clic en un día para ver sus reservas
          </span>
        </div>
      </div>
    </div>
  )
}

export default CalendarLegend
