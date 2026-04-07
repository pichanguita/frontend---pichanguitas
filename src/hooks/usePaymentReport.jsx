import { useState, useCallback } from 'react'
import { API_CONFIG } from '../config/api.config'
import Swal from 'sweetalert2'
import { CreditCard, Building2, Smartphone, QrCode } from 'lucide-react'

/**
 * Hook compartido para la logica de reporte de pagos mensuales.
 * Usado por AdminPaymentStatus y MyMonthlyPaymentsModule.
 *
 * @param {string} token - Token de autenticacion
 * @param {function} onSuccess - Callback a ejecutar cuando el reporte es exitoso
 * @returns {object} Estados y funciones para el reporte de pagos
 */
export const usePaymentReport = (token, onSuccess) => {
  const [platformPaymentMethods, setPlatformPaymentMethods] = useState([])
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [reportForm, setReportForm] = useState({
    payment_method: '',
    payment_reference: '',
    payment_voucher_file: null,
    payment_voucher_preview: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  /**
   * Cargar metodos de pago de la plataforma
   */
  const loadPlatformPaymentMethods = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/platform-payment-methods?active_only=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (!res.ok) {
        throw new Error('Error al cargar metodos de pago')
      }

      const data = await res.json()
      if (data.success) {
        setPlatformPaymentMethods(data.data || [])
      }
    } catch (error) {
      console.error('Error cargando metodos de pago:', error)
    }
  }, [token])

  /**
   * Abrir modal de reporte de pago
   * @param {object} payment - Datos del pago a reportar
   */
  const handleOpenReportModal = useCallback((payment) => {
    setSelectedPayment(payment)
    setReportForm({
      payment_method: '',
      payment_reference: '',
      payment_voucher_file: null,
      payment_voucher_preview: '',
      notes: '',
    })
    setShowReportModal(true)
  }, [])

  /**
   * Cerrar modal de reporte
   */
  const handleCloseReportModal = useCallback(() => {
    setShowReportModal(false)
    setSelectedPayment(null)
    setReportForm({
      payment_method: '',
      payment_reference: '',
      payment_voucher_file: null,
      payment_voucher_preview: '',
      notes: '',
    })
  }, [])

  /**
   * Manejar subida de archivo de comprobante
   * @param {Event} e - Evento de input file
   */
  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0]
    if (!file) return

    // Guardar el archivo original para enviar al servidor
    setReportForm((prev) => ({ ...prev, payment_voucher_file: file }))

    // Crear preview para mostrar en el UI
    const reader = new FileReader()
    reader.onload = () => {
      setReportForm((prev) => ({ ...prev, payment_voucher_preview: reader.result }))
    }
    reader.readAsDataURL(file)
  }, [])

  /**
   * Enviar reporte de pago
   * @param {object} payloadOverrides - Campos adicionales para el payload (opcionales)
   */
  const handleSubmitReport = useCallback(
    async (eventOrOverrides) => {
      // Ignorar si es un evento de click (evita error de estructura circular)
      const payloadOverrides =
        eventOrOverrides && eventOrOverrides.target ? {} : eventOrOverrides || {}
      if (!reportForm.payment_method) {
        Swal.fire('Error', 'Selecciona un metodo de pago', 'error')
        return
      }

      if (!reportForm.payment_reference) {
        Swal.fire('Error', 'Ingresa el numero de operacion o referencia', 'error')
        return
      }

      if (!selectedPayment) {
        Swal.fire('Error', 'No hay pago seleccionado', 'error')
        return
      }

      try {
        setSubmitting(true)

        // Construir FormData para enviar archivo
        const formData = new FormData()
        formData.append('config_id', selectedPayment.config_id || selectedPayment.config?.id)
        formData.append('field_id', selectedPayment.field_id || selectedPayment.fieldId)
        formData.append('admin_id', selectedPayment.admin_id)
        formData.append('month', selectedPayment.month)
        formData.append('year', selectedPayment.year)
        formData.append('amount', selectedPayment.amount || selectedPayment.config?.monthlyFee)
        formData.append('due_day', selectedPayment.due_day || selectedPayment.config?.dueDay || 10)
        formData.append('payment_method', reportForm.payment_method)
        formData.append('payment_reference', reportForm.payment_reference)
        if (reportForm.notes) formData.append('notes', reportForm.notes)
        if (reportForm.payment_voucher_file) {
          formData.append('voucher', reportForm.payment_voucher_file)
        }

        // Agregar overrides
        Object.entries(payloadOverrides).forEach(([key, value]) => {
          if (value !== undefined && value !== null) formData.append(key, value)
        })

        const res = await fetch(`${API_CONFIG.BASE_URL}/api/monthly-payments/report`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })

        if (!res.ok) {
          throw new Error('Error de conexion al reportar pago')
        }

        const data = await res.json()

        if (data.success) {
          await Swal.fire({
            icon: 'success',
            title: 'Pago Reportado',
            text: 'Tu pago ha sido reportado exitosamente. El administrador lo revisara pronto.',
            confirmButtonColor: '#10B981',
          })
          handleCloseReportModal()
          if (onSuccess) {
            onSuccess()
          }
        } else {
          throw new Error(data.error || 'Error al reportar pago')
        }
      } catch (error) {
        console.error('Error reportando pago:', error)
        Swal.fire('Error', error.message || 'No se pudo reportar el pago', 'error')
      } finally {
        setSubmitting(false)
      }
    },
    [token, reportForm, selectedPayment, onSuccess, handleCloseReportModal]
  )

  /**
   * Obtener icono segun tipo de metodo de pago
   * @param {string} methodType - Tipo de metodo de pago
   * @returns {JSX.Element} Componente de icono
   */
  const getMethodIcon = useCallback((methodType) => {
    switch (methodType) {
      case 'bank_transfer':
        return <Building2 className="w-5 h-5" />
      case 'yape':
      case 'plin':
        return <Smartphone className="w-5 h-5" />
      case 'qr':
        return <QrCode className="w-5 h-5" />
      default:
        return <CreditCard className="w-5 h-5" />
    }
  }, [])

  /**
   * Actualizar un campo del formulario de reporte
   * @param {string} field - Nombre del campo
   * @param {any} value - Nuevo valor
   */
  const updateReportForm = useCallback((field, value) => {
    setReportForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  /**
   * Limpiar imagen del comprobante
   */
  const clearVoucherImage = useCallback(() => {
    setReportForm((prev) => ({ ...prev, payment_voucher_file: null, payment_voucher_preview: '' }))
  }, [])

  return {
    // Estados
    platformPaymentMethods,
    showReportModal,
    selectedPayment,
    reportForm,
    submitting,

    // Setters directos (para casos donde se necesite control fino)
    setShowReportModal,
    setSelectedPayment,
    setReportForm,

    // Funciones principales
    loadPlatformPaymentMethods,
    handleOpenReportModal,
    handleCloseReportModal,
    handleFileUpload,
    handleSubmitReport,
    getMethodIcon,
    updateReportForm,
    clearVoucherImage,
  }
}

export default usePaymentReport
