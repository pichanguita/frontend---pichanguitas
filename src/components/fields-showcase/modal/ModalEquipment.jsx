import React from 'react'

const EQUIPMENT_ITEMS = [
  { key: 'hasJerseyRental', priceKey: 'jerseyPrice', label: 'Alquiler de Chalecos' },
  { key: 'hasBallRental', priceKey: 'ballPrice', label: 'Alquiler de Pelotas' },
  { key: 'hasConeRental', priceKey: 'conePrice', label: 'Alquiler de Conos' },
]

const ModalEquipment = ({ equipment }) => {
  if (!equipment) return null

  const availableItems = EQUIPMENT_ITEMS.filter((item) => equipment[item.key])

  if (availableItems.length === 0) return null

  return (
    <div className="mb-6">
      <h4 className="font-bold text-secondary-900 mb-3">Alquiler de Equipamiento:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {availableItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <span className="text-purple-600">✓</span>
              <span className="text-purple-800 text-sm font-medium">{item.label}</span>
            </div>
            {equipment[item.priceKey] > 0 && (
              <span className="text-purple-700 text-sm font-semibold">
                S/ {parseFloat(equipment[item.priceKey]).toFixed(2)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ModalEquipment
