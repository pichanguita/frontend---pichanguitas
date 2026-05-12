/**
 * Servicio de Autenticación
 *
 * Maneja login y registro contra el backend.
 * El logout es puramente cliente (limpia el store): no hay endpoint en el
 * backend para invalidar tokens. La expiración real la controla el JWT.
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Realiza el login de un usuario (Admin o Cliente)
 * @param {Object} credentials - Credenciales del usuario
 * @param {string} credentials.identifier - Email, username o teléfono
 * @param {string} credentials.password - Contraseña
 * @returns {Promise<Object>} Respuesta del servidor con token y datos del usuario
 */
export const loginUser = async (credentials) => {
  try {
    const { identifier, password } = credentials

    // Validaciones básicas
    if (!identifier || !password) {
      throw new Error('Todos los campos son requeridos')
    }

    const response = await fetch(API_CONFIG.AUTH.LOGIN, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        identifier,
        password,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Manejo de errores específicos del servidor
      throw new Error(data.message || data.error || 'Error en el login')
    }

    // Validación defensiva: verificar que id_rol esté presente
    if (!data.user?.id_rol && data.user?.role_id) {
      data.user.id_rol = data.user.role_id
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message,
    }
  } catch (error) {
    console.error('❌ Error en login:', error)
    throw new Error(error.message || 'Error al iniciar sesión')
  }
}

/**
 * Registra un nuevo usuario cliente
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(API_CONFIG.AUTH.REGISTER, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error en el registro')
    }

    return {
      success: true,
      message: data.message,
      user: data.user,
    }
  } catch (error) {
    console.error('❌ Error en registro:', error)
    throw new Error(error.message || 'Error al registrar usuario')
  }
}
