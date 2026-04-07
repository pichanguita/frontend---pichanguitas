/**
 * LOCATIONS SERVICE
 *
 * Servicio para operaciones de ubicaciones (departamentos, provincias, distritos).
 * Maneja la obtención de datos geográficos del Perú.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== DEPARTMENTS ====================

/**
 * Obtener todos los departamentos desde el backend
 * @param {string} token - Token de autenticación (opcional)
 * @returns {Promise<Array>} Array de departamentos
 */
export const fetchDepartments = async (token = null) => {
  try {
    // Headers básicos sin autenticación para endpoints públicos
    const headers = {
      'Content-Type': 'application/json',
    }

    // Solo agregar token si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(API_CONFIG.LOCATIONS.GET_DEPARTMENTS, {
      method: 'GET',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener departamentos')
    }

    return data.data || []
  } catch (error) {
    console.error('Error al obtener departamentos:', error)
    throw new Error(error.message || 'Error al obtener departamentos')
  }
}

/**
 * Obtener un departamento por ID desde el backend
 * @param {string} departmentId - ID del departamento
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Departamento
 */
export const fetchDepartmentById = async (departmentId, token) => {
  try {
    const response = await fetch(API_CONFIG.LOCATIONS.GET_DEPARTMENT_BY_ID(departmentId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener departamento')
    }

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener departamento:', error)
    throw new Error(error.message || 'Error al obtener departamento')
  }
}

// ==================== PROVINCES ====================

/**
 * Obtener todas las provincias desde el backend
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.department_id - ID del departamento para filtrar
 * @param {string} token - Token de autenticación (opcional)
 * @returns {Promise<Array>} Array de provincias
 */
export const fetchProvinces = async (filters = {}, token = null) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.department_id) queryParams.append('department_id', filters.department_id)
    if (filters.department_name) queryParams.append('department_name', filters.department_name)

    const url = `${API_CONFIG.LOCATIONS.GET_PROVINCES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    // Headers básicos sin autenticación para endpoints públicos
    const headers = {
      'Content-Type': 'application/json',
    }

    // Solo agregar token si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener provincias')
    }

    return data.data || []
  } catch (error) {
    console.error('Error al obtener provincias:', error)
    throw new Error(error.message || 'Error al obtener provincias')
  }
}

/**
 * Obtener una provincia por ID desde el backend
 * @param {string} provinceId - ID de la provincia
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Provincia
 */
export const fetchProvinceById = async (provinceId, token) => {
  try {
    const response = await fetch(API_CONFIG.LOCATIONS.GET_PROVINCE_BY_ID(provinceId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener provincia')
    }

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener provincia:', error)
    throw new Error(error.message || 'Error al obtener provincia')
  }
}

// ==================== DISTRICTS ====================

/**
 * Obtener todos los distritos desde el backend
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.province_id - ID de la provincia para filtrar
 * @param {string} token - Token de autenticación (opcional)
 * @returns {Promise<Array>} Array de distritos
 */
export const fetchDistricts = async (filters = {}, token = null) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.province_id) queryParams.append('province_id', filters.province_id)
    if (filters.province_name) queryParams.append('province_name', filters.province_name)

    const url = `${API_CONFIG.LOCATIONS.GET_DISTRICTS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    // Headers básicos sin autenticación para endpoints públicos
    const headers = {
      'Content-Type': 'application/json',
    }

    // Solo agregar token si existe
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener distritos')
    }

    return data.data || []
  } catch (error) {
    console.error('Error al obtener distritos:', error)
    throw new Error(error.message || 'Error al obtener distritos')
  }
}

/**
 * Obtener un distrito por ID desde el backend
 * @param {string} districtId - ID del distrito
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Distrito
 */
