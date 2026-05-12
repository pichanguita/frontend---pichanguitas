import { MapPin, DollarSign, UserCheck, Eye, Edit3, Cog, Trash2 } from 'lucide-react'
import {
  FIELD_STATUS,
  FIELD_STATUS_LABELS,
  FIELD_APPROVAL_STATUS,
  FIELD_APPROVAL_STATUS_LABELS,
  BUTTON_TEXTS,
  DEFAULT_ICONS,
  UI_CONFIG,
} from '../../../../constants'

/**
 * Componente de tarjeta para mostrar información de una cancha
 */
export const FieldCard = ({
  field,
  fieldOwner,
  sportTypes,
  isSuperAdmin,
  onView,
  onEdit,
  onConfig,
  onDelete,
}) => {
  // Clase CSS para el badge de disponibilidad
  const statusBadgeClass =
    {
      [FIELD_STATUS.AVAILABLE]: 'bg-green-100 text-green-800',
      [FIELD_STATUS.MAINTENANCE]: 'bg-yellow-100 text-yellow-800',
      [FIELD_STATUS.INACTIVE]: 'bg-gray-100 text-gray-800',
      [FIELD_STATUS.CLOSED]: 'bg-gray-100 text-gray-800',
      [FIELD_STATUS.DELETED]: 'bg-red-100 text-red-800',
      [FIELD_STATUS.UNAVAILABLE]: 'bg-red-100 text-red-800',
    }[field.status] || 'bg-gray-100 text-gray-800'

  // Clase CSS para el badge de aprobación
  const approvalBadgeClass =
    {
      [FIELD_APPROVAL_STATUS.APPROVED]: 'bg-green-100 text-green-800',
      [FIELD_APPROVAL_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
      [FIELD_APPROVAL_STATUS.REJECTED]: 'bg-red-100 text-red-800',
    }[field.approvalStatus] || 'bg-gray-100 text-gray-800'

  return (
    <div className="bg-white rounded-xl shadow-custom p-6">
      <div className="flex items-start justify-between gap-4">
        {/* Contenido principal */}
        <div className="flex-1">
          {/* Nombre de la cancha */}
          <h4 className="text-xl font-semibold text-secondary-900 mb-2">{field.name}</h4>

          {/* Propietario (solo para super admin) */}
          {isSuperAdmin && fieldOwner && (
            <div className="flex items-center space-x-2 text-sm text-primary-600 mb-2">
              <UserCheck className="w-4 h-4" />
              <span className="font-medium">Propietario: {fieldOwner.name}</span>
              {fieldOwner.phone && <span className="text-secondary-500">• {fieldOwner.phone}</span>}
            </div>
          )}

          {/* Información básica */}
          <div className="flex flex-col space-y-1 text-sm text-secondary-600 mb-2">
            <span className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{field.location}</span>
            </span>

            {/* Coordenadas con enlace a Google Maps */}
            {field.latitude && field.longitude && (
              <a
                href={`https://www.google.com/maps?q=${field.latitude},${field.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 hover:underline ml-5"
                title="Ver en Google Maps"
              >
                <span className="text-xs">
                  📍 {field.latitude}, {field.longitude}
                </span>
              </a>
            )}

            <span className="flex items-center space-x-1">
              <DollarSign className="w-4 h-4" />
              <span>S/ {field.price_per_hour || field.pricePerHour || 'N/A'}/hora</span>
            </span>
          </div>

          {/* Deportes disponibles */}
          {field.sportNames && field.sportNames.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              {field.sportNames
                .slice(0, UI_CONFIG.MAX_SPORTS_ICONS_DISPLAYED)
                .map((sport, index) => {
                  // Preferir el icono que el backend envía con el field (sportIcons[i]).
                  // Esto funciona aun cuando el deporte fue soft-deleted del catálogo.
                  // Fallback al catálogo activo y luego al icono por defecto.
                  const fieldIcon = field.sportIcons?.[index]
                  const sportData = sportTypes.find((s) => s.name === sport)
                  return (
                    <span key={index} className="text-lg" title={sport}>
                      {fieldIcon || sportData?.icon || DEFAULT_ICONS.SOCCER}
                    </span>
                  )
                })}
              {field.sportNames.length > UI_CONFIG.MAX_SPORTS_ICONS_DISPLAYED && (
                <span className="text-xs text-secondary-500">
                  +{field.sportNames.length - UI_CONFIG.MAX_SPORTS_ICONS_DISPLAYED} más
                </span>
              )}
            </div>
          )}

          {/* Badges de estado — prioridad approvalStatus > status:
              una cancha rechazada o pendiente no muestra su estado operativo
              porque no puede ser usada (regla definida en getFieldCategory) */}
          <div className="flex items-center space-x-2 mt-3">
            {/* Estado de aprobación (tiene prioridad cuando no está aprobada) */}
            {field.approvalStatus && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${approvalBadgeClass}`}>
                {FIELD_APPROVAL_STATUS_LABELS[field.approvalStatus] || field.approvalStatus}
              </span>
            )}

            {/* Estado de disponibilidad — solo si está aprobada o no tiene approvalStatus */}
            {(!field.approvalStatus ||
              field.approvalStatus === FIELD_APPROVAL_STATUS.APPROVED) && (
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadgeClass}`}>
                {FIELD_STATUS_LABELS[field.status] || field.status}
              </span>
            )}
          </div>
        </div>

        {/* Botones de acción - Compactos en una fila a la derecha */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(field)}
            className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            title="Ver"
          >
            <Eye className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{BUTTON_TEXTS.VIEW}</span>
          </button>

          <button
            onClick={() => onEdit(field)}
            className="flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            title="Editar"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{BUTTON_TEXTS.EDIT}</span>
          </button>

          <button
            onClick={() => onConfig(field)}
            className="flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            title="Configurar"
          >
            <Cog className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{BUTTON_TEXTS.CONFIG}</span>
          </button>

          <button
            onClick={() => onDelete(field)}
            className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  )
}
