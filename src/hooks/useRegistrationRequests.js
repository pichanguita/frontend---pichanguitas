import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import useAuthStore from '../store/authStore'
import {
  filterRequests,
  calculateStats,
  getFullName,
} from '../utils/registration/registrationHelpers.jsx'
import {
  fetchRegistrationRequests,
  approveRegistrationRequestAPI,
  rejectRegistrationRequestAPI,
  fetchRegistrationRequestStatsAPI,
} from '../services/registrationRequests/registrationRequestsService'
import { API_CONFIG } from '../config/api.config'

/**
 * Transforma los datos del backend al formato del frontend
 */
const transformBackendToFrontend = (backendRequest) => {
  const docs = backendRequest.documents || {}
  const API_BASE_URL = API_CONFIG.BASE_URL

  // Construir URLs completas para los archivos subidos
  const uploadedFiles = docs.uploadedFiles || []
  const documentsMetadata = docs.documentsMetadata || []
  const photosMetadata = docs.photosMetadata || []

  // Función helper para encontrar metadata por nombre de archivo
  const findMetadata = (file, metadataArray) => {
    return (
      metadataArray.find(
        (meta) =>
          meta.name === file.originalname ||
          meta.name.includes(file.originalname?.split('.')[0] || '')
      ) || {}
    )
  }

  // Helper para construir URL completa (soporta Wasabi y rutas locales)
  const buildFileUrl = (filePath) => {
    if (!filePath) return ''
    // Si ya es URL absoluta (Wasabi u otra), retornar directamente
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath
    }
    // Si es ruta relativa, agregar BASE_URL
    if (filePath.startsWith('/')) {
      return `${API_BASE_URL}${filePath}`
    }
    return `${API_BASE_URL}/${filePath}`
  }

  // Separar documentos (PDFs, etc.) de fotos (imagenes)
  const documentsWithUrls = uploadedFiles
    .filter((file) => file.mimetype?.startsWith('application/') || file.mimetype?.includes('pdf'))
    .map((file) => {
      const metadata = findMetadata(file, documentsMetadata)
      return {
        id: metadata.id || Date.now() + Math.random(),
        name: file.originalname || file.filename || 'Documento',
        size: file.size || metadata.size || 0,
        type: file.mimetype || metadata.type || 'application/pdf',
        data: buildFileUrl(file.path),
      }
    })

  const photosWithUrls = uploadedFiles
    .filter((file) => file.mimetype?.startsWith('image/'))
    .map((file) => {
      const metadata = findMetadata(file, photosMetadata)
      return {
        id: metadata.id || Date.now() + Math.random(),
        name: file.originalname || file.filename || 'Foto',
        size: file.size || metadata.size || 0,
        type: file.mimetype || metadata.type || 'image/jpeg',
        data: buildFileUrl(file.path),
      }
    })

  return {
    id: backendRequest.id.toString(),
    // Datos personales
    firstName: backendRequest.name?.split(' ')[0] || '',
    lastName: backendRequest.name?.split(' ').slice(1).join(' ') || '',
    dni: backendRequest.dni || '',
    email: backendRequest.email || '',
    phone: backendRequest.phone || '',

    // Datos del negocio (usando field_name como businessName)
    businessName: backendRequest.field_name || '',
    businessAddress: backendRequest.address || '',
    businessRuc: docs.businessRuc || '',
    businessPhone: docs.businessPhone || '',
    businessReference: docs.businessReference || '',

    // Ubicación
    department: backendRequest.department || '',
    province: backendRequest.province || '',
    district: backendRequest.district || '',
    addressReferences: docs.addressReferences || '',
    businessCoordinates: docs.businessCoordinates || null,

    // Información adicional
    sportTypes: docs.sportTypes || [],
    experience: docs.experience || '',
    reasonToJoin: docs.reasonToJoin || '',

    // Credenciales
    username: docs.credentials?.username || '',
    password: docs.credentials?.password || '',

    // Documentos y fotos con URLs completas
    documents: documentsWithUrls,
    photos: photosWithUrls,
    uploadedFiles: docs.uploadedFiles || [],

    // Estado
    status: backendRequest.status || 'pending',
    requestDate: backendRequest.date_time_registration || new Date().toISOString(),
    reviewDate: backendRequest.reviewed_at || null,
    reviewedBy: backendRequest.reviewed_by_name || null,
    rejectionReason: backendRequest.rejection_reason || null,
  }
}

