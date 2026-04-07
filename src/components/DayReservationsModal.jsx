import React, { useState } from 'react'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
  AlertTriangle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useBookingStore from '../store/bookingStore'
import Swal from 'sweetalert2'

/**
 * Obtiene la fecha y hora actual en hora local de Perú
 * Funciona tanto en desarrollo local como en producción
 * @returns {Date} Fecha actual en hora local
 */
const getCurrentLocalDateTime = () => {
  // Crear fecha actual
  const now = new Date()

  // En producción (servidores UTC), ajustar a hora de Perú (UTC-5)
  // En desarrollo local, usar la hora del sistema
  // Esta implementación funciona en ambos casos porque toLocaleString
  // siempre devuelve la hora correcta para la zona horaria especificada
  const peruTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Lima' }))

  return peruTime
}

/**
 * Verifica si una reserva pendiente ya pasó su fecha/hora
 * @param {Object} reservation - Objeto de reserva
 * @returns {boolean} True si la reserva pendiente ya venció
 */
const isExpiredPendingReservation = (reservation) => {
  // Solo verificar reservas pendientes
  const status = reservation.status?.toLowerCase?.()?.trim() || ''
  if (status !== 'pending' && status !== 'pendiente') {
    return false
  }

  // Obtener fecha de la reserva
  const resDateStr = reservation.date ? reservation.date.split('T')[0] : null
  if (!resDateStr) return false

  // Obtener hora de inicio de la reserva
  const startTime = reservation.startTime || reservation.start_time
  if (!startTime) return false

  // Parsear la fecha de la reserva como fecha local
  const [year, month, day] = resDateStr.split('-').map(Number)
  const [hours, minutes] = startTime.split(':').map(Number)

  // Crear fecha/hora de inicio de la reserva en hora local
  const reservationStart = new Date(year, month - 1, day, hours, minutes || 0, 0, 0)

  // Obtener fecha/hora actual local
  const now = getCurrentLocalDateTime()

  // La reserva está vencida si la hora de INICIO ya pasó
  return reservationStart < now
}

