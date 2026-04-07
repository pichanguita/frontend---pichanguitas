import React, { useState, useEffect, useMemo } from 'react'
import Swal from 'sweetalert2'
import { formatCurrency } from '@/utils/superadmin/dashboardHelpers'
import { API_CONFIG } from '@/config/api.config'
import usePaymentStore from '@/store/paymentStore'
import useAuthStore from '@/store/authStore'
import { CheckCircle, XCircle, FileText, Image, Clock, AlertTriangle } from 'lucide-react'

const API_URL = API_CONFIG.BASE_URL

const MonthlyPaymentsView = () => {
  const { loadMonthlyPendingAmount } = usePaymentStore()
  const token = useAuthStore((state) => state.token)
  const [payments, setPayments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterAdmin, setFilterAdmin] = useState('all')
  const [showVoucherModal, setShowVoucherModal] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState(null)

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('month', selectedMonth)
      params.append('year', selectedYear)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterAdmin !== 'all') params.append('admin_id', filterAdmin)

      const response = await fetch(`${API_URL}/api/monthly-payments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        setPayments(data.data)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/monthly-payments/stats?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchPayments()
    fetchStats()
  }, [selectedMonth, selectedYear, filterStatus, filterAdmin])

  const uniqueAdmins = useMemo(() => {
    const adminsMap = new Map()
    payments.forEach((p) => {
      if (!adminsMap.has(p.admin_id)) {
        adminsMap.set(p.admin_id, { id: p.admin_id, name: p.admin_name })
      }
    })
    return Array.from(adminsMap.values())
  }, [payments])

  const handleRegisterPayment = async (payment) => {
    const result = await Swal.fire({
      title: 'Confirmar pago',
      html: `
        <div class="text-center">
          <p class="font-medium text-lg">${payment.field_name}</p>
          <p class="text-gray-600">${payment.admin_name}</p>
          <p class="text-2xl font-bold text-green-600 mt-3">S/ ${formatCurrency(payment.amount)}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, registrar pago',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10B981',
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/monthly-payments/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            config_id: payment.config_id,
            field_id: payment.field_id,
            admin_id: payment.admin_id,
            month: selectedMonth,
            year: selectedYear,
            amount: payment.amount,
            due_day: payment.due_day,
          }),
        })
        const data = await response.json()

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Pago Registrado',
            timer: 2000,
            showConfirmButton: false,
          })
          fetchPayments()
          fetchStats()
          loadMonthlyPendingAmount()
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message })
      }
    }
  }

  const handleConfirmPayment = async (payment) => {
    const result = await Swal.fire({
      title: 'Confirmar pago reportado',
      html: `
        <div class="text-left space-y-2">
          <p><strong>Cancha:</strong> ${payment.field_name}</p>
          <p><strong>Admin:</strong> ${payment.admin_name}</p>
          <p><strong>Monto:</strong> <span class="text-green-600 font-bold">S/ ${formatCurrency(payment.amount)}</span></p>
          ${payment.payment_method ? `<p><strong>Metodo:</strong> ${payment.payment_method}</p>` : ''}
          ${payment.payment_reference ? `<p><strong>Referencia:</strong> ${payment.payment_reference}</p>` : ''}
          ${payment.reported_by_name ? `<p><strong>Reportado por:</strong> ${payment.reported_by_name}</p>` : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar Pago',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10B981',
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${API_URL}/api/monthly-payments/${payment.payment_id}/confirm`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({}),
          }
        )
        const data = await response.json()

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Pago Confirmado',
            text: 'El admin ha sido notificado',
            timer: 2000,
            showConfirmButton: false,
          })
          fetchPayments()
          fetchStats()
          loadMonthlyPendingAmount()
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message })
      }
    }
  }

  const handleRejectPayment = async (payment) => {
    const result = await Swal.fire({
      title: 'Rechazar pago reportado',
      html: `
        <div class="text-left space-y-2 mb-4">
          <p><strong>Cancha:</strong> ${payment.field_name}</p>
          <p><strong>Admin:</strong> ${payment.admin_name}</p>
        </div>
      `,
      input: 'textarea',
      inputLabel: 'Razon del rechazo',
      inputPlaceholder: 'Ingresa la razon por la cual rechazas este pago...',
      inputValidator: (value) => {
        if (!value) return 'Debes ingresar una razon'
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(
          `${API_URL}/api/monthly-payments/${payment.payment_id}/reject`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reason: result.value }),
          }
        )
        const data = await response.json()

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Pago Rechazado',
            text: 'El admin ha sido notificado',
            timer: 2000,
            showConfirmButton: false,
          })
          fetchPayments()
          fetchStats()
          loadMonthlyPendingAmount()
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message })
      }
    }
  }

  const handleDeletePayment = async (payment) => {
    const result = await Swal.fire({
      title: 'Eliminar pago?',
      html: `<p>El cobro de <strong>${payment.field_name}</strong> volvera a estar pendiente.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    })

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/monthly-payments/${payment.payment_id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Pago eliminado',
            text: 'El cobro vuelve a estar pendiente',
            timer: 2000,
            showConfirmButton: false,
          })
          fetchPayments()
          fetchStats()
          loadMonthlyPendingAmount()
        } else {
          throw new Error(data.error)
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: error.message })
      }
    }
  }

  const handleViewVoucher = (payment) => {
    setSelectedVoucher(payment)
    setShowVoucherModal(true)
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      reported: 'bg-blue-100 text-blue-800',
    }
    const labels = {
      pending: 'Pendiente',
      paid: 'Pagado',
      overdue: 'Vencido',
      reported: 'Reportado',
    }
    const icons = {
      pending: <Clock className="w-3 h-3" />,
      paid: <CheckCircle className="w-3 h-3" />,
      overdue: <AlertTriangle className="w-3 h-3" />,
      reported: <FileText className="w-3 h-3" />,
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${styles[status] || styles.pending}`}
      >
        {icons[status]}
        {labels[status] || status}
      </span>
    )
  }

  const getMonthName = (month) => {
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
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Total Mensual</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_payments}</p>
            <p className="text-xs text-gray-400">S/ {formatCurrency(stats.total_amount)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-xs text-yellow-500">S/ {formatCurrency(stats.pending_amount)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 border-2 border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Reportados</p>
            <p className="text-2xl font-bold text-blue-600">{stats.reported || 0}</p>
            <p className="text-xs text-blue-500">S/ {formatCurrency(stats.reported_amount || 0)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Cobrados</p>
            <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
            <p className="text-xs text-green-500">S/ {formatCurrency(stats.collected_amount)}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-sm text-gray-500">Vencidos</p>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-xs text-red-500">S/ {formatCurrency(stats.overdue_amount)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {getMonthName(i + 1)}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="reported">Reportados</option>
              <option value="paid">Pagados</option>
              <option value="overdue">Vencidos</option>
            </select>

            <select
              value={filterAdmin}
              onChange={(e) => setFilterAdmin(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">Todos los admins</option>
              {uniqueAdmins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No hay configuraciones de pago activas</p>
            <p className="text-sm mt-2">
              Configura los pagos mensuales en la seccion de configuracion.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cancha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Administrador
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contacto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vencimiento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Detalles
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment, index) => (
                  <tr
                    key={`${payment.config_id}-${index}`}
                    className={`hover:bg-gray-50 ${payment.status === 'reported' ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{payment.field_name}</div>
                      <div className="text-xs text-gray-500">{payment.field_address}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{payment.admin_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{payment.admin_phone || '-'}</div>
                      <div className="text-xs text-gray-500">{payment.admin_email || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        S/ {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">Dia {payment.due_day}</div>
                      {payment.paid_at && (
                        <div className="text-xs text-green-600">
                          Pagado: {new Date(payment.paid_at).toLocaleDateString('es-PE')}
                        </div>
                      )}
                      {payment.reported_at && payment.status === 'reported' && (
                        <div className="text-xs text-blue-600">
                          Reportado: {new Date(payment.reported_at).toLocaleDateString('es-PE')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                    <td className="px-4 py-3">
                      {payment.status === 'reported' && (
                        <div className="space-y-1">
                          {payment.payment_method && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Metodo:</span> {payment.payment_method}
                            </div>
                          )}
                          {payment.payment_reference && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Ref:</span> {payment.payment_reference}
                            </div>
                          )}
                          {payment.payment_voucher_url && (
                            <button
                              onClick={() => handleViewVoucher(payment)}
                              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              <Image className="w-3 h-3" />
                              Ver comprobante
                            </button>
                          )}
                        </div>
                      )}
                      {payment.status === 'paid' && payment.confirmed_by_name && (
                        <div className="text-xs text-gray-500">
                          Confirmado por: {payment.confirmed_by_name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {payment.status === 'reported' && (
                          <>
                            <button
                              onClick={() => handleConfirmPayment(payment)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 inline-flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Confirmar
                            </button>
                            <button
                              onClick={() => handleRejectPayment(payment)}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 inline-flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              Rechazar
                            </button>
                          </>
                        )}
                        {(payment.status === 'pending' || payment.status === 'overdue') && (
                          <button
                            onClick={() => handleRegisterPayment(payment)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Cobrar
                          </button>
                        )}
                        {payment.status === 'paid' && (
                          <button
                            onClick={() => handleDeletePayment(payment)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                          >
                            Revertir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Ver Comprobante */}
      {showVoucherModal && selectedVoucher && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowVoucherModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Comprobante de Pago</h2>
                <p className="text-sm text-gray-500">
                  {selectedVoucher.field_name} - {selectedVoucher.admin_name}
                </p>
              </div>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Monto:</span>
                    <p className="font-bold text-green-600">
                      S/ {formatCurrency(selectedVoucher.amount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Metodo:</span>
                    <p className="font-medium">{selectedVoucher.payment_method || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Referencia:</span>
                    <p className="font-medium font-mono">
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
                    <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">
                      {selectedVoucher.notes}
                    </p>
                  </div>
                )}
                {selectedVoucher.payment_voucher_url && (
                  <div>
                    <span className="text-gray-500 text-sm">Imagen del comprobante:</span>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img
                        src={selectedVoucher.payment_voucher_url?.startsWith('http') ? selectedVoucher.payment_voucher_url : `${API_CONFIG.BASE_URL}${selectedVoucher.payment_voucher_url}`}
                        alt="Comprobante"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowVoucherModal(false)
                    handleConfirmPayment(selectedVoucher)
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 inline-flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirmar Pago
                </button>
                <button
                  onClick={() => {
                    setShowVoucherModal(false)
                    handleRejectPayment(selectedVoucher)
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 inline-flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MonthlyPaymentsView
