import React from 'react'
import { Users, ShieldCheck, ShieldOff, Building } from 'lucide-react'

/**
 * Componente para mostrar las tarjetas de estadísticas de usuarios
 * @param {Object} props - Props del componente
 * @param {Object} props.stats - Objeto con estadísticas (total, allowed, blocked, withFields)
 */
const UserStatsCards = ({ stats }) => {
  const statsCards = [
    {
      title: 'Total Usuarios',
      value: stats.total,
      icon: Users,
      bgColor: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Acceso Permitido',
      value: stats.allowed,
      icon: ShieldCheck,
      bgColor: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
    },
    {
      title: 'Bloqueados',
      value: stats.blocked,
      icon: ShieldOff,
      bgColor: 'bg-red-500',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
    },
    {
      title: 'Con Canchas Asignadas',
      value: stats.withFields,
      icon: Building,
      bgColor: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statsCards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={index}
            className={`${card.bgLight} rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-full`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default UserStatsCards
