import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Gift, Settings, CheckCircle, Edit2, Trash2 } from 'lucide-react'

/**
 * Lista de reglas de promoción
 */
const RulesList = ({
  promotionRules,
  onToggleStatus,
  onEditRule,
  onDeleteRule,
  onCreateNewRule,
}) => {
  if (promotionRules.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="bg-white rounded-xl shadow-custom p-12 text-center">
          <Gift className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
          <p className="text-secondary-500">No hay reglas de promoción configuradas</p>
          <button
            onClick={onCreateNewRule}
            className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Crear Primera Regla
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4"
    >
      {promotionRules.map((rule) => (
        <div key={rule.id} className="bg-white rounded-xl shadow-custom p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-secondary-900">{rule.name}</h3>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {rule.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <p className="text-secondary-600 mb-3">{rule.description}</p>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-secondary-400" />
                  <span>
                    <strong>{rule.hoursRequired}</strong> horas requeridas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-500" />
                  <span>
                    <strong>{rule.freeHours}</strong> hora(s) gratis
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-secondary-400" />
                  <span className="text-secondary-600">
                    Aplica a:{' '}
                    {rule.appliesTo === 'all' ? 'Todas las canchas' : 'Canchas específicas'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onToggleStatus(rule.id)}
                className={`p-2 rounded-lg transition-colors ${
                  rule.isActive
                    ? 'bg-green-100 hover:bg-green-200 text-green-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={rule.isActive ? 'Desactivar' : 'Activar'}
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEditRule(rule)}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteRule(rule.id)}
                className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  )
}

export default RulesList
