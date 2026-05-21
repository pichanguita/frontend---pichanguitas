import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import {
  fetchProvincesByDepartment,
  fetchDistrictsByProvince,
} from '../services/locations/locationsService'
import { findCompleteLocation } from '../services/locations/locationMatcher'
import { getToken } from '../config/api.config'
import { INITIAL_FORM_DATA } from '../components/NewFieldModal/utils/fieldConstants'
import {
  validateForm,
  validateImageFile,
  validateVideoFile,
  formatPhone,
} from '../components/NewFieldModal/utils/fieldValidators'
import {
  calculateArea,
  buildFieldObject,
  resetFormData,
} from '../components/NewFieldModal/utils/fieldHelpers'
import {
  toggleSport,
  isMultiSport as checkIsMultiSport,
  selectAllSports,
  deselectAllSports,
} from '../services/sportsService'

/**
 * Hook personalizado para manejar el formulario de nueva cancha
 */
const useNewFieldForm = (onSave, onClose, user, availableSports = []) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [activeTab, setActiveTab] = useState('form')
  const [images, setImages] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [videos, setVideos] = useState([])
  const [videoFiles, setVideoFiles] = useState([])
  const [availableProvinces, setAvailableProvinces] = useState([])
  const [availableDistricts, setAvailableDistricts] = useState([])

  /**
   * Cargar provincias cuando cambia el departamento
   * Usa departamentoId (el ID) para la llamada a la API
   */
  useEffect(() => {
    const loadProvinces = async () => {
      const deptId = formData.departamentoId || formData.departamento
      if (deptId && deptId !== '') {
        try {
          const token = getToken()
          const provinces = await fetchProvincesByDepartment(deptId, token)
          setAvailableProvinces(provinces)
        } catch (error) {
          console.error('❌ Error al cargar provincias:', error)
          setAvailableProvinces([])
        }
      } else {
        setAvailableProvinces([])
      }
    }
    loadProvinces()
  }, [formData.departamentoId, formData.departamento])

  /**
   * Cargar distritos cuando cambia la provincia
   * Usa provinciaId (el ID) para la llamada a la API
   */
  useEffect(() => {
    const loadDistricts = async () => {
      const provId = formData.provinciaId || formData.provincia
      if (provId && provId !== '') {
        try {
          const token = getToken()
          const districts = await fetchDistrictsByProvince(provId, token)
          setAvailableDistricts(districts)
        } catch (error) {
          console.error('❌ Error al cargar distritos:', error)
          setAvailableDistricts([])
        }
      } else {
        setAvailableDistricts([])
      }
    }
    loadDistricts()
  }, [formData.provinciaId, formData.provincia])

  /**
   * Toggle de deportes
   * Estabilizado con useCallback para evitar re-renders innecesarios
   */
  const handleSportToggle = useCallback((sportName, sports) => {
    setFormData((prev) => {
      const newSports = toggleSport(prev.sportTypes, sportName)

      return {
        ...prev,
        sportTypes: newSports,
        isMultiSport: checkIsMultiSport(newSports, sports),
      }
    })

    setErrors((prev) => {
      const { sportTypes: _sportTypes, ...rest } = prev
      return rest
    })
  }, [])

  /**
   * Toggle multideporte
   * Estabilizado con useCallback para evitar re-renders innecesarios
   */
  const handleMultiSportToggle = useCallback((sports) => {
    setFormData((prev) => {
      const currentIsMultiSport = checkIsMultiSport(prev.sportTypes, sports)
      const newSports = currentIsMultiSport ? deselectAllSports() : selectAllSports(sports)

      return {
        ...prev,
        sportTypes: newSports,
        isMultiSport: !currentIsMultiSport,
      }
    })

    setErrors((prev) => {
      const { sportTypes: _sportTypes, ...rest } = prev
      return rest
    })
  }, [])

  /**
   * Manejo de cambios en inputs
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    // Manejar campos anidados (dimensions, equipment)
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }))

      // Auto-calcular área si se ingresan largo y ancho
      if (parent === 'dimensions' && (child === 'length' || child === 'width')) {
        const length = child === 'length' ? value : formData.dimensions.length
        const width = child === 'width' ? value : formData.dimensions.width
        const area = calculateArea(length, width)
        if (area) {
          setFormData((prev) => ({
            ...prev,
            dimensions: {
              ...prev.dimensions,
              area,
            },
          }))
        }
      }

      setErrors((prev) => ({ ...prev, [name]: '' }))
      return
    }

    // Si cambia el departamento, resetear provincia y distrito
    // Guardar el NOMBRE (selectedLabel) en lugar del ID
    if (name === 'departamento') {
      const departmentName = e.target.selectedLabel || value
      setFormData((prev) => ({
        ...prev,
        departamento: departmentName, // Guardar nombre, no ID
        departamentoId: value, // Guardar ID por separado si se necesita
        provincia: '',
        provinciaId: '',
        distrito: '',
        districtId: '',
      }))
      setAvailableDistricts([])
    }
    // Si cambia la provincia, resetear el distrito
    else if (name === 'provincia') {
      const provinceName = e.target.selectedLabel || value
      setFormData((prev) => ({
        ...prev,
        provincia: provinceName, // Guardar nombre, no ID
        provinciaId: value, // Guardar ID por separado
        distrito: '',
        districtId: '',
      }))
    } else if (name === 'distrito') {
      const districtName = e.target.selectedLabel || value
      // Usar el ID numérico real del distrito seleccionado
      setFormData((prev) => ({
        ...prev,
        distrito: districtName, // Guardar nombre
        distritoId: value, // Guardar ID por separado (legacy)
        districtId: value, // Usar el ID numérico real de la base de datos
      }))
    } else if (name === 'phone') {
      // Formatear teléfono con espacios cada 3 dígitos (XXX XXX XXX)
      const formatted = formatPhone(value)
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))
    }

    // Limpiar error
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  /**
   * Selección de ubicación desde el mapa
   */
  const handleLocationSelect = async (locationData) => {
    if (locationData.error) {
      Swal.fire({
        icon: 'error',
        title: 'Ubicación inválida',
        text: locationData.error,
        confirmButtonColor: '#22c55e',
        showCloseButton: true,
        allowEscapeKey: true,
      })
      return
    }

    if (locationData.success) {
      // Actualizar coordenadas y dirección inmediatamente
      setFormData((prev) => ({
        ...prev,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        address: locationData.address,
      }))

      setSelectedLocation(locationData)

      setErrors((prev) => ({
        ...prev,
        latitude: '',
        longitude: '',
        address: '',
        departamento: '',
        provincia: '',
        distrito: '',
      }))

      // Si hay datos geográficos, intentar autocompletar
      if (locationData.geoData) {
        try {
          const token = getToken()
          const foundLocation = await findCompleteLocation(locationData.geoData, token)

          if (foundLocation.department) {
            // Cargar provincias del departamento primero
            const provinces = await fetchProvincesByDepartment(foundLocation.department.id, token)
            setAvailableProvinces(provinces)

            // Preparar datos para actualizar
            // IMPORTANTE: Guardar NOMBRE (para mostrar en filtros) e ID (para cargar cascada)
            const updateData = {
              departamento: foundLocation.department.name, // Guardar NOMBRE
              departamentoId: foundLocation.department.id, // Guardar ID para cargar provincias
            }

            if (foundLocation.province) {
              // Cargar distritos de la provincia
              const districts = await fetchDistrictsByProvince(foundLocation.province.id, token)
              setAvailableDistricts(districts)

              updateData.provincia = foundLocation.province.name // Guardar NOMBRE
              updateData.provinciaId = foundLocation.province.id // Guardar ID para cargar distritos

              if (foundLocation.district) {
                updateData.distrito = foundLocation.district.name // Guardar NOMBRE
                updateData.distritoId = foundLocation.district.id // Guardar ID
                updateData.districtId = foundLocation.district.id // ID numérico real
              }
            }

            // Actualizar todo de una vez
            setFormData((prev) => ({
              ...prev,
              ...updateData,
            }))

            // Mostrar mensaje según lo que se encontró
            if (foundLocation.district) {
              // Se encontró todo
              Swal.fire({
                icon: 'success',
                title: '¡Ubicación Detectada!',
                html: `
                  <div style="text-align: left;">
                    <p><strong>📍 Dirección:</strong> ${locationData.address}</p>
                    <p><strong>🏛️ Departamento:</strong> ${foundLocation.department.name}</p>
                    <p><strong>🏘️ Provincia:</strong> ${foundLocation.province.name}</p>
                    <p><strong>🏠 Distrito:</strong> ${foundLocation.district.name}</p>
                    <p class="mt-2"><small>Los campos de ubicación se han autocompletado. Puedes modificarlos si es necesario.</small></p>
                  </div>
                `,
                confirmButtonColor: '#22c55e',
                timer: 5000,
                timerProgressBar: true,
                showCloseButton: true,
                allowEscapeKey: true,
              })
            } else if (foundLocation.province) {
              // Se encontró departamento y provincia
              Swal.fire({
                icon: 'info',
                title: 'Ubicación Parcial',
                html: `
                  <div style="text-align: left;">
                    <p><strong>Dirección:</strong> ${locationData.address}</p>
                    <p><strong>✅ Detectado:</strong> ${foundLocation.department.name} - ${foundLocation.province.name}</p>
                    <p class="mt-2"><small>Por favor, selecciona el distrito manualmente.</small></p>
                  </div>
                `,
                confirmButtonColor: '#22c55e',
                timer: 4000,
                timerProgressBar: true,
                showCloseButton: true,
                allowEscapeKey: true,
              })
            } else {
              // Solo se encontró departamento
              Swal.fire({
                icon: 'info',
                title: 'Ubicación Parcial',
                html: `
                  <div style="text-align: left;">
                    <p><strong>Dirección:</strong> ${locationData.address}</p>
                    <p><strong>✅ Detectado:</strong> ${foundLocation.department.name}</p>
                    <p class="mt-2"><small>Por favor, selecciona la provincia y distrito manualmente.</small></p>
                  </div>
                `,
                confirmButtonColor: '#22c55e',
                timer: 4000,
                timerProgressBar: true,
                showCloseButton: true,
                allowEscapeKey: true,
              })
            }
            return
          }

          // No se encontró ni siquiera el departamento
          Swal.fire({
            icon: 'info',
            title: 'Ubicación Parcial',
            html: `
              <div style="text-align: left;">
                <p><strong>Dirección:</strong> ${locationData.address}</p>
                <p class="mt-2"><small>No se pudo detectar automáticamente el departamento, provincia y distrito.</small></p>
                <p class="mt-2"><small>Por favor, selecciona manualmente los campos.</small></p>
              </div>
            `,
            confirmButtonColor: '#22c55e',
            timer: 4000,
            timerProgressBar: true,
            showCloseButton: true,
            allowEscapeKey: true,
          })
        } catch (error) {
          console.error('Error al autocompletar ubicación:', error)
          Swal.fire({
            icon: 'warning',
            title: 'Ubicación seleccionada',
            html: `
              <div style="text-align: left;">
                <p><strong>Dirección:</strong> ${locationData.address}</p>
                <p class="mt-2"><small>Por favor, selecciona manualmente el departamento, provincia y distrito.</small></p>
              </div>
            `,
            confirmButtonColor: '#22c55e',
            timer: 3000,
            timerProgressBar: true,
            showCloseButton: true,
            allowEscapeKey: true,
          })
        }
      } else {
        // No hay datos geográficos, el usuario debe seleccionar manualmente
        Swal.fire({
          icon: 'success',
          title: 'Ubicación seleccionada',
          html: `
            <div style="text-align: left;">
              <p><strong>Dirección:</strong> ${locationData.address}</p>
              <p class="mt-2"><small>Por favor, selecciona manualmente el departamento, provincia y distrito.</small></p>
            </div>
          `,
          confirmButtonColor: '#22c55e',
          timer: 3000,
          timerProgressBar: true,
          showCloseButton: true,
          allowEscapeKey: true,
        })
      }

      if (locationData.warning) {
        setTimeout(() => {
          Swal.fire({
            icon: 'warning',
            title: 'Aviso',
            text: locationData.warning,
            confirmButtonColor: '#22c55e',
            showCloseButton: true,
            allowEscapeKey: true,
          })
        }, 3500)
      }
    }
  }

  /**
   * Toggle de amenidad por key del catálogo
   */
  const handleAmenityToggle = useCallback((key, isChecked) => {
    setFormData((prev) => {
      const next = new Set(prev.amenityKeys || [])
      if (isChecked) next.add(key)
      else next.delete(key)
      return { ...prev, amenityKeys: Array.from(next) }
    })
  }, [])

  /**
   * Subir imágenes
   */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)

    files.forEach((file) => {
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        Swal.fire({
          icon: 'error',
          title: validation.error === 'INVALID_TYPE' ? 'Archivo inválido' : 'Archivo muy grande',
          text: validation.message,
          confirmButtonColor: '#22c55e',
          showCloseButton: true,
          allowEscapeKey: true,
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage = {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target.result,
          name: file.name,
          category: 'general',
        }

        setImages((prev) => [...prev, newImage])
        setImageFiles((prev) => [...prev, file])
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ''
  }

  /**
   * Eliminar imagen
   */
  const removeImage = (imageId) => {
    setImages((prev) => {
      const removedImage = prev.find((img) => img.id === imageId)
      if (removedImage) {
        setImageFiles((prevFiles) => prevFiles.filter((file) => file !== removedImage.file))
      }
      return prev.filter((img) => img.id !== imageId)
    })
  }

  /**
   * Actualizar categoría de imagen
   */
  const updateImageCategory = (imageId, category) => {
    setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, category } : img)))
  }

  /**
   * Subir videos
   */
  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files)

    files.forEach((file) => {
      const validation = validateVideoFile(file)
      if (!validation.isValid) {
        Swal.fire({
          icon: 'error',
          title: validation.error === 'INVALID_TYPE' ? 'Archivo inválido' : 'Archivo muy grande',
          text: validation.message,
          confirmButtonColor: '#22c55e',
          showCloseButton: true,
          allowEscapeKey: true,
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const newVideo = {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target.result,
          name: file.name,
        }

        setVideos((prev) => [...prev, newVideo])
        setVideoFiles((prev) => [...prev, file])
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ''
  }

  /**
   * Eliminar video
   */
  const removeVideo = (videoId) => {
    setVideos((prev) => {
      const removedVideo = prev.find((vid) => vid.id === videoId)
      if (removedVideo) {
        setVideoFiles((prevFiles) => prevFiles.filter((file) => file !== removedVideo.file))
      }
      return prev.filter((vid) => vid.id !== videoId)
    })
  }

  /**
   * Cerrar modal
   */
  const handleClose = () => {
    setFormData(resetFormData())
    setSelectedLocation(null)
    setActiveTab('form')
    setImages([])
    setImageFiles([])
    setVideos([])
    setVideoFiles([])
    setErrors({})
    onClose()
  }

  /**
   * Validar formulario
   */
  const handleValidateForm = () => {
    const newErrors = validateForm(formData, images)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Enviar formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!handleValidateForm()) {
      const newErrors = validateForm(formData, images)
      const errorMessages = Object.values(newErrors)

      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        html: `
          <div style="text-align: left; max-height: 300px; overflow-y: auto;">
            <p style="margin-bottom: 8px;">Corrige los siguientes campos para continuar:</p>
            <ul style="padding-left: 20px; margin: 0;">
              ${errorMessages.map((msg) => `<li style="margin-bottom: 4px; color: #dc2626;">• ${msg}</li>`).join('')}
            </ul>
          </div>
        `,
        confirmButtonColor: '#22c55e',
        confirmButtonText: 'Entendido',
        showCloseButton: true,
        allowEscapeKey: true,
      })
      return
    }

    setIsLoading(true)

    try {
      const newField = buildFieldObject(
        formData,
        images,
        imageFiles,
        videos,
        videoFiles,
        user,
        availableSports
      )

      await onSave(newField)

      const successMessage = `${newField.name} ha sido enviada para aprobación. Podrás aprobarla desde el módulo de Solicitudes`

      Swal.fire({
        icon: 'success',
        title: '¡Solicitud Enviada!',
        text: successMessage,
        timer: 3000,
        showConfirmButton: false,
        showCloseButton: true,
        allowEscapeKey: true,
      })

      setFormData(resetFormData())
      setSelectedLocation(null)
      setActiveTab('form')
      setImages([])
      setImageFiles([])
      setVideos([])
      setVideoFiles([])

      handleClose()
    } catch (_error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar la cancha. Intenta nuevamente.',
        confirmButtonColor: '#22c55e',
        showCloseButton: true,
        allowEscapeKey: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    // Estado
    formData,
    errors,
    isLoading,
    selectedLocation,
    activeTab,
    images,
    videos,
    availableProvinces,
    availableDistricts,

    // Setters
    setActiveTab,
    setFormData,

    // Handlers
    handleSportToggle,
    handleMultiSportToggle,
    handleInputChange,
    handleLocationSelect,
    handleAmenityToggle,
    handleImageUpload,
    removeImage,
    updateImageCategory,
    handleVideoUpload,
    removeVideo,
    handleClose,
    handleSubmit,
  }
}

export default useNewFieldForm