export const fetchDistrictById = async (districtId, token) => {
  try {
    const response = await fetch(API_CONFIG.LOCATIONS.GET_DISTRICT_BY_ID(districtId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener distrito')
    }

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener distrito:', error)
    throw new Error(error.message || 'Error al obtener distrito')
  }
}

// ==================== COMPLETE LOCATION ====================

/**
 * Obtener ubicación completa (departamento, provincia, distrito) desde el backend
 * @param {string} districtId - ID del distrito
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} { department, province, district }
 */
export const fetchCompleteLocation = async (districtId, token) => {
  try {
    const response = await fetch(API_CONFIG.LOCATIONS.GET_COMPLETE(districtId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener ubicación completa')
    }

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener ubicación completa:', error)
    throw new Error(error.message || 'Error al obtener ubicación completa')
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Obtener provincias por departamento (helper)
 * @param {string} departmentIdOrName - ID o nombre del departamento
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de provincias
 */
export const fetchProvincesByDepartment = async (departmentIdOrName, token) => {
  // Si es un número, es un ID; si no, es un nombre
  const isId = !isNaN(departmentIdOrName)
  const filters = isId
    ? { department_id: departmentIdOrName }
    : { department_name: departmentIdOrName }

  const result = await fetchProvinces(filters, token)

  return result
}

/**
 * Obtener distritos por provincia (helper)
 * @param {string} provinceIdOrName - ID o nombre de la provincia
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de distritos
 */
export const fetchDistrictsByProvince = async (provinceIdOrName, token) => {
  // Si es un número, es un ID; si no, es un nombre
  const isId = !isNaN(provinceIdOrName)

  return fetchDistricts(
    isId ? { province_id: provinceIdOrName } : { province_name: provinceIdOrName },
    token
  )
}

// ==================== UBICACIONES CON CANCHAS ====================

/**
 * Obtener departamentos que tienen canchas registradas
 * @returns {Promise<Array>} Array de departamentos con canchas
 */
export const fetchDepartmentsWithFields = async () => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    }

    const response = await fetch(API_CONFIG.LOCATIONS.GET_DEPARTMENTS_WITH_FIELDS, {
      method: 'GET',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener departamentos con canchas')
    }

    return data.data || []
  } catch (error) {
    console.error('Error al obtener departamentos con canchas:', error)
    throw new Error(error.message || 'Error al obtener departamentos con canchas')
  }
}

/**
 * Obtener provincias que tienen canchas registradas
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.department_id - ID del departamento para filtrar
 * @param {string} filters.department_name - Nombre del departamento para filtrar
 * @returns {Promise<Array>} Array de provincias con canchas
 */
export const fetchProvincesWithFields = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.department_id) queryParams.append('department_id', filters.department_id)
    if (filters.department_name) queryParams.append('department_name', filters.department_name)

    const url = `${API_CONFIG.LOCATIONS.GET_PROVINCES_WITH_FIELDS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const headers = {
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener provincias con canchas')
    }

    return data.data || []
  } catch (error) {
    console.error('Error al obtener provincias con canchas:', error)
    throw new Error(error.message || 'Error al obtener provincias con canchas')
  }
}

/**
 * Obtener distritos que tienen canchas registradas
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.province_id - ID de la provincia para filtrar
 * @param {string} filters.province_name - Nombre de la provincia para filtrar
 * @returns {Promise<Array>} Array de distritos con canchas
 */
export const fetchDistrictsWithFields = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.province_id) queryParams.append('province_id', filters.province_id)
    if (filters.province_name) queryParams.append('province_name', filters.province_name)

    const url = `${API_CONFIG.LOCATIONS.GET_DISTRICTS_WITH_FIELDS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const headers = {
      'Content-Type': 'application/json',
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener distritos con canchas')
    }

    return data.data || []
  } catch (error) {
    console.error('Error al obtener distritos con canchas:', error)
    throw new Error(error.message || 'Error al obtener distritos con canchas')
  }
}

/**
 * Obtener provincias con canchas por departamento (helper)
 * @param {string} departmentIdOrName - ID o nombre del departamento
 * @returns {Promise<Array>} Array de provincias con canchas
 */
export const fetchProvincesWithFieldsByDepartment = async (departmentIdOrName) => {
  const isId = !isNaN(departmentIdOrName)
  const filters = isId
    ? { department_id: departmentIdOrName }
    : { department_name: departmentIdOrName }

  return fetchProvincesWithFields(filters)
}

/**
 * Obtener distritos con canchas por provincia (helper)
 * @param {string} provinceIdOrName - ID o nombre de la provincia
 * @returns {Promise<Array>} Array de distritos con canchas
 */
export const fetchDistrictsWithFieldsByProvince = async (provinceIdOrName) => {
  const isId = !isNaN(provinceIdOrName)
  const filters = isId ? { province_id: provinceIdOrName } : { province_name: provinceIdOrName }

  return fetchDistrictsWithFields(filters)
}
