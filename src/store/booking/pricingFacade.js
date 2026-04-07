/**
 * Módulo Facade: Precios
 *
 * Delega todas las operaciones de cálculo de precios a pricingStore
 */

import usePricingStore from '../modules/pricingStore'

export const createPricingFacade = (_set, _get) => ({
  calculatePriceWithDiscount: (field, date, timeSlotIds) => {
    return usePricingStore.getState().calculatePriceWithDiscount(field, date, timeSlotIds)
  },

  getSpecialPrice: (field, date, timeRange) => {
    return usePricingStore.getState().getSpecialPrice(field, date, timeRange)
  },

  calculateTotalPrice: (field, date, timeRanges) => {
    return usePricingStore.getState().calculateTotalPrice(field, date, timeRanges)
  },
})
