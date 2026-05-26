import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import { DivIcon } from 'leaflet'
import { MapPin, Phone, Clock, DollarSign, CheckCircle, Wrench, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useBookingStore from '../store/bookingStore'
import 'leaflet/dist/leaflet.css'

// Custom map icon component
const createCustomIcon = (field) => {
  const isAvailable = field.status === 'available'
  const color = isAvailable ? '#22c55e' : '#f59e0b'

  return new DivIcon({
    html: `
      <div style="
        background: ${color}; 
        width: 32px; 
        height: 32px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      " class="custom-marker">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// Component to fit map bounds
const MapBounds = ({ fields }) => {
  const map = useMap()

  useEffect(() => {
    if (fields.length > 0) {
      const coordinates = fields.map((field) => field.coordinates)
      map.fitBounds(coordinates, { padding: [20, 20] })
    }
  }, [fields, map])

  return null
}

const FieldsMap = ({ onFieldSelect, onFieldDetails, selectedField }) => {
  const { availableFields } = useBookingStore()
  const [showFieldDetails, setShowFieldDetails] = useState(null)
  const [filteredFields, setFilteredFields] = useState([])

  // Initialize with available fields from store (already filtered)
  useEffect(() => {
    setFilteredFields(availableFields)
  }, [availableFields])

  // Center coordinates for Abancay, Apurimac (latitude, longitude)
  const abancayCenter = [-13.6339, -72.8814]

  const handleMarkerClick = (field) => {
    if (onFieldDetails) {
      onFieldDetails(field)
    } else {
      setShowFieldDetails(field)
    }
  }

  const handleSelectField = (field) => {
    onFieldSelect(field)
    setShowFieldDetails(null)
  }

  const getStatusBadge = (status) => {
    if (status === 'available') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Disponible
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Wrench className="w-3 h-3 mr-1" />
          Mantenimiento
        </span>
      )
    }
  }

  return (
    <div className="space-y-4">
      {/* Results count */}
      {filteredFields.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-center">
            No se encontraron canchas con los filtros seleccionados.
            <button
              onClick={() => window.location.reload()}
              className="ml-2 text-amber-900 font-semibold hover:underline"
            >
              Limpiar filtros
            </button>
          </p>
        </div>
      ) : (
        <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2">
          <p className="text-primary-800 text-sm font-medium">
            {filteredFields.length} cancha{filteredFields.length !== 1 ? 's' : ''} disponible
            {filteredFields.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Map Container */}
      <div className="relative">
        <div className="h-[500px] rounded-xl overflow-hidden shadow-custom border-2 border-secondary-200">
          <MapContainer
            center={abancayCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            className="leaflet-container"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <MapBounds fields={filteredFields} />

            {filteredFields.map((field) => (
              <Marker
                key={field.id}
                position={[field.coordinates[0], field.coordinates[1]]}
                icon={createCustomIcon(field)}
                eventHandlers={{
                  click: () => handleMarkerClick(field),
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-secondary-600">Disponible</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow"></div>
            <span className="text-secondary-600">Mantenimiento</span>
          </div>
        </div>
      </div>

      {/* Field Details Modal (only show if no external onFieldDetails handler) */}
      <AnimatePresence>
        {showFieldDetails && !onFieldDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-secondary-900">{showFieldDetails.name}</h3>
                <button
                  onClick={() => setShowFieldDetails(null)}
                  className="p-1 hover:bg-secondary-100 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-secondary-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center space-x-2">
                  {getStatusBadge(showFieldDetails.status)}
                </div>

                {/* Location */}
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-secondary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-secondary-900">{showFieldDetails.location}</p>
                    <p className="text-sm text-secondary-600">{showFieldDetails.address}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-secondary-500" />
                  <span className="text-secondary-700">{showFieldDetails.phone}</span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-secondary-500" />
                  <span className="text-lg font-semibold text-primary-600">
                    S/ {showFieldDetails.pricePerHour}/hora
                  </span>
                </div>

                {/* Hours */}
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-secondary-500" />
                  <span className="text-secondary-700">5:00 PM - 12:00 AM</span>
                </div>

                {/* Comodidades incluidas */}
                {showFieldDetails?.amenities && showFieldDetails.amenities.length > 0 && (
                  <div className="pt-3 border-t border-secondary-200">
                    <span className="text-secondary-600 text-sm font-medium block mb-2">
                      Comodidades incluidas:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {showFieldDetails.amenities.map((amenity) => (
                        <span
                          key={amenity.key}
                          className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
                        >
                          ✓ {amenity.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-2">
                  {showFieldDetails.status === 'available' ? (
                    <button
                      onClick={() => handleSelectField(showFieldDetails)}
                      className={`w-full py-3 rounded-xl font-semibold transition-colors duration-200 ${
                        selectedField?.id === showFieldDetails.id
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                          : 'bg-primary-600 hover:bg-primary-700 text-white'
                      }`}
                    >
                      {selectedField?.id === showFieldDetails.id
                        ? 'Cancha Seleccionada'
                        : 'Seleccionar Cancha'}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-secondary-200 text-secondary-500 py-3 rounded-xl font-semibold cursor-not-allowed"
                    >
                      No Disponible
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FieldsMap
