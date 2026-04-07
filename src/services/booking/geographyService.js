/**
 * GEOGRAPHY SERVICE
 *
 * Servicio para manejar la lógica de ubicaciones geográficas.
 * Extrae departamentos, provincias y distritos desde las canchas disponibles.
 *
 * Este servicio es stateless y recibe los datos como parámetros.
 */

/**
 * Helper para normalizar nombres a IDs
 * @param {string} name - Nombre a normalizar
 * @returns {string} ID normalizado
 */
const normalizeToId = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

/**
 * Obtiene la lista única de departamentos desde las canchas
 * @param {Array} fields - Array de canchas
 * @returns {Array} Array de objetos { id, name }
 */
export const getDepartments = (fields) => {
  const uniqueDepartments = [...new Set(fields.map((field) => field.departamento).filter(Boolean))]

  return uniqueDepartments.map((dept) => ({
    id: normalizeToId(dept),
    name: dept,
  }))
}

/**
 * Obtiene las provincias de un departamento específico
 * @param {Array} fields - Array de canchas
 * @param {string} departmentName - Nombre del departamento
 * @returns {Array} Array de objetos { id, name, departmentId }
 */
export const getProvinces = (fields, departmentName) => {
  if (!departmentName) return []

  const provincesInDept = fields
    .filter((field) => field.departamento === departmentName && field.provincia)
    .map((field) => field.provincia)

  const uniqueProvinces = [...new Set(provincesInDept)]

  return uniqueProvinces.map((prov) => ({
    id: normalizeToId(prov),
    name: prov,
    departmentId: normalizeToId(departmentName),
  }))
}

/**
 * Obtiene los distritos de una provincia específica
 * @param {Array} fields - Array de canchas
 * @param {string} provinciaName - Nombre de la provincia
 * @returns {Array} Array de objetos { id, name, provinceId }
 */
export const getDistricts = (fields, provinciaName) => {
  if (!provinciaName) return []

  const districtsInProv = fields
    .filter((field) => field.provincia === provinciaName && field.distrito)
    .map((field) => field.distrito)

  const uniqueDistricts = [...new Set(districtsInProv)]

  return uniqueDistricts.map((dist) => ({
    id: normalizeToId(dist),
    name: dist,
    provinceId: normalizeToId(provinciaName),
  }))
}

/**
 * Filtra canchas por ubicación
 * @param {Array} fields - Array de canchas
 * @param {Object} location - Objeto con { departamento, provincia, distrito }
 * @returns {Array} Canchas filtradas
 */
export const filterFieldsByLocation = (fields, location) => {
  let filtered = [...fields]

  if (location.departamento) {
    filtered = filtered.filter((field) => field.departamento === location.departamento)
  }

  if (location.provincia) {
    filtered = filtered.filter((field) => field.provincia === location.provincia)
  }

  if (location.distrito) {
    filtered = filtered.filter((field) => field.distrito === location.distrito)
  }

  return filtered
}

/**
 * Valida que una ubicación tenga los datos mínimos necesarios
 * @param {Object} location - Objeto con datos de ubicación
 * @returns {boolean} true si es válida
 */
export const isValidLocation = (location) => {
  return !!(location && location.departamento)
}
