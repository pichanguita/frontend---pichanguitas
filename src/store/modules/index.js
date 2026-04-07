/**
 * Store Modules Index
 * Exporta todos los stores modulares desde un solo punto
 *
 * Uso:
 * import { useGeographyStore, useFieldStore, usePricingStore } from '@/store/modules'
 */

export { default as useGeographyStore } from './geographyStore'
export { default as useFieldStore } from './fieldStore'
export { default as usePricingStore } from './pricingStore'
export { default as useCouponStore } from './couponStore'
export { default as useReviewStore } from './reviewStore'
export { default as useBlacklistStore } from './blacklistStore'

// Re-exportar stores principales para conveniencia
export { default as useBookingStore } from '../bookingStore'
export { default as useAuthStore } from '../authStore'
export { default as useAlertStore } from '../alertStore'
export { default as useConfigStore } from '../configStore'
export { default as useThemeStore } from '../themeStore'
export { default as usePaymentStore } from '../paymentStore'
export { default as useCustomerStore } from '../customerStore'
export { default as useGamificationStore } from '../gamificationStore'
