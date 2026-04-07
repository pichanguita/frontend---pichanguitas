import React from 'react'
import { DIMENSION_LABELS } from '../../../utils/fields-showcase/constants'

const DIMENSION_UNITS = { length: 'm', width: 'm', area: 'm²' }

const ModalDimensions = ({ dimensions }) => {
  return (
    <div className="mb-6">
      <h4 className="font-bold text-secondary-900 mb-3">Especificaciones:</h4>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(dimensions).map(([key, value]) => (
          <div key={key} className="p-2 bg-gray-50 rounded">
            <span className="text-sm text-gray-600">{DIMENSION_LABELS[key] || key}:</span>
            <p className="font-medium">{value}{DIMENSION_UNITS[key] ? ` ${DIMENSION_UNITS[key]}` : ''}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ModalDimensions
