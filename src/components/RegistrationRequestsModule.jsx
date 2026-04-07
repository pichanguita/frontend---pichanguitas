import React from 'react'
import {
  UserPlus,
  XCircle,
  Eye,
  FileText,
  Image,
  Download,
  ExternalLink,
  Paperclip,
  User,
  MapPin,
  Activity,
  Building2,
  Phone,
  Mail,
  CheckCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRegistrationRequests } from '../hooks/useRegistrationRequests'
import { getStatusBadge, getFullName } from '../utils/registration/registrationHelpers.jsx'
import RegistrationHeader from './registration/RegistrationHeader'
import RegistrationFilters from './registration/RegistrationFilters'
import RegistrationTable from './registration/RegistrationTable'

const RegistrationRequestsModule = () => {
  const {
    filteredRequests,
    selectedRequest,
    searchTerm,
    filterStatus,
    showDetails,
    showDocumentsModal,
    selectedDocuments,
    stats,
    setSearchTerm,
    setFilterStatus,
    setShowDetails,
    setShowDocumentsModal,
    handleApprove,
    handleReject,
    handleViewDetails,
    handleViewDocuments,
  } = useRegistrationRequests()

  // Función para descargar archivos sin navegar
  const handleDownloadFile = async (url, filename) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Error al descargar archivo:', error)
      // Fallback: abrir en nueva pestaña
      window.open(url, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <RegistrationHeader stats={stats} />

      <RegistrationFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <RegistrationTable
        filteredRequests={filteredRequests}
        handleViewDetails={handleViewDetails}
        handleViewDocuments={handleViewDocuments}
        handleApprove={handleApprove}
        handleReject={handleReject}
      />

      {/* Modal de detalles */}
      <AnimatePresence>
        {showDetails && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <UserPlus className="w-6 h-6" />
                      Detalles de la Solicitud
                    </h3>
                    <p className="text-primary-100 text-sm mt-1">
                      Solicitud #{selectedRequest.id.slice(-6)} -{' '}
                      {new Date(selectedRequest.requestDate).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-6 space-y-6">
                {/* Información personal */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-5 border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información Personal
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm md:col-span-2">
                      <p className="text-xs font-medium text-blue-600 mb-1">Nombre Completo</p>
                      <p className="font-semibold text-secondary-900">
                        {getFullName(selectedRequest)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs font-medium text-blue-600 mb-1">DNI</p>
                      <p className="font-semibold text-secondary-900">{selectedRequest.dni}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs font-medium text-blue-600 mb-1">
                        <Mail className="w-3 h-3 inline" /> Email
                      </p>
                      <p className="font-semibold text-secondary-900">{selectedRequest.email}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs font-medium text-blue-600 mb-1">
                        <Phone className="w-3 h-3 inline" /> Teléfono
                      </p>
                      <p className="font-semibold text-secondary-900">{selectedRequest.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Información del negocio */}
                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-5 border border-green-200">
                  <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Información del Negocio
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs font-medium text-green-600 mb-1">Nombre del Negocio</p>
                      <p className="font-semibold text-secondary-900">
                        {selectedRequest.businessName}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm">
                      <p className="text-xs font-medium text-green-600 mb-1">RUC</p>
                      <p className="font-semibold text-secondary-900">
                        {selectedRequest.businessRuc || 'No proporcionado'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm md:col-span-2">
                      <p className="text-xs font-medium text-green-600 mb-1">
                        <MapPin className="w-3 h-3 inline" /> Dirección
                      </p>
                      <p className="font-semibold text-secondary-900">
                        {selectedRequest.businessAddress}
                      </p>
                    </div>
                    {selectedRequest.sportTypes && selectedRequest.sportTypes.length > 0 && (
                      <div className="bg-white rounded-lg p-4 shadow-sm md:col-span-2">
                        <p className="text-xs font-medium text-green-600 mb-3">Tipos de Cancha</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedRequest.sportTypes.map((sport, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-full"
                            >
                              <Activity className="w-3.5 h-3.5 mr-1.5" />
                              {sport}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información adicional */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-5 border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Información Adicional
                  </h4>
                  <div className="space-y-4">
                    {selectedRequest.experience && (
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-xs font-medium text-purple-600 mb-2">Experiencia</p>
                        <p className="text-sm text-secondary-700">{selectedRequest.experience}</p>
                      </div>
                    )}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-xs font-medium text-purple-600 mb-2">Razón para unirse</p>
                      <p className="text-sm text-secondary-700">{selectedRequest.reasonToJoin}</p>
                    </div>
                  </div>
                </div>

                {/* Documentos */}
                {(selectedRequest.documents?.length > 0 || selectedRequest.photos?.length > 0) && (
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-5 border border-amber-200">
                    <h4 className="text-lg font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <Paperclip className="w-5 h-5" />
                      Documentos Adjuntos
                    </h4>
                    <div className="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between">
                      <p className="text-base font-semibold text-secondary-900">
                        {(selectedRequest.documents?.length || 0) +
                          (selectedRequest.photos?.length || 0)}{' '}
                        archivos
                      </p>
                      <button
                        onClick={() => handleViewDocuments(selectedRequest)}
                        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver archivos
                      </button>
                    </div>
                  </div>
                )}

                {/* Estado */}
                <div className="bg-gradient-to-br from-secondary-50 to-secondary-100/50 rounded-xl p-5 border border-secondary-200">
                  <div className="flex items-center justify-between">
                    <div>{getStatusBadge(selectedRequest.status)}</div>
                    {selectedRequest.reviewDate && (
                      <p className="text-sm text-secondary-700">
                        Revisado el{' '}
                        {new Date(selectedRequest.reviewDate).toLocaleDateString('es-PE')}
                      </p>
                    )}
                  </div>
                  {selectedRequest.rejectionReason && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg mt-4">
                      <p className="text-sm font-semibold text-red-800 mb-1">Motivo:</p>
                      <p className="text-sm text-red-700">{selectedRequest.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="border-t bg-secondary-50 px-6 py-4 flex gap-3">
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      handleApprove(selectedRequest)
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Aprobar
                  </button>
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      handleReject(selectedRequest)
                    }}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    Rechazar
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de documentos */}
      <AnimatePresence>
        {showDocumentsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-secondary-900">
                      Documentos de Acreditación
                    </h3>
                    {selectedDocuments.requestInfo && (
                      <p className="text-sm text-secondary-600 mt-1">
                        {selectedDocuments.requestInfo.name} -{' '}
                        {selectedDocuments.requestInfo.business}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDocumentsModal(false)}
                    className="p-2 hover:bg-secondary-100 rounded-lg"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {selectedDocuments.documents?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-secondary-700 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Documentos ({selectedDocuments.documents.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedDocuments.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="border rounded-lg p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="p-2 bg-secondary-100 rounded-lg">
                                <FileText className="w-6 h-6 text-secondary-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-secondary-900 truncate">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-secondary-500 mt-1">
                                  {(doc.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDownloadFile(doc.data, doc.name)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <a
                                href={doc.data}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDocuments.photos?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-secondary-700 mb-3 flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Fotos ({selectedDocuments.photos.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedDocuments.photos.map((photo) => (
                        <div key={photo.id} className="group relative">
                          <div className="aspect-square bg-secondary-100 rounded-lg overflow-hidden">
                            <img
                              src={photo.data}
                              alt={photo.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDownloadFile(photo.data, photo.name)}
                                className="p-2 bg-white text-secondary-700 rounded-lg"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <a
                                href={photo.data}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white text-secondary-700 rounded-lg"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </div>
                          <p className="text-xs text-secondary-600 mt-2 truncate">{photo.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedDocuments.documents?.length && !selectedDocuments.photos?.length && (
                  <div className="text-center py-8">
                    <Paperclip className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500">No hay documentos adjuntos</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RegistrationRequestsModule
