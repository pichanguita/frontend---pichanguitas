import React, { useState, useMemo, useEffect } from 'react'
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  User,
  Phone,
  DollarSign,
  Filter,
  Image,
  Eye,
  Gift,
  Search,
  AlertTriangle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import useBookingStore from '../store/bookingStore'
import useFieldStore from '../store/modules/fieldStore'
import Swal from 'sweetalert2'
import { parseLocalDate } from '../utils/dateFormatters'
import { resolveMediaUrl } from '../utils/mediaUrl'

/**
 * Formatea una fecha de reserva de manera segura para evitar desfase de zona horaria
 * Funciona tanto en local como en despliegue (cualquier zona horaria)
 * @param {string} dateString - Fecha en formato ISO (ej: "2026-01-30" o "2026-01-30T00:00:00.000Z")
 * @param {Object} options - Opciones de formateo para toLocaleDateString
 * @returns {string} Fecha formateada
 */
const formatReservationDateSafe = (dateString, options = {}) => {
  if (!dateString) return 'Fecha no disponible'

  try {
    // Usar parseLocalDate que maneja correctamente las fechas YYYY-MM-DD
    const date = parseLocalDate(dateString)

    if (isNaN(date.getTime())) {
      return 'Fecha no válida'
    }

    return date.toLocaleDateString('es-PE', options)
  } catch (error) {
    console.error('Error formateando fecha:', error)
    return 'Fecha no válida'
  }
}

/**
 * Convierte una fecha de reserva a formato YYYY-MM-DD de manera segura
 * @param {string} dateString - Fecha en cualquier formato
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
const toDateStringSafe = (dateString) => {
  if (!dateString) return ''

  // Si ya es formato YYYY-MM-DD, retornar directamente
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }

  // Si tiene formato ISO completo, extraer solo la parte de fecha
  if (typeof dateString === 'string' && dateString.includes('T')) {
    return dateString.split('T')[0]
  }

  // Usar parseLocalDate para parsear correctamente
  const date = parseLocalDate(dateString)
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Obtiene la fecha y hora actual en hora local de Perú
 * Funciona tanto en desarrollo local como en producción
 * @returns {Date} Fecha actual en hora local
 */
