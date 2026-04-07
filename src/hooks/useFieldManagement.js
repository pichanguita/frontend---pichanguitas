import { FIELD_APPROVAL_STATUS } from '../constants/fieldStatus'

/**
 * Hook para gestión de campos (canchas)
 * Centraliza las operaciones CRUD de campos con logging automático
 *
 * Elimina ~50 líneas de código duplicado y mejora mantenibilidad
 */
export const useFieldManagement = ({
  user,
  addField,
  updateFieldLocal,
  addActivityLog,
}) => {
  /**
   * Crea un nuevo campo con logging automático
   */
  const handleNewField = async (newField) => {
    try {
      await addField(newField, user)

      addActivityLog('field_created', {
        fieldId: newField.id,
        fieldName: newField.name,
        location: newField.location,
        approvalStatus: user?.role === 'super_admin' ? FIELD_APPROVAL_STATUS.APPROVED : FIELD_APPROVAL_STATUS.PENDING,
      })

      return true
    } catch (error) {
      console.error('❌ [useFieldManagement.handleNewField] Error creating field:', error)
      throw error
    }
  }

  /**
   * Actualiza información básica de un campo con logging
   * NOTA: Solo actualiza el estado local porque la API ya fue llamada desde el formulario
   */
  const handleUpdateField = async (fieldId, updatedField) => {
    try {
      // Usar updateFieldLocal para solo actualizar el estado (la API ya fue llamada)
      if (updateFieldLocal) {
        updateFieldLocal(fieldId, updatedField)
      }
      addActivityLog('field_updated', {
        fieldId: fieldId,
        fieldName: updatedField.name,
        changes: 'Field information updated',
      })
      return true
    } catch (error) {
      console.error('Error updating field:', error)
      throw error
    }
  }

  /**
   * Actualiza configuración de un campo con logging
   * NOTA: Solo actualiza el estado local porque la API ya fue llamada desde el formulario
   */
  const handleUpdateFieldConfig = async (fieldId, updatedField) => {
    try {
      // Usar updateFieldLocal para solo actualizar el estado (la API ya fue llamada)
      if (updateFieldLocal) {
        updateFieldLocal(fieldId, updatedField)
      }
      addActivityLog('field_config_updated', {
        fieldId: fieldId,
        fieldName: updatedField.name,
        changes: 'Field configuration updated',
      })
      return true
    } catch (error) {
      console.error('Error updating field config:', error)
      throw error
    }
  }

  return {
    handleNewField,
    handleUpdateField,
    handleUpdateFieldConfig,
  }
}
