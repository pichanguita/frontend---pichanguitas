/**
 * Servicio de Autenticación
 *
 * Maneja todas las operaciones relacionadas con autenticación:
 * - Login
 * - Registro
 * - Logout
 * - Verificación de token
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

/**
 * Cierra la sesión del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const logoutUser = async (token) => {
  try {
    const response = await fetch(API_CONFIG.AUTH.LOGOUT, {
      method: 'POST',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error al cerrar sesión')
    }

    return {
      success: true,
      message: data.message,
    }
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error)
    // No lanzar error en logout para permitir cierre de sesión local
    return {
      success: false,
      message: error.message,
    }
  }
}

/**
 * Verifica si un token es válido
 * @param {string} token - Token a verificar
 * @returns {Promise<Object>} Información del usuario si el token es válido
 */
export const verifyToken = async (token) => {
  try {
    const response = await fetch(API_CONFIG.AUTH.VERIFY_TOKEN, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Token inválido')
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error('❌ Token inválido:', error)
    return {
      success: false,
      message: error.message,
    }
  }
}

/**
 * Refresca el token de autenticación
 * @param {string} token - Token actual
 * @returns {Promise<Object>} Nuevo token
 */
export const refreshToken = async (token) => {
  try {
    const response = await fetch(API_CONFIG.AUTH.REFRESH_TOKEN, {
      method: 'POST',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error al refrescar token')
    }

    return {
      success: true,
      token: data.token,
    }
  } catch (error) {
    console.error('❌ Error al refrescar token:', error)
    throw new Error(error.message)
  }
}