export const useRegistrationRequests = () => {
  const { token } = useAuthStore()
  const [requests, setRequests] = useState([])
  const [filteredRequests, setFilteredRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showDetails, setShowDetails] = useState(false)
  const [showDocumentsModal, setShowDocumentsModal] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState({ documents: [], photos: [] })
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  // Cargar solicitudes desde el backend
  useEffect(() => {
    loadRequests()
  }, [])

  // Filtrar solicitudes
  useEffect(() => {
    const filtered = filterRequests(requests, filterStatus, searchTerm)
    setFilteredRequests(filtered)
  }, [requests, filterStatus, searchTerm])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const backendRequests = await fetchRegistrationRequests()
      const transformedRequests = backendRequests.map(transformBackendToFrontend)

      setRequests(transformedRequests)

      // Cargar estadísticas
      try {
        const statsData = await fetchRegistrationRequestStatsAPI(token)
        setStats({
          total: parseInt(statsData.total_requests) || 0,
          pending: parseInt(statsData.pending_requests) || 0,
          approved: parseInt(statsData.approved_requests) || 0,
          rejected: parseInt(statsData.rejected_requests) || 0,
        })
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
        // Calcular stats localmente si falla la API
        setStats(calculateStats(transformedRequests))
      }
    } catch (error) {
      console.error('❌ Error al cargar solicitudes:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las solicitudes. Intenta nuevamente.',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (request) => {
    const fullName = getFullName(request)
    const result = await Swal.fire({
      title: '¿Aprobar solicitud?',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Nombre:</strong> ${fullName}</p>
          <p class="mb-2"><strong>Email:</strong> ${request.email}</p>
          <p class="mb-2"><strong>Cancha:</strong> ${request.businessName}</p>
          <p class="mt-4 text-sm text-gray-600">Al aprobar, se creará automáticamente:</p>
          <ul class="text-sm text-gray-700 list-disc list-inside ml-2">
            <li>Cuenta de administrador</li>
            <li>Cancha asignada</li>
          </ul>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      try {
        // Aprobar en el backend (esto ahora crea automáticamente el usuario y la cancha)
        const approvalResult = await approveRegistrationRequestAPI(request.id, token)

        // Recargar solicitudes para reflejar el cambio de estado
        await loadRequests()

        Swal.fire({
          icon: 'success',
          title: 'Solicitud Aprobada',
          html: `
            <div class="text-left">
              <p class="mb-3">La solicitud ha sido aprobada exitosamente.</p>
              <div class="bg-green-50 p-3 rounded-lg">
                <p class="text-sm font-medium text-green-800 mb-2">Se ha creado:</p>
                <p class="text-sm text-green-700">✅ Cuenta de administrador</p>
                <p class="text-sm text-green-700">✅ Cancha: ${request.businessName}</p>
                <p class="text-sm text-green-700 mt-2"><strong>Email:</strong> ${request.email}</p>
                <p class="text-sm text-green-700"><strong>Usuario:</strong> ${request.username}</p>
              </div>
              <p class="mt-3 text-sm text-gray-600">El administrador ya puede iniciar sesión con sus credenciales.</p>
            </div>
          `,
          confirmButtonColor: '#22c55e',
        })
      } catch (error) {
        console.error('Error al aprobar solicitud:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo aprobar la solicitud. Intenta nuevamente.',
          confirmButtonColor: '#ef4444',
        })
      }
    }
  }

  const handleReject = async (request) => {
    const result = await Swal.fire({
      title: 'Rechazar solicitud',
      input: 'textarea',
      inputLabel: 'Motivo del rechazo',
      inputPlaceholder: 'Explica brevemente por qué se rechaza la solicitud...',
      inputAttributes: {
        'aria-label': 'Motivo del rechazo',
      },
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes proporcionar un motivo'
        }
      },
    })

    if (result.isConfirmed) {
      try {
        // Rechazar en el backend
        await rejectRegistrationRequestAPI(request.id, result.value, token)

        // Recargar solicitudes
        await loadRequests()

        Swal.fire({
          icon: 'info',
          title: 'Solicitud Rechazada',
          text: 'La solicitud ha sido rechazada correctamente',
          confirmButtonColor: '#3b82f6',
        })
      } catch (error) {
        console.error('Error al rechazar solicitud:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo rechazar la solicitud. Intenta nuevamente.',
          confirmButtonColor: '#ef4444',
        })
      }
    }
  }

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setShowDetails(true)
  }

  const handleViewDocuments = (request) => {
    const fullName = getFullName(request)
    setSelectedDocuments({
      documents: request.documents || [],
      photos: request.photos || [],
      requestInfo: {
        name: fullName,
        business: request.businessName,
      },
    })
    setShowDocumentsModal(true)
  }

  return {
    // Estado
    requests,
    filteredRequests,
    selectedRequest,
    searchTerm,
    filterStatus,
    showDetails,
    showDocumentsModal,
    selectedDocuments,
    stats,
    loading,

    // Setters
    setSearchTerm,
    setFilterStatus,
    setShowDetails,
    setShowDocumentsModal,
    setSelectedDocuments,
    setSelectedRequest,

    // Acciones
    handleApprove,
    handleReject,
    handleViewDetails,
    handleViewDocuments,
    loadRequests,
  }
}
