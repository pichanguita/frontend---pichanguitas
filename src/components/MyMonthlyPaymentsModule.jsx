import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Receipt,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  X,
  Send,
  FileCheck,
  Filter,
  Eye,
  AlertTriangle,
  Building2,
  RefreshCw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/authStore'
import { API_CONFIG } from '../config/api.config'
import { resolveMediaUrl } from '../utils/mediaUrl'
import { usePaymentReport } from '../hooks/usePaymentReport.jsx'

const MyMonthlyPaymentsModule = () => {
  const { user, token } = useAuthStore()

  // Estados principales
  const [paymentConfigs, setPaymentConfigs] = useState([])
  const [allPayments, setAllPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filtros
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedField, setSelectedField] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Modal Ver Comprobante
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState(null)

  // Usar el hook compartido para reporte de pagos
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
    updateReportForm,
    clearVoucherImage,
  } = usePaymentReport(token, refreshData)

  // Cargar datos iniciales
  useEffect(() => {
    if (user?.id && token) {
      loadAllData()
    }
  }, [user, token])

  const loadAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([loadPaymentConfigs(), loadAllPayments(), loadPlatformPaymentMethods()])
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
    }
  }

  async function refreshData() {
    setRefreshing(true)
    await loadAllData()
    setRefreshing(false)
  }

  const loadPaymentConfigs = async () => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/payment-configs?admin_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error('Error al cargar configuraciones')
      }

      const data = await res.json()
      setPaymentConfigs((data.data || []).filter((c) => c.is_active))
    } catch (error) {
      console.error('Error cargando configuraciones:', error)
    }
  }

  const loadAllPayments = async () => {
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/monthly-payments/history?admin_id=${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!res.ok) {
        throw new Error('Error al cargar pagos')
      }

      const data = await res.json()
      setAllPayments(data.data || [])
    } catch (error) {
      console.error('Error cargando pagos:', error)
    }
  }

  // Generar pagos del año seleccionado
  const paymentsForYear = useMemo(() => {
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentYear = today.getFullYear()
    const payments = []

    paymentConfigs.forEach((config) => {
      // Fecha de vigencia de la config (determina desde cuándo aplica)
      const effFromRaw = config.effective_from || config.date_time_registration
      const effFromDate = effFromRaw ? new Date(effFromRaw) : null
      const effFromUTC = effFromDate
        ? new Date(Date.UTC(effFromDate.getUTCFullYear(), effFromDate.getUTCMonth(), effFromDate.getUTCDate()))
        : null

      // Generar 12 meses del año seleccionado
      for (let month = 1; month <= 12; month++) {
        // No mostrar meses futuros
        if (selectedYear > currentYear || (selectedYear === currentYear && month > currentMonth)) {
          continue
        }

        // Comparar effective_from contra la fecha de vencimiento exacta de este mes
        // Si la vigencia es posterior al vencimiento de este mes, no mostrar
        const dueDateForMonth = new Date(Date.UTC(selectedYear, month - 1, config.due_day))
        if (effFromUTC && effFromUTC > dueDateForMonth) {
          continue
        }

        // Buscar pago existente
        const existingPayment = allPayments.find(
          (p) => p.field_id === config.field_id && p.month === month && p.year === selectedYear
        )

        const dueDate = new Date(Date.UTC(selectedYear, month - 1, config.due_day))
        const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
        let status = 'pending'
        let daysLate = 0

        if (existingPayment) {
          status = existingPayment.status
        } else {
          // Solo marcar como overdue si la fecha de vigencia es anterior o igual al vencimiento
          const configRegDateUTC = effFromDate
            ? new Date(Date.UTC(effFromDate.getUTCFullYear(), effFromDate.getUTCMonth(), effFromDate.getUTCDate()))
            : new Date(0)
          if (todayUTC > dueDate && configRegDateUTC <= dueDate) {
            status = 'overdue'
            daysLate = Math.floor((todayUTC - dueDate) / (1000 * 60 * 60 * 24))
          }
        }

        payments.push({
          id: existingPayment?.id || `pending-${config.field_id}-${month}-${selectedYear}`,
          field_id: config.field_id,
          field_name: config.field_name || `Cancha ${config.field_id}`,
          month,
          year: selectedYear,
          amount: parseFloat(config.monthly_fee),
          due_date: dueDate,
          due_day: config.due_day,
          status,
          daysLate,
          payment_method: existingPayment?.payment_method || null,
          payment_reference: existingPayment?.payment_reference || null,
          payment_voucher_url: existingPayment?.payment_voucher_url || null,
          paid_at: existingPayment?.paid_at || null,
          reported_at: existingPayment?.reported_at || null,
          confirmed_at: existingPayment?.confirmed_at || null,
          notes: existingPayment?.notes || null,
          config_id: config.id,
          admin_id: config.admin_id,
        })
      }
    })

    // Aplicar filtros
    return payments
      .filter((p) => {
        if (selectedField !== 'all' && p.field_id !== parseInt(selectedField)) return false
        if (selectedStatus !== 'all' && p.status !== selectedStatus) return false
        return true
      })
      .sort((a, b) => b.month - a.month)
  }, [paymentConfigs, allPayments, selectedYear, selectedField, selectedStatus])

  // Calcular estadisticas
  const stats = useMemo(() => {
    const yearPayments = paymentsForYear.filter((p) => p.year === selectedYear)

    return {
      total: yearPayments.length,
      pending: yearPayments.filter((p) => p.status === 'pending').length,
      reported: yearPayments.filter((p) => p.status === 'reported').length,
      paid: yearPayments.filter((p) => p.status === 'paid').length,
      overdue: yearPayments.filter((p) => p.status === 'overdue').length,
      totalAmount: yearPayments.reduce((sum, p) => sum + p.amount, 0),
      paidAmount: yearPayments
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: yearPayments
        .filter((p) => ['pending', 'overdue', 'reported'].includes(p.status))
        .reduce((sum, p) => sum + p.amount, 0),
    }
  }, [paymentsForYear, selectedYear])

  // Obtener años disponibles
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let y = currentYear; y >= currentYear - 2; y--) {
      years.push(y)
    }
    return years
  }, [])

  // Obtener campos unicos
  const uniqueFields = useMemo(() => {
    return paymentConfigs.map((c) => ({
      id: c.field_id,
      name: c.field_name || `Cancha ${c.field_id}`,
    }))
  }, [paymentConfigs])

  // Nombre del mes
  const getMonthName = useCallback((month) => {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ]
    return months[month - 1]
  }, [])

  // Configuracion de estados
  const getStatusConfig = useCallback((status) => {
    const configs = {
      paid: {
        label: 'Pagado',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        iconColor: 'text-green-600',
      },
      reported: {
        label: 'Reportado',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: FileCheck,
        iconColor: 'text-blue-600',
      },
      pending: {
        label: 'Pendiente',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        iconColor: 'text-yellow-600',
      },
      overdue: {
        label: 'Vencido',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertCircle,
        iconColor: 'text-red-600',
      },
    }
    return configs[status] || configs.pending
  }, [])

  // Ver comprobante (abre modal)
  const handleViewVoucher = useCallback((payment) => {
    if (!payment?.payment_voucher_url) return
    setSelectedVoucher(payment)
    setShowVoucherModal(true)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Cargando pagos mensuales...</p>
        </div>
      </div>
    )
  }

  if (paymentConfigs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin configuracion de pagos</h3>
        <p className="text-gray-500">
          Aun no tienes configuracion de pagos mensuales asignada.
          <br />
          Contacta al administrador del sistema para mas informacion.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Receipt className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Mi Mensualidad</h2>
              <p className="text-sm text-gray-500">Gestiona tus pagos mensuales a la plataforma</p>
            </div>
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tarjetas de estadisticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total {selectedYear}</p>
              <p className="text-2xl font-bold text-gray-900">S/ {stats.totalAmount.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pagado</p>
              <p className="text-2xl font-bold text-green-600">S/ {stats.paidAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-400">{stats.paid} pagos</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pendiente</p>
              <p className="text-2xl font-bold text-yellow-600">
                S/ {stats.pendingAmount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">{stats.pending + stats.reported} pagos</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vencidos</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              <p className="text-xs text-gray-400">pagos atrasados</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todas las canchas</option>
            {uniqueFields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="reported">Reportado</option>
            <option value="paid">Pagado</option>
            <option value="overdue">Vencido</option>
          </select>
        </div>
      </div>

      {/* Tabla de pagos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Periodo
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cancha
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Metodo
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paymentsForYear.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No hay pagos para mostrar con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                paymentsForYear.map((payment, index) => {
                  const statusConfig = getStatusConfig(payment.status)
                  const StatusIcon = statusConfig.icon
                  const canReport = ['pending', 'overdue'].includes(payment.status)

                  return (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {getMonthName(payment.month)} {payment.year}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{payment.field_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">
                          S/ {payment.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600">
                          {payment.due_date.toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            // due_date se construye en UTC (new Date(Date.UTC(año, mes, due_day))).
                            // Formatear en 'UTC' garantiza que se muestre EXACTAMENTE el día
                            // configurado por el SA, sin desfasarse por la zona horaria del
                            // navegador (p. ej. Perú UTC-5 mostraba el día anterior). Es
                            // invariante a la zona: idéntico en local y en producción (Railway).
                            timeZone: 'UTC',
                          })}
                        </span>
                        {payment.daysLate > 0 && (
                          <span className="ml-2 text-xs text-red-600">
                            ({payment.daysLate} dias tarde)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                        >
                          <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.iconColor}`} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.payment_method ? (
                          <div>
                            <span className="text-gray-700">{payment.payment_method}</span>
                            {payment.payment_reference && (
                              <p className="text-xs text-gray-500">
                                Ref: {payment.payment_reference}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {canReport && (
                            <button
                              onClick={() => handleOpenReportModal(payment)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              Reportar
                            </button>
                          )}
                          {payment.payment_voucher_url && (
                            <button
                              onClick={() => handleViewVoucher(payment)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver
                            </button>
                          )}
                          {payment.status === 'reported' && (
                            <span className="text-xs text-blue-600 italic">En revision</span>
                          )}
                          {payment.status === 'paid' && payment.confirmed_at && (
                            <span className="text-xs text-green-600">
                              Confirmado{' '}
                              {new Date(payment.confirmed_at).toLocaleDateString('es-PE')}
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resumen por cancha */}
      {uniqueFields.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-500" />
            Resumen por Cancha ({selectedYear})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniqueFields.map((field) => {
              const fieldPayments = paymentsForYear.filter((p) => p.field_id === field.id)
              const fieldPaid = fieldPayments.filter((p) => p.status === 'paid').length
              const fieldPending = fieldPayments.filter((p) =>
                ['pending', 'overdue', 'reported'].includes(p.status)
              ).length

              return (
                <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{field.name}</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600">{fieldPaid} pagados</span>
                    <span className="text-yellow-600">{fieldPending} pendientes</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(fieldPaid / 12) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Modal de Reporte de Pago */}
      <AnimatePresence>
        {showReportModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header del modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Reportar Pago</h2>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 space-y-6">
                {/* Info del pago */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900">{selectedPayment.field_name}</h3>
                  <p className="text-2xl font-bold text-primary-600">
                    S/ {selectedPayment.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Periodo: {getMonthName(selectedPayment.month)} de {selectedPayment.year}
                  </p>
                </div>

                {/* Formulario */}
                <div className="space-y-4">
                  {/* Metodo de pago */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Metodo de Pago *
                    </label>
                    {platformPaymentMethods.length > 0 ? (
                      <>
                        <select
                          value={reportForm.payment_method}
                          onChange={(e) => updateReportForm('payment_method', e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="">Selecciona un metodo</option>
                          {platformPaymentMethods.map((method) => (
                            <option key={method.id} value={method.name}>
                              {method.name}
                            </option>
                          ))}
                        </select>
                        {/* Mostrar datos del método seleccionado */}
                        {reportForm.payment_method &&
                          (() => {
                            const selected = platformPaymentMethods.find(
                              (m) => m.name === reportForm.payment_method
                            )
                            if (!selected) return null
                            return (
                              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                                <p className="font-medium text-blue-900">{selected.name}</p>
                                <p className="text-blue-800 font-mono">
                                  {selected.account_number || selected.phone_number}
                                </p>
                                {selected.account_holder && (
                                  <p className="text-blue-600 text-xs">
                                    Titular: {selected.account_holder}
                                  </p>
                                )}
                              </div>
                            )
                          })()}
                      </>
                    ) : (
                      <input
                        type="text"
                        value={reportForm.payment_method}
                        onChange={(e) => updateReportForm('payment_method', e.target.value)}
                        placeholder="Ej: Yape, BCP, Interbank..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    )}
                  </div>

                  {/* Numero de operacion */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numero de Operacion / Referencia *
                    </label>
                    <input
                      type="text"
                      value={reportForm.payment_reference}
                      onChange={(e) => updateReportForm('payment_reference', e.target.value)}
                      placeholder="Ingresa el numero de operacion"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* Comprobante */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comprobante de Pago (opcional)
                    </label>
                    <input
                      type="file"
                      id="voucher-upload-monthly"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="voucher-upload-monthly"
                      className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                    >
                      {reportForm.payment_voucher_preview ? (
                        <span className="text-green-600 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Imagen seleccionada
                        </span>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-500">Subir imagen del comprobante</span>
                        </>
                      )}
                    </label>
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

                  {/* Notas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      value={reportForm.notes}
                      onChange={(e) => updateReportForm('notes', e.target.value)}
                      placeholder="Cualquier informacion adicional..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Footer del modal */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={
                    submitting || !reportForm.payment_method || !reportForm.payment_reference
                  }
                  className="flex items-center gap-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

      {/* Modal Ver Comprobante */}
      <AnimatePresence>
        {showVoucherModal && selectedVoucher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Comprobante de Pago</h2>
                  <p className="text-sm text-gray-500">
                    {selectedVoucher.field_name} - {getMonthName(selectedVoucher.month)}{' '}
                    {selectedVoucher.year}
                  </p>
                </div>
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Monto:</span>
                    <p className="font-bold text-green-600">
                      S/ {selectedVoucher.amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Metodo:</span>
                    <p className="font-medium">{selectedVoucher.payment_method || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Referencia:</span>
                    <p className="font-medium font-mono break-all">
                      {selectedVoucher.payment_reference || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Reportado:</span>
                    <p className="font-medium">
                      {selectedVoucher.reported_at
                        ? new Date(selectedVoucher.reported_at).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </p>
                  </div>
                </div>

                {selectedVoucher.notes && (
                  <div>
                    <span className="text-gray-500 text-sm">Notas:</span>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1 whitespace-pre-wrap">
                      {selectedVoucher.notes}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-gray-500 text-sm">Imagen del comprobante:</span>
                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={resolveMediaUrl(selectedVoucher.payment_voucher_url)}
                      alt="Comprobante"
                      className="w-full h-auto max-h-[60vh] object-contain"
                    />
                  </div>
                  <a
                    href={resolveMediaUrl(selectedVoucher.payment_voucher_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    <Eye className="w-4 h-4" />
                    Abrir en nueva pestana
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyMonthlyPaymentsModule
