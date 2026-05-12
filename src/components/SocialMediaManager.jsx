import React, { useState, useEffect } from 'react'
import { Save, X, Plus, Eye, EyeOff, Trash2, Edit2, AlertCircle } from 'lucide-react'
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaTiktok,
} from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { HiLink } from 'react-icons/hi'
import { motion } from 'framer-motion'
import useConfigStore from '../store/configStore'
import Swal from 'sweetalert2'

// Map de iconos disponibles - íconos oficiales de redes sociales
const iconMap = {
  Facebook: FaFacebookF,
  Instagram: FaInstagram,
  Twitter: FaXTwitter,
  MessageCircle: FaWhatsapp,
  Youtube: FaYoutube,
  Music: FaTiktok,
  LinkIcon: HiLink,
}

const iconOptions = [
  { value: 'Facebook', label: 'Facebook', icon: FaFacebookF },
  { value: 'Instagram', label: 'Instagram', icon: FaInstagram },
  { value: 'Twitter', label: 'Twitter/X', icon: FaXTwitter },
  { value: 'MessageCircle', label: 'WhatsApp', icon: FaWhatsapp },
  { value: 'Youtube', label: 'YouTube', icon: FaYoutube },
  { value: 'Music', label: 'TikTok', icon: FaTiktok },
  { value: 'LinkIcon', label: 'Otro', icon: HiLink },
]

