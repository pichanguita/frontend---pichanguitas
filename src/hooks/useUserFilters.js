import { useState, useMemo } from 'react'
import { filterUsers, calculateUserStats } from '../utils/userManagementHelpers'

/**
 * Hook personalizado para manejar el filtrado y búsqueda de usuarios
 * @param {Array} users - Array de usuarios
 * @param {Array} fields - Array de canchas
 * @returns {Object} Estados y funciones de filtrado
 */
const useUserFilters = (users, fields) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, allowed, blocked
  const [filterMonths, setFilterMonths] = useState('all') // all, 0, 1, 2, ..., 12+

  // Usuarios filtrados usando useMemo para optimizar rendimiento
  const filteredUsers = useMemo(() => {
    return filterUsers(users, searchTerm, filterStatus, filterMonths)
  }, [users, searchTerm, filterStatus, filterMonths])

  // Estadísticas usando useMemo
  const stats = useMemo(() => {
    return calculateUserStats(users, fields)
  }, [users, fields])

  // Reset de filtros
  const resetFilters = () => {
    setSearchTerm('')
    setFilterStatus('all')
    setFilterMonths('all')
  }

  // Verificar si hay filtros activos
  const hasActiveFilters = searchTerm !== '' || filterStatus !== 'all' || filterMonths !== 'all'

  return {
    // Estados
    searchTerm,
    filterStatus,
    filterMonths,

    // Setters
    setSearchTerm,
    setFilterStatus,
    setFilterMonths,

    // Datos computados
    filteredUsers,
    stats,

    // Funciones
    resetFilters,
    hasActiveFilters,
  }
}

export default useUserFilters
