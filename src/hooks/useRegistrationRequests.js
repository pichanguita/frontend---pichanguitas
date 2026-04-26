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
 * Adapta los datos que devuelve el backend (nuevo esquema relacional) al
 * formato que consumen los componentes de SA.
 */
const transformBackendToFrontend = (backendRequest) => {
  const files = Array.isArray(backendRequest.files) ? backendRequest.files : []
  const sports = Array.isArray(backendRequest.sports) ? backendRequest.sports : []

  const mapFile = (file) => ({
    id: file.id,
    fileId: file.id,
    name: file.originalName || 'archivo',
    size: file.sizeBytes || 0,
    type: file.mimeType || 'application/octet-stream',
    kind: file.kind,
    // URL de descarga autenticada (stream con Authorization: Bearer ...)
    downloadUrl: API_CONFIG.REGISTRATION_REQUESTS.DOWNLOAD_FILE(
      backendRequest.id,
      file.id
    ),
  })

  const documents = files.filter((f) => f.kind === 'document').map(mapFile)
  const photos = files.filter((f) => f.kind === 'photo').map(mapFile)

  return {
    id: backendRequest.id.toString(),

    firstName: backendRequest.name?.split(' ')[0] || '',
    lastName: backendRequest.name?.split(' ').slice(1).join(' ') || '',
    dni: backendRequest.dni || '',
    email: backendRequest.email || '',
    phone: backendRequest.phone || '',

    businessName: backendRequest.field_name || '',
    businessAddress: backendRequest.address || '',
    businessRuc: backendRequest.business_ruc || '',
    businessPhone: backendRequest.business_phone || '',
    businessReference: backendRequest.business_reference || '',

    department: backendRequest.department || '',
    province: backendRequest.province || '',
    district: backendRequest.district || '',
    addressReferences: backendRequest.address_references || '',
    businessCoordinates:
      backendRequest.business_latitude != null && backendRequest.business_longitude != null
        ? {
            latitude: Number(backendRequest.business_latitude),
            longitude: Number(backendRequest.business_longitude),
          }
        : null,

    sportTypes: sports.map((s) => s.name),
    experience: backendRequest.experience || '',
    reasonToJoin: backendRequest.reason_to_join || '',

    username: backendRequest.credentials_username || '',

    documents,
    photos,

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

  useEffect(() => {
    loadRequests()
  }, [])

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
        await approveRegistrationRequestAPI(request.id, token)
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
        await rejectRegistrationRequestAPI(request.id, result.value, token)
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

    setSearchTerm,
    setFilterStatus,
    setShowDetails,
    setShowDocumentsModal,
    setSelectedDocuments,
    setSelectedRequest,

    handleApprove,
    handleReject,
    handleViewDetails,
    handleViewDocuments,
    loadRequests,
  }
}
