import React from 'react'
import { motion } from 'framer-motion'
import { Check, Trash2, Edit } from 'lucide-react'
import { ALERT_TYPES, ALERT_STATUS } from '@/constants'
import { getPriorityColor, getTypeIcon, formatAlertDate } from '../../utils/alerts/formatters.jsx'
import ReservationDetails from './ReservationDetails'
import AnniversaryDetails from './AnniversaryDetails'

const AlertCard = ({ alert, onMarkAsRead, onDelete, onEdit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border-l-4 p-4 rounded-r-lg shadow-sm mb-3 ${getPriorityColor(alert.priority)} ${
        alert.status === ALERT_STATUS.UNREAD ? 'ring-2 ring-blue-200' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="mt-1">{getTypeIcon(alert.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4
                className={`text-sm font-semibold ${alert.status === ALERT_STATUS.UNREAD ? 'text-gray-900' : 'text-gray-700'}`}
              >
                {alert.title}
              </h4>
              <span className="text-xs text-gray-500 ml-2">
                {formatAlertDate(alert.createdAt || alert.date_time_registration)}
              </span>
            </div>

            <p
              className={`text-sm mb-2 ${alert.status === ALERT_STATUS.UNREAD ? 'text-gray-800' : 'text-gray-600'}`}
            >
              {alert.message}
            </p>

            {/* Reservation Details */}
            {alert.type === ALERT_TYPES.RESERVATION && alert.reservationData && (
              <ReservationDetails alert={alert} />
            )}

            {/* Anniversary Details */}
            {alert.type === ALERT_TYPES.USER_ANNIVERSARY && <AnniversaryDetails alert={alert} />}
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {alert.type === ALERT_TYPES.RESERVATION && alert.reservationData && (
            <button
              onClick={() => onEdit(alert)}
              className="p-1 text-green-600 hover:bg-green-100 rounded-full transition-colors"
              title="Editar reserva"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {alert.status === ALERT_STATUS.UNREAD && (
            <button
              onClick={() => onMarkAsRead(alert.id)}
              className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
              title="Marcar como leído"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(alert.id)}
            className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
            title="Eliminar alerta"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default AlertCard
