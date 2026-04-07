export const createMaintenanceItem = () => ({
  id: `maint-${Date.now()}`,
  startDate: '',
  endDate: '',
  reason: '',
  type: 'scheduled',
})

export const createSpecialPricingItem = () => ({
  id: `price-${Date.now()}`,
  name: '',
  timeSlots: [],
  discountType: 'percentage',
  discountValue: 0,
  daysOfWeek: [],
})

export const validateImageUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
