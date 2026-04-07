import React from 'react'
import { UserPlus, Shield, Clock, CheckCircle, XCircle } from 'lucide-react'

const RegistrationHeader = ({ stats }) => {
  return (
    <div className="bg-white rounded-xl shadow-custom p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-primary-600" />
            Solicitudes de Registro
          </h2>
          <p className="text-secondary-600 mt-1">
            Gestiona las solicitudes de nuevos administradores
          </p>
        </div>
        <div className="bg-primary-100 px-4 py-2 rounded-lg">
          <p className="text-sm font-medium text-primary-800">
            {stats.pending} solicitudes pendientes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-secondary-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-6 h-6 text-secondary-600" />
          </div>
          <p className="text-2xl font-bold text-secondary-900">{stats.total}</p>
          <p className="text-xs text-secondary-600">Total Solicitudes</p>
        </div>

        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900">{stats.pending}</p>
          <p className="text-xs text-amber-700">Pendientes</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
          <p className="text-xs text-green-700">Aprobadas</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
          <p className="text-xs text-red-700">Rechazadas</p>
        </div>
      </div>
    </div>
  )
}

export default RegistrationHeader
