import React from 'react'
import { motion } from 'framer-motion'
import { Clock, DollarSign, Trophy, Users } from 'lucide-react'

/**
 * Tabla de clientes con sus estadísticas de promociones
 * Nota: El canje de promociones lo realiza el cliente desde su vista (PromotionsView.jsx)
 */
const ClientsTable = ({ clientStats }) => {
  if (clientStats.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-custom overflow-hidden"
      >
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
          <p className="text-secondary-500">No hay clientes con reservas aún</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-custom overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50">
            <tr>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">Cliente</th>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">
                Horas Acumuladas
              </th>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">Total Gastado</th>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">Horas Gratis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {clientStats.map((client, index) => (
              <tr key={index} className="hover:bg-secondary-50 transition-colors">
                <td className="py-4 px-6">
                  <div>
                    <p className="font-medium text-secondary-900">{client.name}</p>
                    <p className="text-sm text-secondary-600">+51 {client.phoneNumber}</p>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-secondary-400" />
                    <span className="font-medium">{client.totalHours || 0}h</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-secondary-400" />
                    <span>S/ {(client.totalSpent || 0).toFixed(2)}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-green-600">
                        {client.availableFreeHours || 0}h disponibles
                      </p>
                      <p className="text-xs text-secondary-500">
                        {client.earnedFreeHours || 0}h ganadas | {client.usedFreeHours || 0}h usadas
                      </p>
                    </div>
                    {(client.availableFreeHours || 0) > 0 && (
                      <Trophy className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export default ClientsTable
