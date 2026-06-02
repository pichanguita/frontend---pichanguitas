import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, XCircle } from 'lucide-react'

/**
 * Modal para crear/editar reglas de promoción
 */
const RuleFormModal = ({
  isOpen,
  editingRule,
  appliesTo,
  selectedFields,
  selectedSports,
  userFields,
  availableSports = [],
  isSuperAdmin,
  fieldsWithRules = [],
  ruleConflicts = {},
  onClose,
  onSave,
  onAppliesToChange,
  onFieldsChange,
  onSportsChange,
}) => {
  // Crear un mapa de field_id -> rule_name para verificar rápidamente
  // IMPORTANTE: Este hook debe estar antes del early return
  const occupiedFieldsMap = useMemo(() => {
    const map = {}
    fieldsWithRules.forEach((item) => {
      map[item.field_id] = item.rule_name
    })
    return map
  }, [fieldsWithRules])

  // Determinar si hay conflictos que bloquean el guardado
  const hasBlockingConflict = useMemo(() => {
    // Si hay una regla global activa, bloquea todo
    if (ruleConflicts.hasGlobalRule) return true

    // Si se selecciona "all" y hay reglas específicas, bloquea
    if (appliesTo === 'all' && ruleConflicts.hasSpecificRules) return true

    return false
  }, [ruleConflicts, appliesTo])

  // Mensaje de error según el tipo de conflicto
  const conflictMessage = useMemo(() => {
    if (ruleConflicts.hasGlobalRule) {
      return {
        type: 'error',
        title: 'No se pueden crear nuevas reglas',
        message: `Ya existe una regla activa "${ruleConflicts.globalRule?.name}" que aplica a TODAS las canchas. Debe desactivarla primero antes de crear o modificar otras reglas.`,
      }
    }

    if (appliesTo === 'all' && ruleConflicts.hasSpecificRules) {
      const ruleNames = ruleConflicts.specificRules?.map((r) => `"${r.name}"`).join(', ') || ''
      return {
        type: 'error',
        title: 'No se puede aplicar a todas las canchas',
        message: `Existen ${ruleConflicts.specificRules?.length || 0} regla(s) activa(s) con canchas específicas: ${ruleNames}. Debe desactivarlas primero para crear una regla que aplique a todas las canchas.`,
      }
    }

    return null
  }, [ruleConflicts, appliesTo])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()

    // Prevenir envío si hay conflictos
    if (hasBlockingConflict) return

    const formData = new FormData(e.target)
    onSave({
      name: formData.get('name'),
      description: formData.get('description'),
      hoursRequired: parseInt(formData.get('hoursRequired')),
      freeHours: parseInt(formData.get('freeHours')),
      isActive: formData.get('isActive') === 'on',
      appliesTo: appliesTo,
      specificFields: selectedFields,
      specificSports: selectedSports,
    })
  }

  const handleAppliesToChange = (value) => {
    onAppliesToChange(value)
  }

  const handleFieldToggle = (fieldId) => {
    if (selectedFields.includes(fieldId)) {
      onFieldsChange(selectedFields.filter((id) => id !== fieldId))
    } else {
      onFieldsChange([...selectedFields, fieldId])
    }
  }

  const handleSportToggle = (sport) => {
    if (selectedSports.includes(sport)) {
      onSportsChange(selectedSports.filter((s) => s !== sport))
    } else {
      onSportsChange([...selectedSports, sport])
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-bold text-secondary-900 mb-4">
          {editingRule ? 'Editar Regla' : 'Nueva Regla de Promoción'}
        </h3>

        {/* Alerta de conflicto bloqueante */}
        {conflictMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">{conflictMessage.title}</p>
                <p className="text-xs text-red-700 mt-1">{conflictMessage.message}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Nombre de la regla
            </label>
            <input
              type="text"
              name="name"
              defaultValue={editingRule?.name}
              required
              disabled={ruleConflicts.hasGlobalRule}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Ej: Cliente Frecuente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Descripción</label>
            <input
              type="text"
              name="description"
              defaultValue={editingRule?.description}
              required
              disabled={ruleConflicts.hasGlobalRule}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Ej: Por cada 10 horas, 1 gratis"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Horas requeridas
              </label>
              <input
                type="number"
                name="hoursRequired"
                defaultValue={editingRule?.hoursRequired || 10}
                min="1"
                required
                disabled={ruleConflicts.hasGlobalRule}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Horas gratis
              </label>
              <input
                type="number"
                name="freeHours"
                defaultValue={editingRule?.freeHours || 1}
                min="1"
                required
                disabled={ruleConflicts.hasGlobalRule}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Aplica a</label>
            <select
              name="appliesTo"
              value={appliesTo}
              onChange={(e) => handleAppliesToChange(e.target.value)}
              disabled={ruleConflicts.hasGlobalRule}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="all">Todas las canchas</option>
              <option value="specific_fields">Canchas específicas</option>
              <option value="specific_sports">Deportes específicos</option>
            </select>
          </div>

          {/* Alerta cuando se selecciona "all" y hay reglas específicas */}
          {appliesTo === 'all' && ruleConflicts.hasSpecificRules && (
            <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">
                No puede seleccionar "Todas las canchas" porque ya existen{' '}
                {ruleConflicts.specificRules?.length} regla(s) con canchas específicas activas.
              </p>
            </div>
          )}

          {/* Campo condicional para seleccionar canchas específicas */}
          {appliesTo === 'specific_fields' && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Seleccionar canchas{' '}
                {!isSuperAdmin && (
                  <span className="text-xs text-secondary-500">(solo tus canchas)</span>
                )}
              </label>
              {fieldsWithRules.length > 0 && (
                <div className="flex items-start gap-2 mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    Las canchas marcadas en gris ya tienen una regla activa asignada y no pueden
                    seleccionarse.
                  </p>
                </div>
              )}
              <div className="border border-secondary-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                {userFields.length > 0 ? (
                  userFields.map((field) => {
                    const occupyingRule = occupiedFieldsMap[field.id]
                    const isOccupied = !!occupyingRule

                    return (
                      <label
                        key={field.id}
                        className={`flex items-center mb-2 p-1 rounded ${
                          isOccupied
                            ? 'bg-gray-100 cursor-not-allowed opacity-60'
                            : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                        title={isOccupied ? `Ya asignada a: ${occupyingRule}` : ''}
                      >
                        <input
                          type="checkbox"
                          value={field.id}
                          checked={selectedFields.includes(field.id)}
                          onChange={() => !isOccupied && handleFieldToggle(field.id)}
                          disabled={isOccupied}
                          className={`w-4 h-4 border-secondary-300 rounded focus:ring-primary-500 mr-2 ${
                            isOccupied ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600'
                          }`}
                        />
                        <span
                          className={`text-sm ${isOccupied ? 'text-gray-500' : 'text-secondary-700'}`}
                        >
                          {field.name}
                        </span>
                        {isOccupied && (
                          <span className="ml-auto text-xs text-amber-600 italic">
                            ({occupyingRule})
                          </span>
                        )}
                      </label>
                    )
                  })
                ) : (
                  <p className="text-sm text-secondary-500">
                    {isSuperAdmin ? 'No hay canchas disponibles' : 'No tienes canchas asignadas'}
                  </p>
                )}
              </div>
              {selectedFields.length > 0 && (
                <p className="text-xs text-secondary-600 mt-1">
                  {selectedFields.length} cancha(s) seleccionada(s)
                </p>
              )}
            </div>
          )}

          {/* Campo condicional para seleccionar deportes específicos */}
          {appliesTo === 'specific_sports' && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Seleccionar deportes
              </label>
              <div className="border border-secondary-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                {availableSports.length > 0 ? (
                  availableSports.map((sport) => (
                    <label
                      key={sport}
                      className="flex items-center mb-2 hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        value={sport}
                        checked={selectedSports.includes(sport)}
                        onChange={() => handleSportToggle(sport)}
                        className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500 mr-2"
                      />
                      <span className="text-sm text-secondary-700">{sport}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-secondary-500">
                    No hay deportes configurados. El superadministrador debe crearlos en "Gestión de
                    Deportes".
                  </p>
                )}
              </div>
              {selectedSports.length > 0 && (
                <p className="text-xs text-secondary-600 mt-1">
                  {selectedSports.length} deporte(s) seleccionado(s)
                </p>
              )}
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              defaultChecked={editingRule?.isActive ?? true}
              disabled={ruleConflicts.hasGlobalRule}
              className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500 disabled:cursor-not-allowed"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-secondary-700">
              Regla activa
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={hasBlockingConflict}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                hasBlockingConflict
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {editingRule ? 'Actualizar' : 'Crear'} Regla
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default RuleFormModal
