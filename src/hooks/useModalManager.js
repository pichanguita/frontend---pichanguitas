import { useState, useCallback } from 'react'

/**
 * useModalManager - Hook para gestionar múltiples estados de modales
 *
 * Centraliza la gestión de apertura/cierre de modales,
 * reduciendo la cantidad de estados individuales y sus setters
 *
 * @param {string[]} modalNames - Array con los nombres de los modales a gestionar
 * @returns {Object} Objeto con estados y funciones para cada modal
 *
 * @example
 * const { modals, openModal, closeModal, toggleModal } = useModalManager([
 *   'newField',
 *   'editField',
 *   'configField'
 * ])
 *
 * // Uso:
 * openModal('newField')
 * closeModal('editField')
 * {modals.newField && <NewFieldModal />}
 */
export const useModalManager = (modalNames = []) => {
  // Crear objeto inicial con todos los modales en false
  const initialState = modalNames.reduce((acc, name) => {
    acc[name] = false
    return acc
  }, {})

  const [modals, setModals] = useState(initialState)

  // Abrir un modal específico
  const openModal = useCallback((modalName) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: true,
    }))
  }, [])

  // Cerrar un modal específico
  const closeModal = useCallback((modalName) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: false,
    }))
  }, [])

  // Alternar el estado de un modal
  const toggleModal = useCallback((modalName) => {
    setModals((prev) => ({
      ...prev,
      [modalName]: !prev[modalName],
    }))
  }, [])

  // Cerrar todos los modales
  const closeAllModals = useCallback(() => {
    setModals(initialState)
  }, [initialState])

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
  }
}
