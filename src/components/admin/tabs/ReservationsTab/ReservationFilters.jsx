import { useMemo } from 'react'
import { Filter, Search } from 'lucide-react'
import { DEFAULT_VALUES, BUTTON_TEXTS, FILTER_TEXTS } from '../../../../constants'

/**
 * Componente de filtros para el tab de Reservas
 *
 * Las ubicaciones (departamentos, provincias, distritos) se derivan directamente
 * de las canchas visibles para el usuario (visibleFields). Esto asegura que un
 * admin de cancha solo vea las ubicaciones donde administra canchas.
 */
export const ReservationFilters = ({
  selectedFieldFilter,
  filterDepartment,
  filterProvince,
  filterDistrict,
  filterPhone,
  visibleFields,
  onFilterChange,
}) => {
  const departments = useMemo(() => {
    const map = new Map()
    visibleFields.forEach((field) => {
      if (!field.departamento) return
      const count = map.get(field.departamento) || 0
      map.set(field.departamento, count + 1)
    })
    return Array.from(map.entries())
      .map(([name, fields_count]) => ({ name, fields_count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [visibleFields])

  const provinces = useMemo(() => {
    if (!filterDepartment || filterDepartment === DEFAULT_VALUES.ALL) return []
    const map = new Map()
    visibleFields.forEach((field) => {
      if (field.departamento !== filterDepartment || !field.provincia) return
      const count = map.get(field.provincia) || 0
      map.set(field.provincia, count + 1)
    })
    return Array.from(map.entries())
      .map(([name, fields_count]) => ({ name, fields_count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [visibleFields, filterDepartment])

  const districts = useMemo(() => {
    if (!filterProvince || filterProvince === DEFAULT_VALUES.ALL) return []
    const map = new Map()
    visibleFields.forEach((field) => {
      if (
        field.departamento !== filterDepartment ||
        field.provincia !== filterProvince ||
        !field.distrito
      ) {
        return
      }
      const count = map.get(field.distrito) || 0
      map.set(field.distrito, count + 1)
    })
    return Array.from(map.entries())
      .map(([name, fields_count]) => ({ name, fields_count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [visibleFields, filterDepartment, filterProvince])

  const hasActiveFilters =
    selectedFieldFilter !== DEFAULT_VALUES.ALL ||
    filterDepartment !== DEFAULT_VALUES.ALL ||
    filterProvince !== DEFAULT_VALUES.ALL ||
    filterDistrict !== DEFAULT_VALUES.ALL ||
    filterPhone !== ''

  const clearAllFilters = () => {
    onFilterChange.setSelectedFieldFilter(DEFAULT_VALUES.ALL)
    onFilterChange.setFilterDepartment(DEFAULT_VALUES.ALL)
    onFilterChange.setFilterProvince(DEFAULT_VALUES.ALL)
    onFilterChange.setFilterDistrict(DEFAULT_VALUES.ALL)
    onFilterChange.setFilterPhone('')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-secondary-600" />
        <h4 className="font-medium text-secondary-900">{FILTER_TEXTS.FILTERS}</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Filtro por cancha */}
        <select
          value={selectedFieldFilter}
          onChange={(e) => onFilterChange.setSelectedFieldFilter(e.target.value)}
          className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value={DEFAULT_VALUES.ALL}>Todas las canchas</option>
          {visibleFields.map((field) => (
            <option key={field.id} value={field.id}>
              {field.name}
            </option>
          ))}
        </select>

        {/* Filtro por departamento */}
        <select
          value={filterDepartment}
          onChange={(e) => {
            onFilterChange.setFilterDepartment(e.target.value)
            onFilterChange.setFilterProvince(DEFAULT_VALUES.ALL)
            onFilterChange.setFilterDistrict(DEFAULT_VALUES.ALL)
          }}
          disabled={departments.length === 0}
          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-secondary-100 disabled:cursor-not-allowed"
        >
          <option value={DEFAULT_VALUES.ALL}>{FILTER_TEXTS.ALL_DEPARTMENTS}</option>
          {departments.map((dept) => (
            <option key={dept.name} value={dept.name}>
              {dept.name} ({dept.fields_count})
            </option>
          ))}
        </select>

        {/* Filtro por provincia */}
        <select
          value={filterProvince}
          onChange={(e) => {
            onFilterChange.setFilterProvince(e.target.value)
            onFilterChange.setFilterDistrict(DEFAULT_VALUES.ALL)
          }}
          disabled={filterDepartment === DEFAULT_VALUES.ALL || provinces.length === 0}
          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-secondary-100 disabled:cursor-not-allowed"
        >
          <option value={DEFAULT_VALUES.ALL}>{FILTER_TEXTS.ALL_PROVINCES}</option>
          {provinces.map((prov) => (
            <option key={prov.name} value={prov.name}>
              {prov.name} ({prov.fields_count})
            </option>
          ))}
        </select>

        {/* Filtro por distrito */}
        <select
          value={filterDistrict}
          onChange={(e) => onFilterChange.setFilterDistrict(e.target.value)}
          disabled={filterProvince === DEFAULT_VALUES.ALL || districts.length === 0}
          className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-secondary-100 disabled:cursor-not-allowed"
        >
          <option value={DEFAULT_VALUES.ALL}>{FILTER_TEXTS.ALL_DISTRICTS}</option>
          {districts.map((dist) => (
            <option key={dist.name} value={dist.name}>
              {dist.name} ({dist.fields_count})
            </option>
          ))}
        </select>

        {/* Búsqueda por teléfono */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar por teléfono..."
            value={filterPhone}
            onChange={(e) => onFilterChange.setFilterPhone(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Botón limpiar filtros */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            {BUTTON_TEXTS.CLEAR_FILTERS}
          </button>
        </div>
      )}
    </div>
  )
}
