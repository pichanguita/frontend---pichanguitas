import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * FilterPanel - Componente de Filtros para BookingFlow (Paso 1)
 *
 * Componente "controlled" puro que renderiza los filtros de búsqueda.
 * TODO el estado y lógica de negocio permanecen en el padre (BookingFlow).
 *
 * Props:
 * - Valores de filtros: selectedDepartment, selectedProvince, selectedDistrict,
 *   selectedSportTypes (array), selectedDate, startTime, endTime
 * - Datos: departments, provinces, districts, sportTypes, timeRanges
 * - Estados calendario: currentMonth, currentYear, monthNames, weekDays
 * - Handlers: onDepartmentSelect, onProvinceSelect, onDistrictSelect,
 *   onSportTypeSelect, onDateSelect, onStartTimeChange, onEndTimeChange,
 *   onMonthChange, onYearChange
 * - Helpers: generateCalendar
 * - Validación: canSearch, onSearch
 * - UI: visibleFieldsCount
 */

const FilterPanel = ({
  // Valores de los filtros
  selectedDepartment,
  selectedProvince,
  selectedDistrict,
  selectedSportTypes = [], // Ahora es un array
  startTime,
  endTime,
  // Datos para los selects
  departments,
  provinces,
  districts,
  sportTypes,
  timeRanges,
  // Estados del calendario
  currentMonth,
  currentYear,
  // Handlers
  onDepartmentSelect,
  onProvinceSelect,
  onDistrictSelect,
  onSportTypeSelect,
  onDateSelect,
  onStartTimeChange,
  onEndTimeChange,
  onMonthChange,
  onYearChange,
  // Helpers del calendario
  generateCalendar,
  monthNames,
  weekDays,
  // Validación y búsqueda
  canSearch,
  onSearch,
  // Contador de resultados
  visibleFieldsCount,
}) => {
  // Helper para manejar cambio de mes anterior
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      onMonthChange(11)
      onYearChange(currentYear - 1)
    } else {
      onMonthChange(currentMonth - 1)
    }
  }

  // Helper para manejar cambio de mes siguiente
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange(0)
      onYearChange(currentYear + 1)
    } else {
      onMonthChange(currentMonth + 1)
    }
  }

  return (
    <div className="lg:col-span-12 p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h3 className="text-2xl font-bold text-secondary-900 mb-6">Paso 1: Filtros</h3>

        {/* 1. Tipo de Deporte (PRIMERO) - Selección múltiple */}
        <div className="mb-6">
          <label className="text-lg font-bold text-secondary-900 mb-2 block">
            ¿Qué deporte(s) quieres jugar?
          </label>
          <p className="text-sm text-secondary-500 mb-3">
            Puedes seleccionar uno o varios deportes
          </p>
          <div className="flex flex-wrap gap-3">
            {sportTypes.map((sport) => {
              const isSelected = selectedSportTypes.includes(sport.id)
              return (
                <button
                  key={sport.id}
                  onClick={() => onSportTypeSelect(sport.id)}
                  className={`px-5 py-3 rounded-full font-medium transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'text-white shadow-lg'
                      : 'bg-white text-secondary-700 border-2 border-secondary-200 hover:border-primary-300'
                  }`}
                  style={{
                    backgroundColor: isSelected ? '#22c55e' : 'white',
                  }}
                >
                  <span className="text-xl">{sport.icon}</span>
                  <span>{sport.name}</span>
                  {isSelected && <span className="ml-1 text-white">✓</span>}
                </button>
              )
            })}
          </div>
          {selectedSportTypes.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              {selectedSportTypes.length} deporte{selectedSportTypes.length > 1 ? 's' : ''}{' '}
              seleccionado{selectedSportTypes.length > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* 2. Ubicación (DESPUÉS del deporte) */}
        <div className="mb-6">
          <label className="text-lg font-bold text-secondary-900 mb-3 block">
            ¿Dónde quieres jugar?
          </label>
          <div className="space-y-3">
            {/* Departamento */}
            <select
              value={selectedDepartment}
              onChange={(e) => onDepartmentSelect(e.target.value)}
              className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base"
            >
              <option value="">Selecciona Departamento</option>
              {departments.map((department) => (
                <option key={department.id} value={department.name}>
                  {department.name}
                </option>
              ))}
            </select>

            {/* Provincia y Distrito */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={selectedProvince}
                onChange={(e) => onProvinceSelect(e.target.value)}
                disabled={!selectedDepartment}
                className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-secondary-100 text-base"
              >
                <option value="">Selecciona Provincia</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedDistrict}
                onChange={(e) => onDistrictSelect(e.target.value)}
                disabled={!selectedProvince}
                className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-secondary-100 text-base"
              >
                <option value="">Selecciona Distrito</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.name}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fecha y Rango de Búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Calendario */}
          <div>
            <label className="text-lg font-bold text-secondary-900 mb-3 block">
              Selecciona Fecha
            </label>
            <div className="rounded-lg p-4" style={{ backgroundColor: '#2d2d2d' }}>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <span className="font-bold text-white">
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                    {day.charAt(0)}
                  </div>
                ))}
              </div>

              {/* Días del calendario */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendar().map((day, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (day.isCurrentMonth && !day.isPast) {
                        onDateSelect(day.date.toISOString().split('T')[0])
                      }
                    }}
                    disabled={!day.isCurrentMonth || day.isPast}
                    className={`
                      aspect-square flex items-center justify-center text-sm rounded transition-all
                      ${!day.isCurrentMonth ? 'text-gray-600 cursor-default' : ''}
                      ${day.isPast && day.isCurrentMonth ? 'text-gray-600 cursor-not-allowed' : ''}
                      ${day.isSelected ? 'text-white font-bold' : 'text-white hover:bg-gray-700'}
                    `}
                    style={{
                      backgroundColor: day.isSelected ? '#22c55e' : 'transparent',
                    }}
                  >
                    {day.day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rango de Búsqueda */}
          <div>
            <label className="text-lg font-bold text-secondary-900 mb-3 block">
              Rango de Búsqueda
            </label>
            <div className="space-y-3">
              <div>
                <select
                  value={startTime}
                  onChange={(e) => onStartTimeChange(e.target.value)}
                  className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-base"
                >
                  <option value="">Desde</option>
                  {timeRanges.slice(0, -1).map((time) => (
                    <option key={time.id} value={time.startTime}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  value={endTime}
                  onChange={(e) => onEndTimeChange(e.target.value)}
                  disabled={!startTime}
                  className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-secondary-100 text-base"
                >
                  <option value="">Hasta</option>
                  {timeRanges
                    .filter((time) => {
                      if (!startTime) return false
                      return time.startTime > startTime
                    })
                    .map((time) => (
                      <option key={time.id} value={time.startTime}>
                        {time.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de búsqueda */}
        <button
          onClick={onSearch}
          disabled={!canSearch}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
            canSearch
              ? 'text-white shadow-lg'
              : 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
          }`}
          style={{
            backgroundColor: canSearch ? '#22c55e' : '#e5e7eb',
          }}
          onMouseEnter={(e) => {
            if (canSearch) {
              e.currentTarget.style.backgroundColor = '#16a34a'
            }
          }}
          onMouseLeave={(e) => {
            if (canSearch) {
              e.currentTarget.style.backgroundColor = '#22c55e'
            }
          }}
        >
          Buscar Canchas Disponibles
        </button>

        {/* Contador de resultados */}
        {canSearch && visibleFieldsCount > 0 && (
          <p className="text-center mt-3 text-green-700 font-medium">
            {visibleFieldsCount} canchas encontradas
          </p>
        )}
      </div>
    </div>
  )
}

export default FilterPanel
