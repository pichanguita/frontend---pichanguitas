import React from 'react'
import { BarChart3, MapPin, Filter, RefreshCw, Download } from 'lucide-react'

/**
 * Header del dashboard con filtros y controles
 */
const MetricsHeader = ({
  selectedPeriod,
  selectedField,
  selectedDepartment,
  selectedDistrict,
  availableDepartments,
  availableDistricts,
  visibleFields,
  onPeriodChange,
  onFieldChange,
  onDepartmentChange,
  onDistrictChange,
  onRefresh,
  onExport,
}) => {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5 md:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary-600" />
            Panel de Métricas
          </h2>
          <p className="text-sm sm:text-base text-secondary-600 mt-1">
            Análisis de rendimiento y ocupación
          </p>

          {/* Indicador de filtros activos */}
          {(selectedDepartment !== 'all' ||
            selectedDistrict !== 'all' ||
            selectedField !== 'all') && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
              {selectedDepartment !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                  <MapPin className="w-3 h-3" />
                  <span className="hidden xs:inline">{selectedDepartment}</span>
                </span>
              )}
              {selectedDistrict !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  <MapPin className="w-3 h-3" />
                  <span className="hidden xs:inline">{selectedDistrict}</span>
                </span>
              )}
              {selectedField !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <Filter className="w-3 h-3" />
                  <span className="hidden xs:inline">
                    {visibleFields.find((f) => f.id === selectedField)?.name}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          {/* Selector de departamento */}
          {availableDepartments.length > 0 && (
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 sm:px-4 text-sm sm:text-base border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">Todos los departamentos</option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          )}

          {/* Selector de distrito */}
          {availableDistricts.length > 0 && (
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 sm:px-4 text-sm sm:text-base border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">Todos los distritos</option>
              {availableDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          )}

          {/* Selector de período */}
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 sm:px-4 text-sm sm:text-base border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="day">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
            <option value="year">Último año</option>
          </select>

          {/* Selector de cancha */}
          <select
            value={selectedField}
            onChange={(e) => onFieldChange(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 sm:px-4 text-sm sm:text-base border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">Todas las canchas</option>
            {visibleFields
              .filter((f) => {
                const matchesDept =
                  selectedDepartment === 'all' ||
                  (f.departamento || f.department) === selectedDepartment
                const matchesDist =
                  selectedDistrict === 'all' || (f.distrito || f.district) === selectedDistrict
                return matchesDept && matchesDist
              })
              .map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name}
                </option>
              ))}
          </select>

          {/* Botones de acción */}
          <button
            onClick={onRefresh}
            className="w-full sm:w-auto px-3 py-2 sm:px-4 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={onExport}
            className="w-full sm:w-auto px-3 py-2 sm:px-4 text-sm sm:text-base bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default MetricsHeader
