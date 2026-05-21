// WhatsApp service for Canchas Apurimac
// Generates WhatsApp links with pre-formatted reservation confirmations

/**
 * Formats phone number for WhatsApp (removes spaces, adds country code if needed)
 */
export const formatPhoneForWhatsApp = (phoneNumber) => {
  // Remove all non-numeric characters
  let cleaned = phoneNumber.replace(/\D/g, '')

  // Add Peru country code if not present
  if (!cleaned.startsWith('51') && cleaned.length === 9) {
    cleaned = '51' + cleaned
  }

  return cleaned
}

/**
 * Gets payment method display name
 */
const getPaymentMethodName = (methodId) => {
  const methods = {
    yape: 'Yape',
    plin: 'Plin',
    bcp: 'Transferencia BCP',
    interbank: 'Transferencia Interbank',
    cash: 'Efectivo en cancha',
    efectivo: 'Efectivo en cancha',
  }
  return methods[methodId] || 'Pago digital'
}

/**
 * Generates reservation confirmation message for WhatsApp
 */
export const generateConfirmationMessage = (reservationData, fieldData) => {
  const date = new Date(reservationData.date)
  const formattedDate = date.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const fieldName = fieldData?.name || 'Cancha'
  const fieldAddress = fieldData?.address || fieldData?.distrito || ''

  const message = `🔔 *NUEVA RESERVA*
━━━━━━━━━━━━━━━━━━━━━━━━

🏟️ *Cancha:* ${fieldName}
📍 *Ubicacion:* ${fieldAddress}
📅 *Fecha:* ${formattedDate}
⏰ *Horario:* ${reservationData.startTime} - ${reservationData.endTime}
⏱️ *Duracion:* ${reservationData.totalHours} hora${reservationData.totalHours > 1 ? 's' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━
👤 *DATOS DEL CLIENTE:*
━━━━━━━━━━━━━━━━━━━━━━━━
📱 *Telefono:* ${reservationData.phoneNumber}
👤 *Nombre:* ${reservationData.customerName || reservationData.phoneNumber}

━━━━━━━━━━━━━━━━━━━━━━━━
💰 *PAGO:*
━━━━━━━━━━━━━━━━━━━━━━━━
💵 *Total:* S/ ${reservationData.totalAmount}
💳 *Metodo:* ${getPaymentMethodName(reservationData.paymentMethod)}

✅ *Reserva registrada en el sistema*

📞 Puedes contactar al cliente directamente desde este chat.`

  return message.trim()
}

/**
 * Creates a shareable WhatsApp link for field information
 */
export const createFieldShareLink = (fieldData) => {
  const message = `🏟️ *${fieldData.name}*
*Canchas Apurimac*

📍 *Ubicacion:* ${fieldData.address || fieldData.distrito || ''}
💰 *Precio:* S/ ${fieldData.pricePerHour}/hora
⏰ *Horarios:* Consultar disponibilidad
☎️ *Contacto:* ${fieldData.phone || ''}

${
  Array.isArray(fieldData.amenities) && fieldData.amenities.length > 0
    ? `🌟 *Servicios:*\n${fieldData.amenities.map((a) => `• ${a.label}`).join('\n')}`
    : ''
}

📱 *¡Reserva ahora!*
🌐 www.canchasapurimac.com`

  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/?text=${encodedMessage}`
}

export default {
  formatPhoneForWhatsApp,
  generateConfirmationMessage,
  createFieldShareLink,
}
