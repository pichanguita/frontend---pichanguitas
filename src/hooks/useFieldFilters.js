import { useMemo } from 'react'
import { FIELD_STATUS, FIELD_APPROVAL_STATUS, DEFAULT_VALUES } from '../constants'

/**
 * Hook para filtrar canchas según múltiples criterios
 *
 * Elimina la duplicación de lógica de filtrado que estaba repetida 3 veces en AdminPanel
 *
 * @param {Array} fields - Array de canchas a filtrar
 * @param {Object} filters - Objeto con los filtros a aplicar
 * @param {string} filters.searchTerm - Término de búsqueda por nombre
 * @param {string} filters.filterSport - Filtro por deporte
 * @param {string} filters.filterStatus - Filtro por estado
 * @param {string} filters.filterOwner - Filtro por propietario (solo superadmin)
 * @param {boolean} isSuperAdmin - Si el usuario es super admin
 *
 * @returns {Array} Array de canchas filtradas
 */
export const useFieldFilters = (
  fields,
  filters = {},
  isSuperAdmin = false
) => {
  const {
    searchTerm = '',
    filterSport = DEFAULT_VALUES.ALL,
    filterStatus = DEFAULT_VALUES.ALL,
    filterOwner = DEFAULT_VALUES.ALL,
  } = filters

  return useMemo(() => {
    if (!fields || fields.length === 0) return []

    return fields.filter((field) => {
      // Filtro por búsqueda de nombre
      if (searchTerm && !field.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Filtro por deporte
      // Usa field.sportNames (array de nombres de deportes desde el backend)
      if (filterSport !== DEFAULT_VALUES.ALL) {
        if (
          !field.sportNames ||
          !Array.isArray(field.sportNames) ||
          !field.sportNames.includes(filterSport)
        ) {
          return false
        }
      }

      // Filtro por estado
      if (filterStatus !== DEFAULT_VALUES.ALL) {
        // Estados de disponibilidad
        if (filterStatus === FIELD_STATUS.AVAILABLE && field.status !== FIELD_STATUS.AVAILABLE) {
          return false
        }
        if (filterStatus === FIELD_STATUS.UNAVAILABLE && field.status === FIELD_STATUS.AVAILABLE) {
          return false
        }

        // Estados de aprobación
        if (
          filterStatus === FIELD_APPROVAL_STATUS.APPROVED &&
          field.approvalStatus !== FIELD_APPROVAL_STATUS.APPROVED
        ) {
          return false
        }
        if (
          filterStatus === FIELD_APPROVAL_STATUS.PENDING &&
          field.approvalStatus !== FIELD_APPROVAL_STATUS.PENDING
        ) {
          return false
        }
        if (
          filterStatus === FIELD_APPROVAL_STATUS.REJECTED &&
          field.approvalStatus !== FIELD_APPROVAL_STATUS.REJECTED
        ) {
          return false
        }
      }

      // Filtro por propietario (solo para superadmin)
      // Fuente de verdad: field.adminId. El <select> emite el id como string,
      // mientras que adminId viene como número desde el backend → comparar como string.
      if (isSuperAdmin && filterOwner !== DEFAULT_VALUES.ALL) {
        if (String(field.adminId) !== String(filterOwner)) {
          return false
        }
      }

      return true
    })
  }, [fields, searchTerm, filterSport, filterStatus, filterOwner, isSuperAdmin])
}