const DayReservationsModal = ({ isOpen, onClose, date, fields }) => {
  const { cancelReservationAPI, existingReservations } = useBookingStore()
  const [cancellingId, setCancellingId] = useState(null)

  // Derivar reservas del día directamente del store para reactividad automática
  const reservations = React.useMemo(() => {
    if (!date) return []
    const d = new Date(date)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return existingReservations.filter((r) => {
      if (!r.date) return false
      return r.date.split('T')[0] === dateStr
    })
  }, [date, existingReservations])

  if (!isOpen) return null

  const getFieldName = (reservation) => {
    // Primero intentar usar fieldName de la reserva (viene del backend)
    if (reservation.fieldName || reservation.field_name) {
      return reservation.fieldName || reservation.field_name
    }
    // Si no, buscar en el array de fields
    const fieldId = reservation.fieldId || reservation.field_id
    if (fields && fields.length > 0 && fieldId) {
      const field = fields.find((f) => f.id === fieldId || f.id === parseInt(fieldId))
      if (field) return field.name
    }
    return 'Campo desconocido'
  }

  const getStatusInfo = (status, reservation = null) => {
    // Normalizar el status (lowercase y trim)
    const normalizedStatus = status?.toLowerCase?.()?.trim() || ''

    // Verificar si es una reserva pendiente vencida
    if ((normalizedStatus === 'pending' || normalizedStatus === 'pendiente') && reservation) {
      const isExpired = isExpiredPendingReservation(reservation)
      if (isExpired) {
        return {
          label: 'Vencida',
          icon: AlertTriangle,
          color: 'text-red-700',
          bg: 'bg-red-100',
          isExpired: true,
          expiredMessage: 'Esta reserva pendiente ya pasó su horario',
        }
      }
    }

    switch (normalizedStatus) {
      case 'confirmed':
      case 'confirmada':
      case 'active':
        return {
          label: 'Confirmada',
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
        }
      case 'pending':
      case 'pendiente':
        return {
          label: 'Pendiente',
          icon: AlertCircle,
          color: 'text-amber-600',
          bg: 'bg-amber-100',
        }
      case 'cancelled':
      case 'canceled':
      case 'cancelada':
        return { label: 'Cancelada', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' }
      case 'completed':
      case 'completada':
      case 'realizada':
        return { label: 'Completada', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' }
      case 'no_show':
      case 'no-show':
      case 'noshow':
        return { label: 'No asistió', icon: XCircle, color: 'text-orange-600', bg: 'bg-orange-100' }
      default:
        return {
          label: status || 'Sin estado',
          icon: AlertCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
        }
    }
  }

  const formatTime = (reservation) => {
    // Intentar usar startTime y endTime directamente
    const startTime = reservation.startTime || reservation.start_time
    const endTime = reservation.endTime || reservation.end_time

    if (startTime && endTime) {
      // Formatear HH:MM (quitar segundos si existen)
      const formatHHMM = (t) => {
        if (!t) return ''
        const parts = t.split(':')
        return `${parts[0]}:${parts[1] || '00'}`
      }
      return `${formatHHMM(startTime)} - ${formatHHMM(endTime)}`
    }

    // Fallback al campo time si existe
    const time = reservation.time
    if (!time) return 'No especificado'

    // Si ya tiene el formato correcto "HH:MM - HH:MM", devolverlo
    if (time.includes(':') && time.includes(' - ')) {
      return time
    }

    // Si el formato es "14-16", convertir a "14:00 - 16:00"
    if (time.includes('-')) {
      const [start, end] = time.split('-').map((s) => s.trim())
      // Solo agregar :00 si no tiene ya
      const formatStart = start.includes(':') ? start : `${start}:00`
      const formatEnd = end.includes(':') ? end : `${end}:00`
      return `${formatStart} - ${formatEnd}`
    }

    return time
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Estados que cuentan como "activas" para ingresos
  const activeStatuses = [
    'confirmed',
    'confirmada',
    'active',
    'completed',
    'completada',
    'pending',
    'pendiente',
  ]

  const confirmedReservations = reservations.filter((r) => {
    const status = r.status?.toLowerCase?.()?.trim() || ''
    return activeStatuses.includes(status)
  })

  const totalIncome = confirmedReservations.reduce(
    (total, r) => total + (r.totalPrice || r.total_price || 0),
    0
  )

  const handleCancelReservation = async (reservation) => {
    // Confirmar cancelación
    const result = await Swal.fire({
      title: '¿Cancelar Reserva?',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Cliente:</strong> ${reservation.customerName || reservation.customer_name || 'N/A'}</p>
          <p class="mb-2"><strong>Cancha:</strong> ${getFieldName(reservation)}</p>
          <p class="mb-2"><strong>Horario:</strong> ${formatTime(reservation)}</p>
          <p class="mb-2"><strong>Monto:</strong> S/ ${(reservation.totalPrice || reservation.total_price)?.toFixed(2) || '0.00'}</p>
        </div>
        <p class="mt-4 text-red-600 font-semibold">Esta acción no se puede deshacer.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, cancelar reserva',
      cancelButtonText: 'No, mantener',
      reverseButtons: true,
    })

    if (result.isConfirmed) {
      setCancellingId(reservation.id)

      try {
        // Cancelar la reserva en el backend
        await cancelReservationAPI(reservation.id, 'Cancelada por administrador')

        await Swal.fire({
          icon: 'success',
          title: 'Reserva Cancelada',
          text: 'La reserva ha sido cancelada exitosamente',
          timer: 2000,
          showConfirmButton: false,
        })

        // Si todas las reservas están canceladas, cerrar el modal
        // Leer el estado fresco del store tras la cancelación
        const freshReservations = useBookingStore.getState().existingReservations
        const d = new Date(date)
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        const remainingActive = freshReservations.filter((r) => {
          if (!r.date) return false
          return r.date.split('T')[0] === dateStr && r.status !== 'cancelled'
        })

        if (remainingActive.length === 0) {
          setTimeout(() => {
            onClose()
          }, 2000)
        }
      } catch (error) {
        console.error('Error al cancelar reserva:', error)
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cancelar la reserva. Intenta nuevamente.',
          confirmButtonColor: '#22c55e',
        })
      } finally {
        setCancellingId(null)
      }
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Reservas del Día</h2>
                <p className="text-sm text-white/90">
                  {date ? formatDate(date) : 'Fecha no especificada'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Stats Summary */}
          <div className="px-6 py-4 bg-secondary-50 border-b border-secondary-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-secondary-600 font-medium">Total Reservas</p>
                    <p className="text-2xl font-bold text-secondary-900">{reservations.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-secondary-600 font-medium">Activas</p>
                    <p className="text-2xl font-bold text-green-600">
                      {confirmedReservations.length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-secondary-600 font-medium">Ingresos</p>
                    <p className="text-2xl font-bold text-green-600">S/ {totalIncome.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Reservations List */}
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-280px)]">
            {reservations.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-secondary-600">
                  No hay reservas para este día
                </p>
                <p className="text-sm text-secondary-500 mt-1">
                  Selecciona otro día para ver las reservas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.map((reservation, index) => {
                  const statusInfo = getStatusInfo(reservation.status, reservation)
                  const StatusIcon = statusInfo.icon
                  const isExpired = statusInfo.isExpired

                  return (
                    <motion.div
                      key={reservation.id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`rounded-xl p-4 transition-shadow relative ${
                        isExpired
                          ? 'bg-red-50 border-2 border-red-500 shadow-lg ring-2 ring-red-300 ring-opacity-50'
                          : reservation.status === 'cancelled'
                            ? 'bg-red-50 border-2 border-red-300 opacity-75'
                            : 'bg-white border border-secondary-200 hover:shadow-md'
                      }`}
                    >
                      {/* Alerta visual para reservas pendientes vencidas */}
                      {isExpired && (
                        <div className="absolute -top-3 left-4 right-4">
                          <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-1 animate-pulse shadow-lg">
                            <AlertTriangle className="w-3 h-3" />
                            <span>¡ATENCIÓN REQUERIDA! - Reserva pendiente vencida</span>
                          </div>
                        </div>
                      )}

                      <div
                        className={`flex items-start justify-between mb-3 ${isExpired ? 'mt-2' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isExpired ? 'bg-red-200' : 'bg-primary-100'
                            }`}
                          >
                            <MapPin
                              className={`w-5 h-5 ${isExpired ? 'text-red-600' : 'text-primary-600'}`}
                            />
                          </div>
                          <div>
                            <h4
                              className={`font-semibold ${isExpired ? 'text-red-900' : 'text-secondary-900'}`}
                            >
                              {getFieldName(reservation)}
                            </h4>
                            <p
                              className={`text-sm flex items-center gap-1 mt-0.5 ${isExpired ? 'text-red-700 font-medium' : 'text-secondary-600'}`}
                            >
                              <Clock className="w-3 h-3" />
                              {formatTime(reservation)}
                              {isExpired && <span className="ml-1">(Ya pasó)</span>}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`flex items-center gap-1 px-3 py-1 rounded-full ${statusInfo.bg} ${isExpired ? 'animate-pulse' : ''}`}
                        >
                          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          <span className={`text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-secondary-100">
                        <div className="flex items-center gap-2 text-sm text-secondary-700">
                          <User className="w-4 h-4 text-secondary-500" />
                          <span className="font-medium">
                            {reservation.customerName ||
                              reservation.customer_name ||
                              'Cliente no especificado'}
                          </span>
                        </div>

                        {(reservation.customerPhone || reservation.customer_phone) && (
                          <div className="flex items-center gap-2 text-sm text-secondary-700">
                            <Phone className="w-4 h-4 text-secondary-500" />
                            <span>{reservation.customerPhone || reservation.customer_phone}</span>
                          </div>
                        )}

                        {reservation.customerEmail && (
                          <div className="flex items-center gap-2 text-sm text-secondary-700">
                            <Mail className="w-4 h-4 text-secondary-500" />
                            <span>{reservation.customerEmail}</span>
                          </div>
                        )}

                        {(reservation.totalPrice || reservation.total_price) && (
                          <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span>
                              S/ {(reservation.totalPrice || reservation.total_price).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>

                      {reservation.notes && (
                        <div className="mt-3 pt-3 border-t border-secondary-100">
                          <p className="text-sm text-secondary-600">
                            <span className="font-medium">Notas:</span> {reservation.notes}
                          </p>
                        </div>
                      )}

                      {/* Mensaje de alerta para reservas pendientes vencidas */}
                      {isExpired && (
                        <div className="mt-3 pt-3 border-t border-red-200">
                          <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-red-800">
                                  Reserva pendiente vencida
                                </p>
                                <p className="text-xs text-red-700 mt-1">
                                  Esta reserva nunca fue confirmada y ya pasó su horario programado.
                                  Considera cancelarla o marcarla como "No asistió".
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Botón de Cancelar - Mostrar si está pendiente, confirmada, o es una reserva vencida */}
                      {(() => {
                        // Estados que no permiten cancelar
                        const nonCancellableStatuses = ['cancelled', 'completed', 'no_show']
                        if (nonCancellableStatuses.includes(reservation.status)) return null

                        // Si es una reserva vencida, SIEMPRE mostrar el botón
                        if (isExpired) {
                          return (
                            <div className="mt-3 pt-3 border-t border-red-200">
                              <button
                                onClick={() => handleCancelReservation(reservation)}
                                disabled={cancellingId === reservation.id}
                                className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                                  cancellingId === reservation.id
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg'
                                }`}
                              >
                                {cancellingId === reservation.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Cancelando...
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-4 h-4" />
                                    Cancelar Reserva Vencida
                                  </>
                                )}
                              </button>
                            </div>
                          )
                        }

                        // Verificar si la reserva ya pasó (para reservas NO pendientes vencidas)
                        const resDate = reservation.date ? reservation.date.split('T')[0] : null
                        const endTime = reservation.endTime || reservation.end_time
                        if (resDate && endTime) {
                          const [year, month, day] = resDate.split('-').map(Number)
                          const [hours, minutes] = endTime.split(':').map(Number)
                          const reservationEnd = new Date(
                            year,
                            month - 1,
                            day,
                            hours,
                            minutes || 0,
                            0,
                            0
                          )
                          const now = getCurrentLocalDateTime()
                          if (reservationEnd < now) return null // Ya pasó
                        }

                        return (
                          <div className="mt-3 pt-3 border-t border-secondary-100">
                            <button
                              onClick={() => handleCancelReservation(reservation)}
                              disabled={cancellingId === reservation.id}
                              className={`w-full py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                                cancellingId === reservation.id
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-red-500 hover:bg-red-600 text-white hover:shadow-lg'
                              }`}
                            >
                              {cancellingId === reservation.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Cancelando...
                                </>
                              ) : (
                                <>
                                  <Ban className="w-4 h-4" />
                                  Cancelar Reserva
                                </>
                              )}
                            </button>
                          </div>
                        )
                      })()}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-secondary-50 border-t border-secondary-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default DayReservationsModal
