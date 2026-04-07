import React from 'react'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import FileUploader from './FileUploader'

/**
 * Paso 4: Detalles Adicionales y Confirmación
 */
const DetailsStep = ({
  formData,
  errors,
  onInputChange,
  onFileChange,
  onRemoveFile,
  onAddFile,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-xl font-semibold text-secondary-900">Detalles Adicionales</h2>

      {/* Experiencia */}
      <div>
        <label className="block mb-2 text-sm font-medium text-secondary-700">
          Experiencia en el rubro (Opcional)
        </label>
        <textarea
          name="experience"
          value={formData.experience}
          onChange={onInputChange}
          rows="3"
          className="w-full px-4 py-2 border rounded-lg border-secondary-300 focus:ring-2 focus:ring-primary-500"
          placeholder="Cuéntanos sobre tu experiencia administrando canchas deportivas..."
        />
      </div>

      {/* Razón para unirse */}
      <div>
        <label className="block mb-2 text-sm font-medium text-secondary-700">
          ¿Por qué quieres inscribir tu cancha en nuestra plataforma?
        </label>
        <textarea
          name="reasonToJoin"
          value={formData.reasonToJoin}
          onChange={onInputChange}
          rows="3"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.reasonToJoin ? 'border-red-500' : 'border-secondary-300'
          }`}
          placeholder="Explícanos por qué quieres formar parte de nuestra red de canchas..."
        />
        {errors.reasonToJoin && <p className="mt-1 text-sm text-red-600">{errors.reasonToJoin}</p>}
      </div>

      {/* Adjuntar Documento */}
      <div>
        <label className="block mb-2 text-sm font-medium text-secondary-700">
          Adjuntar Documento (Opcional)
        </label>
        <p className="mb-3 text-xs text-secondary-500">
          Puedes adjuntar documentos como certificados, licencias o referencias. Formatos
          permitidos: PDF, JPG, PNG (máx. 10MB)
        </p>

        {!formData.attachedDocument ? (
          <div className="p-6 text-center transition-colors border-2 border-dashed rounded-lg border-secondary-300 hover:border-primary-400">
            <input
              type="file"
              id="document"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={onFileChange}
              className="hidden"
            />
            <label htmlFor="document" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-secondary-400" />
              <p className="text-sm text-secondary-600">Haz clic para seleccionar un archivo</p>
              <p className="mt-1 text-xs text-secondary-400">o arrastra y suelta aquí</p>
            </label>
          </div>
        ) : (
          <div className="p-4 border rounded-lg bg-secondary-50 border-secondary-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <File className="w-5 h-5 mr-3 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-secondary-900">
                    {formData.attachedDocument.name}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {(formData.attachedDocument.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile()}
                className="text-red-500 transition-colors hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {errors.attachedDocument && (
          <p className="mt-2 text-sm text-red-600">{errors.attachedDocument}</p>
        )}
      </div>

      {/* Términos y condiciones */}
      <div className="p-4 rounded-lg bg-blue-50">
        <div className="flex items-start">
          <input
            type="checkbox"
            name="termsAccepted"
            id="terms"
            checked={formData.termsAccepted}
            onChange={onInputChange}
            className="w-4 h-4 mt-1 rounded text-primary-600 border-secondary-300 focus:ring-primary-500"
          />
          <label htmlFor="terms" className="ml-3 text-sm text-secondary-700">
            Acepto los términos y condiciones de uso de la plataforma y autorizo el procesamiento de
            mis datos personales de acuerdo con la política de privacidad.
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="mt-2 text-sm text-red-600">{errors.termsAccepted}</p>
        )}
      </div>

      {/* Sección de carga de documentos y fotos */}
      <FileUploader
        formData={formData}
        errors={errors}
        onAddFile={onAddFile}
        onRemoveFile={onRemoveFile}
      />

      {/* Mensaje importante */}
      <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="ml-3">
            <p className="text-sm font-medium text-amber-800">Importante</p>
            <p className="mt-1 text-sm text-amber-700">
              Tu solicitud y documentos serán revisados por nuestro equipo de administración.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailsStep
