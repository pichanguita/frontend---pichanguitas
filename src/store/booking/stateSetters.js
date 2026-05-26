/**
 * Módulo: Setters de Estado
 *
 * Contiene todos los setters simples del estado de reserva actual
 */

export const createStateSetters = (set, get) => ({
  setSelectedField: (field) => set({ selectedField: field }),

  setSelectedDate: (date) => {
    set({
      selectedDate: date,
      selectedTimeSlots: [],
      selectedTimeRanges: [],
      availableFields: [],
    })
  },

  setSelectedTimeSlots: (timeSlots) => set({ selectedTimeSlots: timeSlots }),

  setSelectedTimeRanges: (timeRangeIds) => {
    set({
      selectedTimeRanges: timeRangeIds,
      // NO limpiar availableFields para mantener la imagen visible
    })
  },

  toggleTimeRange: (timeRangeId) => {
    const { selectedTimeRanges } = get()
    const newTimeRanges = selectedTimeRanges.includes(timeRangeId)
      ? selectedTimeRanges.filter((id) => id !== timeRangeId)
      : [...selectedTimeRanges, timeRangeId]

    set({ selectedTimeRanges: newTimeRanges })
  },

  /**
   * Agrega un time slot (string como "08:00 - 09:00") a la selección
   * También actualiza selectedTimeRanges con el ID correspondiente
   */
  addTimeSlot: (timeSlot) => {
    const { selectedTimeSlots, selectedTimeRanges, timeRanges } = get()

    if (selectedTimeSlots.includes(timeSlot)) return

    // Encontrar el ID del time range correspondiente
    const matchingRange = timeRanges.find((tr) => `${tr.startTime} - ${tr.endTime}` === timeSlot)

    const newSelectedTimeSlots = [...selectedTimeSlots, timeSlot]
    const newSelectedTimeRanges = matchingRange
      ? [...selectedTimeRanges, matchingRange.id]
      : selectedTimeRanges

    set({
      selectedTimeSlots: newSelectedTimeSlots,
      selectedTimeRanges: newSelectedTimeRanges,
    })
  },

  /**
   * Remueve un time slot (string) de la selección
   * También actualiza selectedTimeRanges
   */
  removeTimeSlot: (timeSlot) => {
    const { selectedTimeSlots, selectedTimeRanges, timeRanges } = get()

    // Encontrar el ID del time range correspondiente
    const matchingRange = timeRanges.find((tr) => `${tr.startTime} - ${tr.endTime}` === timeSlot)

    set({
      selectedTimeSlots: selectedTimeSlots.filter((slot) => slot !== timeSlot),
      selectedTimeRanges: matchingRange
        ? selectedTimeRanges.filter((id) => id !== matchingRange.id)
        : selectedTimeRanges,
    })
  },

  setPhoneNumber: (phone) => set({ phoneNumber: phone }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setLoading: (loading) => set({ isLoading: loading }),

  setFreeHoursToUse: (hours) => set({ freeHoursToUse: hours }),
})
