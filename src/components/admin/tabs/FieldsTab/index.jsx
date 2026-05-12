import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import useFieldStore from '../../../../store/modules/fieldStore'
import useAuthStore from '../../../../store/authStore'
import { useFieldFilters } from '../../../../hooks'
import { FieldFilters } from './FieldFilters'
import { FieldCard } from './FieldCard'
import { FieldEmptyState } from './FieldEmptyState'
import { DEFAULT_VALUES, BUTTON_TEXTS } from '../../../../constants'

/**
 * Tab de Gestión de Canchas
 *
 * Antes: ~300 líneas dentro de AdminPanel.jsx con lógica duplicada 3 veces
 * Ahora: ~120 líneas usando el hook useFieldFilters
 */
export const FieldsTab = ({
  onOpenNewFieldModal,
  onViewField,
  onEditField,
  onConfigField,
  onDeleteField,
  getFieldOwner,
  sportTypes,
  users,
}) => {
  // Estados locales para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSport, setFilterSport] = useState(DEFAULT_VALUES.ALL)
  const [filterStatus, setFilterStatus] = useState(DEFAULT_VALUES.ALL)
  const [filterOwner, setFilterOwner] = useState(DEFAULT_VALUES.ALL)

  // Stores
  const { fields, error: fieldStoreError } = useFieldStore()
  const { user } = useAuthStore()

  // Verificar si es super admin
  const isSuperAdmin = () => {
    return user?.role === 'super_admin'
  }

  // Obtener canchas visibles según permisos
  const getVisibleFields = () => {
    // Super admin o admin general pueden ver todas las canchas
    if (user?.role === 'super_admin' || (user?.role === 'admin' && user?.adminType === 'general')) {
      return fields
    }

    // Admin de cancha: puede tener adminType='field' O id_rol=2 (desde backend)
    // Solo puede ver SUS canchas - filtrar por admin_id o managedFields
    const isFieldAdmin = user?.adminType === 'field' || user?.id_rol === 2

    if (user?.role === 'admin' && isFieldAdmin) {
      return fields.filter((field) => {
        // Nuevo sistema: filtrar por adminId (camelCase desde backend)
        if (field.adminId === user.id) return true

        // Sistema legacy: filtrar por managedFields
        const managedFieldIds = user?.managedFields || []
        return managedFieldIds.includes(field.id)
      })
    }

    return []
  }

  const visibleFields = getVisibleFields()

  // Hook personalizado que filtra canchas (reemplaza ~85 líneas de código duplicado)
  const filteredFields = useFieldFilters(
    visibleFields,
    {
      searchTerm,
      filterSport,
      filterStatus,
      filterOwner,
    },
    isSuperAdmin()
  )

  // Crear Map de propietarios para lookups O(1)
  const fieldOwnersMap = useMemo(() => {
    if (!isSuperAdmin()) return null

    const map = new Map()
    fields.forEach((field) => {
      // Priorizar adminName que viene del backend (más eficiente)
      if (field.adminName) {
        map.set(field.id, {
          name: field.adminName,
          phone: field.phone || null,
        })
      } else {
        // Fallback a getFieldOwner si no hay adminName
        const owner = getFieldOwner(field.id)
        if (owner) {
          map.set(field.id, owner)
        }
      }
    })
    return map
  }, [fields, getFieldOwner, isSuperAdmin])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header con botón Nueva Cancha */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-secondary-900">Gestión de Canchas</h3>
        <button
          onClick={onOpenNewFieldModal}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>{BUTTON_TEXTS.NEW_FIELD}</span>
        </button>
      </div>

      {/* Filtros */}
      <FieldFilters
        searchTerm={searchTerm}
        filterSport={filterSport}
        filterStatus={filterStatus}
        filterOwner={filterOwner}
        sportTypes={sportTypes}
        users={users}
        isSuperAdmin={isSuperAdmin()}
        filteredFieldsCount={filteredFields.length}
        onFilterChange={{
          setSearchTerm,
          setFilterSport,
          setFilterStatus,
          setFilterOwner,
        }}
      />

      {/* Lista de canchas */}
      <div className="grid gap-6">
        {filteredFields.length === 0 ? (
          <FieldEmptyState user={user} error={fieldStoreError} />
        ) : (
          filteredFields.map((field) => (
            <FieldCard
              key={field.id}
              field={field}
              fieldOwner={isSuperAdmin() ? fieldOwnersMap?.get(field.id) : null}
              sportTypes={sportTypes}
              isSuperAdmin={isSuperAdmin()}
              onView={onViewField}
              onEdit={onEditField}
              onConfig={onConfigField}
              onDelete={onDeleteField}
            />
          ))
        )}
      </div>
    </motion.div>
  )
}
