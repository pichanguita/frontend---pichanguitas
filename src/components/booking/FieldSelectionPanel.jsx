import React from 'react'
import { MapPin, ChevronLeft, ChevronRight, Image, CheckCircle, AlertCircle } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { API_CONFIG } from '../../config/api.config'
import StarRating from '../common/StarRating'
import { FieldReviews } from '../reviews-public'

/**
 * FieldSelectionPanel - Componente de Selección de Canchas (Paso 2)
 *
 * Componente "controlled" puro que renderiza:
 * - Mapa con marcadores de canchas
 * - Grid de tarjetas de canchas con carruseles de imágenes
 * - Selector de horarios por cancha
 * - Botón de reserva
 *
 * TODO el estado y lógica de negocio permanecen en el padre (BookingFlow).
 */

const FieldSelectionPanel = ({
  // Estados y valores
  visibleFields,
  selectedFieldForReservation,
  showCancellationPolicies,
  currentImageIndex,
  selectedTimeRanges,
  isAuthenticated,
  // Datos
  timeRanges,
  // Funciones helper
  calculateSelectedTimeRanges,
  isTimeSlotAvailable,
  // Handlers
  onFieldSelect,
  onFieldClick,
  onToggleCancellationPolicies,
  onChangeFieldImage,
  onTimeRangeToggle,
  onNextStep,
  // Props adicionales para carrusel
  onImageIndexChange,
}) => {
  return (
    <div className="lg:col-span-12 p-6">
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-secondary-900 mb-6 text-center">
          🏟️ Canchas Disponibles ({visibleFields.length})
        </h3>

        {/* Mapa de Canchas Disponibles - Solo para usuarios registrados */}
        {isAuthenticated && visibleFields.length > 0 && (
          <div
            className="mb-8 bg-white rounded-xl border-2 border-primary-200 shadow-lg"
            style={{ overflow: 'hidden', isolation: 'isolate' }}
          >
            <div className="p-4 bg-primary-50 border-b border-primary-200">
              <h4 className="font-bold text-primary-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                Mapa de Ubicaciones
              </h4>
              <p className="text-sm text-primary-700 mt-1">
                Haz clic en los marcadores para ver detalles y seleccionar una cancha
              </p>
            </div>
            <div
              style={{
                position: 'relative',
                height: '384px',
                width: '100%',
                overflow: 'hidden',
                backgroundColor: '#f3f4f6',
                isolation: 'isolate',
                contain: 'layout style paint',
              }}
            >
              <MapContainer
                center={visibleFields[0]?.coordinates || [-13.6343, -72.8748]}
                zoom={13}
                style={{
                  height: '100%',
                  width: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1,
                }}
                zoomControl={true}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {visibleFields.map((field) => {
                  const isSelected = selectedFieldForReservation?.id === field.id

                  // Crear icono personalizado para cancha seleccionada
                  const customIcon = L.icon({
                    iconUrl: isSelected
                      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
                      : 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    shadowUrl:
                      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41],
                  })

                  return (
                    <Marker
                      key={field.id}
                      position={field.coordinates || [-13.6343, -72.8748]}
                      icon={customIcon}
                      eventHandlers={{
                        click: () => {
                          onFieldSelect(field)
                          // Scroll hacia la cancha en la lista
                          const element = document.getElementById(`field-card-${field.id}`)
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                          }
                        },
                      }}
                    >
                      <Popup>
                        <div className="text-center p-2">
                          <h6 className="font-bold text-base mb-2">{field.name}</h6>
                          <p className="text-xs text-secondary-600 mb-2">{field.address}</p>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="text-sm font-bold text-primary-600">
                              S/ {field.pricePerHour}
                            </span>
                            <span className="text-xs text-secondary-500">por hora</span>
                          </div>
                          {field.totalReviews > 0 && (
                            <div className="flex justify-center mb-3">
                              <StarRating rating={field.rating} showValue size={3} />
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onFieldSelect(field)
                              // Scroll hacia la cancha
                              const element = document.getElementById(`field-card-${field.id}`)
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              }
                            }}
                            className={`w-full px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                              isSelected
                                ? 'bg-green-600 text-white'
                                : 'bg-primary-600 text-white hover:bg-primary-700'
                            }`}
                          >
                            {isSelected ? '✓ Seleccionada' : 'Seleccionar'}
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Filtro de Políticas de Cancelación */}
        <div className="mb-6 p-4 bg-secondary-50 rounded-xl">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={showCancellationPolicies}
              onChange={(e) => onToggleCancellationPolicies(e.target.checked)}
              className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-base font-semibold text-secondary-900">
              📋 Mostrar política de cancelación
            </span>
          </label>
          <p className="text-sm text-secondary-600 ml-8 mt-1">
            Ver condiciones y tiempo de cancelación de cada cancha
          </p>
        </div>

        {visibleFields.length === 0 ? (
          <div className="text-center py-16 text-secondary-400">
            <MapPin className="w-16 h-16 mb-4 opacity-30 mx-auto" />
            <p className="text-lg font-medium">No hay canchas disponibles</p>
            <p className="text-sm mt-2">
              Puede deberse a horarios ocupados o a canchas cerradas en la fecha elegida. Prueba con
              otra fecha, horario o filtros.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleFields.map((field) => {
              const isSelected = selectedFieldForReservation?.id === field.id
              // Usar SOLO las imágenes reales de la cancha desde la BD
              const realImages = (field.images || [])
                .map((img) => {
                  if (!img) return null
                  // Si ya es URL absoluta, usarla directamente
                  if (img.startsWith('http://') || img.startsWith('https://')) return img
                  // Si es ruta relativa, agregar base URL
                  return `${API_CONFIG.BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`
                })
                .filter(Boolean)

              // Usar SOLO imágenes reales, si no hay usar placeholder
              const placeholderImage = 'https://placehold.co/600x400/1a1a2e/white?text=Sin+Imagen'
              const fieldImages = realImages.length > 0 ? realImages : [placeholderImage]
              const currentIndex = currentImageIndex[field.id] || 0
              const hasMultipleImages = fieldImages.length > 1

              return (
                <div
                  key={field.id}
                  id={`field-card-${field.id}`}
                  onClick={() => onFieldClick(field)}
                  className={`border-2 rounded-xl overflow-hidden cursor-pointer transition-all shadow-2xl ${
                    isSelected
                      ? 'border-primary-500'
                      : 'border-secondary-200 hover:border-primary-300'
                  }`}
                  style={{ backgroundColor: 'white' }}
                >
                  <div className="relative h-48" style={{ backgroundColor: '#0a2424' }}>
                    <img
                      src={fieldImages[currentIndex]}
                      alt={field.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Controles de carrusel - Solo si hay más de 1 imagen */}
                    {hasMultipleImages && (
                      <>
                        {/* Botón Anterior */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onChangeFieldImage(field.id, 'prev', fieldImages.length)
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: 'rgba(255, 213, 0, 0.9)' }}
                        >
                          <ChevronLeft className="w-5 h-5" style={{ color: '#0a2424' }} />
                        </button>

                        {/* Botón Siguiente */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onChangeFieldImage(field.id, 'next', fieldImages.length)
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                          style={{ backgroundColor: 'rgba(255, 213, 0, 0.9)' }}
                        >
                          <ChevronRight className="w-5 h-5" style={{ color: '#0a2424' }} />
                        </button>

                        {/* Indicadores de imagen (dots) */}
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {fieldImages.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation()
                                onImageIndexChange && onImageIndexChange(field.id, idx)
                              }}
                              className="w-2 h-2 rounded-full transition-all"
                              style={{
                                backgroundColor:
                                  idx === currentIndex ? '#ffd500' : 'rgba(255, 255, 255, 0.5)',
                              }}
                            />
                          ))}
                        </div>

                        {/* Contador de imágenes */}
                        <div
                          className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: 'rgba(10, 36, 36, 0.8)', color: '#ffd500' }}
                        >
                          <Image className="w-3 h-3 inline mr-1" />
                          {currentIndex + 1}/{fieldImages.length}
                        </div>
                      </>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="font-bold text-white text-lg mb-1">{field.name}</h4>
                        <p className="text-sm flex items-center" style={{ color: '#ffd500' }}>
                          <MapPin className="w-4 h-4 mr-1" />
                          {field.address}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div
                        className="rounded-lg px-4 py-2 shadow-lg"
                        style={{ backgroundColor: '#ffd500' }}
                      >
                        <p
                          className="text-2xl font-black tracking-tight"
                          style={{ color: '#0a2424' }}
                        >
                          S/ {field.pricePerHour}
                        </p>
                        <p className="text-xs font-bold uppercase" style={{ color: '#0a2424' }}>
                          por hora
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4" style={{ backgroundColor: 'white' }}>
                    {/* Rating Display (promedio derivado de reseñas visibles) */}
                    {field.totalReviews > 0 && (
                      <div className="mb-3">
                        <StarRating
                          rating={field.rating}
                          count={field.totalReviews}
                          showValue
                          size={5}
                        />
                      </div>
                    )}

                    {/* Lista de reseñas de la cancha (colapsable) */}
                    <FieldReviews
                      fieldId={field.id}
                      rating={field.rating}
                      totalReviews={field.totalReviews}
                      collapsible
                    />

                    {/* Indicador de adelanto requerido por la cancha */}
                    {(field.requiresAdvancePayment ?? field.requires_advance_payment) && (
                      <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                        <span className="text-xs font-medium text-orange-800">
                          Requiere adelanto
                          {(() => {
                            const amt =
                              parseFloat(
                                field.advancePaymentAmount ?? field.advance_payment_amount
                              ) || 0
                            return amt > 0 ? `: S/ ${amt.toFixed(2)} por hora` : ''
                          })()}
                        </span>
                      </div>
                    )}

                    {/* Alquiler de Equipamiento */}
                    {field.equipment &&
                      (field.equipment.hasJerseyRental ||
                        field.equipment.hasBallRental ||
                        field.equipment.hasConeRental) && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {field.equipment.hasJerseyRental && (
                            <span className="inline-flex items-center px-2 py-1 bg-purple-50 border border-purple-200 rounded-md text-xs text-purple-700">
                              Chalecos
                              {field.equipment.jerseyPrice > 0 &&
                                ` S/${parseFloat(field.equipment.jerseyPrice).toFixed(2)}`}
                            </span>
                          )}
                          {field.equipment.hasBallRental && (
                            <span className="inline-flex items-center px-2 py-1 bg-purple-50 border border-purple-200 rounded-md text-xs text-purple-700">
                              Pelotas
                              {field.equipment.ballPrice > 0 &&
                                ` S/${parseFloat(field.equipment.ballPrice).toFixed(2)}`}
                            </span>
                          )}
                          {field.equipment.hasConeRental && (
                            <span className="inline-flex items-center px-2 py-1 bg-purple-50 border border-purple-200 rounded-md text-xs text-purple-700">
                              Conos
                              {field.equipment.conePrice > 0 &&
                                ` S/${parseFloat(field.equipment.conePrice).toFixed(2)}`}
                            </span>
                          )}
                        </div>
                      )}

                    {/* Política de Cancelación - Solo si el filtro está activo */}
                    {showCancellationPolicies && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Política de Cancelación
                        </h5>
                        {field.cancellationPolicy?.allowCancellation ? (
                          <div className="text-sm text-blue-800 space-y-1">
                            <p>
                              ✅ <strong>Cancelación permitida</strong> hasta{' '}
                              <strong>
                                {field.cancellationPolicy.hoursBeforeEvent} horas antes
                              </strong>
                            </p>
                            <p>
                              💰 Reembolso:{' '}
                              <strong>{field.cancellationPolicy.refundPercentage}%</strong>
                              {field.cancellationPolicy.refundPercentage === 0 &&
                                ' (Sin reembolso)'}
                              {field.cancellationPolicy.refundPercentage === 100 &&
                                ' (Reembolso completo)'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-red-700">
                            ❌ <strong>No se permiten cancelaciones</strong>
                          </p>
                        )}
                      </div>
                    )}

                    {isSelected && (
                      <div className="mb-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
                        <p className="text-sm text-primary-700 font-bold flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Cancha seleccionada
                        </p>
                      </div>
                    )}

                    {/* Selección de horarios en cada tarjeta */}
                    {isSelected && (
                      <>
                        <p className="text-sm font-medium text-secondary-900 mb-3">
                          Selecciona tus horarios:
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {calculateSelectedTimeRanges().map((timeRangeId) => {
                            const timeRange = timeRanges.find((tr) => tr.id === timeRangeId)
                            const isAvailable = isTimeSlotAvailable(field, timeRangeId)
                            const isTimeSelected = selectedTimeRanges.includes(timeRangeId)

                            // Formatear hora
                            const formatTimeSlot = () => {
                              if (!timeRange) return ''
                              const startHour = parseInt(timeRange.startTime.split(':')[0])
                              const endHour = parseInt(timeRange.endTime.split(':')[0])
                              const endPeriod = endHour >= 12 ? 'p.m.' : 'a.m.'
                              const formatHour = (hour) =>
                                hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
                              return `${formatHour(startHour)}:00 - ${formatHour(endHour)}:00 ${endPeriod}`
                            }

                            return (
                              <button
                                key={timeRangeId}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (isAvailable) {
                                    onTimeRangeToggle(timeRangeId, selectedFieldForReservation)
                                  }
                                }}
                                disabled={!isAvailable}
                                className={`p-3 rounded-lg font-medium transition-all text-sm relative ${
                                  !isAvailable
                                    ? 'bg-red-100 border-2 border-red-300 cursor-not-allowed'
                                    : isTimeSelected
                                      ? 'bg-primary-600 text-white shadow-lg border-2 border-primary-600'
                                      : 'bg-white hover:bg-primary-50 text-secondary-700 border-2 border-secondary-200'
                                }`}
                              >
                                <span className={!isAvailable ? 'text-red-500' : ''}>
                                  {formatTimeSlot()}
                                </span>
                                {!isAvailable && (
                                  <span className="block text-xs text-red-600 font-bold mt-1">
                                    🔒 OCUPADO
                                  </span>
                                )}
                                {isAvailable && isTimeSelected && (
                                  <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                    ✓
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>

                        {/* Leyenda de colores */}
                        <div className="flex flex-wrap gap-3 text-xs mb-3 p-2 bg-gray-50 rounded-lg">
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-white border-2 border-secondary-200 rounded"></span>
                            Disponible
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-primary-600 rounded"></span>
                            Seleccionado
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 bg-red-100 border-2 border-red-300 rounded"></span>
                            Ocupado
                          </span>
                        </div>
                      </>
                    )}

                    {!isSelected && (
                      <>
                        <p className="text-sm mb-2 font-medium">
                          <span style={{ color: '#ffd500' }}>Horarios</span>{' '}
                          <span style={{ color: '#000000' }}>en tu rango:</span>
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {calculateSelectedTimeRanges()
                            .slice(0, 4)
                            .map((timeRangeId) => {
                              const timeRange = timeRanges.find((tr) => tr.id === timeRangeId)
                              const isAvailable = isTimeSlotAvailable(field, timeRangeId)
                              return (
                                <span
                                  key={timeRangeId}
                                  className={`px-3 py-2 rounded-lg text-sm font-bold ${
                                    isAvailable ? '' : 'line-through'
                                  }`}
                                  style={{
                                    backgroundColor: isAvailable ? '#ffd500' : '#fee2e2',
                                    color: isAvailable ? '#0a2424' : '#dc2626',
                                  }}
                                  title={isAvailable ? 'Disponible' : 'Ocupado'}
                                >
                                  {timeRange?.startTime}
                                  {!isAvailable && ' 🔒'}
                                </span>
                              )
                            })}
                          {calculateSelectedTimeRanges().length > 4 && (
                            <span
                              className="px-2 py-1 rounded text-xs"
                              style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
                            >
                              +{calculateSelectedTimeRanges().length - 4} más
                            </span>
                          )}
                        </div>
                        {/* Resumen rápido de disponibilidad */}
                        {(() => {
                          const allSlots = calculateSelectedTimeRanges()
                          const availableCount = allSlots.filter((id) =>
                            isTimeSlotAvailable(field, id)
                          ).length
                          const occupiedCount = allSlots.length - availableCount
                          return (
                            <p className="text-xs mb-2">
                              <span className="text-green-600 font-medium">
                                {availableCount} disponibles
                              </span>
                              {occupiedCount > 0 && (
                                <span className="text-red-500 font-medium">
                                  {' '}
                                  • {occupiedCount} ocupados
                                </span>
                              )}
                            </p>
                          )
                        })()}
                      </>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isSelected && selectedTimeRanges.length > 0) {
                          onNextStep()
                        } else {
                          onFieldSelect(field)
                        }
                      }}
                      className="w-full py-4 rounded-xl font-bold text-lg transition-all"
                      style={{
                        backgroundColor:
                          isSelected && selectedTimeRanges.length > 0
                            ? '#22c55e'
                            : isSelected
                              ? '#d1d5db'
                              : '#ffd500',
                        color:
                          isSelected && selectedTimeRanges.length > 0
                            ? '#ffffff'
                            : isSelected
                              ? '#9ca3af'
                              : '#0a2424',
                        cursor:
                          isSelected && selectedTimeRanges.length === 0 ? 'not-allowed' : 'pointer',
                      }}
                      disabled={isSelected && selectedTimeRanges.length === 0}
                    >
                      {isSelected && selectedTimeRanges.length > 0
                        ? '✓ Reservar'
                        : isSelected
                          ? 'Selecciona horarios'
                          : 'Seleccionar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FieldSelectionPanel
