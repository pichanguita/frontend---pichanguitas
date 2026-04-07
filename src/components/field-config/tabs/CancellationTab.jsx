import React from 'react'
import { Ban } from 'lucide-react'

const CancellationTab = ({ cancellationPolicy, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Ban className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900">Política de Cancelación</h4>
            <p className="text-sm text-red-700 mt-1">
              Define las reglas de cancelación para esta cancha. Esto afecta directamente la
              experiencia del cliente.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">Permitir Cancelaciones?</h3>
              <p className="text-sm text-secondary-600 mt-1">
                Decide si los clientes pueden cancelar sus reservas
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={cancellationPolicy.allowCancellation}
                onChange={(e) => onChange('allowCancellation', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {cancellationPolicy.allowCancellation && (
            <div className="space-y-4 pt-4 border-t border-secondary-200">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Tiempo mínimo para cancelar
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={cancellationPolicy.hoursBeforeEvent}
                    onChange={(e) => onChange('hoursBeforeEvent', parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                  <span className="text-secondary-600">horas antes del evento</span>
                </div>
                <p className="text-xs text-secondary-500 mt-1">
                  Los clientes deben cancelar al menos {cancellationPolicy.hoursBeforeEvent} horas
                  antes del evento
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Porcentaje de Reembolso
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={cancellationPolicy.refundPercentage}
                      onChange={(e) => onChange('refundPercentage', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                    <div className="w-16 px-3 py-1 bg-primary-100 text-primary-700 font-bold rounded-lg text-center">
                      {cancellationPolicy.refundPercentage}%
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      onClick={() => onChange('refundPercentage', 0)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all ${
                        cancellationPolicy.refundPercentage === 0
                          ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold'
                          : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                      }`}
                    >
                      Sin reembolso (0%)
                    </button>
                    <button
                      onClick={() => onChange('refundPercentage', 50)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all ${
                        cancellationPolicy.refundPercentage === 50
                          ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold'
                          : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                      }`}
                    >
                      Parcial (50%)
                    </button>
                    <button
                      onClick={() => onChange('refundPercentage', 100)}
                      className={`px-3 py-2 rounded-lg border-2 transition-all ${
                        cancellationPolicy.refundPercentage === 100
                          ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold'
                          : 'border-secondary-200 text-secondary-600 hover:border-secondary-300'
                      }`}
                    >
                      Total (100%)
                    </button>
                  </div>

                  <p className="text-xs text-secondary-500 mt-2">
                    {cancellationPolicy.refundPercentage === 0 &&
                      'No se devolverá dinero en caso de cancelación'}
                    {cancellationPolicy.refundPercentage > 0 &&
                      cancellationPolicy.refundPercentage < 100 &&
                      `Se devolverá el ${cancellationPolicy.refundPercentage}% del monto pagado`}
                    {cancellationPolicy.refundPercentage === 100 &&
                      'Se devolverá el monto completo pagado'}
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Vista Previa de Política:</h4>
                <p className="text-sm text-blue-800">
                  "Los clientes pueden cancelar hasta {cancellationPolicy.hoursBeforeEvent} horas
                  antes del evento
                  {cancellationPolicy.refundPercentage === 0 && ' sin reembolso'}
                  {cancellationPolicy.refundPercentage > 0 &&
                    cancellationPolicy.refundPercentage < 100 &&
                    ` con un reembolso del ${cancellationPolicy.refundPercentage}%`}
                  {cancellationPolicy.refundPercentage === 100 && ' con reembolso completo'}."
                </p>
              </div>
            </div>
          )}

          {!cancellationPolicy.allowCancellation && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                Las cancelaciones están deshabilitadas. Los clientes no podrán cancelar sus reservas
                una vez confirmadas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CancellationTab
