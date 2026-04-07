import React, { useState, useEffect } from 'react'
import { MessageCircle, Phone, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import useAuthStore from '../store/authStore'
import useFieldStore from '../store/modules/fieldStore'
import { updateFieldAPI } from '../services/field/fieldService'
import Swal from 'sweetalert2'

const WhatsAppConfigModule = () => {
  const { user, token } = useAuthStore()
  const { fields, loadFields, updateFieldLocal } = useFieldStore()

  const [fieldPhones, setFieldPhones] = useState({})
  const [savingFields, setSavingFields] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  // Filtrar canchas del admin actual
  const getAdminFields = () => {
    if (!user || !fields) return []

    if (user.role === 'super_admin') {
      return fields
    }

    if (user.adminType === 'general') {
      return fields.filter((f) => f.adminId === user.id)
    }

    if (user.adminType === 'field' && user.managedFields) {
      return fields.filter((f) => user.managedFields.includes(f.id))
    }

    return fields.filter((f) => f.adminId === user.id)
  }

  // Cargar canchas al montar
  useEffect(() => {
    const loadData = async () => {
      if (!user || !token) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        await loadFields()
      } catch (error) {
        console.error('Error cargando canchas:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, token, loadFields])

  // Inicializar estados de los telefonos cuando cargan los campos
  useEffect(() => {
    if (!user || !fields) return

    const adminFields = (() => {
      if (user.role === 'super_admin') {
        return fields
      }
      if (user.adminType === 'general') {
        return fields.filter((f) => f.adminId === user.id)
      }
      if (user.adminType === 'field' && user.managedFields) {
        return fields.filter((f) => user.managedFields.includes(f.id))
      }
      return fields.filter((f) => f.adminId === user.id)
    })()

    const initialPhones = {}

    adminFields.forEach((field) => {
      // Extraer solo los 9 digitos (sin codigo de pais)
      const phone = field.phone || ''
      const cleanPhone = phone.replace(/\D/g, '')
      initialPhones[field.id] = cleanPhone.startsWith('51')
        ? cleanPhone.slice(2)
        : cleanPhone.slice(0, 9)
    })

    setFieldPhones(initialPhones)
  }, [fields, user])

  const handlePhoneChange = (fieldId, value) => {
    // Solo permitir numeros y maximo 9 digitos
    const onlyNumbers = value.replace(/\D/g, '').slice(0, 9)
    setFieldPhones((prev) => ({
      ...prev,
      [fieldId]: onlyNumbers,
    }))
  }

  const handleSavePhone = async (fieldId) => {
    const phone = fieldPhones[fieldId] || ''

    // Validar 9 digitos
    if (phone.length !== 9) {
      Swal.fire({
        icon: 'error',
        title: 'Numero Invalido',
        text: 'El numero debe tener exactamente 9 digitos',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    setSavingFields((prev) => ({ ...prev, [fieldId]: true }))

    try {
      // Guardar en el backend
      const updatedField = await updateFieldAPI(fieldId, { phone }, token)

      // Actualizar estado local
      updateFieldLocal(fieldId, updatedField)

      Swal.fire({
        icon: 'success',
        title: 'Guardado',
        text: 'El numero de WhatsApp se ha actualizado',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Error guardando telefono:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar el numero',
        confirmButtonColor: '#22c55e',
      })
    } finally {
      setSavingFields((prev) => ({ ...prev, [fieldId]: false }))
    }
  }

  const adminFields = getAdminFields()

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="text-gray-600">Cargando canchas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configuracion de WhatsApp</h2>
            <p className="text-sm text-gray-600">
              Configura el numero de WhatsApp de tus canchas. Los clientes seran redirigidos a este
              numero despues de completar una reserva.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Canchas Gestionadas</p>
              <p className="text-2xl font-bold text-gray-900">{adminFields.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Con WhatsApp Configurado</p>
              <p className="text-2xl font-bold text-gray-900">
                {adminFields.filter((f) => f.phone && f.phone.length >= 9).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Canchas */}
      <div className="space-y-4">
        {adminFields.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes canchas</h3>
            <p className="text-gray-600">
              Primero debes crear una cancha para configurar su numero de WhatsApp.
            </p>
          </div>
        ) : (
          adminFields.map((field) => {
            const currentPhone = fieldPhones[field.id] || ''
            const originalPhone = (field.phone || '').replace(/\D/g, '')
            const cleanOriginal = originalPhone.startsWith('51')
              ? originalPhone.slice(2)
              : originalPhone.slice(0, 9)
            const hasChanges = currentPhone !== cleanOriginal
            const isSaving = savingFields[field.id]
            const isValid = currentPhone.length === 9

            return (
              <div
                key={field.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
                    <p className="text-sm text-gray-500">
                      {field.distrito}, {field.provincia}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={currentPhone}
                        onChange={(e) => handlePhoneChange(field.id, e.target.value)}
                        placeholder="999888777"
                        className="w-48 pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">+51</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSavePhone(field.id)}
                      disabled={!hasChanges || !isValid || isSaving}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        hasChanges && isValid && !isSaving
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isSaving ? 'Guardando...' : 'Guardar'}
                    </button>
                  </div>
                </div>

                {currentPhone && currentPhone.length !== 9 && (
                  <p className="mt-2 text-xs text-amber-600">
                    El numero debe tener 9 digitos ({currentPhone.length}/9)
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Informacion */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <h4 className="font-semibold mb-2">Informacion importante:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                El numero de WhatsApp se usara para que los clientes te contacten despues de
                reservar
              </li>
              <li>Cada cancha puede tener su propio numero de contacto</li>
              <li>
                Los clientes veran un boton "Finalizar" que abrira WhatsApp con los datos de su
                reserva
              </li>
              <li>Asegurate de que el numero este activo en WhatsApp para recibir mensajes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhatsAppConfigModule
