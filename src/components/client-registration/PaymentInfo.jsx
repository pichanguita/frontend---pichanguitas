import React from 'react'
import { DollarSign, Tag } from 'lucide-react'

const PaymentInfo = ({
  totalAmount,
  advanceAmount,
  remainingAmount,
  paymentStatus,
  originalAmount,
  discountAmount,
  appliedDiscounts,
}) => {
  if (totalAmount <= 0) {
    return null
  }

  const hasDiscount = discountAmount > 0 && originalAmount > totalAmount

  return (
    <div className="space-y-3">
      {/* Mostrar descuentos aplicados si existen */}
      {hasDiscount && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-700">Subtotal:</span>
              <span className="text-purple-600 line-through">
                S/ {originalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-700 flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                Descuento especial:
              </span>
              <span className="text-purple-600 font-medium">
                - S/ {discountAmount.toLocaleString()}
              </span>
            </div>
            {appliedDiscounts && appliedDiscounts.length > 0 && (
              <div className="text-xs text-purple-600 mt-1">
                {appliedDiscounts.map((d, i) => (
                  <span
                    key={i}
                    className="inline-block bg-purple-100 px-2 py-0.5 rounded mr-1 mb-1"
                  >
                    {d.name} ({d.value}
                    {d.type === 'percentage' ? '%' : ''})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="font-medium text-blue-800">Monto Total de Reserva:</span>
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-blue-600 mr-1" />
            <span className="text-xl font-bold text-blue-600">
              S/ {totalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {paymentStatus === 'advance' && advanceAmount > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-700">Adelanto Pagado:</span>
              <span className="text-orange-600 font-medium">
                S/ {parseFloat(advanceAmount).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-orange-200 pt-2">
              <span className="font-medium text-orange-800">Total a Pagar:</span>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-orange-600 mr-1" />
                <span className="text-xl font-bold text-orange-600">
                  S/ {remainingAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {paymentStatus !== 'advance' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-green-800">Total a Pagar:</span>
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-1" />
              <span className="text-xl font-bold text-green-600">
                S/ {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentInfo
