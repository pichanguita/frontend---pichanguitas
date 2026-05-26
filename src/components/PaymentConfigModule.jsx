import React, { useState, useEffect } from 'react'
import {
  Settings,
  DollarSign,
  Calendar,
  Power,
  Edit2,
  X,
  Check,
  CreditCard,
  Plus,
  Trash2,
} from 'lucide-react'
import usePaymentStore from '../store/paymentStore'
import useFieldStore from '../store/modules/fieldStore'
import useAuthStore from '../store/authStore'
import {
  upsertPaymentConfigAPI,
  fetchPaymentConfigs,
} from '../services/paymentConfigs/paymentConfigsService'
import { API_CONFIG } from '../config/api.config'
import Swal from 'sweetalert2'

const PaymentConfigModule = () => {
  const { getAllPaymentConfigs, setPaymentConfig, getPaymentConfig } = usePaymentStore()
  const { fields } = useFieldStore()
  const { token, user } = useAuthStore()

  const [isLoading, setIsLoading] = useState(false)
  const [configs, setConfigs] = useState([])
  const [editingFieldId, setEditingFieldId] = useState(null)
  const [editForm, setEditForm] = useState({
    monthlyFee: '',
    dueDay: 10,
    effectiveFrom: '',
    isActive: true,
  })

  // Estados para métodos de cobro
  const [showMethodsModal, setShowMethodsModal] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [methodForm, setMethodForm] = useState({ name: '', account_number: '', account_holder: '' })
  const [editingMethodId, setEditingMethodId] = useState(null)
  const [isSavingMethod, setIsSavingMethod] = useState(false)

  // Cargar configuraciones al montar y cuando cambien los fields
  useEffect(() => {
    loadConfigs()
    loadPaymentMethods()
  }, [fields])

  // Funciones para métodos de cobro
  const loadPaymentMethods = async () => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/platform-payment-methods`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) setPaymentMethods(data.data || [])
    } catch (error) {
      console.error('Error cargando métodos:', error)
    }
  }

  const saveMethod = async () => {
    // Guard de re-entrancy: evita que múltiples clicks generen duplicados
    if (isSavingMethod) return

    if (!methodForm.name || !methodForm.account_number) {
      Swal.fire('Error', 'Nombre y número son requeridos', 'error')
      return
    }
    try {
      setIsSavingMethod(true)
      const url = editingMethodId
        ? `${API_CONFIG.BASE_URL}/api/platform-payment-methods/${editingMethodId}`
        : `${API_CONFIG.BASE_URL}/api/platform-payment-methods`
      const res = await fetch(url, {
        method: editingMethodId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...methodForm, method_type: 'other', is_active: true }),
      })
      const data = await res.json()
      if (data.success) {
        loadPaymentMethods()
        setMethodForm({ name: '', account_number: '', account_holder: '' })
        setEditingMethodId(null)
        Swal.fire({ icon: 'success', title: 'Guardado', timer: 1500, showConfirmButton: false })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      Swal.fire('Error', error.message || 'No se pudo guardar', 'error')
    } finally {
      setIsSavingMethod(false)
    }
  }

  const deleteMethod = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      confirmButtonColor: '#EF4444',
    })
    if (result.isConfirmed) {
      await fetch(`${API_CONFIG.BASE_URL}/api/platform-payment-methods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      loadPaymentMethods()
    }
  }

  const loadConfigs = async () => {
    try {
      setIsLoading(true)

      // Obtener configuraciones desde la base de datos
      const dbConfigs = await fetchPaymentConfigs(token)

      // Filtrar canchas: excluir las del super_admin (no se cobra a sí mismo)
      // Solo mostrar canchas aprobadas y operativas de admins de cancha (rol 2)
      const fieldsToShow = fields.filter((field) => {
        // Excluir canchas donde el adminId sea el mismo que el usuario actual (super_admin)
        // El super_admin no debe cobrarse a sí mismo
        if (user && field.adminId === user.id) {
          return false
        }
        // Solo se cobra mensualidad a canchas aprobadas
        if (field.approvalStatus && field.approvalStatus !== 'approved') {
          return false
        }
        return true
      })

      // Combinar campos con sus configuraciones desde la BD
      const configsWithFields = fieldsToShow.map((field) => {
        const config = dbConfigs.find((c) => c.field_id === field.id) || {}
        return {
          fieldId: field.id,
          fieldName: field.name,
          adminId: field.adminId,
          adminName: field.adminName || 'Admin',
          monthlyFee: config.monthly_fee || 0,
          dueDay: config.due_day || 10,
          effectiveFrom: config.effective_from || null,
          isActive: config.is_active || false,
          hasConfig: !!config.monthly_fee,
          createdAt: field.createdAt || new Date().toISOString(),
        }
      })

      setConfigs(configsWithFields)
    } catch (error) {
      console.error('Error cargando configuraciones:', error)
      // Fallback a localStorage si falla
      const allConfigs = getAllPaymentConfigs()

      // Filtrar canchas: excluir las del super_admin y las no aprobadas
      const fieldsToShow = fields.filter((field) => {
        if (user && field.adminId === user.id) {
          return false
        }
        if (field.approvalStatus && field.approvalStatus !== 'approved') {
          return false
        }
        return true
      })

      const configsWithFields = fieldsToShow.map((field) => {
        const config = allConfigs.find((c) => c.fieldId === field.id) || {}
        return {
          fieldId: field.id,
          fieldName: field.name,
          adminId: field.adminId,
          adminName: field.adminName || 'Admin',
          monthlyFee: config.monthlyFee || 0,
          dueDay: config.dueDay || 10,
          isActive: config.isActive || false,
          hasConfig: !!config.monthlyFee,
          createdAt: field.createdAt || new Date().toISOString(),
        }
      })
      setConfigs(configsWithFields)
    } finally {
      setIsLoading(false)
    }
  }

  // Extraer YYYY-MM-DD de una fecha sin desfase de timezone
  const toDateInputValue = (dateStr) => {
    if (!dateStr) return ''
    // Si ya viene como YYYY-MM-DD, usarlo directo
    if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr
    // Si viene como ISO "2026-03-27T00:00:00.000Z", extraer la parte de fecha
    if (typeof dateStr === 'string' && dateStr.includes('T')) return dateStr.split('T')[0]
    // Si es Date object, extraer en UTC para evitar desfase
    const d = new Date(dateStr)
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
  }

  const handleEdit = (field) => {
    setEditingFieldId(field.fieldId)
    setEditForm({
      monthlyFee: field.monthlyFee || '',
      dueDay: field.dueDay || 10,
      effectiveFrom: toDateInputValue(field.effectiveFrom) || toDateInputValue(new Date()),
      isActive: field.isActive,
    })
  }

  const handleSave = async (fieldId, fieldName, adminId, adminName) => {
    if (!editForm.monthlyFee || editForm.monthlyFee <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El monto mensual debe ser mayor a 0',
      })
      return
    }

    if (editForm.dueDay < 1 || editForm.dueDay > 31) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El día de vencimiento debe estar entre 1 y 31',
      })
      return
    }

    try {
      setIsLoading(true)

      // Guardar en la base de datos
      const configData = {
        field_id: fieldId,
        admin_id: adminId,
        monthly_fee: parseFloat(editForm.monthlyFee),
        due_day: parseInt(editForm.dueDay),
        effective_from: editForm.effectiveFrom || null,
        is_active: editForm.isActive,
      }

      await upsertPaymentConfigAPI(configData, token)

      // También guardar en localStorage para mantener sincronización
      setPaymentConfig(fieldId, {
        fieldName,
        adminId,
        adminName,
        monthlyFee: parseFloat(editForm.monthlyFee),
        dueDay: parseInt(editForm.dueDay),
        isActive: editForm.isActive,
        updatedAt: new Date().toISOString(),
      })

      Swal.fire({
        icon: 'success',
        title: 'Configuración guardada',
        text: `Se configuró el pago para ${fieldName}`,
        timer: 2000,
        showConfirmButton: false,
      })

      setEditingFieldId(null)
      await loadConfigs()
    } catch (error) {
      console.error('Error guardando configuración:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar la configuración',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingFieldId(null)
    setEditForm({
      monthlyFee: '',
      dueDay: 10,
      effectiveFrom: '',
      isActive: true,
    })
  }

  const toggleActive = async (fieldId, currentStatus) => {
    const configData = configs.find((c) => c.fieldId === fieldId)

    if (!configData || !configData.hasConfig) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin configuración',
        text: 'Primero debes configurar el monto y día de pago',
      })
      return
    }

    try {
      setIsLoading(true)

      // Actualizar en la base de datos
      const updateData = {
        field_id: fieldId,
        admin_id: configData.adminId,
        monthly_fee: configData.monthlyFee,
        due_day: configData.dueDay,
        is_active: !currentStatus,
      }

      await upsertPaymentConfigAPI(updateData, token)

      // También actualizar localStorage
      const config = getPaymentConfig(fieldId)
      if (config) {
        setPaymentConfig(fieldId, {
          ...config,
          isActive: !currentStatus,
        })
      }

      await loadConfigs()

      Swal.fire({
        icon: 'success',
        title: !currentStatus ? 'Activado' : 'Desactivado',
        text: !currentStatus ? 'El cobro mensual está activo' : 'El cobro mensual está desactivado',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Error actualizando estado:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Configuración de Pagos</h2>
              <p className="text-primary-100 text-sm mt-1">
                Configura el monto mensual y día de vencimiento para cada cancha
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMethodsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            <span className="hidden sm:inline">Mis Cuentas</span>
          </button>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">ℹ️</div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">¿Cómo funciona?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • Configura el <strong>monto mensual</strong> que cada cancha debe pagar
              </li>
              <li>
                • Define el <strong>día de vencimiento</strong> (entre 1 y 31; en meses más
                cortos se ajusta automáticamente al último día)
              </li>
              <li>• Activa el cobro cuando esté listo</li>
              <li>• Los pagos se generarán automáticamente cada mes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tabla de configuraciones */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Cancha
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Administrador
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Inicio Vigencia
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Monto Mensual
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Día Vencimiento
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {configs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">No hay canchas registradas</p>
                    <p className="text-sm">Las canchas aparecerán aquí cuando se registren</p>
                  </td>
                </tr>
              ) : (
                configs.map((config) => (
                  <tr key={config.fieldId} className="hover:bg-gray-50 transition-colors">
                    {/* Nombre de cancha */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{config.fieldName}</div>
                    </td>

                    {/* Administrador */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{config.adminName}</div>
                    </td>

                    {/* Fecha de Inicio de Vigencia */}
                    <td className="px-6 py-4">
                      {editingFieldId === config.fieldId ? (
                        <input
                          type="date"
                          value={editForm.effectiveFrom}
                          onChange={(e) =>
                            setEditForm({ ...editForm, effectiveFrom: e.target.value })
                          }
                          className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {config.effectiveFrom
                              ? (() => {
                                  // Parsear en UTC para evitar desfase de timezone
                                  const dateStr = toDateInputValue(config.effectiveFrom)
                                  const [y, m, d] = dateStr.split('-').map(Number)
                                  const date = new Date(Date.UTC(y, m - 1, d))
                                  return date.toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    timeZone: 'UTC',
                                  })
                                })()
                              : '-'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Monto Mensual */}
                    <td className="px-6 py-4">
                      {editingFieldId === config.fieldId ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">S/.</span>
                          <input
                            type="number"
                            value={editForm.monthlyFee}
                            onChange={(e) =>
                              setEditForm({ ...editForm, monthlyFee: e.target.value })
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="100"
                            min="0"
                            step="10"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-gray-900">
                            {config.monthlyFee > 0
                              ? `S/. ${Number(config.monthlyFee).toFixed(2)}`
                              : '-'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Día de vencimiento */}
                    <td className="px-6 py-4">
                      {editingFieldId === config.fieldId ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={editForm.dueDay}
                            onChange={(e) => setEditForm({ ...editForm, dueDay: e.target.value })}
                            className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            min="1"
                            max="31"
                          />
                          <span className="text-sm text-gray-500">de cada mes</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">
                            {config.dueDay > 0 ? `Día ${config.dueDay}` : '-'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4 text-center">
                      {editingFieldId === config.fieldId ? (
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.isActive}
                            onChange={(e) =>
                              setEditForm({ ...editForm, isActive: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                        </label>
                      ) : (
                        <button
                          onClick={() => toggleActive(config.fieldId, config.isActive)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            config.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          disabled={!config.hasConfig}
                        >
                          <Power className="w-3 h-3" />
                          {config.isActive ? 'Activo' : 'Inactivo'}
                        </button>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-center">
                      {editingFieldId === config.fieldId ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleSave(
                                config.fieldId,
                                config.fieldName,
                                config.adminId,
                                config.adminName
                              )
                            }
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                            title="Guardar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(config)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Edit2 className="w-3 h-3" />
                          {config.hasConfig ? 'Editar' : 'Configurar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Total Canchas</div>
          <div className="text-2xl font-bold text-gray-900">{configs.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Configuradas</div>
          <div className="text-2xl font-bold text-blue-600">
            {configs.filter((c) => c.hasConfig).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600 mb-1">Activas</div>
          <div className="text-2xl font-bold text-green-600">
            {configs.filter((c) => c.isActive).length}
          </div>
        </div>
      </div>

      {/* Modal Mis Cuentas de Cobro */}
      {showMethodsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Mis Cuentas de Cobro</h3>
              <button
                onClick={() => setShowMethodsModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Formulario */}
              <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                <input
                  type="text"
                  placeholder="Nombre (ej: Yape, BCP)"
                  value={methodForm.name}
                  onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Número de cuenta o celular"
                  value={methodForm.account_number}
                  onChange={(e) => setMethodForm({ ...methodForm, account_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Titular (opcional)"
                  value={methodForm.account_holder}
                  onChange={(e) => setMethodForm({ ...methodForm, account_holder: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
                <button
                  onClick={saveMethod}
                  disabled={isSavingMethod}
                  className="w-full py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSavingMethod ? (
                    <>Guardando...</>
                  ) : editingMethodId ? (
                    <>
                      <Check className="w-4 h-4" /> Actualizar
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Agregar
                    </>
                  )}
                </button>
                {editingMethodId && (
                  <button
                    onClick={() => {
                      setEditingMethodId(null)
                      setMethodForm({ name: '', account_number: '', account_holder: '' })
                    }}
                    className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>
              {/* Lista */}
              <div className="space-y-2">
                {paymentMethods.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">
                    No hay cuentas configuradas
                  </p>
                ) : (
                  paymentMethods.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-gray-600">{m.account_number}</p>
                        {m.account_holder && (
                          <p className="text-xs text-gray-400">{m.account_holder}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingMethodId(m.id)
                            setMethodForm({
                              name: m.name,
                              account_number: m.account_number || '',
                              account_holder: m.account_holder || '',
                            })
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => deleteMethod(m.id)}
                          className="p-1.5 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentConfigModule
