/**
 * LOCATION MATCHER SERVICE
 *
 * Servicio para buscar y emparejar ubicaciones geográficas
 * basándose en nombres obtenidos del geocoding.
 */

import {
  fetchDepartments,
  fetchProvincesByDepartment,
  fetchDistrictsByProvince,
} from './locationsService'

/**
 * Normaliza un string para comparación (sin acentos, minúsculas, sin espacios extra)
 * @param {string} str - String a normalizar
 * @returns {string} String normalizado
 */
const normalizeString = (str) => {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .trim()
    .replace(/\s+/g, ' ') // Normalizar espacios
}

/**
 * Calcula la similitud entre dos strings (Levenshtein simplificado)
 * @param {string} str1 - Primer string
 * @param {string} str2 - Segundo string
 * @returns {number} Porcentaje de similitud (0-1)
 */
const calculateSimilarity = (str1, str2) => {
  const s1 = normalizeString(str1)
  const s2 = normalizeString(str2)

  // Coincidencia exacta
  if (s1 === s2) return 1

  // Contiene (dar prioridad a match completo)
  if (s1.includes(s2) || s2.includes(s1)) return 0.9

  // Coincidencia de palabras individuales (útil para "Lima" vs "Provincia de Lima")
  const words1 = s1.split(' ')
  const words2 = s2.split(' ')

  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 && word1.length > 2) {
        return 0.85 // Alta similitud si comparten una palabra significativa
      }
    }
  }

  // Similitud básica por caracteres comunes
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1

  if (longer.length === 0) return 1.0

  let matches = 0
  for (const c of shorter) {
    if (longer.includes(c)) matches++
  }

  return matches / longer.length
}

/**
 * Busca el mejor match de departamento basándose en el nombre
 * @param {string} departmentName - Nombre del departamento del geocoding
 * @param {string} token - Token de autenticación (opcional)
 * @returns {Promise<Object|null>} Departamento encontrado o null
 */
export const findDepartmentByName = async (departmentName, token = null) => {
  if (!departmentName) return null

  try {
    const departments = await fetchDepartments(token)

    let bestMatch = null
    let bestScore = 0

    for (const dept of departments) {
      const similarity = calculateSimilarity(departmentName, dept.name)

      if (similarity > bestScore) {
        bestScore = similarity
        bestMatch = dept
      }
    }

    // Solo retornar si la similitud es mayor a 0.6 (60%)
    if (bestScore > 0.6) {
      return bestMatch
    }

    return null
  } catch (error) {
    console.error('Error al buscar departamento:', error)
    return null
  }
}

/**
 * Busca el mejor match de provincia basándose en el nombre y departamento
 * @param {string} provinceName - Nombre de la provincia del geocoding
 * @param {number} departmentId - ID del departamento
 * @param {string} token - Token de autenticación (opcional)
 * @returns {Promise<Object|null>} Provincia encontrada o null
 */
export const findProvinceByName = async (provinceName, departmentId, token = null) => {
  if (!provinceName || !departmentId) {
    return null
  }

  try {
    const provinces = await fetchProvincesByDepartment(departmentId, token)

    let bestMatch = null
    let bestScore = 0

    for (const prov of provinces) {
      const similarity = calculateSimilarity(provinceName, prov.name)

      if (similarity > bestScore) {
        bestScore = similarity
        bestMatch = prov
      }
    }

    // Solo retornar si la similitud es mayor a 0.6 (60%)
    if (bestScore > 0.6) {
      return bestMatch
    }

    return null
  } catch (error) {
    console.error('Error al buscar provincia:', error)
    return null
  }
}

/**
 * Busca el mejor match de distrito basándose en el nombre y provincia
 * @param {string} districtName - Nombre del distrito del geocoding
 * @param {number} provinceId - ID de la provincia
 * @param {string} token - Token de autenticación (opcional)
 * @returns {Promise<Object|null>} Distrito encontrado o null
 */
export const findDistrictByName = async (districtName, provinceId, token = null) => {
  if (!districtName || !provinceId) {
    return null
  }

  try {
    const districts = await fetchDistrictsByProvince(provinceId, token)

    let bestMatch = null
    let bestScore = 0

    for (const dist of districts) {
      const similarity = calculateSimilarity(districtName, dist.name)

      if (similarity > bestScore) {
        bestScore = similarity
        bestMatch = dist
      }
    }

    // Solo retornar si la similitud es mayor a 0.6 (60%)
    if (bestScore > 0.6) {
      return bestMatch
    }

    return null
  } catch (error) {
    console.error('Error al buscar distrito:', error)
    return null
  }
}

/**
 * Busca la ubicación completa (departamento, provincia, distrito) basándose en datos del geocoding
 * @param {Object} geoData - Datos del geocoding {department, province, district}
 * @param {string} token - Token de autenticación (opcional)
 * @returns {Promise<Object>} {department, province, district} o valores null
 */
export const findCompleteLocation = async (geoData, token = null) => {
  const result = {
    department: null,
    province: null,
    district: null,
  }

  if (!geoData) return result

  try {
    // 1. Buscar departamento
    if (geoData.department) {
      result.department = await findDepartmentByName(geoData.department, token)
    }

    if (!result.department) {
      return result
    }

    // 2. Buscar provincia
    if (geoData.province) {
      result.province = await findProvinceByName(geoData.province, result.department.id, token)
    }

    // Si no se encontró provincia con geoData.province, intentar con district
    if (!result.province && geoData.district) {
      result.province = await findProvinceByName(geoData.district, result.department.id, token)
    }

    // Si aún no hay provincia, intentar buscar la provincia capital del departamento
    if (!result.province) {
      const provinces = await fetchProvincesByDepartment(result.department.id, token)

      // Buscar provincia con el mismo nombre que el departamento (usualmente la capital)
      result.province = provinces.find(
        (p) => normalizeString(p.name) === normalizeString(result.department.name)
      )
    }

    // 3. Buscar distrito (solo si se encontró la provincia)
    if (result.province && geoData.district) {
      result.district = await findDistrictByName(geoData.district, result.province.id, token)
    }

    return result
  } catch (error) {
    console.error('Error al buscar ubicación completa:', error)
    return result
  }
}
