import React from 'react'
import { DollarSign } from 'lucide-react'

const PaymentHeader = () => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Control de Pagos</h2>
          <p className="text-green-100 text-sm mt-1">Gestiona los pagos mensuales de las canchas</p>
        </div>
      </div>
    </div>
  )
}

export default PaymentHeader
