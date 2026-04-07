import { useState, useEffect } from 'react'
import { Filter, Search, Loader2 } from 'lucide-react'
import { DEFAULT_VALUES, BUTTON_TEXTS, FILTER_TEXTS } from '../../../../constants'
import {
  fetchDepartmentsWithFields,
  fetchProvincesWithFieldsByDepartment,
  fetchDistrictsWithFieldsByProvince,
} from '../../../../services/locations/locationsService'

/**
 * Componente de filtros para el tab de Reservas
 *
 * ACTUALIZADO: Usa endpoints que solo retornan ubicaciones con canchas registradas
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
  // Estado para ubicaciones con canchas
  const [departments, setDepartments] = useState([])
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [isLoadingDepts, setIsLoadingDepts] = useState(false)
  const [isLoadingProvs, setIsLoadingProvs] = useState(false)
  const [isLoadingDists, setIsLoadingDists] = useState(false)

  // Cargar departamentos con canchas al montar el componente
  useEffect(() => {
    const loadDepartments = async () => {
      setIsLoadingDepts(true)
      try {
        const depts = await fetchDepartmentsWithFields()
        setDepartments(depts)
      } catch (error) {
        console.error('Error cargando departamentos:', error)
        setDepartments([])
      } finally {
        setIsLoadingDepts(false)
      }
    }
    loadDepartments()
  }, [])

  // Cargar provincias cuando cambia el departamento
  useEffect(() => {
    const loadProvinces = async () => {
      if (!filterDepartment || filterDepartment === DEFAULT_VALUES.ALL) {
        setProvinces([])
        return
      }
      setIsLoadingProvs(true)
      try {
        const provs = await fetchProvincesWithFieldsByDepartment(filterDepartment)
        setProvinces(provs)
      } catch (error) {
        console.error('Error cargando provincias:', error)
        setProvinces([])
      } finally {
        setIsLoadingProvs(false)
      }
    }
    loadProvinces()
  }, [filterDepartment])

  // Cargar distritos cuando cambia la provincia
  useEffect(() => {
    const loadDistricts = async () => {
      if (!filterProvince || filterProvince === DEFAULT_VALUES.ALL) {
        setDistricts([])
        return
      }
      setIsLoadingDists(true)
      try {
        const dists = await fetchDistrictsWithFieldsByProvince(filterProvince)
        setDistricts(dists)
      } catch (error) {
        console.error('Error cargando distritos:', error)
        setDistricts([])
      } finally {
        setIsLoadingDists(false)
      }
    }
    loadDistricts()
  }, [filterProvince])

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
        <div className="relative">
          <select
            value={filterDepartment}
            onChange={(e) => {
              onFilterChange.setFilterDepartment(e.target.value)
              onFilterChange.setFilterProvince(DEFAULT_VALUES.ALL)
              onFilterChange.setFilterDistrict(DEFAULT_VALUES.ALL)
            }}
            disabled={isLoadingDepts}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-secondary-100"
          >
            <option value={DEFAULT_VALUES.ALL}>
              {isLoadingDepts ? 'Cargando...' : FILTER_TEXTS.ALL_DEPARTMENTS}
            </option>
            {departments.map((dept) => (
              <option key={dept.id || dept.name} value={dept.name}>
                {dept.name} {dept.fields_count ? `(${dept.fields_count})` : ''}
              </option>
            ))}
          </select>
          {isLoadingDepts && (
            <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400 animate-spin" />
          )}
        </div>

        {/* Filtro por provincia */}
        <div className="relative">
          <select
            value={filterProvince}
            onChange={(e) => {
              onFilterChange.setFilterProvince(e.target.value)
              onFilterChange.setFilterDistrict(DEFAULT_VALUES.ALL)
            }}
            disabled={filterDepartment === DEFAULT_VALUES.ALL || isLoadingProvs}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-secondary-100 disabled:cursor-not-allowed"
          >
            <option value={DEFAULT_VALUES.ALL}>
              {isLoadingProvs ? 'Cargando...' : FILTER_TEXTS.ALL_PROVINCES}
            </option>
            {provinces.map((prov) => (
              <option key={prov.id || prov.name} value={prov.name}>
                {prov.name} {prov.fields_count ? `(${prov.fields_count})` : ''}
              </option>
            ))}
          </select>
          {isLoadingProvs && (
            <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400 animate-spin" />
          )}
        </div>

        {/* Filtro por distrito */}
        <div className="relative">
          <select
            value={filterDistrict}
            onChange={(e) => onFilterChange.setFilterDistrict(e.target.value)}
            disabled={filterProvince === DEFAULT_VALUES.ALL || isLoadingDists}
            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-secondary-100 disabled:cursor-not-allowed"
          >
            <option value={DEFAULT_VALUES.ALL}>
              {isLoadingDists ? 'Cargando...' : FILTER_TEXTS.ALL_DISTRICTS}
            </option>
            {districts.map((dist) => (
              <option key={dist.id || dist.name} value={dist.name}>
                {dist.name} {dist.fields_count ? `(${dist.fields_count})` : ''}
              </option>
            ))}
          </select>
          {isLoadingDists && (
            <Loader2 className="absolute right-8 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400 animate-spin" />
          )}
        </div>

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
