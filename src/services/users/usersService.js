/**
 * USERS SERVICE
 *
 * Servicio para operaciones CRUD de usuarios del sistema.
 * Maneja administradores, propietarios de canchas y otros roles.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== API CALLS ====================

/**
 * Obtener todos los usuarios desde el backend
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.role - Filtrar por rol
 * @param {string} filters.admin_type - Filtrar por tipo de admin
 * @param {boolean} filters.is_active - Filtrar por estado activo
 * @param {string} filters.search - Búsqueda por nombre, email o username
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de usuarios
 */
// Mapeo de nombres de rol a IDs
const ROLE_IDS = {
  super_admin: 1,
  admin: 2,
  customer: 3,
}

export const fetchUsers = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams()

    // Convertir role (string) a role_id (number) si es necesario
    if (filters.role) {
      const roleId = ROLE_IDS[filters.role]
      if (roleId) queryParams.append('role_id', roleId)
    }
    if (filters.role_id) queryParams.append('role_id', filters.role_id)
    if (filters.admin_type) queryParams.append('admin_type', filters.admin_type)
    if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active)
    if (filters.search) queryParams.append('search', filters.search)

    const url = `${API_CONFIG.USERS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener usuarios')
    }

    return data.data || []
  } catch (error) {
    throw new Error(error.message || 'Error al obtener usuarios')
  }
}

/**
 * Obtener un usuario por ID desde el backend
 * @param {string} userId - ID del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Usuario
 */
export const fetchUserById = async (userId, token) => {
  try {
    const response = await fetch(API_CONFIG.USERS.GET_BY_ID(userId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener usuario')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al obtener usuario')
  }
}

/**
 * Crear un nuevo usuario en el backend
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.username - Nombre de usuario (único)
 * @param {string} userData.email - Email (único)
 * @param {string} userData.password - Contraseña
 * @param {string} userData.full_name - Nombre completo
 * @param {string} userData.phone - Teléfono
 * @param {string} userData.role - Rol del usuario
 * @param {string} userData.admin_type - Tipo de admin (si aplica)
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Usuario creado
 */
export const createUserAPI = async (userData, token) => {
  try {
    const response = await fetch(API_CONFIG.USERS.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear usuario')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al crear usuario')
  }
}

/**
 * Actualizar un usuario en el backend
 * @param {string} userId - ID del usuario
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateUserAPI = async (userId, updates, token) => {
  try {
    const response = await fetch(API_CONFIG.USERS.UPDATE(userId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar usuario')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar usuario')
  }
}

/**
 * Cambiar contraseña de un usuario en el backend
 * @param {string} userId - ID del usuario
 * @param {Object} passwordData - Datos de la contraseña
 * @param {string} passwordData.current_password - Contraseña actual (opcional según permisos)
 * @param {string} passwordData.new_password - Nueva contraseña
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Resultado de la operación
 */
export const changePasswordAPI = async (userId, passwordData, token) => {
  try {
    const response = await fetch(API_CONFIG.USERS.UPDATE_PASSWORD(userId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(passwordData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al cambiar contraseña')
    }

    return data.data || { success: true }
  } catch (error) {
    throw new Error(error.message || 'Error al cambiar contraseña')
  }
}

/**
 * Asignar canchas a un usuario en el backend
 * @param {string} userId - ID del usuario
 * @param {Object} assignmentData - Datos de asignación
 * @param {Array<string>} assignmentData.field_ids - IDs de las canchas a asignar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Resultado de la asignación
 */
export const assignFieldsAPI = async (userId, assignmentData, token) => {
  try {
    const response = await fetch(API_CONFIG.USERS.ASSIGN_FIELDS(userId), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(assignmentData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al asignar canchas')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al asignar canchas')
  }
}

/**
 * Eliminar un usuario (soft delete) en el backend
 * @param {string} userId - ID del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteUserAPI = async (userId, token) => {
  try {
    const response = await fetch(API_CONFIG.USERS.DELETE(userId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar usuario')
    }

    return true
  } catch (error) {
    throw new Error(error.message || 'Error al eliminar usuario')
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Obtener usuarios por rol (helper)
 * @param {string} role - Rol a filtrar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de usuarios
 */
export const fetchUsersByRole = async (role, token) => {
  return fetchUsers({ role }, token)
}

/**
 * Obtener usuarios administradores (helper)
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de administradores
 */
export const fetchAdminUsers = async (token) => {
  return fetchUsers({ role: 'admin' }, token)
}

/**
 * Obtener usuarios propietarios de canchas (helper)
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de propietarios
 */
export const fetchFieldOwners = async (token) => {
  return fetchUsers({ admin_type: 'field_owner' }, token)
}

/**
 * Resetear contraseña de un usuario (genera contraseña temporal)
 * Solo disponible para SuperAdmin
 * @param {string} userId - ID del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Objeto con la contraseña temporal generada
 */
export const resetPasswordAPI = async (userId, token) => {
  try {
    const response = await fetch(API_CONFIG.USERS.RESET_PASSWORD(userId), {
      method: 'POST',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al resetear contraseña')
    }

    return data.data || data
  } catch (error) {
    throw new Error(error.message || 'Error al resetear contraseña')
  }
}

/**
 * Actualizar el perfil del usuario autenticado (Mi Perfil)
 * @param {Object} profileData - Datos del perfil a actualizar
 * @param {string} profileData.name - Nombre del usuario
 * @param {string} profileData.email - Email del usuario
 * @param {string} profileData.phone - Teléfono del usuario
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateMyProfileAPI = async (profileData, token) => {
  try {
    const response = await fetch(API_CONFIG.USERS.UPDATE_MY_PROFILE, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(profileData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar perfil')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar perfil')
  }
}
