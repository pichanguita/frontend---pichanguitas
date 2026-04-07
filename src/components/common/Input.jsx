import React, { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'
import PropTypes from 'prop-types'

/**
 * Componente Input reutilizable
 *
 * @example
 * <Input
 *   label="Nombre"
 *   type="text"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   placeholder="Ingresa tu nombre"
 *   error="Campo requerido"
 * />
 */
const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder = '',
      error = '',
      helperText = '',
      disabled = false,
      required = false,
      icon: Icon,
      iconPosition = 'left',
      size = 'md',
      className = '',
      inputClassName = '',
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

    // Clases base del input
    const baseClasses = `
    w-full rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
    ${sizeClasses[size]}
  `

    // Clases según estado (normal, error, disabled)
    const stateClasses = error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'

    // Clases con ícono
    const iconClasses = Icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''

    return (
      <div className={`w-full ${className}`}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Ícono izquierdo */}
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon
                className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} ${error ? 'text-red-400' : 'text-gray-400'}`}
              />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={type}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={placeholder}
            disabled={disabled}
            className={`${baseClasses} ${stateClasses} ${iconClasses} ${inputClassName}`}
            {...props}
          />

          {/* Ícono derecho o ícono de error */}
          {Icon && iconPosition === 'right' && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon
                className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} text-gray-400`}
              />
            </div>
          )}

          {/* Ícono de error */}
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <AlertCircle
                className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} text-red-400`}
              />
            </div>
          )}
        </div>

        {/* Error o Helper Text */}
        {error && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">{error}</p>}

        {!error && helperText && <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf(['text', 'email', 'password', 'tel', 'number', 'url', 'search']),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  inputClassName: PropTypes.string,
}

export default Input
