/**
 * ROLES & PERMISSIONS SERVICE
 *
 * Servicio para operaciones de roles y permisos del sistema.
 * Maneja la gestión de roles, permisos y asignación de permisos a roles.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== ROLES ====================

/**
 * Obtener todos los roles desde el backend
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de roles
 */
export const fetchRoles = async (token) => {
  try {
    console.log('🛡️ Obteniendo roles')

    const response = await fetch(API_CONFIG.ROLES_PERMISSIONS.GET_ROLES, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener roles')
    }

    console.log('✅ Roles obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener roles:', error)
    throw new Error(error.message || 'Error al obtener roles')
  }
}

/**
 * Obtener un rol por ID desde el backend
 * @param {string} roleId - ID del rol
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Rol
 */
export const fetchRoleById = async (roleId, token) => {
  try {
    console.log('🛡️ Obteniendo rol:', roleId)

    const response = await fetch(API_CONFIG.ROLES_PERMISSIONS.GET_ROLE_BY_ID(roleId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener rol')
    }

    console.log('✅ Rol obtenido:', data.data?.name)

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener rol:', error)
    throw new Error(error.message || 'Error al obtener rol')
  }
}

// ==================== PERMISSIONS ====================

/**
 * Obtener todos los permisos desde el backend
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de permisos
 */
export const fetchPermissions = async (token) => {
  try {
    console.log('🛡️ Obteniendo permisos')

    const response = await fetch(API_CONFIG.ROLES_PERMISSIONS.GET_PERMISSIONS, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener permisos')
    }

    console.log('✅ Permisos obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener permisos:', error)
    throw new Error(error.message || 'Error al obtener permisos')
  }
}

/**
 * Obtener un permiso por ID desde el backend
 * @param {string} permissionId - ID del permiso
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Permiso
 */
export const fetchPermissionById = async (permissionId, token) => {
  try {
    console.log('🛡️ Obteniendo permiso:', permissionId)

    const response = await fetch(API_CONFIG.ROLES_PERMISSIONS.GET_PERMISSION_BY_ID(permissionId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener permiso')
    }

    console.log('✅ Permiso obtenido:', data.data?.name)

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener permiso:', error)
    throw new Error(error.message || 'Error al obtener permiso')
  }
}

// ==================== ROLE PERMISSIONS ====================

/**
 * Obtener permisos de un rol específico desde el backend
 * @param {string} roleId - ID del rol
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de permisos del rol
 */
export const fetchRolePermissions = async (roleId, token) => {
  try {
    console.log('🛡️ Obteniendo permisos del rol:', roleId)

    const response = await fetch(API_CONFIG.ROLES_PERMISSIONS.GET_ROLE_PERMISSIONS(roleId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener permisos del rol')
    }

    console.log('✅ Permisos del rol obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener permisos del rol:', error)
    throw new Error(error.message || 'Error al obtener permisos del rol')
  }
}

/**
 * Asignar permisos a un rol en el backend
 * @param {string} roleId - ID del rol
 * @param {Object} permissionsData - { permission_ids: [array de IDs de permisos] }
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Resultado de la asignación
 */
export const assignPermissionsToRoleAPI = async (roleId, permissionsData, token) => {
  try {
    console.log('🛡️ Asignando permisos al rol:', roleId)

    const response = await fetch(API_CONFIG.ROLES_PERMISSIONS.ASSIGN_PERMISSIONS(roleId), {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(permissionsData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al asignar permisos')
    }

    console.log('✅ Permisos asignados correctamente')

    return data.data || data
  } catch (error) {
    console.error('❌ Error al asignar permisos:', error)
    throw new Error(error.message || 'Error al asignar permisos')
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Verificar si un rol tiene un permiso específico
 * @param {Array} rolePermissions - Array de permisos del rol
 * @param {string} permissionName - Nombre del permiso a verificar
 * @returns {boolean} True si el rol tiene el permiso
 */
export const hasPermission = (rolePermissions, permissionName) => {
  return rolePermissions.some(
    (permission) =>
      permission.name === permissionName || permission.permission_name === permissionName
  )
}

/**
 * Agrupar permisos por módulo
 * @param {Array} permissions - Array de permisos
 * @returns {Object} Permisos agrupados por módulo
 */
export const groupPermissionsByModule = (permissions) => {
  const grouped = {}

  permissions.forEach((permission) => {
    const module = permission.module || 'general'
    if (!grouped[module]) {
      grouped[module] = []
    }
    grouped[module].push(permission)
  })

  return grouped
}

/**
 * Filtrar permisos por categoría
 * @param {Array} permissions - Array de permisos
 * @param {string} category - Categoría a filtrar
 * @returns {Array} Permisos filtrados
 */
export const filterPermissionsByCategory = (permissions, category) => {
  return permissions.filter((permission) => permission.category === category)
}
