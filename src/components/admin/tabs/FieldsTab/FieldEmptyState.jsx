import { MapPin, AlertTriangle } from 'lucide-react'
import { EMPTY_STATES } from '../../../../constants'

/**
 * Estado vacío cuando no hay canchas disponibles
 * Muestra mensaje de error si la carga falló, o estado vacío normal
 */
export const FieldEmptyState = ({ user, error }) => {
  // Si hay error del backend, mostrar estado de error
  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-600 mb-2">
          Error al cargar canchas
        </h3>
        <p className="text-secondary-500 mb-4">
          No se pudieron obtener las canchas del servidor. Intenta recargar la página.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          Recargar página
        </button>
      </div>
    )
  }

  const message =
    user?.role === 'admin' && user?.adminType === 'field'
      ? EMPTY_STATES.NO_ASSIGNED_FIELDS
      : EMPTY_STATES.CREATE_FIRST_FIELD

  return (
    <div className="text-center py-12">
      <MapPin className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-secondary-500 mb-2">
        {EMPTY_STATES.NO_FIELDS_AVAILABLE}
      </h3>
      <p className="text-secondary-400">{message}</p>
    </div>
  )
}
