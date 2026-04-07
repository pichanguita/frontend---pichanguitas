import React from 'react'
import { MapPin, User, Phone, Clock } from 'lucide-react'

const ReservationDetails = ({ alert }) => {
  if (!alert.reservationData) return null

  return (
    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-3 h-3 mr-1" />
          {alert.fieldName}
        </div>
        <div className="flex items-center text-gray-600">
          <User className="w-3 h-3 mr-1" />
          {alert.customerName}
        </div>
        <div className="flex items-center text-gray-600">
          <Phone className="w-3 h-3 mr-1" />
          {alert.customerPhone}
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="w-3 h-3 mr-1" />
          {alert.reservationData.date} {alert.reservationData.startTime}-
          {alert.reservationData.endTime}
        </div>
      </div>
      {alert.reservationData.totalAmount && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-sm font-medium text-green-600">
            Total: S/ {alert.reservationData.totalAmount}
          </span>
        </div>
      )}
    </div>
  )
}

export default ReservationDetails
