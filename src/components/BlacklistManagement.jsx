import React, { useState } from 'react'
import { Ban, UserX, Trash2, Calendar, AlertCircle, Plus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import useBookingStore from '../store/bookingStore'

const BlacklistManagement = () => {
  const { blacklist, addToBlacklist, removeFromBlacklist } = useBookingStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [newBlockForm, setNewBlockForm] = useState({
    phoneNumber: '',
    customerName: '',
    reason: '',
    blockedUntil: '', // vacío = permanente
    isPermanent: true,
  })

  const handleAddToBlacklist = () => {
    if (!newBlockForm.phoneNumber || !newBlockForm.reason) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'Por favor completa el teléfono y la razón del bloqueo',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    // Validar formato de teléfono
    if (!/^9\d{8}$/.test(newBlockForm.phoneNumber)) {
      Swal.fire({
        icon: 'error',
        title: 'Teléfono Inválido',
        text: 'El teléfono debe tener 9 dígitos y comenzar con 9',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    addToBlacklist({
      phoneNumber: newBlockForm.phoneNumber,
      customerName: newBlockForm.customerName || 'Usuario',
      reason: newBlockForm.reason,
      blockedUntil: newBlockForm.isPermanent ? null : newBlockForm.blockedUntil,
    })

    Swal.fire({
      icon: 'success',
      title: '¡Usuario Bloqueado!',
      text: `${newBlockForm.customerName || newBlockForm.phoneNumber} ha sido agregado a la lista negra`,
      timer: 2000,
      showConfirmButton: false,
    })

    setShowAddModal(false)
    setNewBlockForm({
      phoneNumber: '',
      customerName: '',
      reason: '',
      blockedUntil: '',
      isPermanent: true,
    })
  }

  const handleRemoveFromBlacklist = (entry) => {
    Swal.fire({
      icon: 'warning',
      title: '¿Desbloquear Usuario?',
      text: `¿Estás seguro de remover a ${entry.customerName} de la lista negra?`,
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, desbloquear',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        removeFromBlacklist(entry.id)
        Swal.fire({
          icon: 'success',
          title: '¡Usuario Desbloqueado!',
          text: `${entry.customerName} ha sido removido de la lista negra`,
          timer: 2000,
          showConfirmButton: false,
        })
      }
    })
  }

  const isBlockExpired = (blockedUntil) => {
    if (!blockedUntil) return false
    return new Date() > new Date(blockedUntil)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 flex items-center space-x-3">
            <Ban className="w-8 h-8 text-red-600" />
            <span>Lista Negra de Usuarios</span>
          </h1>
          <p className="text-secondary-600 mt-2">
            Gestiona los usuarios bloqueados que no pueden hacer reservas
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Bloquear Usuario</span>
        </button>
      </div>

      {/* Alert Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Información Importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Los usuarios en lista negra no podrán crear nuevas reservas</li>
              <li>El sistema bloqueará automáticamente usuarios con 3+ no-shows</li>
              <li>Puedes establecer bloqueos temporales o permanentes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Blacklist Table */}
      {blacklist.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-secondary-200">
          <UserX className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-secondary-600 mb-2">
            No hay usuarios bloqueados
          </h3>
          <p className="text-secondary-500">
            La lista negra está vacía. Los usuarios con mal comportamiento aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-secondary-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                    Razón
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                    Bloqueado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                    Hasta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-secondary-600 uppercase tracking-wider">
                    No-Shows
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-secondary-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {blacklist.map((entry) => {
                  const expired = isBlockExpired(entry.blockedUntil)
                  return (
                    <tr key={entry.id} className={expired ? 'bg-gray-50 opacity-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-secondary-900">
                            {entry.customerName}
                          </div>
                          <div className="text-sm text-secondary-500">{entry.phoneNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-secondary-700 max-w-xs">{entry.reason}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-secondary-600">
                          {new Date(entry.blockedAt).toLocaleDateString('es-PE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.blockedUntil ? (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-secondary-400" />
                            <span
                              className={`text-sm ${expired ? 'text-red-600 font-bold' : 'text-secondary-600'}`}
                            >
                              {new Date(entry.blockedUntil).toLocaleDateString('es-PE')}
                              {expired && ' (Expirado)'}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Permanente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-red-600">
                          {entry.reservationsMissed || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveFromBlacklist(entry)}
                          className="text-red-600 hover:text-red-900 transition-colors flex items-center space-x-1 ml-auto"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Desbloquear</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add to Blacklist Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-secondary-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Ban className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-secondary-900">Bloquear Usuario</h2>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-secondary-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-secondary-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={newBlockForm.phoneNumber}
                    onChange={(e) =>
                      setNewBlockForm({
                        ...newBlockForm,
                        phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 9),
                      })
                    }
                    placeholder="999888777"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-red-500"
                    maxLength="9"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Nombre (Opcional)
                  </label>
                  <input
                    type="text"
                    value={newBlockForm.customerName}
                    onChange={(e) =>
                      setNewBlockForm({ ...newBlockForm, customerName: e.target.value })
                    }
                    placeholder="Nombre del usuario"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Razón del Bloqueo *
                  </label>
                  <textarea
                    value={newBlockForm.reason}
                    onChange={(e) => setNewBlockForm({ ...newBlockForm, reason: e.target.value })}
                    placeholder="Ej: No asistió a 3 reservas consecutivas"
                    rows="3"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2 mb-3">
                    <input
                      type="checkbox"
                      checked={newBlockForm.isPermanent}
                      onChange={(e) =>
                        setNewBlockForm({ ...newBlockForm, isPermanent: e.target.checked })
                      }
                      className="w-4 h-4 text-red-600 border-secondary-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-secondary-700">
                      Bloqueo Permanente
                    </span>
                  </label>

                  {!newBlockForm.isPermanent && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Bloqueado Hasta
                      </label>
                      <input
                        type="date"
                        value={newBlockForm.blockedUntil}
                        onChange={(e) =>
                          setNewBlockForm({ ...newBlockForm, blockedUntil: e.target.value })
                        }
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-red-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-secondary-200">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddToBlacklist}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Bloquear Usuario
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BlacklistManagement
