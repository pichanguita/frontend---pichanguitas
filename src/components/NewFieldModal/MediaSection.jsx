import React from 'react'
import { Camera, X, Upload } from 'lucide-react'
import { IMAGE_CATEGORIES } from './utils/fieldConstants'

/**
 * Sección de medios (imágenes y videos)
 */
const MediaSection = ({
  images,
  videos,
  isLoading,
  onImageUpload,
  onRemoveImage,
  onUpdateImageCategory,
  onVideoUpload,
  onRemoveVideo,
}) => {
  return (
    <div className="space-y-6">
      {/* Fotografías */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-800 flex items-center">
          <Camera className="w-5 h-5 mr-2 text-primary-600" />
          Fotografías de la Cancha
        </h3>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700">
            Sube fotos de alta calidad que muestren tu cancha. Las primeras 3 imágenes se mostrarán
            en la vista previa de la cancha.
          </p>
          <p className="text-xs text-blue-600 mt-2">
            Formatos permitidos: JPG, PNG. Tamaño máximo: 5MB por imagen.
          </p>
        </div>

        {/* Input de carga */}
        <div>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            multiple
            onChange={onImageUpload}
            className="hidden"
            disabled={isLoading}
          />
          <label
            htmlFor="image-upload"
            className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-secondary-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
          >
            <Upload className="w-5 h-5 mr-2 text-secondary-600" />
            <span className="text-secondary-700 font-medium">Subir Fotografías</span>
          </label>
        </div>

        {/* Vista previa de imágenes */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(image.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Selector de categoría */}
                <select
                  value={image.category}
                  onChange={(e) => onUpdateImageCategory(image.id, e.target.value)}
                  className="absolute bottom-2 left-2 right-2 text-xs p-1 bg-white bg-opacity-90 rounded border border-secondary-300"
                  disabled={isLoading}
                >
                  {IMAGE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Videos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-800 flex items-center">
          <Camera className="w-5 h-5 mr-2 text-primary-600" />
          Videos de la Cancha{' '}
          <span className="text-sm font-normal text-secondary-500 ml-2">(Opcional)</span>
        </h3>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700">
            Sube videos cortos (máximo 30 segundos) que muestren las instalaciones y características
            de tu cancha.
          </p>
          <p className="text-xs text-amber-600 mt-2">
            Formatos permitidos: MP4, MOV, AVI. Tamaño máximo: 50MB por video.
          </p>
        </div>

        {/* Input de carga */}
        <div>
          <input
            type="file"
            id="video-upload"
            accept="video/*"
            multiple
            onChange={onVideoUpload}
            className="hidden"
            disabled={isLoading}
          />
          <label
            htmlFor="video-upload"
            className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-secondary-300 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
          >
            <Upload className="w-5 h-5 mr-2 text-secondary-600" />
            <span className="text-secondary-700 font-medium">Subir Videos (Opcional)</span>
          </label>
        </div>

        {/* Vista previa de videos */}
        {videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video, _index) => (
              <div key={video.id} className="relative group">
                <video
                  src={video.preview}
                  controls
                  className="w-full h-32 object-cover rounded-lg bg-black"
                />
                <button
                  type="button"
                  onClick={() => onRemoveVideo(video.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="mt-1 text-xs text-secondary-600 truncate">{video.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MediaSection
