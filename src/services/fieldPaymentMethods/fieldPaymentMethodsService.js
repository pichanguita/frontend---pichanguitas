/**
 * Field Payment Methods Service
 * Servicio para gestionar los métodos de pago de las canchas
 */

import { API_CONFIG } from '../../config/api.config'

const BASE_URL = API_CONFIG.BASE_URL

/**
 * Obtener métodos de pago de una cancha (público)
 */
export const getFieldPaymentMethods = async (fieldId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/field-payment-methods/field/${fieldId}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener métodos de pago')
    }

    return data.data || []
  } catch (error) {
    console.error('Error en getFieldPaymentMethods:', error)
    throw error
  }
}

/**
 * Obtener todos los métodos de pago de las canchas del admin
 */
export const getAdminFieldsPaymentMethods = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/field-payment-methods/admin/fields`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener métodos de pago')
    }

    return data.data || []
  } catch (error) {
    console.error('Error en getAdminFieldsPaymentMethods:', error)
    throw error
  }
}

/**
 * Guardar método de pago individual
 */
export const saveFieldPaymentMethod = async (fieldId, methodData, token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/field-payment-methods/field/${fieldId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(methodData),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al guardar método de pago')
    }

    return data
  } catch (error) {
    console.error('Error en saveFieldPaymentMethod:', error)
    throw error
  }
}

/**
 * Actualizar múltiples métodos de pago de una cancha
 */
export const updateFieldPaymentMethods = async (fieldId, methods, token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/field-payment-methods/field/${fieldId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ methods }),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar métodos de pago')
    }

    return data
  } catch (error) {
    console.error('Error en updateFieldPaymentMethods:', error)
    throw error
  }
}

/**
 * Eliminar método de pago
 */
export const deleteFieldPaymentMethod = async (fieldId, methodType, token) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/field-payment-methods/field/${fieldId}/${methodType}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar método de pago')
    }

    return data
  } catch (error) {
    console.error('Error en deleteFieldPaymentMethod:', error)
    throw error
  }
}

/**
 * Subir imagen QR para método de pago
 */
export const uploadPaymentQRImage = async (fieldId, methodType, imageFile, token) => {
  try {
    const formData = new FormData()
    formData.append('qrImage', imageFile)

    const response = await fetch(
      `${BASE_URL}/api/field-payment-methods/field/${fieldId}/${methodType}/qr`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    )
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al subir imagen QR')
    }

    return data
  } catch (error) {
    console.error('Error en uploadPaymentQRImage:', error)
    throw error
  }
}

/**
 * Constantes de métodos de pago disponibles
 */
export const AVAILABLE_PAYMENT_METHODS = [
  {
    id: 'yape',
    name: 'Yape',
    description: 'Billetera digital del BCP',
    icon: '📱',
    color: '#722ed1',
    hasQR: true,
    requiresPhone: true,
    requiresAccountNumber: false,
    requiresBankInfo: false,
  },
  {
    id: 'plin',
    name: 'Plin',
    description: 'Billetera digital interbancaria',
    icon: '💳',
    color: '#00b8a9',
    hasQR: true,
    requiresPhone: true,
    requiresAccountNumber: false,
    requiresBankInfo: false,
  },
  {
    id: 'bcp',
    name: 'BCP',
    description: 'Transferencia bancaria BCP',
    icon: '🏦',
    color: '#1976d2',
    hasQR: false,
    requiresPhone: false,
    requiresAccountNumber: true,
    requiresBankInfo: true,
  },
  {
    id: 'interbank',
    name: 'Interbank',
    description: 'Transferencia bancaria Interbank',
    icon: '🏛️',
    color: '#2e7d32',
    hasQR: false,
    requiresPhone: false,
    requiresAccountNumber: true,
    requiresBankInfo: true,
  },
  {
    id: 'bbva',
    name: 'BBVA',
    description: 'Transferencia bancaria BBVA',
    icon: '🏦',
    color: '#004481',
    hasQR: false,
    requiresPhone: false,
    requiresAccountNumber: true,
    requiresBankInfo: true,
  },
  {
    id: 'scotiabank',
    name: 'Scotiabank',
    description: 'Transferencia bancaria Scotiabank',
    icon: '🏛️',
    color: '#cc0000',
    hasQR: false,
    requiresPhone: false,
    requiresAccountNumber: true,
    requiresBankInfo: true,
  },
]

export default {
  getFieldPaymentMethods,
  getAdminFieldsPaymentMethods,
  saveFieldPaymentMethod,
  updateFieldPaymentMethods,
  deleteFieldPaymentMethod,
  uploadPaymentQRImage,
  AVAILABLE_PAYMENT_METHODS,
}
