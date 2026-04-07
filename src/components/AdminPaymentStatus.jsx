import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  History,
  Info,
  Upload,
  X,
  Send,
  FileCheck,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/authStore'
import { API_CONFIG } from '../config/api.config'
import { usePaymentReport } from '../hooks/usePaymentReport.jsx'

const AdminPaymentStatus = () => {
  const { user, token } = useAuthStore()

  const [fieldPayments, setFieldPayments] = useState([])
  const [paymentHistory, setPaymentHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(true)

  /**
   * Obtener mensaje de estado segun el status y fecha de vencimiento
   */
  const getStatusMessage = useCallback((status, dueDate) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    switch (status) {
      case 'paid':
        return 'Pago confirmado'
      case 'reported':
        return 'Pago reportado - Esperando confirmacion'
      case 'overdue':
        return `Vencido hace ${Math.abs(diffDays)} dias`
      case 'pending':
        return diffDays >= 0
          ? `Vence en ${diffDays} dias`
          : `Vencido hace ${Math.abs(diffDays)} dias`
      default:
        return 'Estado desconocido'
    }
  }, [])

  /**
   * Cargar datos usando el endpoint dedicado /api/monthly-payments/my-status
   * MEMOIZADO con useCallback para evitar referencias circulares
   */
  const loadDataFromAPI = useCallback(async () => {
    try {
      setLoading(true)

      // Usar endpoint dedicado que obtiene todo en una llamada
      const statusRes = await fetch(`${API_CONFIG.BASE_URL}/api/monthly-payments/my-status`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!statusRes.ok) {
        throw new Error('Error al cargar estado de pago')
      }

      const statusData = await statusRes.json()

      if (!statusData.success) {
        throw new Error(statusData.error || 'Error al cargar datos')
      }

      // El backend ya devuelve el status calculado correctamente
      const fieldPaymentsData = (statusData.data || []).map((item) => {
        const dueDate = new Date(item.due_date)
        const today = new Date()
        const diffTime = dueDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return {
          fieldId: item.field_id,
          fieldName: item.field_name || `Cancha ${item.field_id}`,
          hasConfig: true,
          status: item.status, // Ya viene calculado del backend
          message: getStatusMessage(item.status, item.due_date),
          daysLate: item.status === 'overdue' ? Math.abs(diffDays) : 0,
          daysUntilDue: item.status === 'pending' ? diffDays : 0,
          payment: {
            id: item.payment_id,
            amount: parseFloat(item.amount),
            dueDate: item.due_date,
            paidDate: item.paid_at,
            status: item.status,
            paymentMethod: item.payment_method,
            paymentReference: item.payment_reference,
            paymentVoucherUrl: item.payment_voucher_url,
            reportedAt: item.reported_at,
          },
          config: {
            id: item.config_id,
            monthlyFee: parseFloat(item.amount),
            dueDay: item.due_day,
          },
          month: item.month,
          year: item.year,
          admin_id: item.admin_id,
        }
      })

      setFieldPayments(fieldPaymentsData)

      // Cargar historial por separado
      const historyRes = await fetch(
        `${API_CONFIG.BASE_URL}/api/monthly-payments/history?admin_id=${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setPaymentHistory((historyData.data || []).slice(0, 12))
      }
    } catch (error) {
      console.error('Error cargando estado de pago:', error)
      setFieldPayments([])
    } finally {
      setLoading(false)
    }
  }, [token, user, getStatusMessage])

  // Usar el hook compartido para reporte de pagos
  // NOTA: loadDataFromAPI ahora está definido ANTES de usarse aquí
  const {
    platformPaymentMethods,
    showReportModal,
    selectedPayment,
    reportForm,
    submitting,
    setShowReportModal,
    loadPlatformPaymentMethods,
    handleOpenReportModal,
    handleFileUpload,
    handleSubmitReport,
    getMethodIcon,
    updateReportForm,
    clearVoucherImage,
  } = usePaymentReport(token, loadDataFromAPI)

  useEffect(() => {
    if (user && user.id && token) {
      loadDataFromAPI()
      loadPlatformPaymentMethods()
    }
  }, [user, token, loadDataFromAPI, loadPlatformPaymentMethods])

  // Combinar pagos vencidos/pendientes actuales con el historial
  const combinedPaymentHistory = useMemo(() => {
    // Convertir fieldPayments vencidos/pendientes al formato del historial
    const overdueFromCurrent = fieldPayments
      .filter((fp) => ['overdue', 'pending'].includes(fp.status))
      .map((fp) => ({
        id: fp.payment?.id || `current-${fp.fieldId}-${fp.month}-${fp.year}`,
        field_id: fp.fieldId,
        field_name: fp.fieldName,
        month: fp.month,
        year: fp.year,
        amount: fp.payment?.amount || fp.config?.monthlyFee,
        status: fp.status,
        due_day: fp.config?.dueDay,
        config_id: fp.config?.id,
        admin_id: fp.admin_id,
        paid_at: null,
        reported_at: null,
        isCurrentPeriod: true,
      }))

    // Filtrar del historial los que ya están en overdueFromCurrent para evitar duplicados
    const historyFiltered = paymentHistory.filter((ph) => {
      return !overdueFromCurrent.some(
        (oc) => oc.field_id === ph.field_id && oc.month === ph.month && oc.year === ph.year
      )
    })

    // Combinar: primero los vencidos actuales, luego el historial
    const combined = [...overdueFromCurrent, ...historyFiltered]

    // Ordenar: vencidos primero, luego por fecha más reciente
    return combined.sort((a, b) => {
      // Priorizar vencidos
      if (a.status === 'overdue' && b.status !== 'overdue') return -1
      if (b.status === 'overdue' && a.status !== 'overdue') return 1
      // Luego pendientes
      if (a.status === 'pending' && !['overdue', 'pending'].includes(b.status)) return -1
      if (b.status === 'pending' && !['overdue', 'pending'].includes(a.status)) return 1
      // Por fecha (año y mes)
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
  }, [fieldPayments, paymentHistory])

  // Contar vencidos para el badge
  const overdueCount = useMemo(() => {
    return combinedPaymentHistory.filter((p) => p.status === 'overdue').length
  }, [combinedPaymentHistory])

  if (loading) {
    return null
  }

  if (fieldPayments.length === 0) {
    return null
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: <CheckCircle className="w-8 h-8 text-green-600" />,
        }
      case 'reported':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: <FileCheck className="w-8 h-8 text-blue-600" />,
        }
      case 'overdue':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: <AlertCircle className="w-8 h-8 text-red-600" />,
        }
      case 'pending':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          icon: <Clock className="w-8 h-8 text-yellow-600" />,
        }
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: <Info className="w-8 h-8 text-gray-600" />,
        }
    }
  }

  const getBlockingWarning = (fieldPayment) => {
    if (fieldPayment.status !== 'overdue') return null

    const daysLate = fieldPayment.daysLate || 0

    if (daysLate <= 7) {
      return {
        level: 'info',
        message: 'Tienes un margen de gracia de 7 dias',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
      }
    }

    if (daysLate <= 15) {
      return {
        level: 'warning',
        message: 'Tu cuenta tiene pagos atrasados. Por favor, regulariza tu situacion pronto.',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700',
      }
    }

    if (daysLate <= 30) {
      return {
        level: 'danger',
        message: 'Alerta: Si no regularizas tu pago pronto, tu cuenta sera suspendida.',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
      }
    }

    return {
      level: 'critical',
      message: 'Tu cuenta esta suspendida por falta de pago. Contacta al administrador.',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-300',
      textColor: 'text-red-800',
    }
  }

  return (
    <div className="space-y-4">
      {/* Lista compacta de Estado de Pago por Cancha */}
      <div className="space-y-2">
        {fieldPayments.map((fieldPayment, index) => {
          const statusColors = getStatusColor(fieldPayment.status)
          const blockingWarning = getBlockingWarning(fieldPayment)
          const canReport = ['pending', 'overdue'].includes(fieldPayment.status)

          return (
            <motion.div
              key={fieldPayment.fieldId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`${statusColors.bg} border ${statusColors.border} rounded-lg px-3 py-2`}
            >
              <div className="flex items-center gap-3">
                {/* Icono de estado */}
                <div className="flex-shrink-0 scale-[0.65] -m-1">{statusColors.icon}</div>

                {/* Info principal */}
                <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <h3 className={`font-semibold ${statusColors.text} text-sm`}>
                    {fieldPayment.fieldName}
                  </h3>
                  <span className={`text-xs ${statusColors.text} opacity-80`}>
                    {fieldPayment.message}
                  </span>
                </div>

                {/* Monto y fecha */}
                {fieldPayment.payment && (
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="w-3 h-3" />
                      <span className={`font-bold ${statusColors.text}`}>
                        S/. {fieldPayment.payment.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(fieldPayment.payment.dueDate).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                )}

                {/* Estado adicional */}
                {fieldPayment.status === 'paid' && fieldPayment.payment?.paidDate && (
                  <span className="text-[11px] text-green-700 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {new Date(fieldPayment.payment.paidDate).toLocaleDateString('es-PE')}
                  </span>
                )}

                {fieldPayment.status === 'reported' && (
                  <span className="text-[11px] text-blue-700 flex items-center gap-1">
                    <FileCheck className="w-3 h-3" />
                    En revision
                  </span>
                )}

                {/* Botón de acción */}
                {canReport && (
                  <button
                    onClick={() => handleOpenReportModal(fieldPayment)}
                    className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    Reportar Pago
                  </button>
                )}
              </div>

              {/* Warning si existe - línea separada compacta */}
              {blockingWarning && (
                <p
                  className={`text-[11px] font-medium ${blockingWarning.textColor} mt-1 pl-7 leading-tight`}
                >
                  {blockingWarning.message}
                </p>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Historial de Pagos - Compacto */}
      {combinedPaymentHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-sm text-gray-700">Historial de Pagos</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                {combinedPaymentHistory.length}
              </span>
              {/* Badge de vencidos */}
              {overdueCount > 0 && (
                <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-full animate-pulse">
                  {overdueCount} vencido{overdueCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <motion.div animate={{ rotate: showHistory ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-100"
              >
                <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                  {combinedPaymentHistory.map((payment, index) => {
                    const isOverdue = payment.status === 'overdue'
                    const isPending = payment.status === 'pending'
                    const canReportFromHistory = isOverdue || isPending

                    // Convertir payment del historial al formato esperado por handleOpenReportModal
                    const paymentForModal = canReportFromHistory
                      ? {
                          fieldId: payment.field_id,
                          fieldName: payment.field_name || `Cancha ${payment.field_id}`,
                          status: payment.status,
                          month: payment.month,
                          year: payment.year,
                          config: {
                            id: payment.config_id,
                            monthlyFee: parseFloat(payment.amount),
                            dueDay: payment.due_day,
                          },
                          payment: {
                            id: payment.id,
                            amount: parseFloat(payment.amount),
                          },
                          admin_id: payment.admin_id,
                        }
                      : null

                    return (
                      <div
                        key={`${payment.id}-${index}`}
                        className={`flex items-center justify-between px-4 py-2 hover:bg-gray-50 ${isOverdue ? 'bg-red-50/50' : isPending ? 'bg-yellow-50/30' : ''}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-800 truncate">
                              {payment.field_name || `Cancha ${payment.field_id}`}
                            </span>
                            {/* Badge distintivo para vencidos */}
                            {isOverdue && (
                              <span className="text-[9px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded uppercase">
                                Vencido
                              </span>
                            )}
                            {isPending && (
                              <span className="text-[9px] font-bold text-yellow-800 bg-yellow-200 px-1.5 py-0.5 rounded uppercase">
                                Pendiente
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {new Date(payment.year, payment.month - 1).toLocaleDateString('es-PE', {
                              month: 'short',
                              year: 'numeric',
                            })}
                            {payment.status === 'paid' && payment.paid_at && (
                              <span className="text-green-600">
                                {' '}
                                • Pagado {new Date(payment.paid_at).toLocaleDateString('es-PE')}
                              </span>
                            )}
                            {payment.status === 'reported' && (
                              <span className="text-blue-600"> • En revision</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span
                            className={`text-xs font-semibold ${isOverdue ? 'text-red-600' : isPending ? 'text-yellow-700' : 'text-gray-700'}`}
                          >
                            S/. {parseFloat(payment.amount).toFixed(2)}
                          </span>
                          {payment.status === 'paid' ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : payment.status === 'reported' ? (
                            <FileCheck className="w-4 h-4 text-blue-500" />
                          ) : isOverdue ? (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-500" />
                          )}
                          {/* Botón reportar pago para vencidos/pendientes */}
                          {canReportFromHistory && (
                            <button
                              onClick={() => handleOpenReportModal(paymentForModal)}
                              className="ml-1 inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-medium transition-colors"
                            >
                              <Upload className="w-3 h-3" />
                              Pagar
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Reportar Pago */}
      <AnimatePresence>
        {showReportModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Reportar Pago</h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Info del pago */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900">{selectedPayment.fieldName}</h3>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    S/. {selectedPayment.config.monthlyFee.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Periodo:{' '}
                    {new Date(selectedPayment.year, selectedPayment.month - 1).toLocaleDateString(
                      'es-PE',
                      {
                        month: 'long',
                        year: 'numeric',
                      }
                    )}
                  </p>
                </div>

                {/* Metodos de pago de la plataforma */}
                {platformPaymentMethods.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Metodos de Pago Disponibles
                    </h4>
                    <div className="space-y-3">
                      {platformPaymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className={`border rounded-xl p-4 cursor-pointer transition-all ${
                            reportForm.payment_method === method.name
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-emerald-300'
                          }`}
                          onClick={() => updateReportForm('payment_method', method.name)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              {getMethodIcon(method.method_type)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{method.name}</p>
                              {method.bank_name && (
                                <p className="text-sm text-gray-600">{method.bank_name}</p>
                              )}
                              {method.account_number && (
                                <p className="text-sm text-gray-500 font-mono">
                                  {method.account_number}
                                </p>
                              )}
                              {method.account_holder && (
                                <p className="text-xs text-gray-500">{method.account_holder}</p>
                              )}
                              {method.phone_number && (
                                <p className="text-sm text-gray-500">{method.phone_number}</p>
                              )}
                              {method.cci_number && (
                                <p className="text-xs text-gray-400">CCI: {method.cci_number}</p>
                              )}
                            </div>
                            {reportForm.payment_method === method.name && (
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                            )}
                          </div>
                          {method.qr_image_url && (
                            <div className="mt-3 flex justify-center">
                              <img
                                src={method.qr_image_url?.startsWith('http') ? method.qr_image_url : `${API_CONFIG.BASE_URL}${method.qr_image_url}`}
                                alt="QR Code"
                                className="w-32 h-32 object-contain rounded-lg"
                              />
                            </div>
                          )}
                          {method.instructions && (
                            <p className="mt-2 text-xs text-gray-500 italic">
                              {method.instructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formulario */}
                <div className="space-y-4">
                  {platformPaymentMethods.length === 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Metodo de Pago *
                      </label>
                      <input
                        type="text"
                        value={reportForm.payment_method}
                        onChange={(e) => updateReportForm('payment_method', e.target.value)}
                        placeholder="Ej: Yape, BCP, Interbank..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numero de Operacion / Referencia *
                    </label>
                    <input
                      type="text"
                      value={reportForm.payment_reference}
                      onChange={(e) => updateReportForm('payment_reference', e.target.value)}
                      placeholder="Ingresa el numero de operacion"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comprobante de Pago (opcional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="voucher-upload"
                      />
                      <label
                        htmlFor="voucher-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors"
                      >
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {reportForm.payment_voucher_preview
                            ? 'Imagen cargada'
                            : 'Subir imagen del comprobante'}
                        </span>
                      </label>
                    </div>
                    {reportForm.payment_voucher_preview && (
                      <div className="mt-2 relative">
                        <img
                          src={reportForm.payment_voucher_preview}
                          alt="Comprobante"
                          className="w-full max-h-48 object-contain rounded-lg"
                        />
                        <button
                          onClick={clearVoucherImage}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      value={reportForm.notes}
                      onChange={(e) => updateReportForm('notes', e.target.value)}
                      placeholder="Cualquier informacion adicional..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={
                    submitting || !reportForm.payment_method || !reportForm.payment_reference
                  }
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Reportar Pago
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminPaymentStatus
