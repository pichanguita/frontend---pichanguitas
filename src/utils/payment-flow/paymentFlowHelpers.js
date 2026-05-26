import { CreditCard, Smartphone } from 'lucide-react'

/**
 * Configuración de SweetAlert2
 */
export const SWAL_CONFIG = {
  confirmButtonColor: '#22c55e',
  showCloseButton: true,
  allowEscapeKey: true,
}

/**
 * Obtiene el ícono correspondiente a un método de pago
 */
export const getMethodIcon = (method) => {
  if (method.id === 'yape' || method.id === 'plin') return Smartphone
  return CreditCard
}

/**
 * Genera los datos de reserva para el PDF
 */
export const generateReservationData = (
  selectedField,
  selectedDate,
  selectedTimeRanges,
  timeRanges,
  phoneNumber,
  paymentMethod,
  totalAmount
) => {
  return {
    id: Date.now().toString().slice(-6),
    createdAt: new Date(),
    field: {
      name: selectedField?.name,
      address:
        selectedField?.address ||
        `${selectedField?.distrito}, ${selectedField?.provincia}, Apurímac`,
      phone: selectedField?.phone || null,
      pricePerHour: selectedField?.pricePerHour,
      amenities: selectedField?.amenities || [],
    },
    date: selectedDate,
    timeSlots: selectedTimeRanges.map((id) => timeRanges.find((tr) => tr.id === id)?.label),
    totalHours: selectedTimeRanges.length,
    phoneNumber: phoneNumber,
    totalAmount: totalAmount,
    paymentMethod: paymentMethod,
    isPendingCashPayment: paymentMethod === 'efectivo',
  }
}

/**
 * Genera los datos para WhatsApp
 */
export const generateWhatsAppData = (
  phoneNumber,
  selectedDate,
  selectedTimeRanges,
  timeRanges,
  totalAmount,
  paymentMethod
) => {
  return {
    phoneNumber: phoneNumber,
    customerName: phoneNumber,
    date: selectedDate,
    startTime: timeRanges.find((tr) => tr.id === selectedTimeRanges[0])?.startTime,
    endTime: timeRanges.find((tr) => tr.id === selectedTimeRanges[selectedTimeRanges.length - 1])
      ?.endTime,
    totalAmount: totalAmount,
    paymentMethod: paymentMethod,
    totalHours: selectedTimeRanges.length,
  }
}
