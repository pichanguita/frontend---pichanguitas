import React from 'react'
import { User, Gift, Calendar } from 'lucide-react'
import { USER_ROLES } from '@/constants'

const AnniversaryDetails = ({ alert }) => {
  return (
    <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center text-purple-700">
          <User className="w-3 h-3 mr-1" />
          <span className="font-medium">{alert.userName}</span>
        </div>
        <div className="flex items-center text-purple-600">
          <Gift className="w-3 h-3 mr-1" />
          <span>{alert.userRole === USER_ROLES.ADMIN ? 'Administrador' : 'Cliente'}</span>
        </div>
        {alert.userEmail && (
          <div className="flex items-center text-purple-600 col-span-2">
            <span className="text-xs">📧 {alert.userEmail}</span>
          </div>
        )}
        <div className="flex items-center text-purple-600 col-span-2">
          <Calendar className="w-3 h-3 mr-1" />
          <span>
            Registrado:{' '}
            {new Date(alert.registrationDate).toLocaleDateString('es-PE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default AnniversaryDetails
