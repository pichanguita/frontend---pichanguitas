import React from 'react'
import { getMethodIcon } from '../../utils/payment-flow/paymentFlowHelpers'

/**
 * Componente que muestra la lista de métodos de pago
 */
const PaymentMethodsList = ({ paymentMethods, selectedMethod, onMethodSelect, isProcessing }) => {
  return (
    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
      <h3 className="font-semibold text-base sm:text-lg text-secondary-800">
        Selecciona el Método de Pago
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {paymentMethods.map((method) => {
          const Icon = getMethodIcon(method)
          const isSelected = selectedMethod === method.id

          return (
            <button
              key={method.id}
              onClick={() => onMethodSelect(method.id)}
              disabled={isProcessing}
              className={`
                flex items-center space-x-3 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2
                transition-all duration-300 text-left
                ${
                  isSelected
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-secondary-200 hover:border-primary-200 hover:bg-secondary-50'
                }
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={{
                backgroundColor: isSelected ? `${method.color}10` : undefined,
                borderColor: isSelected ? method.color : undefined,
              }}
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: method.color }}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-secondary-900 text-sm sm:text-base truncate">
                  {method.name}
                </h4>
                <p className="text-xs sm:text-sm text-secondary-600 truncate">
                  {method.description}
                </p>
                {method.hasQR && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                    📱 Con QR
                  </span>
                )}
              </div>
              {isSelected && (
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary-600 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default PaymentMethodsList
