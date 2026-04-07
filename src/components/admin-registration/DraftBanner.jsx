import React from 'react'
import { Save, Trash2, Clock } from 'lucide-react'

/**
 * DraftBanner - Banner para mostrar que hay un borrador guardado
 * Permite restaurar o eliminar el borrador
 *
 * @param {function} onRestore - Callback al restaurar borrador
 * @param {function} onDiscard - Callback al descartar borrador
 * @param {string} timeSinceLastSave - Texto con tiempo transcurrido
 */
const DraftBanner = ({ onRestore, onDiscard, timeSinceLastSave }) => {
  return (
    <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl shadow-sm">
      <div className="flex items-start gap-4">
        {/* Icono */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-full flex items-center justify-center">
            <Save className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-1">
            Borrador guardado encontrado
          </h3>

          <p className="text-sm sm:text-base text-amber-800 mb-3 leading-relaxed">
            Tienes un registro sin completar. ¿Deseas continuar desde donde lo dejaste?
          </p>

          {timeSinceLastSave && (
            <div className="flex items-center gap-2 mb-4 text-xs sm:text-sm text-amber-700">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Guardado {timeSinceLastSave}</span>
            </div>
          )}

          {/* Botones */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onRestore}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Restaurar borrador</span>
            </button>

            <button
              onClick={onDiscard}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-amber-50 border-2 border-amber-600 text-amber-700 rounded-lg font-medium text-sm transition-colors active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Descartar y empezar de nuevo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DraftBanner
