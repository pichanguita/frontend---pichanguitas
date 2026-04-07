/**
 * Módulo Facade: Cupones
 *
 * Delega todas las operaciones de cupones a couponStore
 */

import useCouponStore from '../modules/couponStore'

export const createCouponFacade = (_set, _get) => ({
  get appliedCoupon() {
    return useCouponStore.getState().appliedCoupon
  },

  validateCoupon: (code, userId, subtotal) => {
    return useCouponStore.getState().validateCoupon(code, userId, subtotal)
  },

  applyCoupon: (code, userId, subtotal) => {
    return useCouponStore.getState().applyCoupon(code, userId, subtotal)
  },

  removeCoupon: () => {
    useCouponStore.getState().removeCoupon()
  },

  calculateCouponDiscount: (subtotal) => {
    return useCouponStore.getState().calculateCouponDiscount(subtotal)
  },

  markCouponAsUsed: (couponId, userId) => {
    return useCouponStore.getState().markCouponAsUsed(couponId, userId)
  },
})
