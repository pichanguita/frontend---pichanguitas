import React, { useRef } from 'react'
import { Plus, X, Image, Upload, AlertCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import { API_CONFIG } from '../../../config/api.config'

// Helper para obtener URL completa de imagen
const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return ''
  // Si ya es URL absoluta (Wasabi u otra), retornar directamente
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  // Si es ruta relativa local, agregar BASE_URL del backend
  if (imageUrl.startsWith('/')) {
    return `${API_CONFIG.BASE_URL}${imageUrl}`
  }
  return imageUrl
}

const GeneralTab = ({
  config,
  fieldTypes,
  getFieldTypeInfo,
  onGeneralChange,
  onFieldTypeChange,
  onAddAmenity,
  onRemoveAmenity,
  onAddRule,
  onRemoveRule,
  onAddCustomImage,
  onUploadCustomImage,
  onRemoveCustomImage,
}) => {
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validación en cliente
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        Swal.fire({
          icon: 'error',
          title: 'Archivo muy grande',
          text: `El tamaño máximo es 5MB. Tu archivo pesa ${(file.size / 1024 / 1024).toFixed(2)}MB`,
          confirmButtonColor: '#22c55e',
        })
        return
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Formato no válido',
          text: 'Solo se permiten imágenes JPG, PNG, GIF o WebP',
          confirmButtonColor: '#22c55e',
        })
        return
      }

      // Llamar a función de upload
      onUploadCustomImage(file)
    }

    // Resetear input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = ''
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900">Información General</h3>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Tipo de Cancha
            </label>
            <select
              value={config.fieldType}
              onChange={(e) => onFieldTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500"
            >
              {fieldTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="mt-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-700">{getFieldTypeInfo(config.fieldType)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Capacidad</label>
            <input
              type="number"
              min="1"
              max="50000"
              value={config.capacity}
              onChange={(e) => onGeneralChange('capacity', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isActive"
              checked={config.isActive}
              onChange={(e) => onGeneralChange('isActive', e.target.checked)}
              className="w-4 h-4 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-secondary-700">
              Cancha activa y disponible para reservas
            </label>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="requiresManualConfirmation"
                checked={config.requiresManualConfirmation}
                onChange={(e) => onGeneralChange('requiresManualConfirmation', e.target.checked)}
                className="w-4 h-4 text-amber-600 border-2 border-amber-300 rounded focus:ring-amber-500 mt-0.5"
              />
              <div className="flex-1">
                <label
                  htmlFor="requiresManualConfirmation"
                  className="text-sm font-medium text-amber-900 cursor-pointer"
                >
                  Requiere confirmación manual del administrador
                </label>
                <p className="text-xs text-amber-700 mt-1">
                  Las reservas quedarán como "Pendientes" hasta que un administrador las apruebe o
                  rechace
                </p>
              </div>
            </div>
            {config.requiresManualConfirmation && (
              <div className="bg-amber-100 rounded-md p-3">
                <p className="text-xs text-amber-800">
                  <strong>Modo Activo:</strong> Las reservas de clientes quedarán pendientes.
                  Recuerda revisarlas en el panel "Reservas Pendientes".
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-secondary-900">Comodidades</h3>
            <button
              onClick={onAddAmenity}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {config.amenities.map((amenity, index) => {
              const amenityName =
                typeof amenity === 'string' ? amenity : amenity.name || amenity.amenityName || ''
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-secondary-50 rounded"
                >
                  <span className="text-sm">{amenityName}</span>
                  <button
                    onClick={() => onRemoveAmenity(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-900">Reglas y Políticas</h3>
          <button
            onClick={onAddRule}
            className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Regla</span>
          </button>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {config.rules.map((rule, index) => {
            const ruleText =
              typeof rule === 'string' ? rule : rule.text || rule.ruleText || rule.rule_text || ''
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded"
              >
                <span className="text-sm">{ruleText}</span>
                <button
                  onClick={() => onRemoveRule(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">Imágenes Personalizadas</h3>
            <p className="text-xs text-secondary-600 mt-1">
              Sube fotos de tu cancha desde tu computador o agrega URLs externas
            </p>
          </div>
          <div className="flex space-x-2">
            {/* Botón de Upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center space-x-1 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Subir Archivo</span>
            </button>

            {/* Botón de URL (funcionalidad original) */}
            <button
              type="button"
              onClick={onAddCustomImage}
              className="text-secondary-600 hover:text-secondary-700 text-sm flex items-center space-x-1 bg-secondary-50 hover:bg-secondary-100 px-3 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>URL Externa</span>
            </button>
          </div>
        </div>

        {/* Input file oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Información de formato */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Requisitos de las imágenes:</p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-700">
                <li>Formatos: JPG, PNG, GIF, WebP</li>
                <li>Tamaño máximo: 5MB por imagen</li>
                <li>Resolución recomendada: mínimo 1280x720px</li>
              </ul>
            </div>
          </div>
        </div>

        {config.customImages.length === 0 ? (
          <div className="text-center py-8 text-secondary-400 border-2 border-dashed border-secondary-200 rounded-lg">
            <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay imágenes personalizadas</p>
            <p className="text-xs mt-1">
              Se usarán las imágenes predeterminadas del tipo de deporte
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {config.customImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-video bg-secondary-100 rounded-lg overflow-hidden border-2 border-secondary-200">
                  <img
                    src={getFullImageUrl(imageUrl)}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23f3f4f6"%3E%3Crect width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="14"%3EError al cargar%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCustomImage(index)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Imagen {index + 1}
                </div>

                {/* Indicador de imagen gestionada por el sistema */}
                {(imageUrl.startsWith('/api/media/') ||
                  imageUrl.includes('wasabisys.com') ||
                  imageUrl.startsWith('/uploads/')) && (
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                    <Upload className="w-3 h-3" />
                    <span>Subida</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GeneralTab
