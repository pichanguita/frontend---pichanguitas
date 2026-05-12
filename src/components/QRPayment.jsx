import React, { useEffect, useState, useRef } from 'react'
import QRCode from 'qrcode'
import { Copy, CheckCircle, Smartphone, X, Upload, Image, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'
import { API_CONFIG } from '../config/api.config'

const QRPayment = ({
  method,
  amount,
  isAdvance = false,
  totalAmount = 0,
  remainingAmount = 0,
  onPaymentComplete,
  onCancel,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [isLoadingQR, setIsLoadingQR] = useState(true)
  const [voucherFile, setVoucherFile] = useState(null)
  const [voucherPreview, setVoucherPreview] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadOrGenerateQRCode()
  }, [method, amount, isAdvance])

  const loadOrGenerateQRCode = async () => {
    setIsLoadingQR(true)
    try {
      // Si el admin subió un QR personalizado, usarlo
      if (method.qrImageUrl) {
        const fullUrl = method.qrImageUrl.startsWith('http')
          ? method.qrImageUrl
          : `${API_CONFIG.BASE_URL}${method.qrImageUrl}`
        setQrCodeUrl(fullUrl)
        setIsLoadingQR(false)
        return
      }

      // Si no hay QR subido, generar uno dinámico (fallback)
      await generateQRCode()
    } catch (error) {
      console.error('Error loading QR code:', error)
      // Intentar generar uno dinámico como fallback
      await generateQRCode()
    }
    setIsLoadingQR(false)
  }

  const generateQRCode = async () => {
    try {
      // Generar QR específico para cada método
      let qrData = ''

      const conceptLabel = isAdvance ? 'Adelanto reserva cancha' : 'Reserva cancha'

      if (method.id === 'yape') {
        // Formato de QR para Yape (simulado - en producción sería el formato real de Yape)
        qrData = JSON.stringify({
          action: 'yape_payment',
          phone: method.qrData?.phone || method.accountNumber,
          amount: amount,
          concept: `${conceptLabel} - ${amount} soles`,
          merchant: method.qrData?.name || method.accountHolder || '',
        })
      } else if (method.id === 'plin') {
        // Formato de QR para Plin (simulado - en producción sería el formato real de Plin)
        qrData = JSON.stringify({
          action: 'plin_payment',
          phone: method.qrData?.phone || method.accountNumber,
          amount: amount,
          concept: `${conceptLabel} - ${amount} soles`,
          merchant: method.qrData?.name || method.accountHolder || '',
        })
      }

      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: method.id === 'yape' ? '#722ed1' : '#1890ff',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      })

      setQrCodeUrl(qrUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(label)
        setTimeout(() => setCopied(false), 2000)

        Swal.fire({
          icon: 'success',
          title: '¡Copiado!',
          text: `${label} copiado al portapapeles`,
          timer: 1500,
          showConfirmButton: false,
          showCloseButton: true,
          allowEscapeKey: true,
        })
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo copiar al portapapeles',
          confirmButtonColor: '#22c55e',
          showCloseButton: true,
          allowEscapeKey: true,
        })
      })
  }

  const getSteps = () => {
    if (method.id === 'yape') {
      return [
        '1. Abre tu app Yape',
        '2. Toca "Escanear QR" o "Yapear"',
        '3. Escanea este código QR',
        '4. Confirma el monto y envía',
        '5. Toma captura del voucher',
      ]
    } else if (method.id === 'plin') {
      return [
        '1. Abre tu app Plin',
        '2. Toca "Pagar con QR" o "Enviar"',
        '3. Escanea este código QR',
        '4. Confirma el pago',
        '5. Guarda el comprobante',
      ]
    }
    return []
  }

  // Manejar selección de archivo
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Formato no válido',
        text: 'Solo se permiten imágenes (JPG, PNG, GIF, WEBP)',
        confirmButtonColor: method.color,
      })
      return
    }

    // Validar tamaño (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo muy grande',
        text: 'El archivo no debe superar los 10MB',
        confirmButtonColor: method.color,
      })
      return
    }

    setVoucherFile(file)

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setVoucherPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Eliminar voucher
  const handleRemoveVoucher = () => {
    setVoucherFile(null)
    setVoucherPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Completar pago con voucher
  const handleComplete = () => {
    if (!voucherFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Comprobante requerido',
        text: 'Por favor sube una captura de tu comprobante de pago',
        confirmButtonColor: method.color,
      })
      return
    }
    onPaymentComplete(voucherFile)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-h-[85vh] relative flex flex-col">
      {/* Botón de cerrar - siempre visible */}
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 z-10 p-2 hover:bg-secondary-100 rounded-full transition-colors duration-200"
        aria-label="Cerrar modal"
      >
        <X className="w-5 h-5 text-secondary-600" />
      </button>

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-4">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center text-xl sm:text-2xl"
            style={{ backgroundColor: `${method.color}20`, color: method.color }}
          >
            {method.icon}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold" style={{ color: method.color }}>
            Pagar con {method.name}
          </h3>
          <p className="text-secondary-600 mt-2 text-sm sm:text-base">
            {isAdvance ? 'Monto del adelanto a pagar:' : 'Monto a pagar:'}{' '}
            <span className="font-bold text-lg sm:text-xl">S/ {Number(amount).toFixed(2)}</span>
          </p>
          {isAdvance && (
            <div className="mt-2 inline-flex flex-col items-center gap-0.5 bg-amber-50 border border-amber-300 rounded-lg px-3 py-1.5">
              <p className="text-xs text-amber-800">
                💡 Estás pagando solo el <strong>adelanto</strong> para confirmar la reserva.
              </p>
              <p className="text-xs text-amber-700">
                Saldo restante (se paga en cancha):{' '}
                <strong>S/ {Number(remainingAmount).toFixed(2)}</strong>
              </p>
              <p className="text-[10px] text-amber-600">
                Total de la reserva: S/ {Number(totalAmount).toFixed(2)}
              </p>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="text-center mb-4 sm:mb-6">
          <div
            className="qr-code-container inline-block p-3 sm:p-4 bg-white rounded-xl shadow-lg border-2"
            style={{ borderColor: method.color }}
          >
            {isLoadingQR ? (
              <div className="w-40 h-40 sm:w-48 sm:h-48 bg-secondary-100 animate-pulse rounded-lg flex items-center justify-center">
                <span className="text-secondary-500 text-xs sm:text-sm">Cargando QR...</span>
              </div>
            ) : qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt={`Código QR para ${method.name}`}
                className="w-40 h-40 sm:w-48 sm:h-48 mx-auto rounded-lg object-contain"
                onError={(e) => {
                  console.error('Error cargando imagen QR')
                  // Si falla la imagen, intentar generar una dinámica
                  generateQRCode()
                }}
              />
            ) : (
              <div className="w-40 h-40 sm:w-48 sm:h-48 bg-secondary-100 rounded-lg flex items-center justify-center">
                <span className="text-secondary-500 text-xs sm:text-sm">QR no disponible</span>
              </div>
            )}
          </div>
          <p className="text-xs sm:text-sm text-secondary-600 mt-2">
            📱 Escanea con tu app {method.name}
          </p>
          <p className="text-xs text-secondary-500 mt-1">
            {method.qrImageUrl
              ? 'Escanea el código QR del propietario'
              : 'El código QR contiene la información del pago'}
          </p>
        </div>

        {/* Instructions */}
        <div className="mb-4 sm:mb-6">
          <h4 className="font-semibold text-secondary-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
            <Smartphone className="w-4 h-4 mr-2" style={{ color: method.color }} />
            Pasos para pagar:
          </h4>
          <ol className="space-y-2">
            {getSteps().map((step, index) => (
              <li key={index} className="text-xs sm:text-sm text-secondary-700 flex items-start">
                <span
                  className="inline-block w-5 h-5 rounded-full text-xs text-white flex items-center justify-center mr-3 mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: method.color }}
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Alternative: Manual Transfer */}
        <div className="bg-secondary-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <h4 className="font-semibold text-secondary-800 mb-2 text-sm sm:text-base">
            Opción alternativa:
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-secondary-700">Número:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs sm:text-sm">
                  {method.accountNumber || 'No configurado'}
                </span>
                <button
                  onClick={() =>
                    method.accountNumber &&
                    copyToClipboard(method.accountNumber.replace(/\s/g, ''), 'Número')
                  }
                  className={`p-1 hover:bg-secondary-200 rounded transition-colors duration-200 ${!method.accountNumber ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!method.accountNumber}
                >
                  {copied === 'Número' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-secondary-500" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-secondary-700">
                {isAdvance ? 'Monto del adelanto:' : 'Monto:'}
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs sm:text-sm">S/ {Number(amount).toFixed(2)}</span>
                <button
                  onClick={() => copyToClipboard(Number(amount).toFixed(2), 'Monto')}
                  className="p-1 hover:bg-secondary-200 rounded transition-colors duration-200"
                >
                  {copied === 'Monto' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-secondary-500" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-secondary-700">Concepto:</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm text-right">Reserva cancha</span>
                <button
                  onClick={() => copyToClipboard('Reserva cancha', 'Concepto')}
                  className="p-1 hover:bg-secondary-200 rounded transition-colors duration-200"
                >
                  {copied === 'Concepto' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-secondary-500" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de subida de comprobante */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4">
          <h4 className="font-semibold text-green-800 mb-3 flex items-center text-sm sm:text-base">
            <Upload className="w-4 h-4 mr-2" />
            Sube tu comprobante de pago
          </h4>

          {/* Input oculto */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          {!voucherPreview ? (
            // Área de drop/click para subir
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-green-300 rounded-lg p-4 sm:p-6 hover:border-green-500 hover:bg-green-100 transition-colors duration-200 flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Image className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-700 font-medium">
                Toca para subir tu comprobante
              </span>
              <span className="text-xs text-green-600">JPG, PNG, GIF o WEBP (máx. 10MB)</span>
            </button>
          ) : (
            // Preview del voucher
            <div className="relative">
              <div className="relative rounded-lg overflow-hidden border border-green-300 bg-white">
                <img
                  src={voucherPreview}
                  alt="Comprobante de pago"
                  className="w-full max-h-48 object-contain"
                />
                {/* Botón para eliminar */}
                <button
                  onClick={handleRemoveVoucher}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-green-700 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {voucherFile?.name}
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-green-600 hover:text-green-800 font-medium"
                >
                  Cambiar imagen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nota si no hay voucher */}
        {!voucherFile && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-xs sm:text-sm text-amber-800">
              <strong>Importante:</strong> Debes subir una captura de pantalla del comprobante de
              pago para continuar.
            </p>
          </div>
        )}
      </div>

      {/* Footer fijo con botones */}
      <div className="sticky bottom-0 flex-shrink-0 p-4 sm:p-6 border-t border-secondary-200 bg-white rounded-b-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col gap-3">
          <button
            onClick={handleComplete}
            disabled={!voucherFile}
            className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold text-white transition-colors duration-200 text-sm sm:text-base flex items-center justify-center gap-2 ${
              !voucherFile ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ backgroundColor: method.color }}
          >
            {voucherFile ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Confirmar pago
              </>
            ) : (
              'Sube tu comprobante para continuar'
            )}
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-secondary-200 hover:bg-secondary-300 text-secondary-700 py-2.5 sm:py-3 rounded-xl font-semibold transition-colors duration-200 text-sm sm:text-base"
          >
            Cambiar método de pago
          </button>
        </div>
      </div>
    </div>
  )
}

export default QRPayment
