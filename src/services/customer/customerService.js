/**
 * CUSTOMER SERVICE
 * Servicio para gestionar clientes en reservas públicas
 */

import { API_CONFIG } from '@/config/api.config'

/**
 * Obtener o crear cliente por teléfono (público, sin autenticación)
 * @param {string} phoneNumber - Número de teléfono
 * @param {string} name - Nombre opcional
 * @returns {Promise<Object>} Cliente existente o recién creado
 */
export const getOrCreateCustomerByPhone = async (phoneNumber, name = null) => {
  try {
    // 1. Buscar cliente existente
    console.log('📞 Buscando cliente con teléfono:', phoneNumber)

    const checkResponse = await fetch(API_CONFIG.CUSTOMERS.GET_BY_PHONE(phoneNumber), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (checkResponse.ok) {
      const data = await checkResponse.json()
      console.log('✅ Cliente encontrado:', data.data.id)
      return data.data
    }

    // 2. Crear nuevo cliente si no existe
    if (checkResponse.status === 404) {
      console.log('📝 Cliente no existe, creando nuevo...')

      const createResponse = await fetch(API_CONFIG.CUSTOMERS.CREATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          name: name || `Cliente ${phoneNumber}`,
          user_id: null,
          email: null,
          is_vip: false,
          notes: 'Cliente creado automáticamente desde reserva pública',
          status: 'active',
        }),
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error || 'Error al crear cliente')
      }

      const newCustomerData = await createResponse.json()
      console.log('✅ Cliente creado:', newCustomerData.data.id)
      return newCustomerData.data
    }

    throw new Error('Error al verificar cliente')
  } catch (error) {
    console.error('❌ Error en getOrCreateCustomerByPhone:', error)
    throw error
  }
}
