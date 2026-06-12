import React from 'react'
import { Star } from 'lucide-react'

/**
 * StarRating - Render reutilizable de calificación con estrellas.
 *
 * Centraliza el dibujo de estrellas (antes duplicado inline en el panel de
 * reserva, la lista de canchas y el panel de reseñas del admin). Soporta media
 * estrella mediante el relleno parcial de la última estrella activa.
 *
 * @param {number} rating - Calificación (0-5). Se admite decimal.
 * @param {number} [count] - Cantidad de reseñas; si se pasa, se muestra "(N reseñas)".
 * @param {boolean} [showValue=true] - Mostrar el valor numérico junto a las estrellas.
 * @param {number} [size=4] - Tamaño de la estrella en unidades Tailwind (w-/h-).
 * @param {string} [colorClass='text-yellow-400'] - Clase de color de las estrellas activas.
 * @param {string} [className] - Clases extra para el contenedor.
 */
const StarRating = ({
  rating = 0,
  count = null,
  showValue = true,
  size = 4,
  colorClass = 'text-yellow-400',
  className = '',
}) => {
  const value = parseFloat(rating) || 0
  const starSize = `w-${size} h-${size}`

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => {
          const filled = i < Math.floor(value)
          const partial = !filled && i < value
          return (
            <Star
              key={i}
              className={`${starSize} ${filled || partial ? colorClass : 'text-gray-300'}`}
              fill={filled ? 'currentColor' : partial ? 'currentColor' : 'none'}
              fillOpacity={partial ? 0.5 : 1}
            />
          )
        })}
      </div>

      {showValue && <span className="text-sm font-semibold text-gray-800">{value.toFixed(1)}</span>}

      {count != null && (
        <span className="text-xs text-gray-500">
          ({count} {count === 1 ? 'reseña' : 'reseñas'})
        </span>
      )}
    </div>
  )
}

export default StarRating
