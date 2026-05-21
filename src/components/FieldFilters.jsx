import React, { useState, useEffect } from 'react'
import { Filter, MapPin, DollarSign, Clock, Users, ChevronDown, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useBookingStore from '../store/bookingStore'
import useAmenitiesCatalog from '../hooks/useAmenitiesCatalog'
import { getAmenityIconComponent } from '../utils/amenityIconRegistry'

const FieldFilters = ({ onFiltersChange }) => {
  const { fields } = useBookingStore()
  const { catalog: availableAmenities } = useAmenitiesCatalog()
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    location: '',
    priceRange: { min: 0, max: 200 },
    timeSlot: '',
    fieldType: '',
    amenities: [], // array de keys del catálogo
    capacity: '',
    searchQuery: '',
  })

  // Obtener ubicaciones únicas
  const locations = [...new Set(fields.map((field) => field.distrito))].filter(Boolean)

  // Obtener tipos de cancha únicos
  const fieldTypes = [
    { value: 'football', label: 'Fútbol' },
    { value: 'stadium', label: 'Estadio' },
    { value: 'futsal', label: 'Futsal' },
  ]

  // Rangos de horario
  const timeSlots = [
    { value: 'morning', label: 'Mañana (6:00 - 12:00)', icon: '🌅' },
    { value: 'afternoon', label: 'Tarde (12:00 - 18:00)', icon: '☀️' },
    { value: 'evening', label: 'Noche (18:00 - 24:00)', icon: '🌙' },
  ]

  // Capacidades
  const capacityOptions = [
    { value: '10-20', label: '10-20 personas' },
    { value: '20-30', label: '20-30 personas' },
    { value: '30+', label: 'Más de 30 personas' },
  ]

  // Aplicar filtros cuando cambien
  useEffect(() => {
    const filteredFields = fields.filter((field) => {
      // Filtro por búsqueda
      if (activeFilters.searchQuery) {
        const query = activeFilters.searchQuery.toLowerCase()
        if (
          !field.name.toLowerCase().includes(query) &&
          !field.location.toLowerCase().includes(query) &&
          !field.address.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Filtro por ubicación
      if (activeFilters.location && field.distrito !== activeFilters.location) {
        return false
      }

      // Filtro por rango de precio
      if (
        field.pricePerHour < activeFilters.priceRange.min ||
        field.pricePerHour > activeFilters.priceRange.max
      ) {
        return false
      }

      // Filtro por tipo de cancha
      if (activeFilters.fieldType && field.fieldType !== activeFilters.fieldType) {
        return false
      }

      // Filtro por amenidades (comparación por key del catálogo)
      if (activeFilters.amenities.length > 0) {
        const fieldKeys = new Set((field.amenities || []).map((a) => a?.key).filter(Boolean))
        const hasAllAmenities = activeFilters.amenities.every((key) => fieldKeys.has(key))
        if (!hasAllAmenities) return false
      }

      // Filtro por capacidad
      if (activeFilters.capacity) {
        const [min, max] = activeFilters.capacity.split('-').map((n) => parseInt(n) || Infinity)
        if (field.capacity < min || (max !== Infinity && field.capacity > max)) {
          return false
        }
      }

      // Filtro por requerimiento de adelanto

      return true
    })

    onFiltersChange(filteredFields)
  }, [activeFilters, fields])

  const handleFilterChange = (filterType, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const handleAmenityToggle = (amenity) => {
    setActiveFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const clearFilters = () => {
    setActiveFilters({
      location: '',
      priceRange: { min: 0, max: 200 },
      timeSlot: '',
      fieldType: '',
      amenities: [],
      capacity: '',
      searchQuery: '',
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (activeFilters.location) count++
    if (activeFilters.priceRange.min > 0 || activeFilters.priceRange.max < 200) count++
    if (activeFilters.timeSlot) count++
    if (activeFilters.fieldType) count++
    if (activeFilters.amenities.length > 0) count++
    if (activeFilters.capacity) count++
    if (activeFilters.searchQuery) count++
    return count
  }

  return (
    <div className="bg-white rounded-xl shadow-custom border-2 border-secondary-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Filter className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">Filtros de Búsqueda</h3>
              {getActiveFilterCount() > 0 && (
                <p className="text-sm text-secondary-600">
                  {getActiveFilterCount()} filtro{getActiveFilterCount() > 1 ? 's' : ''} activo
                  {getActiveFilterCount() > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getActiveFilterCount() > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Limpiar filtros
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-secondary-100 rounded-lg transition-colors duration-200"
            >
              <ChevronDown
                className={`w-5 h-5 text-secondary-600 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o ubicación..."
              value={activeFilters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 space-y-4"
          >
            {/* Ubicación */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-secondary-700 mb-2">
                <MapPin className="w-4 h-4" />
                <span>Ubicación</span>
              </label>
              <select
                value={activeFilters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border-2 border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors duration-200"
              >
                <option value="">Todas las ubicaciones</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Rango de precio */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-secondary-700 mb-2">
                <DollarSign className="w-4 h-4" />
                <span>Rango de precio (S/ por hora)</span>
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={activeFilters.priceRange.min}
                  onChange={(e) =>
                    handleFilterChange('priceRange', {
                      ...activeFilters.priceRange,
                      min: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-24 px-3 py-2 border-2 border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors duration-200"
                />
                <span className="text-secondary-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={activeFilters.priceRange.max}
                  onChange={(e) =>
                    handleFilterChange('priceRange', {
                      ...activeFilters.priceRange,
                      max: parseInt(e.target.value) || 200,
                    })
                  }
                  className="w-24 px-3 py-2 border-2 border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors duration-200"
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-secondary-500">
                <span>S/ {activeFilters.priceRange.min}</span>
                <div className="flex-1 mx-3 h-1 bg-secondary-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{
                      marginLeft: `${(activeFilters.priceRange.min / 200) * 100}%`,
                      width: `${((activeFilters.priceRange.max - activeFilters.priceRange.min) / 200) * 100}%`,
                    }}
                  />
                </div>
                <span>S/ {activeFilters.priceRange.max}</span>
              </div>
            </div>

            {/* Tipo de cancha */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-secondary-700 mb-2">
                <Users className="w-4 h-4" />
                <span>Tipo de cancha</span>
              </label>
              <select
                value={activeFilters.fieldType}
                onChange={(e) => handleFilterChange('fieldType', e.target.value)}
                className="w-full px-3 py-2 border-2 border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors duration-200"
              >
                <option value="">Todos los tipos</option>
                {fieldTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Horario preferido */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-secondary-700 mb-2">
                <Clock className="w-4 h-4" />
                <span>Horario preferido</span>
              </label>
              <select
                value={activeFilters.timeSlot}
                onChange={(e) => handleFilterChange('timeSlot', e.target.value)}
                className="w-full px-3 py-2 border-2 border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors duration-200"
              >
                <option value="">Todos los horarios</option>
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>
                    {slot.icon} {slot.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Amenidades */}
            <div>
              <label className="text-sm font-medium text-secondary-700 mb-2 block">
                Amenidades
              </label>
              <div className="flex flex-wrap gap-2">
                {availableAmenities.map((amenity) => {
                  const Icon = getAmenityIconComponent(amenity.icon_name)
                  const isActive = activeFilters.amenities.includes(amenity.key)
                  return (
                    <button
                      key={amenity.key}
                      onClick={() => handleAmenityToggle(amenity.key)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-full border-2 text-sm transition-all duration-200 ${
                        isActive
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-secondary-200 hover:border-primary-300 text-secondary-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{amenity.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Capacidad */}
            <div>
              <label className="text-sm font-medium text-secondary-700 mb-2 block">Capacidad</label>
              <select
                value={activeFilters.capacity}
                onChange={(e) => handleFilterChange('capacity', e.target.value)}
                className="w-full px-3 py-2 border-2 border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors duration-200"
              >
                <option value="">Todas las capacidades</option>
                {capacityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FieldFilters
