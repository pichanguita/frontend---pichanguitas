import React from 'react'
import { AlertCircle } from 'lucide-react'

/**
 * Componente reutilizable para selects en formularios
 * @param {string} label - Etiqueta del campo
 * @param {string} name - Nombre del campo
 * @param {string} value - Valor seleccionado
 * @param {function} onChange - Función onChange
 * @param {array} options - Array de opciones [{value, label}], [{id, name}] o array de strings
 * @param {string} error - Mensaje de error
 * @param {boolean} required - Si el campo es requerido
 * @param {boolean} disabled - Si el campo está deshabilitado
 * @param {string} hint - Texto de ayuda adicional
 * @param {string} customClassName - Clases CSS adicionales
 * @param {string} placeholder - Texto del placeholder (por defecto "Selecciona...")
 */
const FormSelect = ({
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
  return (
    <div>
      <label className="block text-sm font-medium text-secondary-700 mb-2">
        {label} {required && '*'}
        {hint && <span className="text-xs text-green-600 ml-2">{hint}</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-primary-500 transition-colors duration-200 ${
          error ? 'border-red-300' : 'border-secondary-200'
        } ${customClassName}`}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          // Soportar múltiples formatos:
          // 1. Strings simples: "Opción 1"
          // 2. Objetos {value, label}: {value: "1", label: "Opción 1"}
          // 3. Objetos {id, name}: {id: 1, name: "Lima"} (formato API)
          const optionValue =
            typeof option === 'string'
              ? option
              : option.value !== undefined
                ? option.value
                : option.id

          const optionLabel =
            typeof option === 'string'
              ? option
              : option.label !== undefined
                ? option.label
                : option.name

          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          )
        })}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  )
}

export default FormSelect
