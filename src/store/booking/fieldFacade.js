/**
 * Módulo Facade: Campos y Deportes
 *
 * Delega todas las operaciones de campos y tipos de deporte a fieldStore
 */

import useFieldStore from '../modules/fieldStore'

export const createFieldFacade = (set, get) => ({
  // Getters computados que delegan a fieldStore
  get fields() {
    return useFieldStore.getState().fields
  },

  get sportTypes() {
    return useFieldStore.getState().sportTypes
  },

  // Estado local - ahora es un array para selección múltiple
  selectedSportTypes: [],

  // Setter local - toggle para agregar/quitar deportes
  setSelectedSportType: (sportType) => {
    const current = get().selectedSportTypes || []
    const isSelected = current.includes(sportType)

    set({
      selectedSportTypes: isSelected
        ? current.filter((id) => id !== sportType) // Quitar si ya está
        : [...current, sportType], // Agregar si no está
      availableFields: [],
    })
  },

  // Setter para reemplazar todos los deportes seleccionados
  setSelectedSportTypes: (sportTypes) => {
    set({
      selectedSportTypes: sportTypes,
      availableFields: [],
    })
  },

  // Operaciones CRUD de campos - delegadas a fieldStore
  addField: (newField, createdBy = null) => {
    return useFieldStore.getState().addField(newField, createdBy)
  },

  updateField: (fieldId, updatedData) => {
    return useFieldStore.getState().updateField(fieldId, updatedData)
  },

  deleteField: (fieldId) => {
    const { existingReservations } = get()

    // Eliminar reservas asociadas al campo
    const updatedReservations = existingReservations.filter(
      (reservation) => reservation.fieldId !== fieldId
    )

    set({ existingReservations: updatedReservations })

    return useFieldStore.getState().deleteField(fieldId)
  },

  // Operaciones de aprobación de campos
  approveField: (fieldId, approvedBy) => {
    return useFieldStore.getState().approveField(fieldId, approvedBy)
  },

  rejectField: (fieldId, rejectedBy, reason = '') => {
    return useFieldStore.getState().rejectField(fieldId, rejectedBy, reason)
  },

  getFieldsByApprovalStatus: (status) => {
    return useFieldStore.getState().getFieldsByApprovalStatus(status)
  },

  getVisibleFields: () => {
    return useFieldStore.getState().getVisibleFields()
  },

  // Operaciones CRUD de tipos de deporte - delegadas a fieldStore
  addSportType: (newSport) => {
    return useFieldStore.getState().addSportType(newSport)
  },

  updateSportType: (sportId, updatedData) => {
    return useFieldStore.getState().updateSportType(sportId, updatedData)
  },

  deleteSportType: (sportId) => {
    return useFieldStore.getState().deleteSportType(sportId)
  },
})
