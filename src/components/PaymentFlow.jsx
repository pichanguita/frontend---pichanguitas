import React from 'react'
import { ArrowLeft, Gift, AlertCircle, Phone } from 'lucide-react'
import usePaymentFlow from '../hooks/usePaymentFlow'
import ReservationSummary from './payment-flow/ReservationSummary'
import PaymentMethodsList from './payment-flow/PaymentMethodsList'

const PaymentFlow = ({ onBack, onComplete }) => {
  const {
    paymentMethod,
    isProcessing,
    pricing,
    advanceInfo, // 💰 Info de adelanto
    selectedField,
    selectedDate,
    selectedTimeRanges,
    timeRanges,
    phoneNumber,
    paymentMethods,
    setPaymentMethod,
    processReservation,
  } = usePaymentFlow(onComplete)

  // Verificar si es una reserva gratis (cubierta por horas gratis)
  const isFreeReservation = pricing?.totalAmount === 0 && pricing?.freeHoursUsed > 0

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-0">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-custom p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 hover:bg-secondary-100 rounded-lg transition-colors duration-200"
              disabled={isProcessing}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-600" />
            </button>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-secondary-900">
              Confirmar Pago
            </h2>
          </div>
        </div>

        <ReservationSummary
          selectedField={selectedField}
          selectedDate={selectedDate}
          selectedTimeRanges={selectedTimeRanges}
          phoneNumber={phoneNumber}
          timeRanges={timeRanges}
          pricing={pricing}
        />

        {/* 💰 Adelanto informativo: se coordina y paga con el administrador */}
        {/* (aplica a cualquier método cuando la cancha requiere adelanto) */}
        {advanceInfo?.required &&
          advanceInfo?.perHour > 0 &&
          !isFreeReservation &&
          pricing?.totalAmount > 0 && (
            <div className="mt-4 sm:mt-6 bg-blue-50 border-2 border-blue-400 rounded-xl p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <p className="font-bold text-blue-800 text-base sm:text-lg">
                      Coordina el adelanto con el administrador
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200 mb-3">
                    <p className="text-blue-900 font-semibold text-lg sm:text-xl">
                      Monto del adelanto: S/ {advanceInfo.amount.toFixed(2)}
                    </p>
                    {advanceInfo.hours > 1 && (
                      <p className="text-blue-700 text-xs mt-1">
                        (S/ {advanceInfo.perHour.toFixed(2)} por hora × {advanceInfo.hours} horas)
                      </p>
                    )}
                  </div>
                  <p className="text-blue-700 text-sm">
                    📞 Comunícate con el <strong>administrador por WhatsApp</strong> para coordinar
                    el pago del adelanto.
                  </p>
                  {selectedField?.phone && (
                    <div className="mt-3 flex items-center gap-2 bg-green-100 rounded-lg p-2">
                      <Phone className="w-4 h-4 text-green-700" />
                      <span className="text-green-800 font-medium text-sm">
                        Teléfono de contacto: {selectedField.phone}
                      </span>
                    </div>
                  )}
                  <p className="text-blue-500 text-xs mt-3 italic">
                    💡 El saldo restante de S/ {advanceInfo.remaining.toFixed(2)} lo pagarás al
                    llegar a la cancha.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Si es reserva gratis (cubierta por horas gratis), mostrar solo el botón de confirmar */}
        {isFreeReservation ? (
          <>
            <div className="mt-6 sm:mt-8 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">Reserva cubierta con horas gratis</p>
                  <p className="text-sm text-green-600">
                    Tus {pricing.freeHoursUsed} hora(s) gratis cubren el total de esta reserva
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <button
                onClick={processReservation}
                disabled={isProcessing}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    <span>Confirmar Reserva Gratis</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <PaymentMethodsList
              paymentMethods={paymentMethods}
              selectedMethod={paymentMethod}
              onMethodSelect={setPaymentMethod}
              isProcessing={isProcessing}
            />

            {paymentMethod && (
              <div className="mt-6 sm:mt-8">
                <button
                  onClick={processReservation}
                  disabled={isProcessing}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>Confirmar Reserva</span>
                  )}
                </button>
              </div>
            )}

            {!paymentMethod && (
              <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-700">
                  Selecciona un metodo de pago para continuar con tu reserva
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PaymentFlow
