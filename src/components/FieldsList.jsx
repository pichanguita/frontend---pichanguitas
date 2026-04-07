import React, { useState, useEffect } from 'react'
import {
  MapPin,
  Clock,
  Activity,
  ChevronRight,
  Users,
  Shield,
  Car,
  Wifi,
  Star,
  Droplet,
  Lightbulb,
} from 'lucide-react'
import { motion } from 'framer-motion'
import useBookingStore from '../store/bookingStore'
import useAuthStore from '../store/authStore'
import { parseLocalDate } from '../utils/dateFormatters'

const FieldsList = ({ onFieldSelect }) => {
  const {
    availableFields,
    selectedDate,
    timeRanges,
    sportTypes,
    selectedSportTypes,
    selectedTimeRanges,
    existingReservations,
  } = useBookingStore()
  const { user } = useAuthStore()
  const [fieldsWithHours, setFieldsWithHours] = useState([])

  // Contar cuántas veces el cliente ha reservado cada cancha
  const getFieldReservationCount = (fieldId) => {
    if (!user?.id) return 0
    return existingReservations.filter(
      (reservation) =>
        reservation.fieldId === fieldId &&
        reservation.customerId === user.id &&
        reservation.status !== 'cancelled'
    ).length
  }

  // Calcular horarios disponibles para cada cancha
  useEffect(() => {
    if (availableFields && availableFields.length > 0 && selectedDate) {
      const fieldsWithAvailability = availableFields.map((field) => {
        // Obtener el día de la semana
        const dayOfWeek = parseLocalDate(selectedDate)
          .toLocaleDateString('en-US', { weekday: 'long' })
          .toLowerCase()
        const schedule = field.schedule?.[dayOfWeek]

        if (!schedule?.isOpen) {
          return { ...field, availableHours: [] }
        }

        // Filtrar horarios disponibles basados en el rango seleccionado por el usuario
        const availableHours = timeRanges.filter((timeRange) => {
          // Primero verificar si está en el rango seleccionado por el usuario
          if (!selectedTimeRanges.includes(timeRange.id)) return false

          const startHour = parseInt(timeRange.startTime.split(':')[0])
          const openHour = parseInt(schedule.openTime.split(':')[0])
          const closeHour = parseInt(schedule.closeTime.split(':')[0]) || 24

          // Verificar si está dentro del horario de operación
          if (startHour < openHour || startHour >= closeHour) return false

          // Verificar si ya hay una reserva existente
          const hasReservation = existingReservations?.some(
            (reservation) =>
              reservation.fieldId === field.id &&
              reservation.date === selectedDate &&
              reservation.timeSlots?.includes(timeRange.id) &&
              reservation.status !== 'cancelled'
          )

          return !hasReservation
        })

        return { ...field, availableHours }
      })

      // FILTRAR SOLO LAS CANCHAS QUE TIENEN HORARIOS DISPONIBLES
      const onlyAvailable = fieldsWithAvailability.filter(
        (field) => field.availableHours && field.availableHours.length > 0
      )

      setFieldsWithHours(onlyAvailable)
    } else {
      setFieldsWithHours(availableFields || [])
    }
  }, [availableFields, selectedDate, timeRanges, existingReservations])

  const getSportIcon = (sportTypeId) => {
    const sport = sportTypes.find((s) => s.id === sportTypeId)
    return sport?.icon || '⚽'
  }

  const getSportName = (sportTypeId) => {
    const sport = sportTypes.find((s) => s.id === sportTypeId)
    return sport?.name || 'Deporte'
  }

  const getAmenityIcon = (amenity) => {
    const icons = {
      Estacionamiento: Car,
      Iluminación: '💡',
      Vestuarios: '🚿',
      'Césped sintético': '🌱',
      Tribunas: '🪑',
      Cafetería: '☕',
      WiFi: Wifi,
      Seguridad: Shield,
      Árbitro: '🏃',
    }
    return icons[amenity] || '✓'
  }

  // Mapear amenidades a íconos para mostrar en la imagen
  const getAmenityIconForImage = (amenity) => {
    const normalizedAmenity = amenity.toLowerCase()

    if (normalizedAmenity.includes('estacionamiento') || normalizedAmenity.includes('parking')) {
      return { Icon: Car, color: 'bg-blue-600', label: 'Estacionamiento' }
    }
    if (normalizedAmenity.includes('wifi')) {
      return { Icon: Wifi, color: 'bg-purple-600', label: 'WiFi' }
    }
    if (normalizedAmenity.includes('vestuario')) {
      return { Icon: Droplet, color: 'bg-cyan-600', label: 'Vestuarios' }
    }
    if (normalizedAmenity.includes('ducha')) {
      return { Icon: Droplet, color: 'bg-teal-600', label: 'Duchas' }
    }
    if (normalizedAmenity.includes('seguridad')) {
      return { Icon: Shield, color: 'bg-red-600', label: 'Seguridad' }
    }
    if (normalizedAmenity.includes('iluminación') || normalizedAmenity.includes('led')) {
      return { Icon: Lightbulb, color: 'bg-yellow-500', label: 'Iluminación' }
    }

    return null
  }

  // Obtener los principales servicios visuales de una cancha
  const getMainAmenities = (field) => {
    if (!field.amenities || !Array.isArray(field.amenities)) return []

    const amenitiesWithIcons = field.amenities
      .map((amenity) => getAmenityIconForImage(amenity))
      .filter((item) => item !== null)
      .slice(0, 4) // Máximo 4 íconos

    return amenitiesWithIcons
  }

  const formatDate = (date) => {
    return parseLocalDate(date).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  // Obtener nombres de los deportes seleccionados
  const getSelectedSportsNames = () => {
    if (!selectedSportTypes || selectedSportTypes.length === 0) return 'Sin deportes seleccionados'
    return selectedSportTypes.map((id) => getSportName(id)).join(', ')
  }

  return (
    <div className="space-y-4">
      {/* Header con información de búsqueda */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-primary-900">
              {getSelectedSportsNames()} -{' '}
              {selectedDate ? formatDate(selectedDate) : 'Fecha no seleccionada'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-primary-700">
              {fieldsWithHours?.length || 0} cancha{fieldsWithHours?.length !== 1 ? 's' : ''} con
              disponibilidad
            </span>
          </div>
        </div>
      </div>

      {/* Lista de canchas */}
      {!fieldsWithHours || fieldsWithHours.length === 0 ? (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-8 text-center">
          <p className="text-amber-800 text-lg font-semibold">
            No hay canchas con horarios disponibles
          </p>
          <p className="text-amber-600 mt-2">
            Todas las canchas de {getSelectedSportsNames()} están ocupadas para el{' '}
            {selectedDate ? formatDate(selectedDate) : 'día seleccionado'}.
          </p>
          <p className="text-amber-600 text-sm mt-3">
            Intenta cambiar la fecha o los deportes seleccionados.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {fieldsWithHours &&
            fieldsWithHours.map((field, index) => {
              const reservationCount = getFieldReservationCount(field.id)
              return (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border-2 border-secondary-200 hover:border-primary-300 transition-all duration-300 overflow-hidden group hover:shadow-lg"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Imagen de la cancha */}
                    <div className="lg:w-72 h-48 lg:h-auto relative overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200">
                      {field.image ? (
                        <img
                          src={field.image}
                          alt={field.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-6xl opacity-50">{getSportIcon(field.sportType)}</div>
                        </div>
                      )}

                      {/* Badge de historial de reservas */}
                      {reservationCount > 0 && (
                        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1.5 shadow-lg border-2 border-green-500">
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-bold text-gray-900">
                              {reservationCount} {reservationCount === 1 ? 'vez' : 'veces'}
                            </span>
                          </div>
                        </div>
                      )}

                      {field.status === 'maintenance' && (
                        <div className="absolute top-2 left-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          En mantenimiento
                        </div>
                      )}

                      {/* Amenities Icons on Image */}
                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                        {getMainAmenities(field).map((amenity, idx) => (
                          <div
                            key={idx}
                            className={`${amenity.color} text-white rounded-full p-2 shadow-lg backdrop-blur-sm bg-opacity-90 hover:bg-opacity-100 transition-all`}
                            title={amenity.label}
                          >
                            <amenity.Icon className="w-4 h-4" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Información de la cancha */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          {/* Nombre y ubicación */}
                          <h3 className="text-xl font-bold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                            {field.name}
                          </h3>
                          <div className="flex items-center gap-2 text-secondary-600 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{field.address}</span>
                          </div>

                          {/* Rating */}
                          {field.rating > 0 && (
                            <div className="flex items-center gap-1 mb-4">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(field.rating)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : i < field.rating
                                        ? 'fill-yellow-200 text-yellow-400'
                                        : 'text-gray-300'
                                  }`}
                                />
                              ))}
                              <span className="text-sm font-medium text-gray-700 ml-1">
                                {field.rating.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({field.totalReviews || 0}{' '}
                                {field.totalReviews === 1 ? 'reseña' : 'reseñas'})
                              </span>
                            </div>
                          )}

                          {/* Horarios disponibles */}
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-primary-600" />
                              <span className="text-sm font-semibold text-secondary-800">
                                Horarios disponibles:
                              </span>
                            </div>
                            {field.availableHours && field.availableHours.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {field.availableHours.slice(0, 8).map((hour) => (
                                  <span
                                    key={hour.id}
                                    className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200"
                                  >
                                    {hour.label}
                                  </span>
                                ))}
                                {field.availableHours.length > 8 && (
                                  <span className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg border border-primary-200">
                                    +{field.availableHours.length - 8} más
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg inline-block">
                                Sin horarios disponibles para esta fecha
                              </div>
                            )}
                          </div>

                          {/* Comodidades */}
                          {field.amenities && field.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {field.amenities.slice(0, 4).map((amenity, idx) => {
                                const Icon = getAmenityIcon(amenity)
                                return (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full"
                                  >
                                    {typeof Icon === 'string' ? (
                                      <span>{Icon}</span>
                                    ) : (
                                      <Icon className="w-3 h-3" />
                                    )}
                                    {amenity}
                                  </span>
                                )
                              })}
                              {field.amenities.length > 4 && (
                                <span className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-600 text-xs font-medium rounded-full">
                                  +{field.amenities.length - 4} más
                                </span>
                              )}
                            </div>
                          )}

                          {/* Información adicional */}
                          <div className="flex items-center gap-4 text-sm text-secondary-600">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{field.capacity || '10'} jugadores</span>
                            </div>
                            {field.fieldType && (
                              <span className="text-xs px-2 py-1 bg-secondary-100 rounded-full">
                                {field.fieldType}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Precio y botón de selección */}
                        <div className="lg:text-right space-y-3">
                          <div>
                            <div className="text-lg text-secondary-600">Desde</div>
                            <div className="text-2xl font-bold text-primary-600">
                              S/ {field.pricePerHour}/hora
                            </div>
                            {field.availableHours && field.availableHours.length > 0 && (
                              <div className="text-xs text-green-600 mt-1">
                                {field.availableHours.length} horario
                                {field.availableHours.length !== 1 ? 's' : ''} disponible
                                {field.availableHours.length !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => onFieldSelect(field)}
                            disabled={
                              field.status === 'maintenance' ||
                              !field.availableHours ||
                              field.availableHours.length === 0
                            }
                            className={`
                          px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 w-full lg:w-auto justify-center
                          ${
                            field.status === 'maintenance' ||
                            !field.availableHours ||
                            field.availableHours.length === 0
                              ? 'bg-secondary-200 text-secondary-500 cursor-not-allowed'
                              : 'bg-primary-600 hover:bg-primary-700 text-white hover:scale-105 hover:shadow-lg'
                          }
                        `}
                          >
                            {field.availableHours && field.availableHours.length > 0
                              ? 'Seleccionar'
                              : 'No disponible'}
                            {field.availableHours && field.availableHours.length > 0 && (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
        </div>
      )}
    </div>
  )
}

export default FieldsList
