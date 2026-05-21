import React from 'react'
import { getAmenityIconComponent } from '../../../utils/amenityIconRegistry'

const ModalAmenities = ({ amenities }) => {
  if (!Array.isArray(amenities) || amenities.length === 0) return null

  return (
    <div className="mb-6">
      <h4 className="font-bold text-secondary-900 mb-3">Comodidades incluidas:</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {amenities.map((amenity) => {
          const Icon = getAmenityIconComponent(amenity.icon_name)
          return (
            <div
              key={amenity.key}
              className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg"
            >
              <Icon className="w-4 h-4 text-green-700 flex-shrink-0" />
              <span className="text-green-800 text-sm">{amenity.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ModalAmenities
