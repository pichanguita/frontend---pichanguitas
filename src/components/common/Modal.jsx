import React from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'

/**
 * Componente Modal reutilizable
 *
 * @example
 * <Modal
 *   isOpen={true}
 *   onClose={handleClose}
 *   title="Título del Modal"
 *   subtitle="Subtítulo opcional"
 *   variant="default"
 *   size="md"
 * >
 *   <p>Contenido del modal</p>
 * </Modal>
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  variant = 'default',
  closeOnClickOutside = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
}) => {
  // Cerrar con tecla ESC
  React.useEffect(() => {
    if (!closeOnEsc || !isOpen) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeOnEsc, isOpen, onClose])

  // Prevenir scroll del body cuando el modal está abierto
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Tamaños del modal
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  }

  // Variantes de color para el header
  const variantClasses = {
    default: 'bg-gradient-to-r from-primary-600 to-primary-700',
    success: 'bg-gradient-to-r from-green-600 to-green-700',
    error: 'bg-gradient-to-r from-red-600 to-red-700',
    warning: 'bg-gradient-to-r from-amber-600 to-amber-700',
    info: 'bg-gradient-to-r from-blue-600 to-blue-700',
  }

  // Color del subtítulo según variante
  const subtitleColorClasses = {
    default: 'text-primary-100',
    success: 'text-green-100',
    error: 'text-red-100',
    warning: 'text-amber-100',
    info: 'text-blue-100',
  }

  // Color del botón hover según variante
  const buttonHoverClasses = {
    default: 'hover:bg-primary-800',
    success: 'hover:bg-green-800',
    error: 'hover:bg-red-800',
    warning: 'hover:bg-amber-800',
    info: 'hover:bg-blue-800',
  }

  const handleBackdropClick = () => {
    if (closeOnClickOutside) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ${sizeClasses[size]} ${className}`}
          >
            {/* Header */}
            <div
              className={`sticky top-0 px-6 py-4 flex items-center justify-between rounded-t-2xl ${variantClasses[variant]}`}
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{title}</h3>
                {subtitle && (
                  <p className={`text-sm mt-0.5 ${subtitleColorClasses[variant]}`}>{subtitle}</p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ml-4 ${buttonHoverClasses[variant]}`}
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  variant: PropTypes.oneOf(['default', 'success', 'error', 'warning', 'info']),
  closeOnClickOutside: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  className: PropTypes.string,
}

export default Modal
