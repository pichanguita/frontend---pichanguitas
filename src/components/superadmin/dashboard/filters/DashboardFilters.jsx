import React, { useMemo } from 'react'
import { Filter, Map, BarChart3, Grid, FileText, Calendar } from 'lucide-react'

const DashboardFilters = ({
  selectedDepartment,
  setSelectedDepartment,
  selectedDistrict,
  setSelectedDistrict,
  handleDistrictClick,
  viewMode,
  setViewMode,
  dateRange,
  setDateRange,
  fields = [],
}) => {
  // Filtrar solo canchas con admin asignado
  const fieldsWithAdmin = useMemo(() => fields.filter((f) => f.adminId), [fields])

  // Departamentos únicos de canchas con admin
  const departments = useMemo(() => {
    const deps = [...new Set(fieldsWithAdmin.map((f) => f.departamento).filter(Boolean))]
    return deps.sort()
  }, [fieldsWithAdmin])

  // Distritos según departamento seleccionado
  const districts = useMemo(() => {
    let filtered = fieldsWithAdmin
    if (selectedDepartment !== 'all') {
      filtered = filtered.filter((f) => f.departamento === selectedDepartment)
    }
    const dists = [...new Set(filtered.map((f) => f.distrito).filter(Boolean))]
    return dists.sort()
  }, [fieldsWithAdmin, selectedDepartment])

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 md:mb-8">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Primera fila: Filtros de ubicación y período */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600 hidden sm:block" />
            <span className="text-sm font-medium text-gray-600 hidden sm:inline">Filtros:</span>
          </div>

          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value)
              setSelectedDistrict('all')
            }}
            className="w-full sm:w-auto px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">Todos los departamentos</option>
            {departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictClick(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={districts.length === 0}
          >
            <option value="all">Todos los distritos</option>
            {districts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>

          {/* Selector de período para reportes */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600 hidden sm:block" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 sm:px-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último año</option>
              <option value="all">Todo el historial</option>
            </select>
          </div>
        </div>

        {/* Segunda fila: Botones de vista */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 text-sm sm:text-base rounded-lg flex items-center justify-center gap-2 transition ${
              viewMode === 'map'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Mapa</span>
          </button>
          <button
            onClick={() => setViewMode('charts')}
            className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 text-sm sm:text-base rounded-lg flex items-center justify-center gap-2 transition ${
              viewMode === 'charts'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Gráficos</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 text-sm sm:text-base rounded-lg flex items-center justify-center gap-2 transition ${
              viewMode === 'grid'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span className="hidden sm:inline">Tabla</span>
          </button>
          <button
            onClick={() => setViewMode('reports')}
            className={`flex-1 sm:flex-none px-3 py-2 sm:px-4 text-sm sm:text-base rounded-lg flex items-center justify-center gap-2 transition ${
              viewMode === 'reports'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Reportes</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardFilters
