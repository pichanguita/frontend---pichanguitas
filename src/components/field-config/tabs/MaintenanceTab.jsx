import React from 'react'
import { Plus, Trash2, Wrench } from 'lucide-react'

const MaintenanceTab = ({ maintenanceSchedule, onAdd, onUpdate, onRemove }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">Programar Mantenimientos</h3>
          <p className="text-secondary-600">Gestiona los períodos de mantenimiento de la cancha</p>
        </div>
        <button
          onClick={onAdd}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Mantenimiento</span>
        </button>
      </div>

      {maintenanceSchedule.length === 0 ? (
        <div className="text-center py-8 text-secondary-500">
          <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay mantenimientos programados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {maintenanceSchedule.map((maintenance, index) => (
            <div key={maintenance.id} className="p-4 border border-secondary-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-secondary-900">Mantenimiento #{index + 1}</h4>
                <button
                  onClick={() => onRemove(maintenance.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={maintenance.startDate}
                    onChange={(e) => onUpdate(maintenance.id, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={maintenance.endDate}
                    onChange={(e) => onUpdate(maintenance.id, 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Tipo</label>
                  <select
                    value={maintenance.type}
                    onChange={(e) => onUpdate(maintenance.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500"
                  >
                    <option value="scheduled">Programado</option>
                    <option value="emergency">Emergencia</option>
                    <option value="improvement">Mejora</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Motivo
                  </label>
                  <input
                    type="text"
                    value={maintenance.reason}
                    onChange={(e) => onUpdate(maintenance.id, 'reason', e.target.value)}
                    placeholder="Ej: Renovación de césped"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MaintenanceTab
