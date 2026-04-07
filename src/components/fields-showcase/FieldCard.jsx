import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, DollarSign, Clock } from 'lucide-react'
import { getFieldImage } from '../../data/fieldImages'
import { getMainAmenities } from '../../utils/fields-showcase/amenityMapper'
import { SPORT_ICONS } from '../../utils/fields-showcase/constants'
import StatusBadge from './StatusBadge'

const FieldCard = ({ field, onFieldClick, variants }) => {
  const mainAmenities = getMainAmenities(field)

  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all hover:scale-105"
      onClick={() => onFieldClick(field)}
    >
      {/* Field Image */}
      <div className="h-32 sm:h-36 md:h-40 bg-gradient-to-br from-primary-400 to-primary-600 relative">
        <img
          src={
            (field.customImages && field.customImages.length > 0 && field.customImages[0]) ||
            (field.images && field.images.length > 0 && field.images[0]) ||
            getFieldImage(field.sportType || 'multiuso', field.id)
          }
          alt={field.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = getFieldImage(field.sportType || 'multiuso', field.id)
            e.target.onerror = (e2) => {
              e2.target.src = '/maquetacion/CampoFutbol.png'
              e2.target.onerror = null
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={field.status} />
        </div>

        {/* Amenities Icons on Image */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          {mainAmenities.map((amenity, idx) => (
            <div
              key={idx}
              className={`${amenity.color} text-white rounded-full p-1.5 shadow-lg backdrop-blur-sm bg-opacity-90 hover:bg-opacity-100 transition-all group/icon`}
              title={amenity.label}
            >
              <amenity.Icon className="w-3 h-3" />
            </div>
          ))}
        </div>
      </div>

      {/* Field Info */}
      <div className="p-2 sm:p-3 md:p-4">
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-secondary-900 mb-1 line-clamp-1">
          {field.name}
        </h3>

        <div className="flex items-center space-x-1 text-secondary-600 mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs truncate">{field.location}</span>
        </div>

        {/* Deportes soportados */}
        {field.sportType && (
          <div className="flex flex-wrap gap-1 mb-2">
            {field.sportType === 'multiuso' && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                🏟️ Multi
              </span>
            )}
            {field.sportType !== 'multiuso' && (
              <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">
                {SPORT_ICONS[field.sportType] || '🏃'}
              </span>
            )}
          </div>
        )}

        {/* Features */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <DollarSign className="w-3 h-3 text-primary-600" />
              <span className="text-xs text-secondary-700">Precio:</span>
            </div>
            <span className="text-xs font-bold text-primary-600">S/ {field.pricePerHour}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-primary-600" />
              <span className="text-xs text-secondary-700">Horarios:</span>
            </div>
            <span className="text-xs text-secondary-600">Ver disponibilidad</span>
          </div>
        </div>

        {/* Comodidades incluidas - solo mostrar cantidad */}
        {field.amenities && Array.isArray(field.amenities) && field.amenities.length > 0 && (
          <div className="mb-2 p-1.5 bg-green-50 border border-green-200 rounded">
            <span className="text-green-800 text-xs font-medium flex items-center gap-1">
              ✓ {field.amenities.length} comodidad{field.amenities.length > 1 ? 'es' : ''}
            </span>
          </div>
        )}

        {/* Equipamiento disponible */}
        {field.equipment &&
          (field.equipment.hasJerseyRental ||
            field.equipment.hasBallRental ||
            field.equipment.hasConeRental) && (
            <div className="mb-2 p-1.5 bg-purple-50 border border-purple-200 rounded">
              <span className="text-purple-800 text-xs font-medium flex items-center gap-1">
                ✓ Equipamiento disponible
              </span>
            </div>
          )}

        {/* Click para ver más información */}
        <div className="text-center pt-1 border-t border-gray-100">
          <p className="text-xs text-primary-600 font-medium">Click para más info</p>
        </div>
      </div>
    </motion.div>
  )
}

export default FieldCard
