import React from 'react'
import { Clock } from 'lucide-react'

const ScheduleTab = ({ schedule, onScheduleChange, daysOfWeek }) => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">Configurar Horarios por Día</h3>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          Define los horarios de apertura y cierre para cada día de la semana
        </p>
      </div>

      <div className="grid gap-4">
        {daysOfWeek.map((day) => (
          <div key={day.key} className="flex items-center space-x-4 p-4 bg-secondary-50 rounded-lg">
            <div className="w-20 text-sm font-medium text-secondary-700">{day.label}</div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={schedule[day.key]?.isOpen || false}
                onChange={(e) => onScheduleChange(day.key, 'isOpen', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-secondary-600">Abierto</span>
            </div>

            {schedule[day.key]?.isOpen && (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary-600">De:</span>
                  <input
                    type="time"
                    value={schedule[day.key]?.openTime || '17:00'}
                    onChange={(e) => onScheduleChange(day.key, 'openTime', e.target.value)}
                    className="px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary-600">Hasta:</span>
                  <input
                    type="time"
                    value={schedule[day.key]?.closeTime || '23:00'}
                    onChange={(e) => onScheduleChange(day.key, 'closeTime', e.target.value)}
                    className="px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScheduleTab
