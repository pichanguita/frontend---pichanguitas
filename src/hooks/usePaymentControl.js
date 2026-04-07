/**
 * Custom Hook: usePaymentControl
 *
 * Gestiona el estado y la lógica de carga para el módulo de control de pagos
 * ACTUALIZADO: Sistema simplificado - los cobros se calculan desde payment_configs
 */

import { useState, useEffect } from 'react'
import { API_CONFIG } from '../config/api.config'
import usePaymentStore from '../store/paymentStore'
import useAuthStore from '../store/authStore'

const API_URL = API_CONFIG.BASE_URL

export const usePaymentControl = () => {
  const { loadMonthlyPendingAmount } = usePaymentStore()
  const token = useAuthStore((state) => state.token)

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [payments, setPayments] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [fieldsWithDebt, setFieldsWithDebt] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Cargar datos cuando cambia el mes/año
  useEffect(() => {
    loadPaymentsFromAPI()
    loadStats()
  }, [selectedYear, selectedMonth])

  const loadPaymentsFromAPI = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `${API_URL}/api/monthly-payments?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.ok) {
        const data = await response.json()
        const paymentsList = (data.data || []).map((p) => ({
          id: p.payment_id || `config-${p.config_id}`,
          configId: p.config_id,
          fieldId: p.field_id,
          fieldName: p.field_name,
          fieldAddress: p.field_address,
          adminId: p.admin_id,
          adminName: p.admin_name,
          adminPhone: p.admin_phone,
          adminEmail: p.admin_email,
          amount: parseFloat(p.amount) || 0,
          dueDay: p.due_day,
          dueDate: p.due_date,
          status: p.status,
          paidAt: p.paid_at,
          paidAmount: parseFloat(p.paid_amount) || 0,
          payment_method: p.payment_method,
          payment_reference: p.payment_reference,
          payment_voucher_url: p.payment_voucher_url,
          notes: p.notes,
          reportedAt: p.reported_at,
          reportedByName: p.reported_by_name,
          confirmedByName: p.confirmed_by_name,
        }))
        setPayments(paymentsList)
        calculateFieldsWithDebt(paymentsList)
      }
    } catch (error) {
      console.error('Error cargando pagos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/monthly-payments/stats?month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setMetrics({
            totalExpected: parseFloat(data.data.total_amount) || 0,
            totalPaid: parseFloat(data.data.collected_amount) || 0,
            totalPending: parseFloat(data.data.pending_amount) || 0,
            totalOverdue: parseFloat(data.data.overdue_amount) || 0,
            totalReported: parseFloat(data.data.reported_amount) || 0,
            totalFields: data.data.total_payments || 0,
            paidCount: data.data.paid || 0,
            pendingCount: data.data.pending || 0,
            overdueCount: data.data.overdue || 0,
            reportedCount: data.data.reported || 0,
          })
        }
      }
    } catch (error) {
      console.error('Error cargando stats:', error)
    }
  }

  const calculateFieldsWithDebt = (paymentsList) => {
    const overdueList = paymentsList.filter((p) => p.status === 'overdue')
    const debtByField = {}

    overdueList.forEach((p) => {
      const key = p.fieldId
      if (!debtByField[key]) {
        debtByField[key] = {
          fieldId: p.fieldId,
          fieldName: p.fieldName,
          totalDebt: 0,
          overdueCount: 0,
          maxDaysLate: 0,
        }
      }
      debtByField[key].totalDebt += p.amount
      debtByField[key].overdueCount += 1

      const dueDate = new Date(selectedYear, selectedMonth - 1, p.dueDay)
      const today = new Date()
      const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))
      if (daysLate > debtByField[key].maxDaysLate) {
        debtByField[key].maxDaysLate = daysLate
      }
    })

    setFieldsWithDebt(Object.values(debtByField))
  }

  const refreshAll = async () => {
    await loadPaymentsFromAPI()
    await loadStats()
    await loadMonthlyPendingAmount()
  }

  // Registrar pago usando nueva API
  const registerPayment = async (payment) => {
    try {
      const response = await fetch(`${API_URL}/api/monthly-payments/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          config_id: payment.configId,
          field_id: payment.fieldId,
          admin_id: payment.adminId,
          month: selectedMonth,
          year: selectedYear,
          amount: payment.amount,
          due_day: payment.dueDay,
        }),
      })

      const data = await response.json()
      if (data.success) {
        await refreshAll()
        return true
      }
      return false
    } catch (error) {
      console.error('Error registrando pago:', error)
      return false
    }
  }

  // Confirmar un pago reportado (super_admin)
  const confirmPayment = async (payment) => {
    try {
      const response = await fetch(`${API_URL}/api/monthly-payments/${payment.id}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: '' }),
      })

      const data = await response.json()
      if (data.success) {
        await refreshAll()
        return true
      }
      return false
    } catch (error) {
      console.error('Error confirmando pago:', error)
      return false
    }
  }

  // Rechazar un pago reportado (super_admin)
  const rejectPayment = async (payment, reason) => {
    try {
      const response = await fetch(`${API_URL}/api/monthly-payments/${payment.id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      })

      const data = await response.json()
      if (data.success) {
        await refreshAll()
        return true
      }
      return false
    } catch (error) {
      console.error('Error rechazando pago:', error)
      return false
    }
  }

  // Ya no se necesita generar pagos - se calculan automáticamente
  const generateMonthlyPayments = async () => {
    // No-op: los cobros ahora se calculan automáticamente desde payment_configs
    return 0
  }

  // Retornar configs vacías (ya no se usan)
  const getAllPaymentConfigs = () => []

  return {
    // Estado
    selectedYear,
    selectedMonth,
    payments,
    metrics,
    fieldsWithDebt,
    isLoading,

    // Setters
    setSelectedYear,
    setSelectedMonth,

    // Acciones
    refreshAll,
    registerPayment,
    confirmPayment,
    rejectPayment,
    generateMonthlyPayments,
    getAllPaymentConfigs,
  }
}
