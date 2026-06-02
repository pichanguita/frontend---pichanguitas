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

const StatCard = ({ card, index }) => {
  const Icon = card.icon
  const isCurrency = card.variant === 'currency'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 mb-1 truncate" title={card.label}>
            {card.label}
          </p>
          {isCurrency ? (
            <p
              className={`text-lg sm:text-xl font-bold leading-tight tabular-nums break-words ${card.valueClass}`}
            >
              S/ {formatCompactCurrency(card.value)}
            </p>
          ) : (
            <p className={`text-2xl font-bold leading-tight tabular-nums ${card.valueClass}`}>
              {card.value}
            </p>
          )}
        </div>
        <div className={`${card.iconWrapperClass} p-2.5 rounded-lg flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${card.iconClass}`} />
        </div>
      </div>
    </motion.div>
  )
}

const StatsSection = ({ title, cards, gridClass, startIndex, className = '' }) => (
  <div className={className}>
    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-0.5">
      {title}
    </h3>
    <div className={`grid ${gridClass} gap-3 sm:gap-4`}>
      {cards.map((card, i) => (
        <StatCard key={card.key} card={card} index={startIndex + i} />
      ))}
    </div>
  </div>
)

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

  const fieldCards = [
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
  ]

  const reservationCards = [
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
  ]

  const financeCards = [
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
  ]

  const teamCards = [
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
    <div className="space-y-5 mb-4 sm:mb-6 md:mb-8">
      <StatsSection
        title="Canchas"
        cards={fieldCards}
        gridClass="grid-cols-2 lg:grid-cols-4"
        startIndex={0}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
        <StatsSection
          title="Reservas"
          cards={reservationCards}
          gridClass="grid-cols-2"
          startIndex={4}
          className="xl:col-span-2"
        />
        <StatsSection
          title="Finanzas"
          cards={financeCards}
          gridClass="grid-cols-2"
          startIndex={6}
          className="xl:col-span-2"
        />
        <StatsSection
          title="Equipo"
          cards={teamCards}
          gridClass="grid-cols-1"
          startIndex={8}
          className="md:col-span-2 xl:col-span-1"
        />
      </div>
    </div>
  )
}

export default StatsCards
