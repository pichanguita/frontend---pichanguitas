import React, { useState, useEffect } from 'react'
import {
  Clock,
  User,
  MapPin,
  Phone,
  DollarSign,
  Check,
  X,
  AlertTriangle,
  Eye,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import useBookingStore from '../store/bookingStore'
import useAuthStore from '../store/authStore'
import FieldDetailsModal from './FieldDetailsModal'
import { parseLocalDate } from '../utils/dateFormatters'

const MySwal = withReactContent(Swal)

const PendingFieldCard = ({ field, onApprove, onReject, onViewDetails }) => {
  const formatDate = (dateString) => {
    return parseLocalDate(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = () => {
    switch (field.approvalStatus) {
      case 'pending':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'approved':
        return 'border-l-green-500 bg-green-50'
      case 'rejected':
        return 'border-l-red-500 bg-red-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getStatusText = () => {
    switch (field.approvalStatus) {
      case 'pending':
        return 'Pendiente de Aprobación'
      case 'approved':
        return 'Aprobada'
      case 'rejected':
        return 'Rechazada'
      default:
        return 'Desconocido'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`border-l-4 p-6 rounded-r-lg shadow-sm mb-4 ${getStatusColor()}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between">
        <div className="flex-1 mb-4 lg:mb-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-1">{field.name}</h4>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                {getStatusText()}
              </span>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Creada: {formatDate(field.createdAt)}</p>
              {field.createdBy && (
                <p className="flex items-center justify-end mt-1">
                  <User className="w-3 h-3 mr-1" />
                  {field.createdBy.name}
                </p>
              )}
            </div>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <p className="font-medium">{field.location}</p>
                <p className="text-xs">
                  {field.distrito}, {field.provincia}
                </p>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span>{field.phone}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-semibold text-primary-600">S/ {field.pricePerHour}/hora</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span className="capitalize">{field.sportType}</span>
            </div>
          </div>

          {/* Detalles adicionales */}
          <div className="flex flex-wrap gap-2 mb-4">
            {field.capacity && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Cap: {field.capacity} personas
              </span>
            )}

            {field.amenities && field.amenities.length > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                {field.amenities.length} comodidades
              </span>
            )}

            {field.fieldType && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                Tipo: {field.fieldType}
              </span>
            )}
          </div>

          {/* Dirección completa */}
          <div className="text-sm text-gray-600 mb-4">
            <strong>Dirección:</strong> {field.address}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:ml-4">
          <button
            onClick={() => onViewDetails(field)}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalles
          </button>

          {field.approvalStatus === 'pending' && (
            <>
              <button
                onClick={() => onApprove(field)}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check className="w-4 h-4 mr-2" />
                Aprobar
              </button>

              <button
                onClick={() => onReject(field)}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Rechazar
              </button>
            </>
          )}

          {field.approvalStatus === 'approved' && (field.approvedBy || field.approvedAt) && (
            <div className="text-xs text-green-600 text-center lg:text-left">
              <p>✅ Aprobada</p>
              {field.approvedAt && <p>{formatDate(field.approvedAt)}</p>}
            </div>
          )}

          {field.approvalStatus === 'rejected' && (field.rejectedBy || field.rejectedAt) && (
            <div className="text-xs text-red-600 text-center lg:text-left">
              <p>❌ Rechazada</p>
              {field.rejectedAt && <p>{formatDate(field.rejectedAt)}</p>}
              {field.rejectionReason && <p className="mt-1 italic">"{field.rejectionReason}"</p>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const PendingFieldsModule = () => {
  const { user } = useAuthStore()
  const { getFieldsByApprovalStatus, approveField, rejectField } = useBookingStore()

  const [activeFilter, setActiveFilter] = useState('pending')
  const [fields, setFields] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  useEffect(() => {
    const updateFields = () => {
      const filteredFields = getFieldsByApprovalStatus(activeFilter)
      setFields(filteredFields)
    }

    updateFields()

    // Actualizar cada segundo para mostrar cambios en tiempo real
    const interval = setInterval(updateFields, 1000)
    return () => clearInterval(interval)
  }, [activeFilter, getFieldsByApprovalStatus])

  const handleApprove = async (field) => {
    const result = await MySwal.fire({
      title: '¿Aprobar esta cancha?',
      html: `
        <div class="text-left">
          <p><strong>Cancha:</strong> ${field.name}</p>
          <p><strong>Creada por:</strong> ${field.createdBy?.name}</p>
          <p><strong>Ubicación:</strong> ${field.location}</p>
          <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p class="text-sm text-green-700">
              ✅ Al aprobar, la cancha estará disponible para reservas inmediatamente
            </p>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
      showCloseButton: true,
      allowEscapeKey: true,
    })

    if (result.isConfirmed) {
      approveField(field.id, user)

      MySwal.fire({
        title: 'Cancha Aprobada',
        text: `La cancha "${field.name}" ha sido aprobada correctamente`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        showCloseButton: true,
        allowEscapeKey: true,
      })
    }
  }

  const handleReject = async (field) => {
    const { value: reason } = await MySwal.fire({
      title: '¿Rechazar esta cancha?',
      html: `
        <div class="text-left mb-4">
          <p><strong>Cancha:</strong> ${field.name}</p>
          <p><strong>Creada por:</strong> ${field.createdBy?.name}</p>
          <div class="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <p class="text-sm text-red-700">
              ❌ Al rechazar, la cancha no estará disponible para reservas
            </p>
          </div>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Motivo del rechazo (opcional)',
      inputPlaceholder: 'Explica por qué se rechaza esta cancha...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      showCloseButton: true,
      allowEscapeKey: true,
      inputValidator: (value) => {
        // No es obligatorio, pero si se proporciona debe tener al menos 10 caracteres
        if (value && value.length < 10) {
          return 'El motivo debe tener al menos 10 caracteres'
        }
      },
    })

    if (reason !== undefined) {
      // !== undefined permite strings vacíos
      rejectField(field.id, user, reason)

      MySwal.fire({
        title: 'Cancha Rechazada',
        text: `La cancha "${field.name}" ha sido rechazada`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        showCloseButton: true,
        allowEscapeKey: true,
      })
    }
  }

  const handleViewDetails = (field) => {
    setSelectedField(field)
    setIsDetailsModalOpen(true)
  }

  const filters = [
    { id: 'pending', label: 'Pendientes', count: getFieldsByApprovalStatus('pending').length },
    { id: 'approved', label: 'Aprobadas', count: getFieldsByApprovalStatus('approved').length },
    { id: 'rejected', label: 'Rechazadas', count: getFieldsByApprovalStatus('rejected').length },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="w-7 h-7 mr-3 text-orange-600" />
            Aprobación de Canchas
          </h1>
          <p className="text-gray-600 mt-1">Gestiona las solicitudes de creación de canchas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-4 p-4">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === filter.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              {filter.count > 0 && (
                <span
                  className={`ml-2 px-2 py-1 text-xs rounded-full ${
                    activeFilter === filter.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de campos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {filters.find((f) => f.id === activeFilter)?.label} ({fields.length})
          </h2>

          {fields.length > 0 ? (
            <div>
              <AnimatePresence>
                {fields.map((field) => (
                  <PendingFieldCard
                    key={field.id}
                    field={field}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                No hay canchas {filters.find((f) => f.id === activeFilter)?.label.toLowerCase()}
              </h3>
              <p className="text-gray-400">
                {activeFilter === 'pending'
                  ? 'Cuando los administradores creen nuevas canchas aparecerán aquí'
                  : `No se encontraron canchas ${filters.find((f) => f.id === activeFilter)?.label.toLowerCase()}`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      <FieldDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedField(null)
        }}
        field={selectedField}
      />
    </div>
  )
}

export default PendingFieldsModule
