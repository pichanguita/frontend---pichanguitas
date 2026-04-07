import React from 'react'

const EmptyState = ({ type }) => {
  if (type === 'active') {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reservas activas</h3>
        <p className="text-gray-600">Ve a "Canchas" para reservar tu próxima partida</p>
      </div>
    )
  }

  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">📜</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas en el historial</h3>
      <p className="text-gray-600">Aquí aparecerán tus reservas pasadas y completadas</p>
    </div>
  )
}

export default EmptyState
