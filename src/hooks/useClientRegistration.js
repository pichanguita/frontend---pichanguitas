import { useState, useEffect, useMemo } from 'react'
import Swal from 'sweetalert2'
import useAuthStore from '../store/authStore'
import useBookingStore from '../store/bookingStore'
import useCustomerStore from '../store/customerStore'
import usePricingStore from '../store/modules/pricingStore'
import {
  INITIAL_FORM_DATA,
  calculateDuration,
  generateSlotIds,
  getFilteredTimeOptions,
  validateClientData,
  validateReservationData,
  formatOccupiedSlots,
} from '../utils/client-registration/clientRegistrationHelpers'
import { toISODateString } from '../utils/dateFormatters'

export const useClientRegistration = (selectedDate, isOpen, onSave, onClose) => {
  const { user, getManagedFields } = useAuthStore()
  const { getVisibleFields } = useBookingStore()
  const { customers, loadCustomers } = useCustomerStore()

  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [occupiedSlots, setOccupiedSlots] = useState([])
  const [clientSelectionMode, setClientSelectionMode] = useState('new')
  const [selectedCustomerId, setSelectedCustomerId] = useState('')

  const visibleFields = useMemo(() => {
    try {
      const allFields = getVisibleFields()
      if (!Array.isArray(allFields)) {
        console.warn('⚠️ allFields no es un array:', allFields)
        return []
      }

      const managedFieldIds = getManagedFields()

      if (managedFieldIds.length === 0) {
        return allFields
      }

      const filtered = allFields.filter((field) => managedFieldIds.includes(field.id))
      return filtered
    } catch (error) {
      console.error('❌ Error obteniendo canchas visibles:', error)
      return []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // ✅ Cargar clientes desde el backend cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadCustomers().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (selectedDate && isOpen) {
      // ✅ FIX: Usar toISODateString para evitar bugs de timezone
      // toISOString() convierte a UTC, causando problemas en ciertas horas
      const formattedDate = toISODateString(selectedDate)
      setFormData((prev) => ({
        ...prev,
        date: formattedDate,
      }))
    }
  }, [selectedDate, isOpen])

  useEffect(() => {
    if (formData.date && formData.fieldId) {
      const { existingReservations } = useBookingStore.getState()
      const slots = formatOccupiedSlots(existingReservations, formData.date, formData.fieldId)
      setOccupiedSlots(slots)
    } else {
      setOccupiedSlots([])
    }
  }, [formData.date, formData.fieldId])

  // ✅ FIX: Calcular precios CON descuentos especiales (specialPricing)
  // Esto debe coincidir con la validación del backend
  useEffect(() => {
    if (formData.startTime && formData.endTime && formData.fieldId && formData.date) {
      const duration = calculateDuration(formData.startTime, formData.endTime)
      if (duration > 0) {
        const fieldIdNum = parseInt(formData.fieldId)
        const selectedField = visibleFields.find((f) => f.id === fieldIdNum)

        if (selectedField) {
          // Generar slotIds igual que el backend (ej: ["1pm", "2pm"])
          const slotIds = generateSlotIds(formData.startTime, duration)

          // Calcular precio con descuentos especiales
          const { calculatePriceWithDiscount } = usePricingStore.getState()
          const pricing = calculatePriceWithDiscount(selectedField, formData.date, slotIds)

          // ✅ FIX: Calcular adelanto basado en la configuración de la cancha
          const fieldRequiresAdvance = selectedField?.requiresAdvancePayment === true
          const fieldAdvancePerHour = parseFloat(selectedField?.advancePaymentAmount) || 0

          // Calcular adelanto automático si la cancha lo requiere
          // Adelanto = monto por hora × cantidad de horas (sin exceder el total)
          const calculatedAdvanceFromField = fieldRequiresAdvance
            ? Math.min(fieldAdvancePerHour * duration, pricing.finalPrice)
            : 0

          // Calcular montos según estado de pago
          let advanceAmount = 0
          let remainingAmount = pricing.finalPrice

          if (formData.paymentStatus === 'advance') {
            // Si el admin seleccionó "advance", usar el monto que ingresó
            // pero si no ingresó nada, usar el calculado de la cancha
            advanceAmount = parseFloat(formData.advanceAmount) || calculatedAdvanceFromField
            remainingAmount = pricing.finalPrice - advanceAmount
          } else if (formData.paymentStatus === 'pending' && fieldRequiresAdvance) {
            // ✅ FIX: Si está pendiente pero la cancha requiere adelanto,
            // guardar el adelanto calculado para que se envíe al backend
            advanceAmount = calculatedAdvanceFromField
            remainingAmount = pricing.finalPrice - advanceAmount
          }

          setFormData((prev) => ({
            ...prev,
            duration,
            totalAmount: pricing.finalPrice,
            advanceAmount: advanceAmount,
            remainingAmount: remainingAmount,
            // Guardar info de descuentos para mostrar en UI si es necesario
            originalAmount: pricing.originalPrice,
            discountAmount: pricing.discount,
            appliedDiscounts: pricing.appliedDiscounts,
            // ✅ Guardar info del adelanto para referencia
            fieldRequiresAdvance,
            calculatedAdvanceFromField,
          }))
        }
      }
    }
  }, [
    formData.startTime,
    formData.endTime,
    formData.fieldId,
    formData.date,
    formData.paymentStatus,
    formData.advanceAmount,
    visibleFields,
  ])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }

    // ✅ Lógica inteligente de reseteo de horarios
    if (name === 'date') {
      // Al cambiar fecha, verificar si startTime y endTime siguen siendo válidos
      setFormData((prev) => {
        const newState = { ...prev, [name]: value }

        // Si hay startTime, verificar que siga siendo válido para la nueva fecha
        if (prev.startTime && value) {
          const validStartTimes = getFilteredTimeOptions(value, occupiedSlots, 'start', null)
          const startTimeOption = validStartTimes.find((opt) => opt.time === prev.startTime)
          if (!startTimeOption || startTimeOption.disabled) {
            // startTime ya no es válido, resetear
            newState.startTime = ''
            newState.endTime = ''
            newState.duration = 0
          }
        }

        return newState
      })
      return
    }

    if (name === 'startTime') {
      // Al cambiar hora de inicio, resetear hora de fin
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        endTime: '',
        duration: 0,
      }))
      return
    }

    if (name === 'fieldId') {
      // Al cambiar cancha, resetear horarios porque los ocupados cambian
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        startTime: '',
        endTime: '',
        duration: 0,
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleClientModeChange = (mode) => {
    setClientSelectionMode(mode)

    if (mode === 'new') {
      setSelectedCustomerId('')
      setFormData((prev) => ({
        ...prev,
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        clientNotes: '',
        // ✅ clientDNI removido - no existe en la BD
      }))
    }
  }

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomerId(customerId)

    if (customerId && Array.isArray(customers)) {
      // ✅ Buscar en el array de customers en lugar de acceder como objeto
      const customer = customers.find((c) => c.id === parseInt(customerId))
      if (customer) {
        setFormData((prev) => ({
          ...prev,
          clientName: customer.name || '',
          clientPhone: customer.phoneNumber || '', // ✅ FIX: Backend envía "phoneNumber" (camelCase)
          clientEmail: customer.email || '',
          clientNotes: customer.notes || '',
        }))
      }
    }
  }

  const handleFieldChange = (fieldId) => {
    handleInputChange({ target: { name: 'fieldId', value: fieldId } })
  }

  const validateForm = () => {
    const clientErrors = validateClientData(formData, clientSelectionMode)
    const reservationErrors = validateReservationData(formData)

    const allErrors = { ...clientErrors, ...reservationErrors }
    setErrors(allErrors)
    return Object.keys(allErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const selectedField = visibleFields.find((f) => f.id === formData.fieldId)

      // ✅ INTEGRACIÓN CON BACKEND: Buscar o crear cliente en el backend
      const { getCustomerByPhoneAPI, createCustomerAPI } = useCustomerStore.getState()
      const token = useAuthStore.getState().token

      let customer = null

      // Buscar si ya existe por teléfono
      try {
        customer = await getCustomerByPhoneAPI(formData.clientPhone.trim())
      } catch {
        // Cliente no existe, se creará uno nuevo
      }

      // Si no existe, crearlo
      if (!customer) {
        const customerData = {
          name: formData.clientName.trim(),
          phone_number: formData.clientPhone.trim(), // ✅ Usar phone_number que es el campo del backend
          email: formData.clientEmail.trim() || null,
          notes: formData.clientNotes.trim() || null,
          // ✅ DNI no existe en la tabla customers, no enviarlo
        }
        customer = await createCustomerAPI(customerData, token)
      }

      if (!customer || !customer.id) {
        throw new Error('No se pudo obtener o crear el cliente en el backend')
      }

      const clientRegistration = {
        id: `admin-reg-${Date.now()}`,
        type: 'admin_registered',
        name: formData.clientName.trim(),
        phone: formData.clientPhone.trim(),
        email: formData.clientEmail.trim() || null,
        clientNotes: formData.clientNotes.trim() || null,
        fieldId: formData.fieldId,
        fieldName: selectedField?.name,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        duration: formData.duration,
        totalAmount: formData.totalAmount,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod || null,
        advanceAmount:
          formData.paymentStatus === 'advance' ? parseFloat(formData.advanceAmount) : 0,
        remainingAmount: formData.paymentStatus === 'advance' ? formData.remainingAmount : 0,
        registeredBy: {
          id: user?.id,
          name: user?.name,
          role: user?.role,
        },
        adminNotes: formData.adminNotes.trim() || null,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        customerId: customer.id, // ✅ Usar el ID del backend
      }

      await onSave(clientRegistration)

      Swal.fire({
        icon: 'success',
        title: 'Cliente Registrado',
        text: `${formData.clientName} ha sido registrado exitosamente`,
        timer: 2000,
        showConfirmButton: false,
        showCloseButton: true,
        allowEscapeKey: true,
      })

      setFormData(INITIAL_FORM_DATA)
      setClientSelectionMode('new')
      setSelectedCustomerId('')

      onClose()
    } catch (error) {
      console.error('❌ Error en handleSubmit:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo registrar el cliente. Intenta nuevamente.',
        confirmButtonColor: '#22c55e',
        showCloseButton: true,
        allowEscapeKey: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData(INITIAL_FORM_DATA)
      setErrors({})
      setClientSelectionMode('new')
      setSelectedCustomerId('')
      onClose()
    }
  }

  return {
    formData,
    errors,
    isLoading,
    occupiedSlots,
    clientSelectionMode,
    selectedCustomerId,
    visibleFields,
    handleInputChange,
    handleClientModeChange,
    handleSelectCustomer,
    handleFieldChange,
    handleSubmit,
    handleClose,
  }
}

export default useClientRegistration
