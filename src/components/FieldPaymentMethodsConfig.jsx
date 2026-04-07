import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Save,
  Upload,
  Phone,
  Building,
  FileText,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  QrCode,
} from 'lucide-react'
import Swal from 'sweetalert2'
import useAuthStore from '../store/authStore'
import useFieldStore from '../store/modules/fieldStore'
import {
  getAdminFieldsPaymentMethods,
  updateFieldPaymentMethods,
  uploadPaymentQRImage,
  AVAILABLE_PAYMENT_METHODS,
} from '../services/fieldPaymentMethods/fieldPaymentMethodsService'
import { API_CONFIG } from '../config/api.config'

const FieldPaymentMethodsConfig = () => {
  const { token, user } = useAuthStore()
  const { fields, loadFields } = useFieldStore()

  const [selectedFieldId, setSelectedFieldId] = useState(null)
  const [paymentMethods, setPaymentMethods] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedMethods, setExpandedMethods] = useState({})
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRefs = useRef({})

  // Verificar si es super admin
  const isSuperAdmin = user?.role === 'administrator' || user?.adminType === 'super'

  // Filtrar canchas: Super Admin ve todas, admin regular solo las suyas
  const adminFields = isSuperAdmin
    ? fields.filter((f) => f.approvalStatus === 'approved' || f.status === 'available')
    : fields.filter((f) => f.adminId === user?.id && f.status === 'available')

  // Cargar canchas si no están cargadas
  useEffect(() => {
    if (fields.length === 0) {
      loadFields()
    }
  }, [])

  // Cargar métodos de pago al montar
  useEffect(() => {
    loadPaymentMethods()
  }, [token])

  // Seleccionar primera cancha por defecto
  useEffect(() => {
    if (adminFields.length > 0 && !selectedFieldId) {
      setSelectedFieldId(adminFields[0].id)
    }
  }, [adminFields, selectedFieldId])

  const loadPaymentMethods = async () => {
    if (!token) return

    setIsLoading(true)
    try {
      const data = await getAdminFieldsPaymentMethods(token)

      // Organizar por cancha
      const methodsByField = {}
      data.forEach((field) => {
        methodsByField[field.id] = {
          fieldName: field.name,
          methods: {},
        }

        // Inicializar todos los métodos disponibles
        AVAILABLE_PAYMENT_METHODS.forEach((availableMethod) => {
          const savedMethod = field.field_payment_methods?.find(
            (m) => m.method_type === availableMethod.id
          )

          methodsByField[field.id].methods[availableMethod.id] = {
            ...availableMethod,
            is_enabled: savedMethod?.is_enabled ?? false,
            account_number: savedMethod?.account_number || '',
            account_holder: savedMethod?.account_holder || '',
            phone_number: savedMethod?.phone_number || '',
            qr_image_url: savedMethod?.qr_image_url || '',
            bank_name: savedMethod?.bank_name || availableMethod.name,
            cci_number: savedMethod?.cci_number || '',
            instructions: savedMethod?.instructions || '',
            order_index: savedMethod?.order_index || 0,
          }
        })
      })

      setPaymentMethods(methodsByField)
    } catch (error) {
      console.error('Error cargando métodos de pago:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los métodos de pago',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMethodToggle = (methodId) => {
    if (!selectedFieldId) return

    setPaymentMethods((prev) => ({
      ...prev,
      [selectedFieldId]: {
        ...prev[selectedFieldId],
        methods: {
          ...prev[selectedFieldId]?.methods,
          [methodId]: {
            ...prev[selectedFieldId]?.methods?.[methodId],
            is_enabled: !prev[selectedFieldId]?.methods?.[methodId]?.is_enabled,
          },
        },
      },
    }))
    setHasChanges(true)
  }

  const handleMethodChange = (methodId, field, value) => {
    if (!selectedFieldId) return

    setPaymentMethods((prev) => ({
      ...prev,
      [selectedFieldId]: {
        ...prev[selectedFieldId],
        methods: {
          ...prev[selectedFieldId]?.methods,
          [methodId]: {
            ...prev[selectedFieldId]?.methods?.[methodId],
            [field]: value,
          },
        },
      },
    }))
    setHasChanges(true)
  }

  const handleQRUpload = async (methodId, event) => {
    const file = event.target.files?.[0]
    if (!file || !selectedFieldId) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo inválido',
        text: 'Solo se permiten imágenes',
      })
      return
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo muy grande',
        text: 'La imagen no debe superar los 5MB',
      })
      return
    }

    try {
      Swal.fire({
        title: 'Subiendo imagen...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      const result = await uploadPaymentQRImage(selectedFieldId, methodId, file, token)

      if (result.success) {
        handleMethodChange(methodId, 'qr_image_url', result.data.qr_image_url)
        Swal.fire({
          icon: 'success',
          title: 'Imagen subida',
          text: 'El código QR se ha subido correctamente',
          timer: 2000,
          showConfirmButton: false,
        })
      }
    } catch (error) {
      console.error('Error subiendo QR:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo subir la imagen',
      })
    }
  }

  const toggleExpanded = (methodId) => {
    setExpandedMethods((prev) => ({
      ...prev,
      [methodId]: !prev[methodId],
    }))
  }

  const handleSave = async () => {
    if (!selectedFieldId || !paymentMethods[selectedFieldId]) return

    // Validar números de teléfono antes de guardar
    const methodsWithPhone = Object.entries(paymentMethods[selectedFieldId].methods).filter(
      ([_, method]) => method.is_enabled && method.phone_number
    )

    for (const [, method] of methodsWithPhone) {
      if (method.phone_number && method.phone_number.length !== 9) {
        Swal.fire({
          icon: 'error',
          title: 'Número inválido',
          text: `El número de teléfono de ${method.name} debe tener exactamente 9 dígitos`,
        })
        return
      }
    }

    setIsSaving(true)
    try {
      // Enviar TODOS los métodos (habilitados y deshabilitados) para actualizar correctamente is_enabled
      const methodsToSave = Object.entries(paymentMethods[selectedFieldId].methods).map(
        ([methodId, method], index) => ({
          method_type: methodId,
          is_enabled: method.is_enabled,
          account_number: method.account_number || null,
          account_holder: method.account_holder || null,
          phone_number: method.phone_number || null,
          qr_image_url: method.qr_image_url || null,
          bank_name: method.bank_name || null,
          cci_number: method.cci_number || null,
          instructions: method.instructions || null,
          order_index: method.is_enabled ? index : 999, // Los deshabilitados al final
        })
      )

      await updateFieldPaymentMethods(selectedFieldId, methodsToSave, token)

      Swal.fire({
        icon: 'success',
        title: 'Guardado',
        text: 'Los métodos de pago se han actualizado correctamente',
        timer: 2000,
        showConfirmButton: false,
      })
      setHasChanges(false)
    } catch (error) {
      console.error('Error guardando métodos de pago:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron guardar los métodos de pago',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const selectedFieldData = selectedFieldId ? paymentMethods[selectedFieldId] : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Si no hay canchas, mostrar preview de los métodos disponibles
  const showPreviewMode = adminFields.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-primary-600" />
            Configuración de Métodos de Pago
          </h2>
          <p className="text-secondary-600 mt-1">
            {showPreviewMode
              ? 'Vista previa de los métodos de pago disponibles'
              : 'Configura cómo tus clientes pueden pagarte por las reservas'}
          </p>
        </div>

        {hasChanges && !showPreviewMode && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Cambios
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Aviso de modo preview */}
      {showPreviewMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800">Modo Vista Previa</h4>
              <p className="text-sm text-blue-700 mt-1">
                Aún no tienes canchas registradas. Aquí puedes ver todos los métodos de pago
                disponibles que podrás configurar una vez que registres tu primera cancha.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selector de cancha - solo si hay canchas */}
      {!showPreviewMode && (
        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Seleccionar Cancha
          </label>
          <select
            value={selectedFieldId || ''}
            onChange={(e) => setSelectedFieldId(parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {adminFields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Lista de métodos de pago */}
      {(selectedFieldData || showPreviewMode) && (
        <div className="space-y-4">
          {AVAILABLE_PAYMENT_METHODS.map((availableMethod) => {
            const method = showPreviewMode ? null : selectedFieldData?.methods[availableMethod.id]
            const isExpanded = expandedMethods[availableMethod.id]

            return (
              <motion.div
                key={availableMethod.id}
                layout
                className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden transition-colors ${
                  method?.is_enabled
                    ? 'border-primary-300 bg-primary-50/30'
                    : 'border-secondary-200'
                } ${showPreviewMode ? 'opacity-90' : ''}`}
              >
                {/* Header del método */}
                <div
                  className={`flex items-center justify-between p-4 ${!showPreviewMode ? 'cursor-pointer' : ''}`}
                  onClick={() => !showPreviewMode && toggleExpanded(availableMethod.id)}
                >
                  <div className="flex items-center gap-4">
                    {/* Toggle - deshabilitado en preview */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!showPreviewMode) handleMethodToggle(availableMethod.id)
                      }}
                      disabled={showPreviewMode}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        method?.is_enabled ? 'bg-primary-600' : 'bg-secondary-300'
                      } ${showPreviewMode ? 'cursor-not-allowed' : ''}`}
                    >
                      <div
                        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                          method?.is_enabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    {/* Icono y nombre */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${availableMethod.color}20` }}
                    >
                      {availableMethod.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary-900">{availableMethod.name}</h3>
                      <p className="text-sm text-secondary-600">{availableMethod.description}</p>
                      {/* Mostrar campos requeridos en preview */}
                      {showPreviewMode && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {availableMethod.requiresPhone && (
                            <span className="text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded">
                              Requiere teléfono
                            </span>
                          )}
                          {availableMethod.requiresBankInfo && (
                            <span className="text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded">
                              Requiere datos bancarios
                            </span>
                          )}
                          {availableMethod.hasQR && (
                            <span className="text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded">
                              Admite código QR
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {method?.is_enabled && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        Activo
                      </span>
                    )}
                    {!showPreviewMode && method?.is_enabled ? (
                      isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-secondary-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-secondary-500" />
                      )
                    ) : null}
                  </div>
                </div>

                {/* Contenido expandido */}
                <AnimatePresence>
                  {method?.is_enabled && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-secondary-200 bg-white"
                    >
                      <div className="p-6 space-y-4">
                        {/* Campos para billeteras digitales (Yape, Plin) */}
                        {availableMethod.requiresPhone && (
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                              <Phone className="w-4 h-4 inline mr-1" />
                              Número de teléfono
                            </label>
                            <input
                              type="tel"
                              value={method.phone_number || ''}
                              onChange={(e) => {
                                // Solo permitir números y máximo 9 dígitos
                                const value = e.target.value.replace(/\D/g, '').slice(0, 9)
                                handleMethodChange(availableMethod.id, 'phone_number', value)
                              }}
                              placeholder="987654321"
                              maxLength={9}
                              pattern="[0-9]{9}"
                              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                                method.phone_number && method.phone_number.length !== 9
                                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                  : 'border-secondary-300'
                              }`}
                            />
                            {method.phone_number && method.phone_number.length !== 9 && (
                              <p className="text-xs text-red-500 mt-1">
                                El número debe tener exactamente 9 dígitos (
                                {method.phone_number.length}/9)
                              </p>
                            )}
                            {method.phone_number && method.phone_number.length === 9 && (
                              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Número válido
                              </p>
                            )}
                          </div>
                        )}

                        {/* Campos para bancos */}
                        {availableMethod.requiresBankInfo && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">
                                <Building className="w-4 h-4 inline mr-1" />
                                Número de cuenta
                              </label>
                              <input
                                type="text"
                                value={method.account_number || ''}
                                onChange={(e) =>
                                  handleMethodChange(
                                    availableMethod.id,
                                    'account_number',
                                    e.target.value
                                  )
                                }
                                placeholder="Ej: 123-456789-0-12"
                                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Código CCI (interbancario)
                              </label>
                              <input
                                type="text"
                                value={method.cci_number || ''}
                                onChange={(e) =>
                                  handleMethodChange(
                                    availableMethod.id,
                                    'cci_number',
                                    e.target.value
                                  )
                                }
                                placeholder="Ej: 002-123-456789012345-67"
                                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Titular de la cuenta
                              </label>
                              <input
                                type="text"
                                value={method.account_holder || ''}
                                onChange={(e) =>
                                  handleMethodChange(
                                    availableMethod.id,
                                    'account_holder',
                                    e.target.value
                                  )
                                }
                                placeholder="Nombre completo del titular"
                                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                          </>
                        )}

                        {/* Subir código QR (para Yape y Plin) */}
                        {availableMethod.hasQR && (
                          <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">
                              <QrCode className="w-4 h-4 inline mr-1" />
                              Código QR (opcional)
                            </label>
                            <div className="flex items-start gap-4">
                              {method.qr_image_url ? (
                                <div className="relative">
                                  <img
                                    src={method.qr_image_url?.startsWith('http') ? method.qr_image_url : `${API_CONFIG.BASE_URL}${method.qr_image_url}`}
                                    alt="Código QR"
                                    className="w-32 h-32 object-contain border rounded-lg"
                                  />
                                  <button
                                    onClick={() =>
                                      handleMethodChange(availableMethod.id, 'qr_image_url', '')
                                    }
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  className="w-32 h-32 border-2 border-dashed border-secondary-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
                                  onClick={() => fileInputRefs.current[availableMethod.id]?.click()}
                                >
                                  <Upload className="w-8 h-8 text-secondary-400" />
                                  <span className="text-xs text-secondary-500 mt-1">Subir QR</span>
                                </div>
                              )}
                              <input
                                ref={(el) => (fileInputRefs.current[availableMethod.id] = el)}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleQRUpload(availableMethod.id, e)}
                                className="hidden"
                              />
                              <div className="text-sm text-secondary-600">
                                <p>Sube una imagen del código QR de tu {availableMethod.name}.</p>
                                <p className="text-xs text-secondary-500 mt-1">
                                  Formatos: JPG, PNG, WebP. Máx 5MB
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Instrucciones personalizadas */}
                        <div>
                          <label className="block text-sm font-medium text-secondary-700 mb-1">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Instrucciones adicionales (opcional)
                          </label>
                          <textarea
                            value={method.instructions || ''}
                            onChange={(e) =>
                              handleMethodChange(availableMethod.id, 'instructions', e.target.value)
                            }
                            placeholder="Ej: Poner como concepto el nombre y fecha de reserva"
                            rows={2}
                            className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Botón guardar fijo en móvil */}
      {hasChanges && !showPreviewMode && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default FieldPaymentMethodsConfig
