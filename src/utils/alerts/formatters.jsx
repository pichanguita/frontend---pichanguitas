/**
 * Utilidades de formateo para alertas
 */

import React from 'react'
import { Bell, AlertCircle, Check, Gift } from 'lucide-react'
import { ALERT_TYPES, ALERT_PRIORITY } from '@/constants'

export const formatAlertDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible'

  const date = new Date(dateString)

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return 'Fecha no disponible'

  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getPriorityColor = (priority) => {
  switch (priority) {
    case ALERT_PRIORITY.HIGH:
      return 'border-l-red-500 bg-red-50'
    case ALERT_PRIORITY.MEDIUM:
      return 'border-l-yellow-500 bg-yellow-50'
    case ALERT_PRIORITY.LOW:
      return 'border-l-blue-500 bg-blue-50'
    default:
      return 'border-l-gray-500 bg-gray-50'
  }
}

export const getTypeIcon = (type) => {
  switch (type) {
    case ALERT_TYPES.RESERVATION:
      return <Bell className="w-5 h-5 text-blue-600" />
    case ALERT_TYPES.SYSTEM:
      return <AlertCircle className="w-5 h-5 text-orange-600" />
    case ALERT_TYPES.FIELD_APPROVAL:
      return <AlertCircle className="w-5 h-5 text-yellow-600" />
    case ALERT_TYPES.FIELD_APPROVED:
      return <Check className="w-5 h-5 text-green-600" />
    case ALERT_TYPES.FIELD_REJECTED:
      return <AlertCircle className="w-5 h-5 text-red-600" />
    case ALERT_TYPES.USER_ANNIVERSARY:
      return <Gift className="w-5 h-5 text-purple-600" />
    default:
      return <Bell className="w-5 h-5 text-gray-600" />
  }
}
