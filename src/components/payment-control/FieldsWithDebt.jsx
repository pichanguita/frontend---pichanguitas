import React from 'react'
import { AlertCircle } from 'lucide-react'

const FieldsWithDebt = ({ fieldsWithDebt }) => {
  if (fieldsWithDebt.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <h3 className="font-bold text-red-900 mb-3 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        Canchas con Pagos Atrasados ({fieldsWithDebt.length})
      </h3>
      <div className="space-y-2">
        {fieldsWithDebt.map((field) => (
          <div
            key={field.fieldId}
            className="bg-white rounded-lg p-3 flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-gray-900">{field.fieldName}</div>
              <div className="text-sm text-gray-600">
                {field.overdueCount} pago{field.overdueCount > 1 ? 's' : ''} atrasado
                {field.overdueCount > 1 ? 's' : ''} • {field.maxDaysLate} días de atraso
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-red-600">S/. {field.totalDebt.toFixed(2)}</div>
              <div className="text-xs text-red-500">Deuda total</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FieldsWithDebt
