import React from 'react'
import { Search, X, Filter } from 'lucide-react'

/**
 * Componente para filtros de usuarios
 * @param {Object} props - Props del componente
 * @param {string} props.searchTerm - Término de búsqueda
 * @param {string} props.filterStatus - Filtro de acceso (all, allowed, blocked)
 * @param {string} props.filterMonths - Filtro de meses (all, 0, 1, 2, ..., 12+)
 * @param {boolean} props.hasActiveFilters - Si hay filtros activos
 * @param {number} props.filteredCount - Cantidad de usuarios filtrados
 * @param {number} props.totalCount - Cantidad total de usuarios
 * @param {Function} props.onSearchChange - Handler para cambio de búsqueda
 * @param {Function} props.onStatusChange - Handler para cambio de acceso
 * @param {Function} props.onMonthsChange - Handler para cambio de meses
 * @param {Function} props.onResetFilters - Handler para resetear filtros
 */
const UserFilters = ({
  searchTerm,
  filterStatus,
  filterMonths,
  hasActiveFilters,
  filteredCount,
  totalCount,
  onSearchChange,
  onStatusChange,
  onMonthsChange,
  onResetFilters,
}) => {
  const statusOptions = [
    { value: 'all', label: 'Todos', color: 'bg-gray-500 hover:bg-gray-600' },
    { value: 'allowed', label: 'Permitidos', color: 'bg-green-500 hover:bg-green-600' },
    { value: 'blocked', label: 'Bloqueados', color: 'bg-red-500 hover:bg-red-600' },
  ]

  const monthsOptions = [
    { value: 'all', label: 'Todos' },
    { value: '0', label: '0 meses' },
    { value: '1', label: '1 mes' },
    { value: '2', label: '2 meses' },
    { value: '3', label: '3 meses' },
    { value: '4', label: '4 meses' },
    { value: '5', label: '5 meses' },
    { value: '6', label: '6 meses' },
    { value: '7', label: '7 meses' },
    { value: '8', label: '8 meses' },
    { value: '9', label: '9 meses' },
    { value: '10', label: '10 meses' },
    { value: '11', label: '11 meses' },
    { value: '12+', label: '12+ meses' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Encabezado con contador y botón de reset */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
          <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {filteredCount} de {totalCount}
          </span>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email, username o cancha..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filtros de acceso */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Acceso</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onStatusChange(option.value)}
              className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${
                filterStatus === option.value
                  ? option.color.replace('hover:', '')
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros de meses */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Antigüedad (meses desde registro)
        </label>
        <select
          value={filterMonths}
          onChange={(e) => onMonthsChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
        >
          {monthsOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default UserFilters
