import React from 'react'
import { motion } from 'framer-motion'
import { X, MapPin } from 'lucide-react'
import { getFieldImage } from '../../data/fieldImages'
import StatusBadge from './StatusBadge'
import ModalBasicInfo from './modal/ModalBasicInfo'
import ModalLocation from './modal/ModalLocation'
import ModalAmenities from './modal/ModalAmenities'
import ModalSchedule from './modal/ModalSchedule'
import ModalDimensions from './modal/ModalDimensions'
import ModalRules from './modal/ModalRules'
import ModalEquipment from './modal/ModalEquipment'

const FieldDetailModal = ({ field, onClose }) => {
  if (!field) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header del modal */}
        <div className="relative">
          <img
            src={
              (field.customImages && field.customImages.length > 0 && field.customImages[0]) ||
              (field.images && field.images.length > 0 && field.images[0]) ||
              getFieldImage(field.sportType || 'multiuso', field.id)
            }
            alt={field.name}
            className="w-full h-64 object-cover rounded-t-2xl"
            loading="lazy"
            onError={(e) => {
              e.target.src = getFieldImage(field.sportType || 'multiuso', field.id)
              e.target.onerror = (e2) => {
                e2.target.src = '/maquetacion/CampoFutbol.png'
                e2.target.onerror = null
              }
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <div className="absolute bottom-4 left-4">
            <StatusBadge status={field.status} />
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">{field.name}</h2>

          <div className="flex items-center space-x-2 text-secondary-600 mb-4">
            <MapPin className="w-5 h-5" />
            <span>{field.location}</span>
          </div>

          {/* Información básica */}
          <ModalBasicInfo field={field} />

          {/* Ubicación y Mapa */}
          {field.coordinates && <ModalLocation field={field} />}

          {/* Comodidades */}
          {field.amenities && field.amenities.length > 0 && (
            <ModalAmenities amenities={field.amenities} />
          )}

          {/* Alquiler de Equipamiento */}
          <ModalEquipment equipment={field.equipment} />

          {/* Horarios */}
          {field.schedule && <ModalSchedule schedule={field.schedule} />}

          {/* Dimensiones */}
          {field.dimensions && <ModalDimensions dimensions={field.dimensions} />}

          {/* Reglas */}
          {field.rules && field.rules.length > 0 && <ModalRules rules={field.rules} />}
        </div>
      </motion.div>
    </div>
  )
}

export default FieldDetailModal
