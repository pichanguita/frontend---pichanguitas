import { useEffect, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

/**
 * useAdminRegistrationDraft - Hook para guardar/restaurar borradores del registro de admin
 * Guarda automáticamente el progreso en localStorage
 *
 * @param {object} formData - Datos actuales del formulario
 * @param {function} setFormData - Función para actualizar formData
 * @param {boolean} enabled - Si el auto-guardado está habilitado (default: true)
 * @param {number} saveDelay - Delay en ms antes de guardar (default: 2000)
 * @returns {object} - { hasDraft, loadDraft, clearDraft, lastSaved }
 *
 * @example
 * const { hasDraft, loadDraft, clearDraft, lastSaved } = useAdminRegistrationDraft(
 *   formData,
 *   setFormData,
 *   { enabled: true, saveDelay: 2000 }
 * )
 *
 * if (hasDraft) {
 *   // Preguntar al usuario si quiere restaurar el borrador
 *   loadDraft()
 * }
 */
export const useAdminRegistrationDraft = (formData, setFormData, options = {}) => {
  const { enabled = true, saveDelay = 2000 } = options

  const DRAFT_KEY = 'admin_registration_draft'
  const TIMESTAMP_KEY = 'admin_registration_draft_timestamp'

  const [draftData, setDraftData, removeDraftData] = useLocalStorage(DRAFT_KEY, null)
  const [lastSaved, setLastSaved, removeLastSaved] = useLocalStorage(TIMESTAMP_KEY, null)

  // Auto-guardar formData en localStorage con delay
  useEffect(() => {
    if (!enabled) return

    // No guardar si formData está vacío o es inicial
    const hasData = Object.values(formData).some((value) => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'string') return value.trim() !== ''
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => v !== '' && v !== null)
      }
      return value !== null && value !== undefined
    })

    if (!hasData) return

    const saveTimeout = setTimeout(() => {
      try {
        // Guardar datos
        setDraftData(formData)

        // Guardar timestamp
        const now = new Date().toISOString()
        setLastSaved(now)

        console.log('✅ Borrador guardado automáticamente:', now)
      } catch (_error) {
        console.error('Error al guardar borrador:', _error)
      }
    }, saveDelay)

    return () => {
      clearTimeout(saveTimeout)
    }
  }, [formData, enabled, saveDelay, setDraftData, setLastSaved])

  // Verificar si hay un borrador guardado
  const hasDraft = draftData !== null && draftData !== undefined

  // Cargar borrador
  const loadDraft = useCallback(() => {
    if (!draftData) {
      console.warn('No hay borrador para cargar')
      return false
    }

    try {
      setFormData(draftData)
      console.log('✅ Borrador restaurado:', lastSaved)
      return true
    } catch (error) {
      console.error('Error al cargar borrador:', error)
      return false
    }
  }, [draftData, setFormData, lastSaved])

  // Limpiar borrador
  const clearDraft = useCallback(() => {
    try {
      removeDraftData()
      removeLastSaved()
      console.log('✅ Borrador eliminado')
      return true
    } catch (error) {
      console.error('Error al eliminar borrador:', error)
      return false
    }
  }, [removeDraftData, removeLastSaved])

  // Obtener tiempo transcurrido desde el último guardado
  const getTimeSinceLastSave = useCallback(() => {
    if (!lastSaved) return null

    try {
      const savedDate = new Date(lastSaved)
      const now = new Date()
      const diffMs = now - savedDate

      const minutes = Math.floor(diffMs / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)

      if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`
      if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`
      if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`
      return 'hace menos de 1 minuto'
    } catch (error) {
      return null
    }
  }, [lastSaved])

  return {
    hasDraft,
    loadDraft,
    clearDraft,
    lastSaved,
    getTimeSinceLastSave,
  }
}

export default useAdminRegistrationDraft
