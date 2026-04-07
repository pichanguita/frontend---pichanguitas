import React from 'react'
import { parseLocalDate } from '../../utils/dateFormatters'

/**
 * Componente que muestra el resumen de la reserva
 */
const ReservationSummary = ({
  selectedField,
  selectedDate,
  selectedTimeRanges,
  phoneNumber,
  timeRanges,
  pricing,
}) => {
  return (
    <div className="bg-secondary-50 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8">
      <h3 className="font-semibold text-base sm:text-lg text-secondary-800 mb-3 sm:mb-4">
        Resumen de Reserva
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm mb-4 sm:mb-6">
        <div>
          <span className="text-secondary-600">Cancha:</span>
          <p className="font-medium text-secondary-900">{selectedField?.name}</p>
        </div>
        <div>
          <span className="text-secondary-600">Fecha:</span>
          <p className="font-medium text-secondary-900">
            {selectedDate
              ? parseLocalDate(selectedDate).toLocaleDateString('es-PE', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
              : 'No seleccionada'}
          </p>
        </div>
        <div>
          <span className="text-secondary-600">Horarios:</span>
          <p className="font-medium text-secondary-900">
            {selectedTimeRanges
              ?.map((trId) => {
                const tr = timeRanges.find((t) => t.id === trId)
                return tr?.label
              })
              .filter(Boolean)
              .join(', ') || 'No seleccionados'}
          </p>
        </div>
        <div>
          <span className="text-secondary-600">Teléfono:</span>
          <p className="font-medium text-secondary-900">{phoneNumber || 'No ingresado'}</p>
        </div>
      </div>

      {/* Desglose de precios */}
      <div className="border-t pt-3 sm:pt-4 space-y-2 text-xs sm:text-sm">
        {pricing?.priceInfo?.details && pricing.priceInfo.details.length > 0 && (
          <div className="space-y-1">
            {pricing.priceInfo.details.map((detail, index) => (
              <div key={index} className="flex justify-between text-secondary-700">
                <span>{detail.timeRange}</span>
                <span>S/ {detail.price}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between text-secondary-700 pt-2">
          <span>Subtotal:</span>
          <span>S/ {pricing?.subtotal || 0}</span>
        </div>

        {pricing?.couponDiscount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Descuento de cupón:</span>
            <span>- S/ {pricing.couponDiscount}</span>
          </div>
        )}

        {pricing?.freeHoursUsed > 0 && pricing?.freeHoursDiscount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>🎁 Horas gratis ({pricing.freeHoursUsed}h):</span>
            <span>- S/ {pricing.freeHoursDiscount}</span>
          </div>
        )}

        <div className="flex justify-between text-base sm:text-lg font-bold text-primary-600 pt-2 border-t">
          <span>Total:</span>
          <span>S/ {pricing?.totalAmount || 0}</span>
        </div>
      </div>
    </div>
  )
}

export default ReservationSummary
