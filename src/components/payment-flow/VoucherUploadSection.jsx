import React from 'react'
import { Upload, CheckCircle } from 'lucide-react'

/**
 * Componente para subir el comprobante de pago
 */
const VoucherUploadSection = ({ voucherFile, onFileUpload, requiresVoucher, isProcessing }) => {
  // Si no requiere voucher, no mostrar nada
  if (!requiresVoucher) return null

  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="font-semibold text-base sm:text-lg text-secondary-800 mb-3 sm:mb-4">
        Comprobante de Pago
      </h3>

      <div className="border-2 border-dashed border-secondary-300 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:border-primary-400 hover:bg-primary-25 transition-all duration-300">
        <input
          type="file"
          accept="image/*"
          onChange={onFileUpload}
          className="hidden"
          id="voucher-upload"
          disabled={isProcessing}
        />

        <label
          htmlFor="voucher-upload"
          className={`cursor-pointer block ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {voucherFile ? (
            <div className="space-y-2">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-green-600" />
              <p className="text-green-700 font-medium text-sm sm:text-base">
                ✓ {voucherFile.name}
              </p>
              <p className="text-xs sm:text-sm text-secondary-600">
                {(voucherFile.size / 1024).toFixed(0)} KB - Click para cambiar
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-secondary-400" />
              <p className="text-secondary-700 font-medium text-sm sm:text-base">
                Click para subir tu comprobante
              </p>
              <p className="text-xs sm:text-sm text-secondary-500">PNG, JPG hasta 10MB</p>
            </div>
          )}
        </label>
      </div>

      {voucherFile && (
        <div className="mt-3 sm:mt-4 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-green-700">
            ✓ Comprobante cargado exitosamente. Se comprimió automáticamente para optimizar la
            subida.
          </p>
        </div>
      )}
    </div>
  )
}

export default VoucherUploadSection
