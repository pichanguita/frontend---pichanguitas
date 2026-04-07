import React from 'react'
import { Wrench } from 'lucide-react'

const StatusBadge = ({ status }) => {
  switch (status) {
    case 'available':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
          <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
          Disponible
        </span>
      )
    case 'maintenance':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
          <Wrench className="w-3 h-3 mr-2" />
          Mantenimiento
        </span>
      )
    default:
      return null
  }
}

export default StatusBadge
