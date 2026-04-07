import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, CheckCircle, Calendar, Activity, DollarSign, Clock, Users } from 'lucide-react'
import { formatCurrency } from '@/utils/superadmin/dashboardHelpers'

const StatsCards = ({
  totalFields = 0,
  activeFields = 0,
  totalReservations = 0,
  todayReservations = 0,
  totalRevenue = 0,
  totalPending = 0,
  totalAdmins = 0,
}) => {
  // Asegurar que los valores sean números válidos
  const safeRevenue = typeof totalRevenue === 'number' ? totalRevenue : 0
  const safePending = typeof totalPending === 'number' ? totalPending : 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Total Canchas</p>
            <p className="text-lg sm:text-xl font-bold text-gray-900">{totalFields}</p>
          </div>
          <div className="bg-primary-50 p-2 rounded-lg flex-shrink-0">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Canchas Activas</p>
            <p className="text-lg sm:text-xl font-bold text-green-600">{activeFields}</p>
          </div>
          <div className="bg-green-50 p-2 rounded-lg flex-shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Reservas Totales</p>
            <p className="text-lg sm:text-xl font-bold text-blue-600">{totalReservations}</p>
          </div>
          <div className="bg-blue-50 p-2 rounded-lg flex-shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Reservas Hoy</p>
            <p className="text-lg sm:text-xl font-bold text-purple-600">{todayReservations}</p>
          </div>
          <div className="bg-purple-50 p-2 rounded-lg flex-shrink-0">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Ingresos Totales</p>
            <p className="text-base sm:text-lg font-bold text-amber-600">
              S/{formatCurrency(safeRevenue)}
            </p>
          </div>
          <div className="bg-amber-50 p-2 rounded-lg flex-shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Pagos Pendientes</p>
            <p className="text-base sm:text-lg font-bold text-red-600">
              S/{formatCurrency(safePending)}
            </p>
          </div>
          <div className="bg-red-50 p-2 rounded-lg flex-shrink-0">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Administradores</p>
            <p className="text-lg sm:text-xl font-bold text-indigo-600">{totalAdmins}</p>
          </div>
          <div className="bg-indigo-50 p-2 rounded-lg flex-shrink-0">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default StatsCards