const getCurrentLocalDateTime = () => {
  const now = new Date()
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
  if (reservation.status !== 'pending') return false

  // Obtener fecha de la reserva
  const resDateStr = reservation.date ? reservation.date.split('T')[0] : null
  if (!resDateStr) return false

  // Obtener hora de inicio - puede venir en diferentes formatos
  let startTime = reservation.startTime || reservation.start_time

  // Si no hay startTime, intentar extraerlo del campo 'time' (formato "HH:MM - HH:MM")
  if (!startTime && reservation.time) {
    const timeParts = reservation.time.split('-')
    if (timeParts.length > 0) {
      startTime = timeParts[0].trim()
      // Si es solo hora sin minutos (ej: "14"), agregar ":00"
      if (!startTime.includes(':')) {
        startTime = `${startTime}:00`
      }
    }
  }

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

const PendingReservationsModule = () => {
  const { existingReservations, approveReservationAPI, rejectReservationAPI, loadReservations } =
    useBookingStore()
  const { fields, loadFields } = useFieldStore()
  const [selectedDate, setSelectedDate] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest') // newest, oldest
  const [activeFilter, setActiveFilter] = useState('pending') // pending, confirmed, rejected
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Cargar datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true)
      try {
        await Promise.all([loadReservations(), loadFields()])
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchData()
  }, [loadReservations, loadFields])

  // Contadores por estado
  // 'confirmed' y 'completed' son reservas aprobadas
  // 'rejected' y 'cancelled' son reservas rechazadas
  const statusCounts = useMemo(() => {
    const pendingReservations = existingReservations.filter((r) => r.status === 'pending')
    const expiredPending = pendingReservations.filter((r) => isExpiredPendingReservation(r)).length

    return {
      pending: pendingReservations.length,
      expiredPending: expiredPending,
      confirmed: existingReservations.filter(
        (r) => r.status === 'confirmed' || r.status === 'completed'
      ).length,
      rejected: existingReservations.filter(
        (r) => r.status === 'rejected' || r.status === 'cancelled'
      ).length,
    }
  }, [existingReservations])

  // Filtrar reservas según el filtro activo
  const filteredByStatus = useMemo(() => {
    switch (activeFilter) {
      case 'pending':
        return existingReservations.filter((r) => r.status === 'pending')
      case 'confirmed':
        // Incluir confirmed y completed (reservas que fueron aprobadas)
        return existingReservations.filter(
          (r) => r.status === 'confirmed' || r.status === 'completed'
        )
      case 'rejected':
        return existingReservations.filter(
          (r) => r.status === 'rejected' || r.status === 'cancelled'
        )
      default:
        return existingReservations.filter((r) => r.status === 'pending')
    }
  }, [existingReservations, activeFilter])

  // Para compatibilidad con el código existente
  const pendingReservations = filteredByStatus

  // Aplicar filtros y ordenamiento
  const filteredReservations = useMemo(() => {
    let filtered = [...pendingReservations]

    // Filtro por fecha
    if (selectedDate) {
      filtered = filtered.filter((r) => {
        const resDate = toDateStringSafe(r.date)
        return resDate === selectedDate
      })
    }

    // Filtro por búsqueda (cliente, teléfono, cancha)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim()
      filtered = filtered.filter(
        (r) =>
          (r.customerName && r.customerName.toLowerCase().includes(search)) ||
          (r.phoneNumber && r.phoneNumber.includes(search)) ||
          (r.fieldName && r.fieldName.toLowerCase().includes(search))
      )
    }

    // Ordenamiento
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }

    return filtered
  }, [pendingReservations, selectedDate, searchTerm, sortBy])

  const handleApprove = async (reservation) => {
    const result = await Swal.fire({
      title: '¿Aprobar Reserva?',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Cliente:</strong> ${reservation.customerName}</p>
          <p class="mb-2"><strong>Cancha:</strong> ${reservation.fieldName}</p>
          <p class="mb-2"><strong>Fecha:</strong> ${formatReservationDateSafe(reservation.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p class="mb-2"><strong>Horario:</strong> ${reservation.time}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✓ Sí, Aprobar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
    })

    if (result.isConfirmed) {
      setIsLoadingData(true)
      try {
        console.log('🔄 [handleApprove] Iniciando aprobación para ID:', reservation.id)
        // ✅ Usar la función que conecta al backend
        await approveReservationAPI(reservation.id)
        console.log('✅ [handleApprove] Aprobación completada')

        Swal.fire({
          icon: 'success',
          title: '¡Reserva Aprobada!',
          text: 'La reserva ha sido confirmada exitosamente',
          confirmButtonColor: '#22c55e',
          timer: 2000,
        })
      } catch (error) {
        console.error('Error al aprobar reserva:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo aprobar la reserva. ' + error.message,
          confirmButtonColor: '#dc2626',
        })
      } finally {
        setIsLoadingData(false)
      }
    }
  }

  const handleReject = async (reservation) => {
    const result = await Swal.fire({
      title: '¿Rechazar Reserva?',
      html: `
        <div class="text-left mb-4">
          <p class="mb-2"><strong>Cliente:</strong> ${reservation.customerName}</p>
          <p class="mb-2"><strong>Cancha:</strong> ${reservation.fieldName}</p>
          <p class="mb-2"><strong>Fecha:</strong> ${formatReservationDateSafe(reservation.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p class="mb-2"><strong>Horario:</strong> ${reservation.time}</p>
        </div>
      `,
      input: 'select',
      inputLabel: 'Motivo del rechazo',
      inputOptions: {
        horario_no_disponible: 'Horario ya no disponible',
        pago_no_verificado: 'No se verificó el pago',
        cliente_deuda: 'Cliente tiene deudas pendientes',
        mantenimiento: 'Cancha en mantenimiento',
        otro: 'Otro motivo',
      },
      inputPlaceholder: 'Selecciona un motivo',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '✕ Rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes seleccionar un motivo'
        }
      },
    })

    if (result.isConfirmed) {
      try {
        const reasonLabels = {
          horario_no_disponible: 'Horario ya no disponible',
          pago_no_verificado: 'No se verificó el pago',
          cliente_deuda: 'Cliente tiene deudas pendientes',
          mantenimiento: 'Cancha en mantenimiento',
          otro: 'Otro motivo',
        }

        // ✅ Usar la función que conecta al backend
        await rejectReservationAPI(reservation.id, reasonLabels[result.value])

        Swal.fire({
          icon: 'info',
          title: 'Reserva Rechazada',
          text: 'La reserva ha sido rechazada y el cliente será notificado',
          confirmButtonColor: '#22c55e',
          timer: 2000,
        })
      } catch (error) {
        console.error('Error al rechazar reserva:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo rechazar la reserva. ' + error.message,
          confirmButtonColor: '#dc2626',
        })
      }
    }
  }

  const getTimeSince = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diff = Math.floor((now - date) / 1000) // diferencia en segundos

    if (diff < 60) return 'Hace menos de 1 minuto'
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} minutos`
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`
    return `Hace ${Math.floor(diff / 86400)} días`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Reservas</h2>
        <p className="text-gray-600">
          Revisa, aprueba o rechaza las solicitudes de reserva de los clientes
        </p>
      </div>

      {/* Filtros por estado */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pendientes
            {statusCounts.pending > 0 && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  activeFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-amber-600 text-white'
                }`}
              >
                {statusCounts.pending}
              </span>
            )}
            {statusCounts.expiredPending > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-red-600 text-white animate-pulse">
                {statusCounts.expiredPending} vencida{statusCounts.expiredPending > 1 ? 's' : ''}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('confirmed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'confirmed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Aprobadas
            {statusCounts.confirmed > 0 && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  activeFilter === 'confirmed'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-600 text-white'
                }`}
              >
                {statusCounts.confirmed}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('rejected')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Rechazadas
            {statusCounts.rejected > 0 && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  activeFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {statusCounts.rejected}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-amber-50 rounded-lg shadow-sm border border-amber-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600">Pendientes</p>
              <p className="text-2xl font-bold text-amber-900">{statusCounts.pending}</p>
            </div>
          </div>
        </div>

        {/* Tarjeta de vencidas - Solo mostrar si hay */}
        {statusCounts.expiredPending > 0 && (
          <div className="bg-red-50 rounded-lg shadow-sm border-2 border-red-400 p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-200 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600 font-semibold">¡Vencidas!</p>
                <p className="text-2xl font-bold text-red-900">{statusCounts.expiredPending}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600">Confirmadas Hoy</p>
              <p className="text-2xl font-bold text-green-900">
                {
                  existingReservations.filter(
                    (r) =>
                      r.status === 'confirmed' &&
                      new Date(r.approvedAt).toDateString() === new Date().toDateString()
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600">Rechazadas Hoy</p>
              <p className="text-2xl font-bold text-red-900">
                {
                  existingReservations.filter(
                    (r) =>
                      r.status === 'rejected' &&
                      new Date(r.rejectedAt).toDateString() === new Date().toDateString()
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-900">Filtros</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Buscador */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cliente, teléfono o cancha..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Reserva</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Ordenamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="newest">Más recientes primero</option>
              <option value="oldest">Más antiguas primero</option>
            </select>
          </div>
        </div>

        {/* Botón para limpiar filtros */}
        {(searchTerm || selectedDate) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedDate('')
              }}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <XCircle className="w-4 h-4" />
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de Reservas Pendientes */}
      <div className="space-y-4">
        {filteredReservations.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-12 text-center">
            {activeFilter === 'pending' && (
              <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            )}
            {activeFilter === 'confirmed' && (
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            )}
            {activeFilter === 'rejected' && (
              <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            )}
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {activeFilter === 'pending' && 'No hay reservas pendientes'}
              {activeFilter === 'confirmed' && 'No hay reservas aprobadas'}
              {activeFilter === 'rejected' && 'No hay reservas rechazadas'}
            </h3>
            <p className="text-gray-400">
              {activeFilter === 'pending' && 'Todas las solicitudes han sido revisadas'}
              {activeFilter === 'confirmed' && 'Las reservas aprobadas aparecerán aquí'}
              {activeFilter === 'rejected' && 'Las reservas rechazadas aparecerán aquí'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReservations.map((reservation, index) => {
              const isExpired = isExpiredPendingReservation(reservation)

              return (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-xl border-2 p-6 hover:shadow-lg transition-shadow relative ${
                    isExpired
                      ? 'bg-red-50 border-red-500 shadow-lg ring-2 ring-red-300 ring-opacity-50'
                      : activeFilter === 'pending'
                        ? 'bg-white border-amber-200'
                        : activeFilter === 'confirmed'
                          ? 'bg-white border-green-200'
                          : 'bg-white border-red-200'
                  }`}
                >
                  {/* Alerta visual para reservas pendientes vencidas */}
                  {isExpired && (
                    <div className="absolute -top-3 left-4 right-4 z-10">
                      <div className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 animate-pulse shadow-lg">
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                          ¡ATENCIÓN! - Reserva pendiente vencida - Requiere acción inmediata
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Header con tiempo */}
                  <div
                    className={`flex items-start justify-between mb-4 ${isExpired ? 'mt-3' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${isExpired ? 'bg-red-200' : 'bg-amber-100'}`}
                      >
                        {isExpired ? (
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium ${isExpired ? 'text-red-700' : 'text-amber-700'}`}
                        >
                          {getTimeSince(reservation.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(reservation.createdAt).toLocaleString('es-PE')}
                        </p>
                      </div>
                    </div>

                    {/* Badge de vencida */}
                    {isExpired && (
                      <div className="bg-red-100 border border-red-300 rounded-full px-3 py-1 animate-pulse">
                        <span className="text-xs font-bold text-red-700">VENCIDA</span>
                      </div>
                    )}
                  </div>

                  {/* Información de la reserva */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Cliente:</span>
                        <span className="text-sm text-gray-900">{reservation.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Teléfono:</span>
                        <span className="text-sm text-gray-900">{reservation.phoneNumber}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Cancha:</span>
                        <span className="text-sm text-gray-900">{reservation.fieldName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar
                          className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-gray-500'}`}
                        />
                        <span
                          className={`text-sm font-medium ${isExpired ? 'text-red-700' : 'text-gray-700'}`}
                        >
                          Fecha:
                        </span>
                        <span
                          className={`text-sm ${isExpired ? 'text-red-900 font-semibold' : 'text-gray-900'}`}
                        >
                          {formatReservationDateSafe(reservation.date, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                          {isExpired && <span className="ml-1 text-red-600">(Ya pasó)</span>}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock
                          className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-gray-500'}`}
                        />
                        <span
                          className={`text-sm font-medium ${isExpired ? 'text-red-700' : 'text-gray-700'}`}
                        >
                          Horario:
                        </span>
                        <span
                          className={`text-sm ${isExpired ? 'text-red-900 font-semibold' : 'text-gray-900'}`}
                        >
                          {reservation.time}
                          {isExpired && <span className="ml-1 text-red-600">(Vencido)</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información de pago */}
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                          Método de pago:{' '}
                          {reservation.paymentMethod === 'efectivo'
                            ? 'Efectivo'
                            : reservation.paymentMethod}
                        </span>
                      </div>
                      {reservation.paymentStatus === 'fully_paid' ||
                      reservation.paymentStatus === 'paid' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          ✓ Pagado
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          ⏳ Pago pendiente
                        </span>
                      )}
                    </div>

                    {/* Indicador de horas gratis canjeadas */}
                    {parseFloat(reservation.freeHoursUsed || 0) > 0 && (
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <div className="flex items-center gap-2 bg-purple-50 rounded-lg p-2">
                          <Gift className="w-4 h-4 text-purple-600" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-purple-900">
                              Hora(s) gratis canjeada(s):{' '}
                              {parseFloat(reservation.freeHoursUsed).toFixed(0)}
                            </span>
                            {parseFloat(reservation.freeHoursDiscount || 0) > 0 && (
                              <span className="ml-2 text-xs text-purple-700">
                                (Descuento: S/{' '}
                                {parseFloat(reservation.freeHoursDiscount).toFixed(2)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mostrar voucher si existe */}
                    {reservation.paymentVoucherUrl && (
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-blue-900 flex items-center gap-1">
                            <Image className="w-3 h-3" />
                            Voucher adjunto
                          </span>
                          <button
                            onClick={() => {
                              const imageUrl = resolveMediaUrl(reservation.paymentVoucherUrl)
                              Swal.fire({
                                title: 'Comprobante de Pago',
                                imageUrl: imageUrl,
                                imageWidth: 400,
                                imageAlt: 'Voucher de pago',
                                showCloseButton: true,
                                showConfirmButton: false,
                                customClass: {
                                  image: 'rounded-lg',
                                },
                                didOpen: () => {
                                  // Si la imagen falla al cargar, mostrar mensaje
                                  const img = Swal.getImage()
                                  if (img) {
                                    img.onerror = () => {
                                      Swal.update({
                                        imageUrl: null,
                                        html: `<div class="text-center p-4">
                                          <p class="text-gray-500 mb-2">⚠️ No se pudo cargar el voucher</p>
                                          <p class="text-xs text-gray-400">Archivo: ${reservation.paymentVoucherUrl}</p>
                                          <p class="text-xs text-gray-400 mt-2">Este voucher fue registrado antes de implementar la subida de archivos al servidor.</p>
                                        </div>`,
                                      })
                                    }
                                  }
                                },
                              })
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Ver voucher
                          </button>
                        </div>
                        {/* Miniatura del voucher */}
                        <div className="mt-2" id={`voucher-container-${reservation.id}`}>
                          <img
                            src={resolveMediaUrl(reservation.paymentVoucherUrl)}
                            alt="Voucher de pago"
                            className="w-20 h-20 object-cover rounded-lg border border-blue-200 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              const imageUrl = resolveMediaUrl(reservation.paymentVoucherUrl)
                              Swal.fire({
                                title: 'Comprobante de Pago',
                                imageUrl: imageUrl,
                                imageWidth: 400,
                                imageAlt: 'Voucher de pago',
                                showCloseButton: true,
                                showConfirmButton: false,
                                customClass: {
                                  image: 'rounded-lg',
                                },
                              })
                            }}
                            onError={(e) => {
                              // Mostrar mensaje de archivo no disponible en lugar de ocultar
                              const container = e.target.parentElement
                              container.innerHTML = `
                                <div class="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 text-center">
                                  <span class="text-xs text-gray-400">Archivo no disponible</span>
                                </div>
                              `
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mensaje de alerta para reservas pendientes vencidas */}
                  {isExpired && activeFilter === 'pending' && (
                    <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-red-800 text-sm">
                            ¡Reserva pendiente vencida!
                          </p>
                          <p className="text-sm text-red-700 mt-1">
                            Esta reserva nunca fue confirmada y ya pasó su horario programado. El
                            cliente probablemente ya no asistirá. Considera rechazarla o contactar
                            al cliente.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Acciones - Solo para pendientes */}
                  {activeFilter === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(reservation)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          isExpired
                            ? 'bg-gray-400 hover:bg-gray-500 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        {isExpired ? 'Aprobar (Vencida)' : 'Aprobar Reserva'}
                      </button>
                      <button
                        onClick={() => handleReject(reservation)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Rechazar
                      </button>
                    </div>
                  )}

                  {/* Info de estado para aprobadas/rechazadas */}
                  {activeFilter === 'confirmed' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">
                          {reservation.status === 'completed'
                            ? 'Reserva Completada'
                            : 'Reserva Confirmada'}
                        </span>
                      </div>
                      {reservation.status === 'completed' && reservation.completedAt && (
                        <p className="text-sm text-green-600 mt-1">
                          Completada el: {new Date(reservation.completedAt).toLocaleString('es-PE')}
                        </p>
                      )}
                      {reservation.status === 'confirmed' && reservation.approvedAt && (
                        <p className="text-sm text-green-600 mt-1">
                          Confirmada el: {new Date(reservation.approvedAt).toLocaleString('es-PE')}
                        </p>
                      )}
                    </div>
                  )}

                  {activeFilter === 'rejected' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">Reserva Rechazada</span>
                      </div>
                      {reservation.rejectedAt && (
                        <p className="text-sm text-red-600 mt-1">
                          Rechazada el: {new Date(reservation.rejectedAt).toLocaleString('es-PE')}
                        </p>
                      )}
                      {reservation.cancellationReason && (
                        <p className="text-sm text-red-600 mt-1">
                          Motivo: {reservation.cancellationReason}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default PendingReservationsModule
