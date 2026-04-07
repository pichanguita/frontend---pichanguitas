import React from 'react'
import { Calendar, Clock } from 'lucide-react'

const AvailabilityInfo = ({ date, fieldId, occupiedSlots }) => {
  if (!date) {
    return null
  }

  const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-900 mb-1">
            Fecha seleccionada: {formattedDate}
          </p>

          {!fieldId ? (
            <p className="text-sm text-blue-700">
              Selecciona una cancha para ver la disponibilidad de horarios
            </p>
          ) : occupiedSlots.length === 0 ? (
            <div className="mt-2">
              <p className="text-sm font-medium text-green-700 flex items-center gap-1">
                <span className="text-lg">Checkmark</span>
                Todos los horarios están disponibles
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                <p className="text-sm font-semibold text-red-900">
                  Horarios ocupados ({occupiedSlots.length}):
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {occupiedSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 border border-red-300 rounded-lg"
                  >
                    <span className="text-sm font-medium text-red-800">{slot.time}</span>
                    <span className="text-xs text-red-600">({slot.customerName})</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Selecciona un horario diferente a los mostrados arriba
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AvailabilityInfo
