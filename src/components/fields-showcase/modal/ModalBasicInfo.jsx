import React from 'react'
import { DollarSign, Phone, Calendar } from 'lucide-react'
import { SPORT_ICONS_FULL } from '../../../utils/fields-showcase/constants'

const ModalBasicInfo = ({ field }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-primary-600" />
            <span className="font-medium">Precio por hora:</span>
          </div>
          <span className="font-bold text-primary-600">S/ {field.pricePerHour}</span>
        </div>

        {field.phone && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-primary-600" />
              <span className="font-medium">Teléfono:</span>
            </div>
            <span>{field.phone}</span>
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <span className="font-medium">Capacidad:</span>
          </div>
          <span>{field.capacity} personas</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Deporte */}
        {field.sportType && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Deporte:</h4>
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
              {SPORT_ICONS_FULL[field.sportType] || '🏃 ' + field.sportType}
            </span>
          </div>
        )}

        {/* Dirección completa */}
        {field.address && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">Dirección:</h4>
            <p className="text-gray-600">{field.address}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModalBasicInfo
