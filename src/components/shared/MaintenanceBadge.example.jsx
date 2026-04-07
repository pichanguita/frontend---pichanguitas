/**
 * EJEMPLOS DE USO - MaintenanceBadge
 *
 * Este archivo contiene ejemplos de cómo usar el componente MaintenanceBadge
 * en diferentes contextos del proyecto.
 *
 * NO BORRAR - Archivo de referencia para desarrolladores
 */

import React from 'react'
import MaintenanceBadge from './MaintenanceBadge'
import { isFieldInMaintenance } from '../../utils/fields/fieldUtils'

// ============================================================================
// EJEMPLO 1: Badge pequeño en lista compacta
// ============================================================================
const CompactFieldList = ({ fields }) => {
  return (
    <div className="space-y-2">
      {fields.map((field) => (
        <div key={field.id} className="flex items-center justify-between p-2 bg-white rounded">
          <span className="font-medium">{field.name}</span>

          {isFieldInMaintenance(field) && <MaintenanceBadge variant="small" />}
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// EJEMPLO 2: Badge mediano en tarjeta de cancha (DEFAULT)
// ============================================================================
const FieldCardExample = ({ field }) => {
  const inMaintenance = isFieldInMaintenance(field)

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500">
        {inMaintenance && <MaintenanceBadge variant="medium" className="absolute top-3 left-3" />}
      </div>

      <div className="p-4">
        <h3 className="font-bold">{field.name}</h3>
        <p className="text-gray-600">{field.location}</p>
      </div>
    </div>
  )
}

// ============================================================================
// EJEMPLO 3: Badge grande en header de página
// ============================================================================
const FieldDetailsHeader = ({ field }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{field.name}</h1>
          <p className="text-gray-600 mt-2">{field.location}</p>
        </div>

        {isFieldInMaintenance(field) && <MaintenanceBadge variant="large" />}
      </div>
    </div>
  )
}

// ============================================================================
// EJEMPLO 4: Alert completo en modal
// ============================================================================
const ReservationModalExample = ({ field }) => {
  const inMaintenance = isFieldInMaintenance(field)

  return (
    <div className="bg-white rounded-2xl p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">{field.name}</h2>

      {inMaintenance && <MaintenanceBadge variant="alert" className="mb-4" />}

      {/* Resto del formulario */}
      <div className="space-y-4">
        <input
          type="date"
          disabled={inMaintenance}
          className="w-full p-3 border rounded disabled:bg-gray-100"
        />

        <button
          disabled={inMaintenance}
          className="w-full bg-green-600 text-white py-3 rounded disabled:opacity-50"
        >
          {inMaintenance ? 'Cancha No Disponible' : 'Confirmar Reserva'}
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// EJEMPLO 5: Badge condicional con animación
// ============================================================================
import { motion, AnimatePresence } from 'framer-motion'

const AnimatedFieldCard = ({ field }) => {
  const inMaintenance = isFieldInMaintenance(field)

  return (
    <div className="relative">
      <AnimatePresence>
        {inMaintenance && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-3 left-3 z-10"
          >
            <MaintenanceBadge variant="medium" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido de la tarjeta */}
    </div>
  )
}

// ============================================================================
// EJEMPLO 6: Lista con filtrado y badge
// ============================================================================
const FieldListWithFilter = ({ fields, showMaintenance = false }) => {
  const visibleFields = showMaintenance ? fields : fields.filter((f) => !isFieldInMaintenance(f))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Canchas Disponibles</h2>
        <span className="text-sm text-gray-600">{visibleFields.length} canchas</span>
      </div>

      {visibleFields.map((field) => (
        <div key={field.id} className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">{field.name}</h3>
              <p className="text-sm text-gray-600">{field.location}</p>
            </div>

            {isFieldInMaintenance(field) && <MaintenanceBadge variant="small" />}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// EJEMPLO 7: Badge en tabla administrativa
// ============================================================================
const AdminFieldsTable = ({ fields }) => {
  return (
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left">Nombre</th>
          <th className="px-6 py-3 text-left">Ubicación</th>
          <th className="px-6 py-3 text-left">Estado</th>
          <th className="px-6 py-3 text-left">Acciones</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {fields.map((field) => (
          <tr key={field.id} className="hover:bg-gray-50">
            <td className="px-6 py-4">{field.name}</td>
            <td className="px-6 py-4">{field.location}</td>
            <td className="px-6 py-4">
              {isFieldInMaintenance(field) ? (
                <MaintenanceBadge variant="small" />
              ) : (
                <span className="text-green-600 font-medium">Disponible</span>
              )}
            </td>
            <td className="px-6 py-4">
              <button className="text-blue-600 hover:underline">Editar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ============================================================================
// EJEMPLO 8: Badge con tooltip
// ============================================================================
const FieldWithTooltip = ({ field }) => {
  const inMaintenance = isFieldInMaintenance(field)

  return (
    <div className="relative group">
      {inMaintenance && (
        <div>
          <MaintenanceBadge variant="small" />

          {/* Tooltip */}
          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Esta cancha está en mantenimiento programado
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EJEMPLO 9: Badge en mapa (Leaflet Popup)
// ============================================================================
const MapPopupContent = ({ field }) => {
  const inMaintenance = isFieldInMaintenance(field)

  return (
    <div className="p-2 min-w-[200px]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold">{field.name}</h4>
        {inMaintenance && <MaintenanceBadge variant="small" />}
      </div>

      <p className="text-sm text-gray-600 mb-2">{field.location}</p>

      {!inMaintenance && (
        <button className="w-full bg-green-600 text-white py-2 rounded text-sm">
          Ver Detalles
        </button>
      )}
    </div>
  )
}

// ============================================================================
// EJEMPLO 10: Badge en notificación
// ============================================================================
const MaintenanceNotification = ({ field }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-orange-500">
      <div className="flex items-start gap-3">
        <MaintenanceBadge variant="small" className="mt-0.5" />

        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">Cancha entrará en mantenimiento</h4>
          <p className="text-sm text-gray-600 mt-1">
            {field.name} no estará disponible del 15/01 al 20/01 por mantenimiento programado.
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// VARIANTES DISPONIBLES
// ============================================================================
const AllVariantsExample = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h3 className="font-bold mb-2">Small</h3>
        <MaintenanceBadge variant="small" />
      </div>

      <div>
        <h3 className="font-bold mb-2">Medium (Default)</h3>
        <MaintenanceBadge variant="medium" />
      </div>

      <div>
        <h3 className="font-bold mb-2">Large</h3>
        <MaintenanceBadge variant="large" />
      </div>

      <div>
        <h3 className="font-bold mb-2">Alert</h3>
        <MaintenanceBadge variant="alert" />
      </div>
    </div>
  )
}

// ============================================================================
// EXPORTAR EJEMPLOS (opcional, para testing/storybook)
// ============================================================================
export {
  CompactFieldList,
  FieldCardExample,
  FieldDetailsHeader,
  ReservationModalExample,
  AnimatedFieldCard,
  FieldListWithFilter,
  AdminFieldsTable,
  FieldWithTooltip,
  MapPopupContent,
  MaintenanceNotification,
  AllVariantsExample,
}

/**
 * RESUMEN DE VARIANTES:
 *
 * variant="small"   → Listas compactas, tablas, tooltips
 * variant="medium"  → Cards, tarjetas, headers pequeños (DEFAULT)
 * variant="large"   → Headers principales, páginas de detalles
 * variant="alert"   → Modales, banners informativos, alertas completas
 *
 * PERSONALIZACIÓN:
 * Puedes agregar clases custom vía prop className:
 * <MaintenanceBadge variant="small" className="mt-2 shadow-lg" />
 */
