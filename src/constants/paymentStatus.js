/**
 * Constantes de Estados y Métodos de Pago
 *
 * Valores extraídos de paymentStore.js y componentes de pago
 */

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PARTIAL: 'partial',
  FULLY_PAID: 'fully_paid', // Usado en AdminPanel
  PARTIALLY_PAID: 'partially_paid', // Usado en AdminPanel
  VERIFIED: 'verified',
  REJECTED: 'rejected',
}

export const PAYMENT_METHODS = {
  YAPE: 'yape',
  PLIN: 'plin',
  BCP: 'bcp',
  INTERBANK: 'interbank',
  CASH: 'cash',
  TRANSFER: 'transfer',
}

// Labels para UI
export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pendiente',
  [PAYMENT_STATUS.PAID]: 'Pagado',
  [PAYMENT_STATUS.PARTIAL]: 'Parcial',
  [PAYMENT_STATUS.FULLY_PAID]: 'Pagado',
  [PAYMENT_STATUS.PARTIALLY_PAID]: 'Parcial',
  [PAYMENT_STATUS.VERIFIED]: 'Verificado',
  [PAYMENT_STATUS.REJECTED]: 'Rechazado',
}

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.YAPE]: 'Yape',
  [PAYMENT_METHODS.PLIN]: 'Plin',
  [PAYMENT_METHODS.BCP]: 'BCP',
  [PAYMENT_METHODS.INTERBANK]: 'Interbank',
  [PAYMENT_METHODS.CASH]: 'Efectivo',
  [PAYMENT_METHODS.TRANSFER]: 'Transferencia',
}

// Colores para indicadores
export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: 'yellow',
  [PAYMENT_STATUS.PAID]: 'green',
  [PAYMENT_STATUS.PARTIAL]: 'orange',
  [PAYMENT_STATUS.VERIFIED]: 'blue',
  [PAYMENT_STATUS.REJECTED]: 'red',
}

// Arrays de valores válidos
export const VALID_PAYMENT_STATUS = Object.values(PAYMENT_STATUS)
export const VALID_PAYMENT_METHODS = Object.values(PAYMENT_METHODS)

// Helper functions
export const isPending = (status) => status === PAYMENT_STATUS.PENDING
export const isPaid = (status) => status === PAYMENT_STATUS.PAID
export const isVerified = (status) => status === PAYMENT_STATUS.VERIFIED
