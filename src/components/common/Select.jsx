import React, { forwardRef } from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'
import PropTypes from 'prop-types'

/**
 * Componente Select reutilizable
 *
 * @example
 * <Select
 *   label="País"
 *   value={country}
 *   onChange={(e) => setCountry(e.target.value)}
 *   options={[
 *     { value: 'pe', label: 'Perú' },
 *     { value: 'cl', label: 'Chile' }
 *   ]}
 *   error="Campo requerido"
 * />
 */
const Select = forwardRef(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      onFocus,
      options = [],
      placeholder = 'Selecciona una opción',
      error = '',
      helperText = '',
      disabled = false,
      required = false,
      size = 'md',
      className = '',
      selectClassName = '',
      ...props
    },
    ref
  ) => {
    // Clases de tamaño
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-5 py-3 text-lg',
    }

    // Clases base del select
    const baseClasses = `
    w-full rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
    appearance-none pr-10
    ${sizeClasses[size]}
  `

    // Clases según estado (normal, error, disabled)
    const stateClasses = error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'

    return (
      <div className={`w-full ${className}`}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Select Container */}
        <div className="relative">
          {/* Select */}
          <select
            ref={ref}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            className={`${baseClasses} ${stateClasses} ${selectClassName}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option, index) => (
              <option key={option.value || index} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Ícono de flecha o error */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1">
            {error && (
              <AlertCircle
                className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} text-red-400`}
              />
            )}
            <ChevronDown
              className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} ${error ? 'text-red-400' : 'text-gray-400'}`}
            />
          </div>
        </div>

        {/* Error o Helper Text */}
        {error && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">{error}</p>}

        {!error && helperText && <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

Select.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ).isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  selectClassName: PropTypes.string,
}

export default Select
