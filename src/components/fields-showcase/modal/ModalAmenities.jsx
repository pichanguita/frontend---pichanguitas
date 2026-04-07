import React from 'react'

const ModalAmenities = ({ amenities }) => {
  return (
    <div className="mb-6">
      <h4 className="font-bold text-secondary-900 mb-3">Comodidades incluidas:</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {amenities.map((amenity, index) => (
          <div
            key={index}
            className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg"
          >
            <span className="text-green-600">✓</span>
            <span className="text-green-800 text-sm">{amenity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ModalAmenities
