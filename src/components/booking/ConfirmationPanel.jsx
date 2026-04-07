import React from 'react'
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  Image,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Phone,
  Gift,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

/**
 * ConfirmationPanel - Componente de Confirmación de Reserva (Paso 3)
 *
 * Componente "controlled" puro que renderiza:
 * - Resumen de la cancha seleccionada
 * - Mapa de ubicación
 * - Carrusel de imágenes grande
 * - Información detallada (superficie, capacidad)
 * - Grid de amenidades
 * - Cálculo de precio total
 * - Input de teléfono
 * - Botón de confirmación
 *
 * TODO el estado y lógica de negocio permanecen en el padre (BookingFlow).
 */

const ConfirmationPanel = ({
  // Datos de la reserva
  selectedFieldForReservation,
  selectedTimeRanges,
  timeRanges,
  selectedDate,
  // Estados
  confirmationImageIndex,
  phoneNumber,
  user,
  adminCustomers,
  selectedCustomer,
  // Autenticación del cliente
  isClientAuthenticated = false, // Si es un cliente autenticado (no admin)
  // Funciones helper
  getSportImages,
  getMainAmenities,
  calculatePriceWithDiscount,
  canConfirmReservation,
  // Handlers
  onChangeConfirmationImage,
  onConfirmationImageIndexChange,
  onPhoneNumberChange,
  onCustomerSelect,
  onConfirmReservation,
  // Horas gratis
  freeHoursAvailable = 0,
}) => {
  if (!selectedFieldForReservation) return null

  const sportType =
    selectedFieldForReservation.sportTypes?.[0] ||
    selectedFieldForReservation.sportType ||
    'multiuso'
  const customImages = selectedFieldForReservation.customImages || []
  const confirmationImages = getSportImages(sportType, customImages)
  const hasMultipleImages = confirmationImages.length > 1

  return (
    <div className="lg:col-span-12 p-6">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-secondary-900 mb-6 text-center">
          ✅ Confirmar Reserva
        </h3>

        <div className="space-y-4">
          {/* Tarjeta compacta de información principal */}
          <div className="bg-white rounded-xl p-6 border-2 border-primary-200 shadow-2xl">
            {/* Nombre de la cancha grande */}
            <h2 className="text-3xl font-black text-secondary-900 mb-4">
              {selectedFieldForReservation.name}
            </h2>

            {/* Precio por hora */}
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5" style={{ color: '#ffd500' }} />
              <span className="text-xl font-bold text-primary-900">
                S/ {selectedFieldForReservation.pricePerHour}
              </span>
              <span className="text-secondary-600">por hora</span>
            </div>

            {/* Rango de horarios (texto simple) */}
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5" style={{ color: '#ffd500' }} />
              <span className="text-lg font-medium text-secondary-900">
                {(() => {
                  if (selectedTimeRanges.length === 0) return 'Sin horarios'
                  const firstRange = timeRanges.find((tr) => tr.id === selectedTimeRanges[0])
                  const lastRange = timeRanges.find(
                    (tr) => tr.id === selectedTimeRanges[selectedTimeRanges.length - 1]
                  )
                  if (!firstRange || !lastRange) return ''
                  return `${firstRange.startTime} - ${lastRange.endTime}`
                })()}
              </span>
              <span className="text-secondary-600">
                ({selectedTimeRanges.length} {selectedTimeRanges.length === 1 ? 'hora' : 'horas'})
              </span>
            </div>

            {/* Dirección */}
            <div className="flex items-start gap-2 mb-4">
              <MapPin className="w-5 h-5 mt-0.5" style={{ color: '#ffd500' }} />
              <span className="text-secondary-700">{selectedFieldForReservation.address}</span>
            </div>

            {/* Mapa de ubicación */}
            <div
              className="mb-4 bg-white rounded-xl border-2 border-primary-200 shadow-lg"
              style={{ overflow: 'hidden', isolation: 'isolate' }}
            >
              <div className="p-3 bg-primary-50 border-b border-primary-200">
                <h5 className="font-bold text-primary-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-primary-600" />
                  Ubicación de la Cancha
                </h5>
              </div>
              <div
                style={{
                  position: 'relative',
                  height: '300px',
                  width: '100%',
                  overflow: 'hidden',
                  backgroundColor: '#f3f4f6',
                  isolation: 'isolate',
                  contain: 'layout style paint',
                }}
              >
                <MapContainer
                  center={selectedFieldForReservation.coordinates || [-13.6343, -72.8748]}
                  zoom={15}
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
                  <Marker
                    position={selectedFieldForReservation.coordinates || [-13.6343, -72.8748]}
                    icon={L.icon({
                      iconUrl:
                        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                      shadowUrl:
                        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowSize: [41, 41],
                    })}
                  >
                    <Popup>
                      <div className="text-center p-2">
                        <h6 className="font-bold text-base mb-2">
                          {selectedFieldForReservation.name}
                        </h6>
                        <p className="text-xs text-secondary-600 mb-2">
                          {selectedFieldForReservation.address}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-bold text-primary-600">
                            S/ {selectedFieldForReservation.pricePerHour}
                          </span>
                          <span className="text-xs text-secondary-500">por hora</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* Galería de imágenes con carrusel */}
            <div className="mb-4 pb-4 border-b border-secondary-200">
              {/* Carrusel de imágenes grande */}
              <div
                className="relative h-64 rounded-xl overflow-hidden mb-4"
                style={{ backgroundColor: '#0a2424' }}
              >
                <img
                  src={confirmationImages[confirmationImageIndex]}
                  alt={selectedFieldForReservation.name}
                  className="w-full h-full object-cover"
                />

                {/* Controles de carrusel - Solo si hay más de 1 imagen */}
                {hasMultipleImages && (
                  <>
                    {/* Botón Anterior */}
                    <button
                      onClick={() => onChangeConfirmationImage('prev', confirmationImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                      style={{ backgroundColor: 'rgba(255, 213, 0, 0.95)' }}
                    >
                      <ChevronLeft className="w-6 h-6" style={{ color: '#0a2424' }} />
                    </button>

                    {/* Botón Siguiente */}
                    <button
                      onClick={() => onChangeConfirmationImage('next', confirmationImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                      style={{ backgroundColor: 'rgba(255, 213, 0, 0.95)' }}
                    >
                      <ChevronRight className="w-6 h-6" style={{ color: '#0a2424' }} />
                    </button>

                    {/* Indicadores de imagen (dots) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {confirmationImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => onConfirmationImageIndexChange(idx)}
                          className="w-2.5 h-2.5 rounded-full transition-all hover:scale-125"
                          style={{
                            backgroundColor:
                              idx === confirmationImageIndex
                                ? '#ffd500'
                                : 'rgba(255, 255, 255, 0.6)',
                          }}
                        />
                      ))}
                    </div>

                    {/* Contador de imágenes */}
                    <div
                      className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg"
                      style={{ backgroundColor: 'rgba(10, 36, 36, 0.9)', color: '#ffd500' }}
                    >
                      <Image className="w-4 h-4 inline mr-1" />
                      {confirmationImageIndex + 1}/{confirmationImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Información de la cancha */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold text-secondary-900 text-lg">
                    {selectedFieldForReservation.name}
                  </p>
                  <p className="text-sm text-secondary-600">
                    {selectedFieldForReservation.surface === 'grass'
                      ? 'Césped Natural'
                      : selectedFieldForReservation.surface === 'artificial'
                        ? 'Césped Sintético'
                        : selectedFieldForReservation.surface === 'concrete'
                          ? 'Concreto'
                          : 'Mixta'}
                  </p>
                  <p className="text-sm text-secondary-600">
                    Cap: {selectedFieldForReservation.capacity || '10-12'} jugadores
                  </p>
                </div>
              </div>
            </div>

            {/* Amenidades/Beneficios de la cancha */}
            {getMainAmenities(selectedFieldForReservation).length > 0 && (
              <div className="mb-4 pb-4 border-b border-secondary-200">
                <h5 className="text-sm font-bold text-secondary-900 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" style={{ color: '#ffd500' }} />
                  Beneficios Incluidos
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {getMainAmenities(selectedFieldForReservation).map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-secondary-50 border border-secondary-200"
                    >
                      <div className={`${amenity.color} text-white rounded-full p-2 flex-shrink-0`}>
                        <amenity.Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-secondary-900">
                        {amenity.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alquiler de Equipamiento disponible */}
            {selectedFieldForReservation.equipment &&
              (selectedFieldForReservation.equipment.hasJerseyRental ||
                selectedFieldForReservation.equipment.hasBallRental ||
                selectedFieldForReservation.equipment.hasConeRental) && (
                <div className="mb-4 pb-4 border-b border-secondary-200">
                  <h5 className="text-sm font-bold text-secondary-900 mb-3">
                    Equipamiento Disponible
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedFieldForReservation.equipment.hasJerseyRental && (
                      <div className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded-lg">
                        <span className="text-xs font-medium text-purple-800">Chalecos</span>
                        {selectedFieldForReservation.equipment.jerseyPrice > 0 && (
                          <span className="text-xs font-semibold text-purple-700">
                            S/ {parseFloat(selectedFieldForReservation.equipment.jerseyPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                    {selectedFieldForReservation.equipment.hasBallRental && (
                      <div className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded-lg">
                        <span className="text-xs font-medium text-purple-800">Pelotas</span>
                        {selectedFieldForReservation.equipment.ballPrice > 0 && (
                          <span className="text-xs font-semibold text-purple-700">
                            S/ {parseFloat(selectedFieldForReservation.equipment.ballPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                    {selectedFieldForReservation.equipment.hasConeRental && (
                      <div className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded-lg">
                        <span className="text-xs font-medium text-purple-800">Conos</span>
                        {selectedFieldForReservation.equipment.conePrice > 0 && (
                          <span className="text-xs font-semibold text-purple-700">
                            S/ {parseFloat(selectedFieldForReservation.equipment.conePrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Total a pagar destacado */}
            <div className="bg-primary-50 rounded-lg p-4 mb-4">
              {(() => {
                const priceInfo = calculatePriceWithDiscount(
                  selectedFieldForReservation,
                  selectedDate,
                  selectedTimeRanges
                )

                // Calcular descuento por horas gratis
                const hoursSelected = selectedTimeRanges.length
                const freeHoursToApply = Math.min(freeHoursAvailable, hoursSelected)
                const pricePerHour = selectedFieldForReservation.pricePerHour || 0
                const freeHoursDiscount = freeHoursToApply * pricePerHour
                const finalPriceWithFreeHours = Math.max(
                  0,
                  priceInfo.finalPrice - freeHoursDiscount
                )

                return (
                  <div>
                    {/* Mostrar banner de horas gratis si aplica */}
                    {freeHoursAvailable > 0 && (
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-3 mb-3 flex items-center gap-3">
                        <Gift className="w-6 h-6" />
                        <div>
                          <p className="font-bold">
                            ¡Usando {freeHoursToApply} hora{freeHoursToApply > 1 ? 's' : ''} gratis!
                          </p>
                          <p className="text-sm text-white/80">
                            Descuento: S/ {freeHoursDiscount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Desglose del precio */}
                    {freeHoursAvailable > 0 && (
                      <div className="space-y-1 mb-3 text-sm">
                        <div className="flex justify-between text-secondary-600">
                          <span>
                            Subtotal ({hoursSelected} hora{hoursSelected > 1 ? 's' : ''}):
                          </span>
                          <span>S/ {priceInfo.finalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-medium">
                          <span>Horas gratis (-{freeHoursToApply}h):</span>
                          <span>- S/ {freeHoursDiscount.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-primary-700">Total a pagar:</span>
                      <span className="text-3xl font-black text-primary-900">
                        S/ {finalPriceWithFreeHours.toFixed(2)}
                      </span>
                    </div>
                    {priceInfo.discount > 0 && !freeHoursAvailable && (
                      <div className="mt-2 text-sm text-amber-700 font-medium">
                        ¡Ahorraste S/ {priceInfo.discount.toFixed(2)}!
                      </div>
                    )}
                    {freeHoursAvailable > 0 && finalPriceWithFreeHours === 0 && (
                      <div className="mt-2 text-sm text-green-600 font-bold">
                        ¡Esta reserva es GRATIS con tus horas acumuladas!
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Combobox de clientes existentes - Solo para admins */}
            {user && user.role === 'admin' && adminCustomers.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-bold text-secondary-900 mb-2 block flex items-center gap-2">
                  <UserCircle className="w-4 h-4" style={{ color: '#ffd500' }} />
                  Seleccionar cliente:
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => onCustomerSelect(e.target.value)}
                  className="w-full px-4 py-3 text-lg border-2 border-secondary-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Nuevo cliente</option>
                  {adminCustomers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phoneNumber}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-secondary-500 mt-1">
                  {selectedCustomer
                    ? 'Cliente seleccionado. Puedes modificar el teléfono si es necesario.'
                    : 'Selecciona un cliente existente o ingresa un nuevo número.'}
                </p>
              </div>
            )}

            {/* Input de teléfono */}
            <div className="mb-4">
              <label className="text-sm font-bold text-secondary-900 mb-2 block flex items-center gap-2">
                <Phone className="w-4 h-4" style={{ color: '#ffd500' }} />
                {user && user.role === 'admin'
                  ? 'Número de teléfono del cliente:'
                  : 'Tu número de teléfono:'}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  // Solo permitir cambios si NO es un cliente autenticado
                  if (!isClientAuthenticated) {
                    const value = e.target.value.replace(/\D/g, '')
                    if (value.length <= 9) {
                      onPhoneNumberChange(value)
                    }
                  }
                }}
                placeholder="999888777"
                className={`w-full px-4 py-3 text-lg border-2 rounded-xl transition-colors ${
                  isClientAuthenticated
                    ? 'bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed'
                    : 'border-secondary-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                }`}
                maxLength="9"
                disabled={isClientAuthenticated}
                readOnly={isClientAuthenticated}
              />
              <p className="text-xs text-secondary-500 mt-1">
                {isClientAuthenticated
                  ? '✓ Teléfono de tu cuenta (no editable)'
                  : 'Debe comenzar con 9 y tener 9 dígitos'}
              </p>
            </div>

            {/* Botón amarillo grande */}
            <button
              onClick={onConfirmReservation}
              disabled={!canConfirmReservation}
              className="w-full py-5 rounded-3xl font-bold text-xl transition-all shadow-lg"
              style={{
                backgroundColor: canConfirmReservation ? '#ffd500' : '#d1d5db',
                color: canConfirmReservation ? '#0a2424' : '#9ca3af',
                cursor: canConfirmReservation ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={(e) => {
                if (canConfirmReservation) {
                  e.currentTarget.style.backgroundColor = '#ffc107'
                }
              }}
              onMouseLeave={(e) => {
                if (canConfirmReservation) {
                  e.currentTarget.style.backgroundColor = '#ffd500'
                }
              }}
            >
              {canConfirmReservation ? 'Confirmar Reserva' : 'Completa los datos'}
            </button>

            {/* Mensaje de confirmación */}
            <p className="text-sm text-center text-secondary-600 mt-3">
              Recibirás un mensaje de confirmación en tu celular
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationPanel
