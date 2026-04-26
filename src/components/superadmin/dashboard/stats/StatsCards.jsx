import React from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  CheckCircle,
  Calendar,
  Activity,
  DollarSign,
  Clock,
  Users,
  XCircle,
  AlertCircle,
} from 'lucide-react'

const formatCompactCurrency = (amount) => {
  const num = parseFloat(amount) || 0
  return num.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

const StatsCards = ({
  totalFields = 0,
  activeFields = 0,
  pendingFields = 0,
  rejectedFields = 0,
  totalReservations = 0,
  todayReservations = 0,
  totalRevenue = 0,
  totalPending = 0,
  totalAdmins = 0,
}) => {
  const safeRevenue = typeof totalRevenue === 'number' ? totalRevenue : 0
  const safePending = typeof totalPending === 'number' ? totalPending : 0

  const cards = [
    {
      key: 'total',
      label: 'Total Canchas',
      value: totalFields,
      icon: MapPin,
      valueClass: 'text-gray-900',
      iconWrapperClass: 'bg-primary-50',
      iconClass: 'text-primary-600',
      variant: 'integer',
    },
    {
      key: 'active',
      label: 'Canchas Activas',
      value: activeFields,
      icon: CheckCircle,
      valueClass: 'text-green-600',
      iconWrapperClass: 'bg-green-50',
      iconClass: 'text-green-600',
      variant: 'integer',
    },
    {
      key: 'pending',
      label: 'Canchas Pendientes',
      value: pendingFields,
      icon: AlertCircle,
      valueClass: 'text-blue-600',
      iconWrapperClass: 'bg-blue-50',
      iconClass: 'text-blue-600',
      variant: 'integer',
    },
    {
      key: 'rejected',
      label: 'Canchas Rechazadas',
      value: rejectedFields,
      icon: XCircle,
      valueClass: 'text-red-600',
      iconWrapperClass: 'bg-red-50',
      iconClass: 'text-red-600',
      variant: 'integer',
    },
    {
      key: 'totalReservations',
      label: 'Reservas Totales',
      value: totalReservations,
      icon: Calendar,
      valueClass: 'text-blue-600',
      iconWrapperClass: 'bg-blue-50',
      iconClass: 'text-blue-600',
      variant: 'integer',
    },
    {
      key: 'todayReservations',
      label: 'Reservas Hoy',
      value: todayReservations,
      icon: Activity,
      valueClass: 'text-purple-600',
      iconWrapperClass: 'bg-purple-50',
      iconClass: 'text-purple-600',
      variant: 'integer',
    },
    {
      key: 'revenue',
      label: 'Ingresos Totales',
      value: safeRevenue,
      icon: DollarSign,
      valueClass: 'text-amber-600',
      iconWrapperClass: 'bg-amber-50',
      iconClass: 'text-amber-600',
      variant: 'currency',
    },
    {
      key: 'pendingPayments',
      label: 'Pagos Pendientes',
      value: safePending,
      icon: Clock,
      valueClass: 'text-red-600',
      iconWrapperClass: 'bg-red-50',
      iconClass: 'text-red-600',
      variant: 'currency',
    },
    {
      key: 'admins',
      label: 'Administradores',
      value: totalAdmins,
      icon: Users,
      valueClass: 'text-indigo-600',
      iconWrapperClass: 'bg-indigo-50',
      iconClass: 'text-indigo-600',
      variant: 'integer',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-9 gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon
        const isCurrency = card.variant === 'currency'
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 mb-0.5">{card.label}</p>
                {isCurrency ? (
                  <p
                    className={`text-sm sm:text-base font-bold leading-tight break-all ${card.valueClass}`}
                  >
                    S/{formatCompactCurrency(card.value)}
                  </p>
                ) : (
                  <p className={`text-lg sm:text-xl font-bold ${card.valueClass}`}>{card.value}</p>
                )}
              </div>
              <div className={`${card.iconWrapperClass} p-2 rounded-lg flex-shrink-0`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.iconClass}`} />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default StatsCards