const SocialMediaManager = () => {
  const {
    socialMedia,
    updateSocialMedia,
    addSocialMedia,
    removeSocialMedia,
    toggleSocialMedia,
    fetchSocialMedia,
  } = useConfigStore()
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    url: '',
    icon: 'LinkIcon',
    color: '#22c55e',
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '',
    url: '',
    icon: 'LinkIcon',
    color: '#22c55e',
    isPhone: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // Cargar redes sociales al montar el componente
  useEffect(() => {
    const loadSocialMedia = async () => {
      setIsLoading(true)
      try {
        await fetchSocialMedia()
      } catch (error) {
        console.error('Error al cargar redes sociales:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSocialMedia()
  }, [])

  const handleEdit = (social) => {
    setEditingId(social.id)
    setEditForm({
      name: social.name,
      url: social.url,
      icon: social.icon,
      color: social.color,
    })
  }

  const handleSaveEdit = async (id) => {
    try {
      setIsLoading(true)
      await updateSocialMedia(id, editForm)
      setEditingId(null)
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'La red social se ha actualizado correctamente',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar la red social',
        confirmButtonColor: '#22c55e',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', url: '', icon: 'LinkIcon', color: '#22c55e' })
  }

  const handleAdd = async () => {
    // Guard de re-entrancy: evita que múltiples clicks generen duplicados
    if (isAdding) return

    if (!addForm.name || !addForm.url) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos Incompletos',
        text: 'Por favor completa el nombre y la URL',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    try {
      setIsAdding(true)
      setIsLoading(true)
      await addSocialMedia(addForm)
      setAddForm({ name: '', url: '', icon: 'LinkIcon', color: '#22c55e', isPhone: false })
      setShowAddForm(false)

      Swal.fire({
        icon: 'success',
        title: '¡Agregada!',
        text: 'La red social se ha agregado correctamente',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo agregar la red social',
        confirmButtonColor: '#22c55e',
      })
    } finally {
      setIsLoading(false)
      setIsAdding(false)
    }
  }

  const handleDelete = (id, name) => {
    Swal.fire({
      icon: 'warning',
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar ${name}?`,
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setIsLoading(true)
          await removeSocialMedia(id)
          Swal.fire({
            icon: 'success',
            title: '¡Eliminada!',
            text: 'La red social se ha eliminado correctamente',
            timer: 2000,
            showConfirmButton: false,
          })
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo eliminar la red social',
            confirmButtonColor: '#22c55e',
          })
        } finally {
          setIsLoading(false)
        }
      }
    })
  }

  const handleToggle = async (id, name, enabled) => {
    try {
      setIsLoading(true)
      await toggleSocialMedia(id)
      Swal.fire({
        icon: 'success',
        title: enabled ? '¡Desactivada!' : '¡Activada!',
        text: `${name} se ha ${enabled ? 'desactivado' : 'activado'} correctamente`,
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo cambiar el estado',
        confirmButtonColor: '#22c55e',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Redes Sociales</h2>
          <p className="text-secondary-600 mt-1">Gestiona los enlaces a tus redes sociales</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Red Social</span>
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md border-2 border-primary-300 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">Nueva Red Social</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-secondary-400 hover:text-secondary-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Nombre</label>
              <input
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                placeholder="Ej: LinkedIn"
                className="w-full px-4 py-2 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Ícono</label>
              <select
                value={addForm.icon}
                onChange={(e) => setAddForm({ ...addForm, icon: e.target.value })}
                className="w-full px-4 py-2 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                {iconOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                URL o Teléfono
              </label>
              <input
                type="text"
                value={addForm.url}
                onChange={(e) => setAddForm({ ...addForm, url: e.target.value })}
                placeholder="https://... o 51999888777"
                className="w-full px-4 py-2 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Color</label>
              <input
                type="color"
                value={addForm.color}
                onChange={(e) => setAddForm({ ...addForm, color: e.target.value })}
                className="w-full h-10 px-2 py-1 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPhone"
              checked={addForm.isPhone}
              onChange={(e) => setAddForm({ ...addForm, isPhone: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isPhone" className="text-sm text-secondary-700">
              Es un número de WhatsApp
            </label>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleAdd}
              disabled={isAdding}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isAdding ? 'Guardando...' : 'Guardar'}</span>
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              disabled={isAdding}
              className="bg-secondary-200 hover:bg-secondary-300 text-secondary-700 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      )}

      {/* List of Social Media */}
      <div className="grid md:grid-cols-2 gap-6">
        {socialMedia.map((social) => {
          const Icon = iconMap[social.icon] || HiLink
          const isEditing = editingId === social.id

          return (
            <div
              key={social.id}
              className={`bg-white rounded-xl shadow-md border-2 p-6 transition-all ${
                social.enabled ? 'border-secondary-200' : 'border-secondary-100 opacity-60'
              }`}
            >
              {isEditing ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      URL o Teléfono
                    </label>
                    <input
                      type="text"
                      value={editForm.url}
                      onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Ícono
                      </label>
                      <select
                        value={editForm.icon}
                        onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      >
                        {iconOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Color
                      </label>
                      <input
                        type="color"
                        value={editForm.color}
                        onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                        className="w-full h-10 px-2 py-1 border-2 border-secondary-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveEdit(social.id)}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-secondary-200 hover:bg-secondary-300 text-secondary-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: social.color + '20' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: social.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-secondary-900">{social.name}</h3>
                        <p className="text-xs text-secondary-500">
                          {social.enabled ? 'Activa' : 'Inactiva'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggle(social.id, social.name, social.enabled)}
                      className={`p-2 rounded-lg transition-all ${
                        social.enabled
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-secondary-100 text-secondary-400 hover:bg-secondary-200'
                      }`}
                      title={social.enabled ? 'Desactivar' : 'Activar'}
                    >
                      {social.enabled ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-secondary-600 break-all">{social.url}</p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(social)}
                      className="flex-1 bg-primary-100 hover:bg-primary-200 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(social.id, social.name)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {socialMedia.length === 0 && (
        <div className="bg-secondary-50 border-2 border-dashed border-secondary-300 rounded-xl p-12 text-center">
          <p className="text-secondary-600 mb-4">No hay redes sociales configuradas</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Primera Red Social</span>
          </button>
        </div>
      )}

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Información:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Los enlaces aparecerán en el footer del sitio</li>
              <li>Puedes activar/desactivar redes sin eliminarlas</li>
              <li>Las redes desactivadas no se mostrarán en el sitio</li>
              <li>Para WhatsApp, ingresa el número en formato internacional (51999888777)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SocialMediaManager
