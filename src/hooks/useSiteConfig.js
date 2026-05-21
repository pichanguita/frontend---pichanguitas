import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import imageCompression from 'browser-image-compression'
import useVideoTutorialsStore from '../store/videoTutorialsStore'

export const useSiteConfig = (configStore) => {
  const { updateImageUrl, uploadImage } = configStore
  const { videos, loadVideos, updateVideo } = useVideoTutorialsStore()

  // Estados locales
  // videoForm es un mapa por slug con los valores en edición
  const [videoForm, setVideoForm] = useState({})
  const [imageUrlForm, setImageUrlForm] = useState({})
  const [uploadingImage, setUploadingImage] = useState(null)
  const [activeTab, setActiveTab] = useState('videos')
  const [previewVideo, setPreviewVideo] = useState(null)

  // Cargar tutoriales al montar y rehidratar el form cuando lleguen
  useEffect(() => {
    loadVideos().catch(() => {
      /* el store ya captura el error */
    })
  }, [loadVideos])

  useEffect(() => {
    if (!videos || videos.length === 0) return
    setVideoForm((prev) => {
      // Si el form aún no tiene este slug, copiamos desde el backend.
      // No sobrescribir si el admin ya está editando (mantener su texto).
      const next = { ...prev }
      videos.forEach((v) => {
        if (!next[v.slug]) {
          next[v.slug] = {
            title: v.title,
            description: v.description,
            url: v.video_url,
          }
        }
      })
      return next
    })
  }, [videos])

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

  const handleVideoChange = (slug, field, value) => {
    setVideoForm((prev) => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        [field]: value,
      },
    }))
  }

  /**
   * Convierte la URL a embed si no está vacía. Devuelve {ok, url|error}.
   */
  const prepareVideoUrl = (rawUrl) => {
    if (!rawUrl || rawUrl.trim() === '') return { ok: true, url: '' }
    const embedUrl = convertToEmbedUrl(rawUrl.trim())
    if (!embedUrl) return { ok: false, error: 'URL de YouTube inválida' }
    return { ok: true, url: embedUrl }
  }

  const saveVideo = async (slug) => {
    const videoData = videoForm[slug]
    if (!videoData) return

    const prep = prepareVideoUrl(videoData.url)
    if (!prep.ok) {
      Swal.fire({
        icon: 'warning',
        title: 'URL Inválida',
        text: 'Por favor ingresa una URL válida de YouTube',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    try {
      Swal.fire({
        title: 'Guardando video...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      await updateVideo(slug, {
        title: videoData.title,
        description: videoData.description,
        video_url: prep.url,
      })

      // Sincronizar el form con la URL convertida a embed
      setVideoForm((prev) => ({
        ...prev,
        [slug]: { ...prev[slug], url: prep.url },
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

  const saveAllVideos = async () => {
    const slugs = Object.keys(videoForm)
    if (slugs.length === 0) return

    // Validar todas las URLs antes de enviar nada
    const prepared = slugs.map((slug) => {
      const data = videoForm[slug]
      const prep = prepareVideoUrl(data.url)
      return { slug, data, prep }
    })

    const invalid = prepared.filter((p) => !p.prep.ok)
    if (invalid.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'URL Inválida',
        text: `Revisa la URL de YouTube de ${invalid.length} video(s).`,
        confirmButtonColor: '#22c55e',
      })
      return
    }

    Swal.fire({
      title: 'Guardando todos los videos...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    })

    try {
      await Promise.all(
        prepared.map(({ slug, data, prep }) =>
          updateVideo(slug, {
            title: data.title,
            description: data.description,
            video_url: prep.url,
          })
        )
      )

      // Sincronizar URLs convertidas a embed
      setVideoForm((prev) => {
        const next = { ...prev }
        prepared.forEach(({ slug, prep }) => {
          if (next[slug]) next[slug] = { ...next[slug], url: prep.url }
        })
        return next
      })

      Swal.fire({
        icon: 'success',
        title: '¡Todos los Videos Actualizados!',
        text: 'Los cambios se han guardado correctamente',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: error.message || 'No se pudieron guardar todos los videos',
        confirmButtonColor: '#22c55e',
      })
    }
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

    // Preview
    openVideoPreview,
    closeVideoPreview,
  }
}
