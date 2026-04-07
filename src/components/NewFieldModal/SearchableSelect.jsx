import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, AlertCircle, Check } from 'lucide-react'

/**
 * Componente select con busqueda y dropdown controlado
 * Mantiene el dropdown dentro de los limites del contenedor padre
 */
const SearchableSelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  hint,
  customClassName = '',
  placeholder = 'Selecciona...',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Normalizar opciones a formato {value, label}
  const normalizedOptions = options.map((option) => {
    if (typeof option === 'string') {
      return { value: option, label: option }
    }
    return {
      value: option.value !== undefined ? option.value : option.id,
      label: option.label !== undefined ? option.label : option.name,
    }
  })

  // Filtrar opciones basado en busqueda
  const filteredOptions = normalizedOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Encontrar label del valor seleccionado
  const selectedLabel =
    normalizedOptions.find((opt) => String(opt.value) === String(value))?.label || ''

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Enfocar input de busqueda cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (optionValue) => {
    // Buscar la opción seleccionada para obtener el label (nombre)
    const selectedOption = normalizedOptions.find(
      (opt) => String(opt.value) === String(optionValue)
    )

    // Simular evento onChange como un select nativo
    // Incluir tanto el value (ID) como el label (nombre)
    const syntheticEvent = {
      target: {
        name,
        value: optionValue,
        selectedLabel: selectedOption?.label || '', // Nombre del elemento seleccionado
      },
    }
    onChange(syntheticEvent)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        setSearchTerm('')
      }
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-secondary-700 mb-2">
        {label} {required && '*'}
        {hint && <span className="text-xs text-green-600 ml-2">{hint}</span>}
      </label>

      {/* Boton trigger */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full px-4 py-3 border-2 rounded-xl text-left flex items-center justify-between transition-colors duration-200 ${
          error ? 'border-red-300' : isOpen ? 'border-primary-500' : 'border-secondary-200'
        } ${disabled ? 'bg-secondary-100 cursor-not-allowed text-secondary-500' : 'bg-white hover:border-secondary-300'} ${customClassName}`}
      >
        <span className={selectedLabel ? 'text-secondary-900' : 'text-secondary-400'}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-secondary-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-secondary-200 rounded-xl shadow-lg overflow-hidden">
          {/* Campo de busqueda */}
          {normalizedOptions.length > 5 && (
            <div className="p-2 border-b border-secondary-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-3 py-2 border border-secondary-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
          )}

          {/* Lista de opciones */}
          <ul className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-secondary-500 text-sm text-center">
                No se encontraron resultados
              </li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-4 py-2.5 cursor-pointer flex items-center justify-between transition-colors duration-150 ${
                    String(option.value) === String(value)
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-secondary-50 text-secondary-700'
                  }`}
                >
                  <span>{option.label}</span>
                  {String(option.value) === String(value) && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  )
}

export default SearchableSelect
