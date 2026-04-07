import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, DollarSign, Star, Wrench } from 'lucide-react'
import { isFieldInMaintenance } from '../../utils/fields/fieldUtils'

const FieldCard = ({ field, isSelected, onSelect, reservationCount }) => {
  const inMaintenance = isFieldInMaintenance(field)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => !inMaintenance && onSelect(field)}
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all border-2 ${
        inMaintenance
          ? 'opacity-60 cursor-not-allowed border-gray-300'
          : `cursor-pointer hover:shadow-lg ${isSelected ? 'border-green-500' : 'border-transparent'}`
      }`}
    >
      {/* Field Image */}
      <div className="h-40 sm:h-44 md:h-48 bg-gradient-to-br from-green-400 to-blue-500 relative">
        {(field.customImages && field.customImages.length > 0) ||
        (field.images && field.images.length > 0) ? (
          <img
            src={
              (field.customImages && field.customImages[0]) ||
              (field.images && field.images[0])
            }
            alt={field.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className="text-5xl sm:text-6xl flex items-center justify-center absolute inset-0"
          style={{
            display:
              (field.customImages && field.customImages.length > 0) ||
              (field.images && field.images.length > 0)
                ? 'none'
                : 'flex',
          }}
        >
          ⚽
        </div>

        {/* Badge de mantenimiento */}
        {inMaintenance && (
          <div className="absolute top-3 left-3 bg-orange-500 text-white rounded-lg px-3 py-1.5 shadow-lg">
            <div className="flex items-center gap-1.5">
              <Wrench className="w-4 h-4" />
              <span className="text-xs font-bold">En Mantenimiento</span>
            </div>
          </div>
        )}

        {/* Badge de historial de reservas */}
        {!inMaintenance && reservationCount > 0 && (
          <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-lg border-2 border-green-500">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-gray-900">
                {reservationCount} {reservationCount === 1 ? 'vez' : 'veces'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 space-y-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-900">{field.name}</h3>

        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{field.location}</span>
        </div>

        {/* Rating */}
        {field.rating > 0 && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(field.rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : i < field.rating
                      ? 'fill-yellow-200 text-yellow-400'
                      : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-xs font-medium text-gray-700 ml-1">
              {field.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">({field.totalReviews || 0})</span>
          </div>
        )}

        <div className="flex items-center text-sm text-green-600 font-semibold">
          <DollarSign className="w-4 h-4 mr-1" />
          <span>S/ {field.pricePerHour} / hora</span>
        </div>

        {/* Deportes */}
        {field.sportNames && field.sportNames.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {field.sportNames.slice(0, 3).map((sport, index) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {sport}
              </span>
            ))}
            {field.sportNames.length > 3 && (
              <span className="text-xs text-gray-500">+{field.sportNames.length - 3}</span>
            )}
          </div>
        )}

        {/* Equipamiento disponible */}
        {field.equipment &&
          (field.equipment.hasJerseyRental ||
            field.equipment.hasBallRental ||
            field.equipment.hasConeRental) && (
            <div className="flex flex-wrap gap-1 mt-1">
              {field.equipment.hasJerseyRental && (
                <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                  Chalecos
                </span>
              )}
              {field.equipment.hasBallRental && (
                <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                  Pelotas
                </span>
              )}
              {field.equipment.hasConeRental && (
                <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                  Conos
                </span>
              )}
            </div>
          )}

        {/* Mensaje de mantenimiento o botón de selección */}
        {inMaintenance ? (
          <div className="w-full mt-2 sm:mt-3 bg-orange-50 border border-orange-200 text-orange-700 font-medium py-2 text-xs sm:text-sm rounded-lg text-center">
            No disponible temporalmente
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelect(field)
            }}
            className="w-full mt-2 sm:mt-3 bg-green-600 hover:bg-green-700 text-white font-medium py-2 text-sm sm:text-base rounded-lg transition-colors"
          >
            Seleccionar
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default FieldCard
