import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  validateStep,
  prepareRegistrationData,
  showSuccessMessage,
  showErrorMessage,
  showValidationErrors,
  DEFAULT_COORDINATES,
} from '../utils/adminRegistrationHelpers'
import { createRegistrationRequestWithFilesAPI } from '../services/registrationRequests/registrationRequestsService'
import {
  fetchProvincesByDepartment,
  fetchDistrictsByProvince,
} from '../services/locations/locationsService'
import { getToken } from '../config/api.config'

/**
 * Hook para manejar el formulario de registro de administradores
 */
const useAdminRegistrationForm = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Estados para la cascada de ubicaciones
  const [availableProvincias, setAvailableProvincias] = useState([])
  const [availableDistritos, setAvailableDistritos] = useState([])

  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    // Información personal
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    ownerAddress: '',
    city: '',
    department: '',
    district: '',
    addressReferences: '',

    // Credenciales
    username: '',
    password: '',
    confirmPassword: '',

    // Información del negocio
    businessName: '',
    businessRuc: '',
    businessAddress: '',
    businessPhone: '',
    businessReference: '',
    businessCoordinates: [DEFAULT_COORDINATES.lat, DEFAULT_COORDINATES.lng],
    businessLatitude: DEFAULT_COORDINATES.lat,
    businessLongitude: DEFAULT_COORDINATES.lng,

    // Detalles adicionales
    experience: '',
    reasonToJoin: '',
    sportTypes: [],
    termsAccepted: false,
    attachedDocument: null,
    documents: [],
    photos: [],
  })

  /**
   * Cargar provincias cuando cambia el departamento
   */
  useEffect(() => {
    const loadProvinces = async () => {
      if (formData.department && formData.department !== '') {
        try {
          const token = getToken()
          const provinces = await fetchProvincesByDepartment(formData.department, token)
          setAvailableProvincias(provinces)
        } catch (_error) {
          setAvailableProvincias([])
        }
      } else {
        setAvailableProvincias([])
      }
    }
    loadProvinces()
  }, [formData.department])

  /**
   * Cargar distritos cuando cambia la provincia
   */
  useEffect(() => {
    const loadDistricts = async () => {
      if (formData.city && formData.city !== '') {
        try {
          const token = getToken()
          const districts = await fetchDistrictsByProvince(formData.city, token)
          setAvailableDistritos(districts)
        } catch (_error) {
          setAvailableDistritos([])
        }
      } else {
        setAvailableDistritos([])
      }
    }
    loadDistricts()
  }, [formData.city])

  /**
   * Manejo de cambios en inputs
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    // Manejo especial para la cascada de ubicaciones
    if (name === 'department') {
      setFormData((prev) => ({
        ...prev,
        department: value,
        city: '',
        district: '',
      }))
      setAvailableDistritos([])
    } else if (name === 'city') {
      setFormData((prev) => ({
        ...prev,
        city: value,
        district: '',
      }))
    } else if (name === 'sportTypes') {
      // Manejo especial para checkboxes de deportes
      setFormData((prev) => {
        const currentSports = [...prev.sportTypes]
        if (checked) {
          if (!currentSports.includes(value)) {
            currentSports.push(value)
          }
        } else {
          const index = currentSports.indexOf(value)
          if (index > -1) {
            currentSports.splice(index, 1)
          }
        }
        return {
          ...prev,
          sportTypes: currentSports,
        }
      })
    } else {
      // Manejo normal para otros campos
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }))
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  /**
   * Actualizar ubicación del negocio
   */
  const updateBusinessLocation = (coordinates, address = null) => {
    const [lat, lng] = coordinates
    setFormData((prev) => ({
      ...prev,
      businessCoordinates: [lat, lng],
      businessLatitude: lat,
      businessLongitude: lng,
      ...(address && { businessAddress: address }),
    }))
  }

  /**
   * Manejo de archivos adjuntos
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        attachedDocument: file,
      }))
    }
  }

  /**
   * Remover archivo
   */
  const removeFile = (type, fileId) => {
    if (type === 'documents' || type === 'photos') {
      setFormData((prev) => ({
        ...prev,
        [type]: prev[type].filter((file) => file.id !== fileId),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        attachedDocument: null,
      }))
    }
  }

  /**
   * Agregar documento o foto
   */
  const addFile = (type, fileData) => {
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], fileData],
    }))
  }

  /**
   * Navegar al siguiente paso
   */
  const handleNext = () => {
    const stepErrors = validateStep(currentStep, formData)
    setErrors(stepErrors)

    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(currentStep + 1)
    } else {
      // Mostrar alerta con los errores de validación
      showValidationErrors(stepErrors, currentStep)
    }
  }

  /**
   * Navegar al paso anterior
   */
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  /**
   * Enviar formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault()

    const stepErrors = validateStep(4, formData)
    setErrors(stepErrors)

    if (Object.keys(stepErrors).length > 0) {
      // Mostrar alerta con los errores de validación
      showValidationErrors(stepErrors, 4)
      return
    }

    setIsLoading(true)

    try {
      // Preparar datos para la API
      const requestData = prepareRegistrationData(formData)

      // Obtener token (puede ser null si no está autenticado)
      const token = getToken()

      // Recolectar todos los archivos File reales
      const allFiles = []

      // Agregar archivos del campo attachedDocument si existe
      if (formData.attachedDocument) {
        allFiles.push({ file: formData.attachedDocument })
      }

      // Agregar documentos con sus archivos File
      if (formData.documents && formData.documents.length > 0) {
        formData.documents.forEach((doc) => {
          if (doc.file) {
            allFiles.push({ file: doc.file })
          }
        })
      }

      // Agregar fotos con sus archivos File
      if (formData.photos && formData.photos.length > 0) {
        formData.photos.forEach((photo) => {
          if (photo.file) {
            allFiles.push({ file: photo.file })
          }
        })
      }

      // Enviar solicitud al backend con archivos
      await createRegistrationRequestWithFilesAPI(requestData, allFiles, token)

      setIsLoading(false)
      await showSuccessMessage()
      navigate('/admin')
    } catch (error) {
      setIsLoading(false)
      await showErrorMessage(error.message)
    }
  }

  return {
    // Estados
    formData,
    errors,
    currentStep,
    isLoading,
    availableProvincias,
    availableDistritos,
    showPassword,
    showConfirmPassword,

    // Setters
    setShowPassword,
    setShowConfirmPassword,

    // Handlers
    handleInputChange,
    handleNext,
    handlePrevious,
    handleSubmit,
    handleFileChange,
    removeFile,
    addFile,
    updateBusinessLocation,
  }
}

export default useAdminRegistrationForm
