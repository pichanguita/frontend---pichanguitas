import React from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'
import {
  validateFileSize,
  processFile,
  readFileAsDataURL,
  getFileIcon,
  formatFileSize,
} from '../../utils/adminRegistrationHelpers'

/**
 * Componente para subida de archivos (documentos y fotos)
 */
const FileUploader = ({ formData, errors, onAddFile, onRemoveFile }) => {
  /**
   * Manejo de carga de archivos
   */
  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files)

    for (const file of files) {
      // Validar tamaño
      if (!validateFileSize(file)) {
        continue
      }

      const fileObj = processFile(file)

      // Si es foto, leer como DataURL
      if (type === 'photos') {
        try {
          const dataURL = await readFileAsDataURL(file)
          fileObj.data = dataURL
          onAddFile(type, fileObj)
        } catch (error) {
          console.error('Error al leer archivo:', error)
        }
      } else {
        onAddFile(type, fileObj)
      }
    }

    // Limpiar input
    e.target.value = ''
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-900">
        Documentos de Acreditación{' '}
        <span className="text-sm font-normal text-secondary-500">(Opcional)</span>
      </h3>
      <p className="text-sm text-secondary-600">
        Puedes adjuntar documentos y fotos que acrediten que eres propietario de la cancha
        (opcional)
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Carga de documentos */}
        <div className="space-y-3">
          <label className="block">
            <span className="block mb-2 text-sm font-medium text-secondary-700">
              Documentos (PDF, Word, etc.){' '}
              <span className="text-xs text-secondary-500">- Opcional</span>
            </span>
            <div className="relative">
              <input
                type="file"
                onChange={(e) => handleFileUpload(e, 'documents')}
                accept=".pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
                id="documents-upload"
              />
              <label
                htmlFor="documents-upload"
                className="flex items-center justify-center px-4 py-3 transition-colors bg-white border-2 border-dashed rounded-lg cursor-pointer border-secondary-300 hover:border-primary-500"
              >
                <Upload className="w-5 h-5 mr-2 text-secondary-500" />
                <span className="text-sm text-secondary-600">Seleccionar documentos</span>
              </label>
            </div>
          </label>

          {/* Lista de documentos cargados */}
          {formData.documents.length > 0 && (
            <div className="space-y-2">
              {formData.documents.map((doc) => {
                const IconComponent = getFileIcon(doc.type)
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-secondary-50"
                  >
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4 text-secondary-500" />
                      <div>
                        <p className="text-sm font-medium text-secondary-700 truncate max-w-[150px]">
                          {doc.name}
                        </p>
                        <p className="text-xs text-secondary-500">{formatFileSize(doc.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveFile('documents', doc.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Carga de fotos */}
        <div className="space-y-3">
          <label className="block">
            <span className="block mb-2 text-sm font-medium text-secondary-700">
              Fotos (JPG, PNG, etc.) <span className="text-xs text-secondary-500">- Opcional</span>
            </span>
            <div className="relative">
              <input
                type="file"
                onChange={(e) => handleFileUpload(e, 'photos')}
                accept="image/*"
                multiple
                className="hidden"
                id="photos-upload"
              />
              <label
                htmlFor="photos-upload"
                className="flex items-center justify-center px-4 py-3 transition-colors bg-white border-2 border-dashed rounded-lg cursor-pointer border-secondary-300 hover:border-primary-500"
              >
                <Upload className="w-5 h-5 mr-2 text-secondary-500" />
                <span className="text-sm text-secondary-600">Seleccionar fotos</span>
              </label>
            </div>
          </label>

          {/* Galería de fotos cargadas */}
          {formData.photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {formData.photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.data}
                    alt={photo.name}
                    className="object-cover w-full h-24 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveFile('photos', photo.id)}
                    className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-1 right-1 group-hover:opacity-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-1 text-xs text-white truncate bg-black bg-opacity-50 rounded-b-lg">
                    {photo.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {errors.documents && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{errors.documents}</p>
        </div>
      )}

      <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
        <p className="text-xs text-blue-700">
          <strong>Documentos sugeridos:</strong> Título de propiedad, contrato de alquiler, licencia
          de funcionamiento, fotos del local, etc.
        </p>
      </div>
    </div>
  )
}

export default FileUploader
