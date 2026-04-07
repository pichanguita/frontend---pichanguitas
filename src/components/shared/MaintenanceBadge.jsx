import React from 'react'
import { Wrench } from 'lucide-react'

/**
 * MaintenanceBadge
 *
 * Componente reutilizable para mostrar el estado de mantenimiento de una cancha
 * Sigue principios DRY y reutilización de componentes
 *
 * @param {string} variant - Estilo del badge: 'small', 'medium', 'large', 'alert'
 * @param {string} className - Clases CSS adicionales
 */
const MaintenanceBadge = ({ variant = 'medium', className = '' }) => {
  const variants = {
    small: {
      container: 'flex items-center gap-1 bg-orange-500 text-white rounded px-2 py-1',
      icon: 'w-3 h-3',
      text: 'text-xs font-semibold',
    },
    medium: {
      container:
        'flex items-center gap-1.5 bg-orange-500 text-white rounded-lg px-3 py-1.5 shadow-lg',
      icon: 'w-4 h-4',
      text: 'text-xs font-bold',
    },
    large: {
      container: 'flex items-center gap-2 bg-orange-500 text-white rounded-lg px-4 py-2 shadow-lg',
      icon: 'w-5 h-5',
      text: 'text-sm font-bold',
    },
    alert: {
      container:
        'flex items-start gap-3 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg',
      icon: 'w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5',
      text: 'text-sm text-orange-700',
    },
  }

  const style = variants[variant] || variants.medium

  if (variant === 'alert') {
    return (
      <div className={`${style.container} ${className}`}>
        <Wrench className={style.icon} />
        <div>
          <h4 className="text-sm font-semibold text-orange-800 mb-1">Cancha en Mantenimiento</h4>
          <p className={style.text}>
            Esta cancha se encuentra en mantenimiento programado y no está disponible para reservas
            en este momento.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${style.container} ${className}`}>
      <Wrench className={style.icon} />
      <span className={style.text}>En Mantenimiento</span>
    </div>
  )
}

export default MaintenanceBadge
