import React from 'react'
import { Gift, Plus } from 'lucide-react'

/**
 * Header del módulo de promociones con tabs
 */
const PromotionsHeader = ({ activeTab, onTabChange, onNewRule }) => {
  const tabs = [
    { id: 'overview', label: 'Resumen' },
    { id: 'clients', label: 'Clientes' },
    { id: 'rules', label: 'Reglas' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-custom p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <Gift className="w-7 h-7 text-primary-600" />
            Módulo de Promociones
          </h2>
          <p className="text-secondary-600 mt-1">Gestiona recompensas para clientes recurrentes</p>
        </div>
        <button
          onClick={onNewRule}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Regla
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-secondary-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 px-1 font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-primary-600'
                : 'text-secondary-600 hover:text-secondary-900'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default PromotionsHeader
