import { useState } from 'react'
import Swal from 'sweetalert2'
import imageCompression from 'browser-image-compression'

export const useSiteConfig = (configStore) => {
  const { videos, updateVideoInfo, updateImageUrl, uploadImage, resetToDefaults } = configStore

  // Estados locales
  const [videoForm, setVideoForm] = useState({
    tutorialReserva: { ...videos.tutorialReserva },
    tutorialAdmin: { ...videos.tutorialAdmin },
  })
  const [imageUrlForm, setImageUrlForm] = useState({})
  const [uploadingImage, setUploadingImage] = useState(null)
  const [activeTab, setActiveTab] = useState('videos')
  const [previewVideo, setPreviewVideo] = useState(null)

  // ========================================
  // MANEJO DE VIDEOS
  // ========================================

  /**
   * Extrae el ID del video de cualquier URL de YouTube
   * Soporta: watch?v=, youtu.be/, embed/, shorts/, v/
   */
  const extractYouTubeId = (url) => {
    if (!url) return null

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^&]+)/, // watch?v=
      /youtu\.be\/([^?&]+)/, // youtu.be/
      /youtube\.com\/embed\/([^?&]+)/, // embed/
      /youtube\.com\/shorts\/([^?&]+)/, // shorts/
      /youtube\.com\/v\/([^?&]+)/, // v/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    return null
  }

  /**
   * Convierte cualquier URL de YouTube al formato embed
   */
  const convertToEmbedUrl = (url) => {
    const videoId = extractYouTubeId(url)
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`
    }
    return null
  }

  const handleVideoChange = (videoKey, field, value) => {
    setVideoForm((prev) => ({
      ...prev,
      [videoKey]: {
        ...prev[videoKey],
        [field]: value,
      },
    }))
  }

  const saveVideo = async (videoKey) => {
    const videoData = videoForm[videoKey]

    // Intentar convertir la URL al formato embed
    const embedUrl = convertToEmbedUrl(videoData.url)

    if (!embedUrl) {
      Swal.fire({
        icon: 'warning',
        title: 'URL Inválida',
        text: 'Por favor ingresa una URL válida de YouTube',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    // Guardar con la URL convertida a embed
    const dataToSave = {
      ...videoData,
      url: embedUrl,
    }

    try {
      // Mostrar loading
      Swal.fire({
        title: 'Guardando video...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      // Guardar en el backend
      await updateVideoInfo(videoKey, dataToSave)

      // Actualizar el form local
      setVideoForm((prev) => ({
        ...prev,
        [videoKey]: dataToSave,
      }))

      Swal.fire({
        icon: 'success',
        title: '¡Video Guardado!',
        text: 'El video se ha guardado en la base de datos',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: error.message || 'No se pudo guardar el video',
        confirmButtonColor: '#22c55e',
      })
    }
  }

  const saveAllVideos = () => {
    Object.keys(videoForm).forEach((key) => {
      updateVideoInfo(key, videoForm[key])
    })

    Swal.fire({
      icon: 'success',
      title: '¡Todos los Videos Actualizados!',
      text: 'Los cambios se han guardado correctamente',
      timer: 2000,
      showConfirmButton: false,
    })
  }

  // ========================================
  // MANEJO DE IMÁGENES POR URL
  // ========================================
  const handleImageUrlChange = (imageKey, value) => {
    setImageUrlForm((prev) => ({
      ...prev,
      [imageKey]: value,
    }))
  }

  const saveImageUrl = (imageKey) => {
    const url = imageUrlForm[imageKey]

    if (!url || url.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'URL Vacía',
        text: 'Por favor ingresa una URL válida',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    updateImageUrl(imageKey, url)

    Swal.fire({
      icon: 'success',
      title: '¡Imagen Actualizada!',
      text: 'La URL de la imagen se ha guardado correctamente',
      timer: 2000,
      showConfirmButton: false,
    })
  }

  // ========================================
  // MANEJO DE IMÁGENES POR UPLOAD
  // ========================================
  const handleImageUpload = async (imageKey, event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo Inválido',
        text: 'Por favor selecciona una imagen válida (JPG, PNG, GIF, etc.)',
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

    setUploadingImage(imageKey)

    try {
      Swal.fire({
        title: 'Comprimiendo imagen...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/jpeg',
        initialQuality: 0.8,
      }

      const compressedFile = await imageCompression(file, options)

      const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2)
      const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2)
      const reductionPercent = (((file.size - compressedFile.size) / file.size) * 100).toFixed(0)

      Swal.close()

      await uploadImage(imageKey, compressedFile)

      Swal.fire({
        icon: 'success',
        title: '¡Imagen Subida!',
        html: `
          <div class="text-sm text-left">
            <p class="mb-2">La imagen se ha cargado correctamente</p>
            <div class="bg-green-50 p-3 rounded-lg">
              <p class="text-xs text-gray-600">📦 Tamaño original: <strong>${originalSizeMB}MB</strong></p>
              <p class="text-xs text-gray-600">✨ Tamaño comprimido: <strong>${compressedSizeMB}MB</strong></p>
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

  // ========================================
  // RESET
  // ========================================
  const handleReset = () => {
    Swal.fire({
      icon: 'warning',
      title: '¿Estás seguro?',
      text: 'Esto restaurará todos los videos e imágenes a sus valores por defecto',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        resetToDefaults()
        setVideoForm({
          tutorialReserva: videos.tutorialReserva,
          tutorialAdmin: videos.tutorialAdmin,
        })
        setImageUrlForm({})

        Swal.fire({
          icon: 'success',
          title: '¡Restaurado!',
          text: 'Se han restaurado los valores por defecto',
          timer: 2000,
          showConfirmButton: false,
        })
      }
    })
  }

  // ========================================
  // PREVIEW VIDEO
  // ========================================
  const openVideoPreview = (videoUrl) => {
    setPreviewVideo(videoUrl)
  }

  const closeVideoPreview = () => {
    setPreviewVideo(null)
  }

  return {
    // State
    videoForm,
    imageUrlForm,
    uploadingImage,
    activeTab,
    previewVideo,
    setActiveTab,

    // Video handlers
    handleVideoChange,
    saveVideo,
    saveAllVideos,

    // Image handlers
    handleImageUrlChange,
    saveImageUrl,
    handleImageUpload,

    // Reset
    handleReset,

    // Preview
    openVideoPreview,
    closeVideoPreview,
  }
}
