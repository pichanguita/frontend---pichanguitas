import React, { useState, useEffect } from 'react'
import {
  X,
  MapPin,
  Phone,
  DollarSign,
  Clock,
  Users,
  Star,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchImagesByField } from '../services/fieldImages/fieldImagesService'
import { getToken, API_CONFIG } from '../config/api.config'

const FieldDetailsModal = ({ isOpen, onClose, field, onSelectField }) => {
  const [fieldImages, setFieldImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoadingImages, setIsLoadingImages] = useState(false)

  // Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => document.removeEventListener('keydown', handleEscKey)
  }, [isOpen, onClose])

  // Cargar imágenes desde la base de datos
  useEffect(() => {
    const loadFieldImages = async () => {
      if (isOpen && field) {
        setIsLoadingImages(true)
        try {
          // Priorizar customImages si ya están disponibles (vienen del transformador)
          if (field.customImages && field.customImages.length > 0) {
            setFieldImages(field.customImages)
            setCurrentImageIndex(0)
            setIsLoadingImages(false)
            return
          }

          // Si no hay customImages, cargar desde la API
          const token = getToken()
          const images = await fetchImagesByField(field.id, token)

          // Ordenar por order_index y extraer URLs
          const imageUrls = images
            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            .map((img) => {
              // Si ya es URL absoluta (Wasabi u otra), retornar directamente
              if (img.image_url.startsWith('http://') || img.image_url.startsWith('https://')) {
                return img.image_url
              }
              // Si es ruta relativa local, agregar BASE_URL
              if (img.image_url.startsWith('/')) {
                return `${API_CONFIG.BASE_URL}${img.image_url}`
              }
              return img.image_url
            })

          setFieldImages(
            imageUrls.length > 0 ? imageUrls : [field.image || '/images/default-field.jpg']
          )
          setCurrentImageIndex(0)
        } catch (error) {
          console.error('Error al cargar imágenes:', error)
          // Fallback a imagen por defecto
          setFieldImages([field.image || '/images/default-field.jpg'])
        } finally {
          setIsLoadingImages(false)
        }
      }
    }

    loadFieldImages()
  }, [isOpen, field])

  // Navegación del carrusel
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? fieldImages.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === fieldImages.length - 1 ? 0 : prev + 1))
  }

  if (!isOpen || !field) return null

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-100'
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100'
      case 'closed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Disponible'
      case 'maintenance':
        return 'En Mantenimiento'
      case 'closed':
        return 'Cerrado'
      default:
        return 'Desconocido'
    }
  }

  const getDayName = (day) => {
    const days = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo',
    }
    return days[day] || day
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{field.name}</h2>
              <p className="text-gray-600 mt-1">Detalles completos de la cancha</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información General */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                  Información General
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estado:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(field.status)}`}
                    >
                      {getStatusText(field.status)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="font-medium text-gray-900">{field.location}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Departamento:</span>
                    <span className="font-medium text-gray-900">{field.departamento}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Provincia:</span>
                    <span className="font-medium text-gray-900">{field.provincia}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Distrito:</span>
                    <span className="font-medium text-gray-900">{field.distrito}</span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Dirección:</span>
                    <span className="font-medium text-gray-900 text-right">{field.address}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      Teléfono:
                    </span>
                    <span className="font-medium text-gray-900">{field.phone}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Precio por hora:
                    </span>
                    <span className="font-bold text-primary-600 text-lg">
                      S/ {field.price_per_hour || field.pricePerHour || 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Capacidad:
                    </span>
                    <span className="font-medium text-gray-900">
                      {field.capacity || 'No especificado'} personas
                    </span>
                  </div>

                  {((field.coordinates && field.coordinates.length === 2) ||
                    (field.latitude && field.longitude)) && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Coordenadas:</span>
                      <a
                        href={`https://www.google.com/maps?q=${field.latitude || field.coordinates[1]},${field.longitude || field.coordinates[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        title="Ver en Google Maps"
                      >
                        📍 {field.latitude || field.coordinates[1]},{' '}
                        {field.longitude || field.coordinates[0]}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Precios Especiales */}
              {field.specialPricing && field.specialPricing.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
                    Precios Especiales
                  </h3>
                  <div className="space-y-3">
                    {field.specialPricing.map((pricing) => (
                      <div
                        key={pricing.id}
                        className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-green-800 mb-1">{pricing.name}</h4>
                            {pricing.description && (
                              <p className="text-sm text-green-700 mb-2">{pricing.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-xl font-bold text-green-600">
                              {pricing.discountType === 'percentage'
                                ? `${pricing.discountValue}% OFF`
                                : `S/ ${pricing.discountValue} OFF`}
                            </span>
                            <span className="text-sm text-gray-500 block">descuento</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {/* Horarios */}
                          {pricing.timeSlots && pricing.timeSlots.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs font-medium text-gray-600 mr-2">
                                Horarios:
                              </span>
                              {pricing.timeSlots.map((timeSlot, index) => (
                                <span
                                  key={index}
                                  className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                                >
                                  ⏰ {timeSlot}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Días */}
                          {pricing.daysOfWeek && pricing.daysOfWeek.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs font-medium text-gray-600 mr-2">Días:</span>
                              {pricing.daysOfWeek.map((day, index) => {
                                const dayNames = {
                                  monday: 'Lun',
                                  tuesday: 'Mar',
                                  wednesday: 'Mié',
                                  thursday: 'Jue',
                                  friday: 'Vie',
                                  saturday: 'Sáb',
                                  sunday: 'Dom',
                                }
                                return (
                                  <span
                                    key={index}
                                    className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                                  >
                                    📅 {dayNames[day] || day}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {field.specialPricing.length === 0 && (
                    <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No hay precios especiales activos</p>
                    </div>
                  )}
                </div>
              )}

              {/* Comodidades */}
              {field.amenities && field.amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-primary-600" />
                    Comodidades
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {field.amenities.map((amenity, index) => {
                      // Manejar tanto strings como objetos {id, name, isAvailable}
                      const amenityName =
                        typeof amenity === 'string' ? amenity : amenity?.name || 'Comodidad'
                      return (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full"
                        >
                          ✓ {amenityName}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Reglas */}
              {field.rules && field.rules.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-primary-600" />
                    Reglas
                  </h3>
                  <div className="space-y-2">
                    {field.rules.map((rule, index) => {
                      // Manejar tanto strings como objetos
                      const ruleText =
                        typeof rule === 'string' ? rule : rule?.name || rule?.rule || 'Regla'
                      return (
                        <div key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          <span className="text-gray-700 text-sm">{ruleText}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Horarios y Galería de Imágenes */}
            <div className="space-y-6">
              {/* Galería de Imágenes con Carrusel */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-primary-600" />
                  Galería de Imágenes
                  {fieldImages.length > 1 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({currentImageIndex + 1}/{fieldImages.length})
                    </span>
                  )}
                </h3>

                <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-100">
                  {isLoadingImages ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                  ) : (
                    <>
                      {/* Imagen Actual */}
                      <img
                        src={fieldImages[currentImageIndex]}
                        alt={`${field.name} - Imagen ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-300"
                        onError={(e) => {
                          e.target.src = '/images/default-field.jpg'
                        }}
                      />

                      {/* Controles de Navegación - Solo si hay más de 1 imagen */}
                      {fieldImages.length > 1 && (
                        <>
                          {/* Botón Anterior */}
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
                            aria-label="Imagen anterior"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>

                          {/* Botón Siguiente */}
                          <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110"
                            aria-label="Imagen siguiente"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>

                          {/* Indicadores de Posición (Dots) */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                            {fieldImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                  index === currentImageIndex
                                    ? 'bg-white w-6'
                                    : 'bg-white/50 hover:bg-white/75'
                                }`}
                                aria-label={`Ir a imagen ${index + 1}`}
                              />
                            ))}
                          </div>

                          {/* Contador de Imágenes */}
                          <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {currentImageIndex + 1} / {fieldImages.length}
                          </div>
                        </>
                      )}

                      {/* Indicador de Imagen Única */}
                      {fieldImages.length === 1 && (
                        <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium">
                          Imagen única
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Miniaturas (Thumbnails) - Solo si hay más de 1 imagen */}
                {fieldImages.length > 1 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {fieldImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`aspect-video overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                          index === currentImageIndex
                            ? 'border-primary-600 ring-2 ring-primary-200'
                            : 'border-gray-300 hover:border-primary-400 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/default-field.jpg'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Horarios */}
              {field.schedule && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-primary-600" />
                    Horarios de Atención
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(field.schedule).map(([day, schedule]) => (
                      <div
                        key={day}
                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <span className="font-medium text-gray-700">{getDayName(day)}</span>
                        <span
                          className={`text-sm ${schedule.isOpen ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {schedule.isOpen
                            ? `${schedule.openTime} - ${schedule.closeTime}`
                            : 'Cerrado'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medidas del Campo */}
              {field.dimensions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    📐 Medidas del Campo
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Largo:</span>
                      <span className="font-semibold text-blue-900">{field.dimensions.length} m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ancho:</span>
                      <span className="font-semibold text-blue-900">{field.dimensions.width} m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Área Total:</span>
                      <span className="font-semibold text-blue-900">{field.dimensions.area} m²</span>
                    </div>
                    {field.dimensions.goalSize && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tamaño de Arco:</span>
                        <span className="font-semibold text-blue-900">
                          {field.dimensions.goalSize}
                        </span>
                      </div>
                    )}
                    {field.dimensions.basketHeight && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Altura de Canasta:</span>
                        <span className="font-semibold text-blue-900">
                          {field.dimensions.basketHeight}
                        </span>
                      </div>
                    )}
                    {field.dimensions.netHeight && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Altura de Red:</span>
                        <span className="font-semibold text-blue-900">
                          {field.dimensions.netHeight}
                        </span>
                      </div>
                    )}
                    {field.dimensions.courtType && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600">Tipo de Cancha:</span>
                        <span className="font-semibold text-blue-900 text-right">
                          {field.dimensions.courtType}
                        </span>
                      </div>
                    )}
                    {field.dimensions.surfaceType && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Superficie:</span>
                        <span className="font-semibold text-blue-900">
                          {field.dimensions.surfaceType}
                        </span>
                      </div>
                    )}
                    {field.dimensions.tribuneCapacity && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Capacidad Tribuna:</span>
                        <span className="font-semibold text-blue-900">
                          {field.dimensions.tribuneCapacity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información Técnica */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Técnica</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tipo de Campo:</span>
                    <span className="font-medium text-gray-900">
                      {field.field_type || field.fieldType || 'No especificado'}
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">
                      Deporte{field.is_multi_sport || field.isMultiSport ? 's' : ''}:
                    </span>
                    <div className="text-right">
                      {(() => {
                        // Obtener array de nombres de deportes desde sportNames (backend transformado)
                        const sportsArray = field.sportNames || field.sport_names || []
                        const isMulti = field.is_multi_sport || field.isMultiSport || false

                        if (Array.isArray(sportsArray) && sportsArray.length > 0) {
                          return (
                            <div className="space-y-1">
                              {isMulti && (
                                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full mb-2">
                                  🏟️ Cancha Multideportiva
                                </span>
                              )}
                              <div className="flex flex-wrap gap-1 justify-end">
                                {sportsArray.map((sport, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                                  >
                                    ⚽ {sport}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )
                        } else {
                          // Fallback: mostrar sport_type_name si existe
                          const singleSport =
                            field.sport_type_name || field.sportTypeName || 'No especificado'
                          return <span className="font-medium text-gray-900">{singleSport}</span>
                        }
                      })()}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estado Activo:</span>
                    <span
                      className={`font-medium ${(field.is_active ?? field.isActive) ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {(field.is_active ?? field.isActive) ? 'Sí' : 'No'}
                    </span>
                  </div>

                  {field.createdAt && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Creado:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(field.createdAt).toLocaleDateString('es-PE')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 flex justify-between">
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors duration-200"
            >
              Cerrar
            </button>

            {onSelectField && field.status === 'available' && (
              <button
                onClick={() => onSelectField(field)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors duration-200"
              >
                Seleccionar esta cancha
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default FieldDetailsModal
