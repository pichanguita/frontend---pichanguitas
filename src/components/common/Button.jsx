import React, { forwardRef } from 'react'
import PropTypes from 'prop-types'

/**
 * Componente Button reutilizable con variantes y tamaños
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 */
const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      icon,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Variantes de estilo
    const variants = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
      secondary:
        'bg-secondary-200 hover:bg-secondary-300 text-secondary-800 focus:ring-secondary-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
    }

    // Tamaños
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    // Clases base
    const baseClasses =
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none'

    // Combinar clases
    const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={buttonClasses}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {icon && <span className="mr-2">{icon}</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

// PropTypes para validación
Button.propTypes = {
  /** Contenido del botón */
  children: PropTypes.node.isRequired,

  /** Variante visual del botón */
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'ghost']),

  /** Tamaño del botón */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),

  /** Si el botón está deshabilitado */
  disabled: PropTypes.bool,

  /** Si el botón está en estado de carga */
  loading: PropTypes.bool,

  /** Icono a mostrar antes del texto */
  icon: PropTypes.node,

  /** Clases CSS adicionales */
  className: PropTypes.string,

  /** Tipo de botón HTML */
  type: PropTypes.oneOf(['button', 'submit', 'reset']),

  /** Función onClick */
  onClick: PropTypes.func,
}

export default Button
