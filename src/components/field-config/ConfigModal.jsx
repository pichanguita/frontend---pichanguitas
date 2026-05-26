import React from 'react'
import { X, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ConfigModal = ({ isOpen, onClose, title, subtitle, children, onSave, isLoading, tabs }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header Fijo */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-secondary-200 bg-white">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">{title}</h2>
              {subtitle && <p className="text-secondary-600 mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-secondary-600" />
            </button>
          </div>

          {/* Tabs Fijos (opcional) */}
          {tabs && <div className="flex-shrink-0 bg-white">{tabs}</div>}

          {/* Contenido con Scroll */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">{children}</div>

          {/* Footer Fijo */}
          <div className="flex-shrink-0 flex justify-end space-x-3 p-6 border-t border-secondary-200 bg-white">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-secondary-200 hover:bg-secondary-300 text-secondary-700 rounded-lg font-medium transition-colors duration-200"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Configuración</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ConfigModal
