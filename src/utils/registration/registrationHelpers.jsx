import React from 'react'
import { Clock, CheckCircle, XCircle } from 'lucide-react'

/**
 * Obtener nombre completo de una solicitud
 */
export const getFullName = (request) => {
  return request.fullName || `${request.firstName || ''} ${request.lastName || ''}`.trim()
}

/**
 * Generar badge de estado
 */
export const getStatusBadge = (status) => {
  switch (status) {
    case 'pending':
      return (
        <span className="px-3 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pendiente
        </span>
      )
    case 'approved':
      return (
        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Aprobado
        </span>
      )
    case 'rejected':
      return (
        <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rechazado
        </span>
      )
    default:
      return null
  }
}

/**
 * Calcular estadísticas de solicitudes
 */
export const calculateStats = (requests) => {
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
  }
}

/**
 * Filtrar solicitudes por estado y búsqueda
 */
export const filterRequests = (requests, filterStatus, searchTerm) => {
  let filtered = [...requests]

  // Filtrar por estado
  if (filterStatus !== 'all') {
    filtered = filtered.filter((req) => req.status === filterStatus)
  }

  // Filtrar por búsqueda
  if (searchTerm) {
    filtered = filtered.filter((req) => {
      const fullName = getFullName(req)
      return (
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.businessName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }

  // Ordenar por fecha (más recientes primero)
  filtered.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))

  return filtered
}
