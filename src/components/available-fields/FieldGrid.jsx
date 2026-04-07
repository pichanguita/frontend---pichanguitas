import React from 'react'
import FieldCard from './FieldCard'

const FieldGrid = ({ fields, selectedField, onFieldSelect, getReservationCount }) => {
  if (fields.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron canchas</h3>
        <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
      {fields.map((field) => (
        <FieldCard
          key={field.id}
          field={field}
          isSelected={selectedField?.id === field.id}
          onSelect={onFieldSelect}
          reservationCount={getReservationCount(field.id)}
        />
      ))}
    </div>
  )
}

export default FieldGrid
