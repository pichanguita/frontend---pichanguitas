import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, DollarSign, Calendar, Clock, CheckCircle, History } from 'lucide-react'
import PropTypes from 'prop-types'
import Swal from 'sweetalert2'
import { fetchRefunds } from '../../../../services/refunds/refundsService'
import { formatDate } from '../../../../utils/dateFormatters'

/**
 * RefundsTab - Gestión de reembolsos
 *
 * Muestra la lista de reembolsos pendientes y procesados
 * y permite marcarlos como procesados
 */
export const RefundsTab = ({ pendingRefunds, fields, user, onMarkAsProcessed, onActivityLog }) => {
  const [activeFilter, setActiveFilter] = useState('pending')
  const [allRefunds, setAllRefunds] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Cargar historial cuando se cambia a "Todos"
  useEffect(() => {
    if (activeFilter === 'all' && allRefunds.length === 0) {
      loadAllRefunds()
    }
  }, [activeFilter])

  const loadAllRefunds = async () => {
    setIsLoadingHistory(true)
    try {
      const refunds = await fetchRefunds({}) // Sin filtro de status
      const transformed = refunds.map((refund) => ({
        id: String(refund.id),
        reservationId: String(refund.reservation_id || ''),
        customerId: refund.customer_id,
        customerName: refund.customer_name || 'Cliente',
        phoneNumber: refund.phone_number || '',
        fieldId: String(refund.field_id || ''),
        fieldName: refund.field_name || '',
        date: refund.reservation_date || '',
        startTime: refund.start_time || '',
        time: refund.start_time || '',
        refundAmount: parseFloat(refund.refund_amount) || 0,
        status: refund.status,
        reason: refund.cancellation_reason || '',
        cancelledAt: refund.cancelled_at,
        processedAt: refund.processed_at,
        processedBy: refund.processed_by,
        processedByName: refund.processed_by_name || '',
      }))
      setAllRefunds(transformed)
    } catch (error) {
      console.error('Error cargando historial:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Obtener los reembolsos a mostrar según el filtro
  const displayedRefunds = activeFilter === 'pending' ? pendingRefunds : allRefunds
  const totalRefundAmount = displayedRefunds.reduce((sum, r) => sum + (r.refundAmount || 0), 0)

  const handleMarkAsProcessed = async (reservation) => {
    const result = await Swal.fire({
      title: '¿Marcar como procesado?',
      html: `
        <div class="text-left">
          <p class="mb-2">¿Confirmas que procesaste el reembolso de:</p>
          <p class="font-semibold">S/ ${reservation.refundAmount?.toFixed(2)}</p>
          <p class="text-sm text-gray-600 mt-2">Cliente: ${reservation.customerName}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, procesado',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
    })

    if (result.isConfirmed) {
      try {
        await onMarkAsProcessed(reservation.id)

        Swal.fire({
          icon: 'success',
          title: '¡Reembolso Procesado!',
          text: 'El reembolso ha sido marcado como procesado',
          confirmButtonColor: '#22c55e',
        })

        // Log de actividad
        if (onActivityLog) {
          onActivityLog({
            action: 'refund_processed',
            details: `Reembolso procesado: S/ ${reservation.refundAmount?.toFixed(2)} - ${reservation.customerName}`,
            user: user?.name,
          })
        }
      } catch (error) {
        console.error('Error al procesar reembolso:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo procesar el reembolso',
          confirmButtonColor: '#ef4444',
        })
      }
    }
  }

  const todayRefundsCount = pendingRefunds.filter((r) => {
    const today = new Date().toDateString()
    return new Date(r.cancelledAt).toDateString() === today
  }).length

  const processedCount = allRefunds.filter((r) => r.status === 'processed').length

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Reembolsos</h2>
            <p className="text-gray-600 mt-1">Gestiona los reembolsos de cancelaciones</p>
          </div>
          <div
            className={`${activeFilter === 'pending' ? 'bg-orange-100' : 'bg-gray-100'} px-4 py-2 rounded-lg`}
          >
            <p
              className={`text-sm ${activeFilter === 'pending' ? 'text-orange-700' : 'text-gray-700'}`}
            >
              {activeFilter === 'pending' ? 'Total pendiente' : 'Total histórico'}
            </p>
            <p
              className={`text-2xl font-bold ${activeFilter === 'pending' ? 'text-orange-900' : 'text-gray-900'}`}
            >
              S/{' '}
              {totalRefundAmount.toLocaleString('es-PE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Tabs de filtro */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'pending'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pendientes
            {pendingRefunds.length > 0 && (
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === 'pending' ? 'bg-orange-500' : 'bg-orange-100 text-orange-700'
                }`}
              >
                {pendingRefunds.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-gray-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <History className="w-4 h-4" />
            Historial Completo
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${activeFilter === 'pending' ? 'bg-orange-100' : 'bg-gray-100'}`}
              >
                <RefreshCw
                  className={`w-6 h-6 ${activeFilter === 'pending' ? 'text-orange-600' : 'text-gray-600'}`}
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {activeFilter === 'pending' ? 'Reembolsos Pendientes' : 'Total Reembolsos'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{displayedRefunds.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monto Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  S/{' '}
                  {totalRefundAmount.toLocaleString('es-PE', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                {activeFilter === 'pending' ? (
                  <Calendar className="w-6 h-6 text-blue-600" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {activeFilter === 'pending' ? 'Hoy' : 'Procesados'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeFilter === 'pending' ? todayRefundsCount : processedCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de reembolsos */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {isLoadingHistory ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando historial...</p>
            </div>
          ) : displayedRefunds.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeFilter === 'pending' ? 'No hay reembolsos pendientes' : 'No hay reembolsos'}
              </h3>
              <p className="text-gray-600">
                {activeFilter === 'pending'
                  ? 'Todos los reembolsos han sido procesados'
                  : 'No se encontraron reembolsos en el historial'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reserva
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cancelación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    {activeFilter === 'pending' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedRefunds.map((reservation) => {
                    const field = fields.find((f) => f.id === reservation.fieldId)
                    const isProcessed = reservation.status === 'processed'

                    return (
                      <tr
                        key={reservation.id}
                        className={`hover:bg-gray-50 ${isProcessed ? 'bg-green-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {reservation.customerName || 'Cliente'}
                            </div>
                            <div className="text-sm text-gray-500">{reservation.phoneNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {field?.name || reservation.fieldName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.date ? formatDate(reservation.date) : 'N/A'} -{' '}
                            {reservation.startTime || reservation.time || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {reservation.cancelledAt
                              ? new Date(reservation.cancelledAt).toLocaleDateString('es-PE')
                              : 'N/A'}
                          </div>
                          {reservation.cancelledAt && (
                            <div className="text-sm text-gray-500">
                              {new Date(reservation.cancelledAt).toLocaleTimeString('es-PE', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`text-lg font-bold ${isProcessed ? 'text-green-600' : 'text-orange-600'}`}
                          >
                            S/{' '}
                            {reservation.refundAmount?.toLocaleString('es-PE', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) || '0.00'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isProcessed ? (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <CheckCircle className="w-3 h-3" />
                                Procesado
                              </span>
                              {reservation.processedAt && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {new Date(reservation.processedAt).toLocaleDateString('es-PE')}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                              <Clock className="w-3 h-3" />
                              Pendiente
                            </span>
                          )}
                        </td>
                        {activeFilter === 'pending' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleMarkAsProcessed(reservation)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Marcar Procesado
                            </button>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

RefundsTab.propTypes = {
  pendingRefunds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      customerName: PropTypes.string,
      phoneNumber: PropTypes.string,
      fieldId: PropTypes.string,
      fieldName: PropTypes.string,
      date: PropTypes.string,
      startTime: PropTypes.string,
      time: PropTypes.string,
      cancelledAt: PropTypes.string,
      refundAmount: PropTypes.number,
    })
  ).isRequired,
  fields: PropTypes.array.isRequired,
  user: PropTypes.object,
  onMarkAsProcessed: PropTypes.func.isRequired,
  onActivityLog: PropTypes.func,
}
