import { Filter, Search } from 'lucide-react'
import {
  DEFAULT_VALUES,
  FILTER_TEXTS,
  FIELD_STATUS,
  FIELD_APPROVAL_STATUS,
} from '../../../../constants'
import { pluralize } from '../../../../utils/stringHelpers'

/**
 * Componente de filtros para el tab de Canchas
 *
 * Reemplaza las ~150 líneas de filtros en AdminPanel.jsx
 */
export const FieldFilters = ({
  searchTerm,
  filterSport,
  filterStatus,
  filterOwner,
  sportTypes,
  users,
  isSuperAdmin,
  filteredFieldsCount,
  onFilterChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-custom p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-secondary-600" />
        <h4 className="font-medium text-secondary-900">{FILTER_TEXTS.FILTERS}</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Búsqueda por nombre */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder={FILTER_TEXTS.SEARCH_BY_NAME}
            value={searchTerm}
            onChange={(e) => onFilterChange.setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Filtro por deporte */}
        <select
          value={filterSport}
          onChange={(e) => onFilterChange.setFilterSport(e.target.value)}
          className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value={DEFAULT_VALUES.ALL}>{FILTER_TEXTS.ALL_SPORTS}</option>
          {sportTypes.map((sport) => (
            <option key={sport.id} value={sport.name}>
              {sport.name}
            </option>
          ))}
        </select>

        {/* Filtro por estado */}
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange.setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value={DEFAULT_VALUES.ALL}>{FILTER_TEXTS.ALL_STATES}</option>
          <option value={FIELD_STATUS.AVAILABLE}>Disponible</option>
          <option value={FIELD_STATUS.UNAVAILABLE}>No disponible</option>
          <option value={FIELD_APPROVAL_STATUS.APPROVED}>Aprobada</option>
          <option value={FIELD_APPROVAL_STATUS.PENDING}>Pendiente</option>
          <option value={FIELD_APPROVAL_STATUS.REJECTED}>Rechazada</option>
        </select>

        {/* Filtro por propietario (solo para superadmin) */}
        {isSuperAdmin && (
          <select
            value={filterOwner}
            onChange={(e) => onFilterChange.setFilterOwner(e.target.value)}
            className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value={DEFAULT_VALUES.ALL}>{FILTER_TEXTS.ALL_OWNERS}</option>
            {users
              .filter((u) => u.role === 'admin' && u.adminType === 'field')
              .map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name}
                </option>
              ))}
          </select>
        )}
      </div>

      {/* Contador de resultados */}
      <div className="mt-4 text-sm text-secondary-600">
        {pluralize(filteredFieldsCount, 'cancha encontrada', 'canchas encontradas')}
      </div>
    </div>
  )
}
