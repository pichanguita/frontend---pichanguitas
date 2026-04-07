import React from 'react'
import { motion } from 'framer-motion'
import { Users, Trophy, Award, Clock, TrendingUp } from 'lucide-react'

/**
 * Estadísticas generales del módulo de promociones
 */
const PromotionsStats = ({ clientStats, promotionRules }) => {
  const stats = [
    {
      icon: Users,
      value: clientStats.length,
      label: 'Clientes Activos',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      showTrend: true,
    },
    {
      icon: Trophy,
      value: clientStats.reduce((acc, client) => acc + (client.availableFreeHours || 0), 0),
      label: 'Horas Gratis Disponibles',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: Award,
      value: promotionRules.filter((r) => r.isActive).length,
      label: 'Reglas Activas',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: Clock,
      value: clientStats.reduce((acc, client) => acc + (client.totalHours || 0), 0),
      label: 'Horas Totales Reservadas',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="bg-white rounded-xl shadow-custom p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}
              >
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              {stat.showTrend && <TrendingUp className="w-5 h-5 text-green-500" />}
            </div>
            <h3 className="text-2xl font-bold text-secondary-900">{stat.value}</h3>
            <p className="text-secondary-600 text-sm mt-1">{stat.label}</p>
          </div>
        )
      })}
    </motion.div>
  )
}

export default PromotionsStats
