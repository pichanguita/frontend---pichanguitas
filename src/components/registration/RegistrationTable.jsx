import React from 'react'
import {
  UserPlus,
  Mail,
  Phone,
  Building2,
  Calendar,
  Eye,
  Paperclip,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { getStatusBadge, getFullName } from '../../utils/registration/registrationHelpers.jsx'

const RegistrationTable = ({
  filteredRequests,
  handleViewDetails,
  handleViewDocuments,
  handleApprove,
  handleReject,
}) => {
  if (filteredRequests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-custom overflow-hidden">
        <div className="text-center py-12">
          <UserPlus className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
          <p className="text-secondary-500">No hay solicitudes para mostrar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-custom overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50">
            <tr>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">Solicitante</th>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">Negocio</th>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">Fecha</th>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">Estado</th>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {filteredRequests.map((request) => (
              <motion.tr
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hover:bg-secondary-50 transition-colors"
              >
                <td className="py-4 px-6">
                  <div>
                    <p className="font-medium text-secondary-900">{getFullName(request)}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-secondary-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {request.email}
                      </span>
                      <span className="text-sm text-secondary-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {request.phone}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-secondary-400" />
                    <span className="font-medium">{request.businessName}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2 text-sm text-secondary-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(request.requestDate).toLocaleDateString('es-PE')}
                  </div>
                </td>
                <td className="py-4 px-6">{getStatusBadge(request.status)}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {(request.documents?.length > 0 || request.photos?.length > 0) && (
                      <button
                        onClick={() => handleViewDocuments(request)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors relative"
                        title="Ver documentos adjuntos"
                      >
                        <Paperclip className="w-4 h-4" />
                        <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {(request.documents?.length || 0) + (request.photos?.length || 0)}
                        </span>
                      </button>
                    )}

                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(request)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Aprobar"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Rechazar"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RegistrationTable
