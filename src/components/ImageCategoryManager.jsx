import React, { useState } from 'react'
import { Image as ImageIcon, Upload, Link as LinkIcon, CheckCircle } from 'lucide-react'
import useConfigStore from '../store/configStore'
import imageCompression from 'browser-image-compression'
import Swal from 'sweetalert2'

const ImageItem = ({ imageKey, imageData, onUpload, onUrlSave, uploading }) => {
  const [urlInput, setUrlInput] = useState(imageData.url)

  const handleUploadClick = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo Inválido',
        text: 'Por favor selecciona una imagen válida',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo muy grande',
        text: 'La imagen no debe superar los 10MB',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    await onUpload(imageKey, file)
  }

  const handleUrlSave = () => {
    if (!urlInput || urlInput.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'URL Vacía',
        text: 'Por favor ingresa una URL válida',
        confirmButtonColor: '#22c55e',
      })
      return
    }
    onUrlSave(imageKey, urlInput)
  }

  return (
    <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
      <h4 className="font-medium text-secondary-900 mb-3">{imageData.alt}</h4>

      {/* Preview */}
      {imageData.url && (
        <div className="mb-3">
          <div className="w-full h-32 bg-white rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={imageData.url}
              alt={imageData.alt}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        </div>
      )}

      {/* Opciones */}
      <div className="space-y-3">
        {/* Upload */}
        <div>
          <label className="text-xs font-medium text-secondary-700 mb-1 block">Subir Archivo</label>
          <label className="flex-1 cursor-pointer">
            <div className="border-2 border-dashed border-secondary-300 rounded-lg p-2 hover:border-primary-500 transition-colors">
              <div className="flex items-center justify-center space-x-2">
                {uploading === imageKey ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-secondary-600">Subiendo...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-secondary-400" />
                    <span className="text-xs text-secondary-600">Seleccionar</span>
                  </>
                )}
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadClick}
              className="hidden"
              disabled={uploading === imageKey}
            />
          </label>
        </div>

        {/* URL */}
        <div>
          <label className="text-xs font-medium text-secondary-700 mb-1 block">URL Externa</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-1.5 text-sm border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
            />
            <button
              onClick={handleUrlSave}
              className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
            >
              <LinkIcon className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Type indicator */}
        <div className="flex items-center space-x-2 text-xs text-secondary-500">
          {imageData.type === 'upload' ? (
            <>
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Subida localmente</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-3 h-3 text-blue-600" />
              <span>URL externa</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const ImageCategoryManager = () => {
  const { images, updateImageUrl, uploadImage } = useConfigStore()
  const [uploadingImage, setUploadingImage] = useState(null)

  const handleUpload = async (imageKey, file) => {
    setUploadingImage(imageKey)
    try {
      // Mostrar loading mientras se comprime
      Swal.fire({
        title: 'Comprimiendo imagen...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      // Opciones de compresión
      const options = {
        maxSizeMB: 0.5, // Máximo 500KB
        maxWidthOrHeight: 1920, // Máximo 1920px de ancho o alto
        useWebWorker: true,
        fileType: 'image/jpeg', // Convertir a JPEG para mejor compresión
        initialQuality: 0.8, // Calidad inicial al 80%
      }

      // Comprimir imagen
      const compressedFile = await imageCompression(file, options)

      // Calcular reducción de tamaño
      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2)
      const reductionPercent = (((file.size - compressedFile.size) / file.size) * 100).toFixed(0)

      // Cerrar loading
      Swal.close()

      // Subir imagen comprimida
      await uploadImage(imageKey, compressedFile)

      Swal.fire({
        icon: 'success',
        title: '¡Imagen Subida!',
        html: `
          <div class="text-sm text-left">
            <p class="mb-2">La imagen se ha cargado correctamente</p>
            <div class="bg-green-50 p-3 rounded-lg">
              <p class="text-xs text-gray-600">📦 Original: <strong>${originalSizeMB}MB</strong></p>
              <p class="text-xs text-gray-600">✨ Comprimida: <strong>${compressedSizeMB}MB</strong></p>
              <p class="text-xs text-green-600 font-medium">✓ Reducción: ${reductionPercent}%</p>
            </div>
          </div>
        `,
        timer: 3000,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al subir imagen',
        text: error.message || 'Ocurrió un error al comprimir o subir la imagen',
        confirmButtonColor: '#22c55e',
      })
    } finally {
      setUploadingImage(null)
    }
  }

  const handleUrlSave = (imageKey, url) => {
    updateImageUrl(imageKey, url)
    Swal.fire({
      icon: 'success',
      title: '¡URL Actualizada!',
      text: 'La URL de la imagen se ha guardado correctamente',
      timer: 2000,
      showConfirmButton: false,
    })
  }

  // Agrupar por categoría
  const categories = {
    header: { title: '📱 Header / Logo', images: [] },
    hero: { title: '🎨 Hero Section', images: [] },
    fields: { title: '🏟️ Imágenes de Canchas', images: [] },
    other: { title: '📦 Otros', images: [] },
  }

  Object.entries(images).forEach(([key, data]) => {
    const category = data.category || 'other'
    if (categories[category]) {
      categories[category].images.push([key, data])
    }
  })

  // Para fields, agrupar por deporte
  const fieldsBySport = {}
  categories.fields.images.forEach(([key, data]) => {
    const sport = data.sport || 'general'
    if (!fieldsBySport[sport]) fieldsBySport[sport] = []
    fieldsBySport[sport].push([key, data])
  })

  const sportTitles = {
    futbol: '⚽ Fútbol',
    futsal: '⚽ Futsal',
    basquet: '🏀 Básquet',
    voley: '🏐 Vóley',
    tenis: '🎾 Tenis',
    estadio: '🏟️ Estadio',
    multiuso: '🏟️ Multiuso',
    general: '📸 General',
  }

  return (
    <div className="space-y-8">
      {/* Header / Logo */}
      {categories.header.images.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-4 flex items-center space-x-2 border-b border-secondary-200 pb-2">
            <ImageIcon className="w-6 h-6 text-primary-600" />
            <span>{categories.header.title}</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {categories.header.images.map(([key, data]) => (
              <ImageItem
                key={key}
                imageKey={key}
                imageData={data}
                onUpload={handleUpload}
                onUrlSave={handleUrlSave}
                uploading={uploadingImage}
              />
            ))}
          </div>
        </div>
      )}

      {/* Hero */}
      {categories.hero.images.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-4 flex items-center space-x-2 border-b border-secondary-200 pb-2">
            <ImageIcon className="w-6 h-6 text-primary-600" />
            <span>{categories.hero.title}</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {categories.hero.images.map(([key, data]) => (
              <ImageItem
                key={key}
                imageKey={key}
                imageData={data}
                onUpload={handleUpload}
                onUrlSave={handleUrlSave}
                uploading={uploadingImage}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fields - Por deporte */}
      {categories.fields.images.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-4 flex items-center space-x-2 border-b border-secondary-200 pb-2">
            <ImageIcon className="w-6 h-6 text-primary-600" />
            <span>{categories.fields.title}</span>
          </h2>

          <div className="space-y-6">
            {Object.entries(fieldsBySport).map(([sport, sportImages]) => (
              <div key={sport}>
                <h3 className="text-lg font-semibold text-secondary-800 mb-3 ml-2 flex items-center space-x-2">
                  <span>{sportTitles[sport] || sport}</span>
                  <span className="text-sm text-secondary-500">({sportImages.length})</span>
                </h3>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sportImages.map(([key, data]) => (
                    <ImageItem
                      key={key}
                      imageKey={key}
                      imageData={data}
                      onUpload={handleUpload}
                      onUrlSave={handleUrlSave}
                      uploading={uploadingImage}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other */}
      {categories.other.images.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-4 flex items-center space-x-2 border-b border-secondary-200 pb-2">
            <ImageIcon className="w-6 h-6 text-primary-600" />
            <span>{categories.other.title}</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {categories.other.images.map(([key, data]) => (
              <ImageItem
                key={key}
                imageKey={key}
                imageData={data}
                onUpload={handleUpload}
                onUrlSave={handleUrlSave}
                uploading={uploadingImage}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageCategoryManager
