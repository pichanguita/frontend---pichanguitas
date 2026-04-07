import React from 'react'
import { useAvailableFields } from '../hooks/useAvailableFields'
import { handleReservation } from '../utils/fields/fieldHandlers'
import { FieldHeader, FieldFilters, FieldGrid, ReservationModal } from './available-fields'

/**
 * AvailableFieldsView - Vista de Canchas Disponibles
 *
 * Componente orquestador que coordina:
 * - Custom hook para lógica de estado (useAvailableFields)
 * - Handlers para acciones (fieldHandlers)
 * - Componentes UI especializados
 *
 * IMPORTANTE: Este componente delega toda la lógica a módulos especializados
 * para mantener la escalabilidad y salud del código.
 */
const AvailableFieldsView = () => {
  const {
    // Filtros
    searchTerm,
    setSearchTerm,
    selectedSport,
    setSelectedSport,

    // Reserva
    selectedField,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    duration,
    setDuration,

    // Datos
    availableFields,
    sportTypes,
    timeSlots,

    // Helpers
    isSlotAvailable,
    getFieldReservationCount,

    // Acciones
    handleFieldSelection,
    clearSelection,
    addReservation,

    // Usuario
    user,
  } = useAvailableFields()

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Header */}
      <FieldHeader />

      {/* Filtros */}
      <FieldFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
        sportTypes={sportTypes}
        resultCount={availableFields.length}
      />

      {/* Grid de Canchas */}
      <FieldGrid
        fields={availableFields}
        selectedField={selectedField}
        onFieldSelect={handleFieldSelection}
        getReservationCount={getFieldReservationCount}
      />

      {/* Modal de Reserva */}
      <ReservationModal
        field={selectedField}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTimeSlot={selectedTimeSlot}
        setSelectedTimeSlot={setSelectedTimeSlot}
        duration={duration}
        setDuration={setDuration}
        timeSlots={timeSlots}
        isSlotAvailable={isSlotAvailable}
        onClose={clearSelection}
        onConfirm={() =>
          handleReservation({
            selectedField,
            selectedDate,
            selectedTimeSlot,
            duration,
            isSlotAvailable,
            user,
            addReservation,
            clearSelection,
          })
        }
      />
    </div>
  )
}

export default AvailableFieldsView
