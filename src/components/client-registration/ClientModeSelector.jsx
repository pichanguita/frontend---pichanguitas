import React from 'react'

const ClientModeSelector = ({ mode, onModeChange, isLoading }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Registro</label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onModeChange('existing')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'existing'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          disabled={isLoading}
        >
          Cliente Existente
        </button>
        <button
          type="button"
          onClick={() => onModeChange('new')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'new'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
          disabled={isLoading}
        >
          Nuevo Cliente
        </button>
      </div>
    </div>
  )
}

export default ClientModeSelector
