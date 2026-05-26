import React, { useState, useEffect } from 'react'
import {
  Trophy,
  Plus,
  Edit3,
  Trash2,
  Search,
  Activity,
  X,
  Check,
  AlertCircle,
  Loader2,
  GripVertical,
} from 'lucide-react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion'
import useFieldStore from '../store/modules/fieldStore'
import useAuthStore from '../store/authStore'
import { fetchSportTypeFieldsCount } from '../services/sportTypes/sportTypesService'
import Swal from 'sweetalert2'

/**
 * Contenido visual de una fila de deporte (ícono, nombre, descripción, color y
 * acciones). Compartido entre la vista reordenable y la vista de búsqueda para
 * evitar duplicación de marcado.
 */
const SportRowContent = ({ sport, onEdit, onDelete, isSubmitting }) => (
  <>
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
      style={{ backgroundColor: (sport.color || '#22c55e') + '20' }}
    >
      {sport.icon || '⚽'}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-secondary-900 truncate">{sport.name}</h3>
      {sport.description && (
        <p className="text-sm text-secondary-600 truncate">{sport.description}</p>
      )}
    </div>
    <div
      className="w-5 h-5 rounded-full border-2 border-white shadow-sm flex-shrink-0"
      style={{ backgroundColor: sport.color || '#22c55e' }}
      title="Color del deporte"
    />
    <div className="flex gap-1 flex-shrink-0">
      <button
        onClick={() => onEdit(sport)}
        disabled={isSubmitting}
        className={`p-2 rounded-lg transition-colors ${
          isSubmitting ? 'text-secondary-400 cursor-not-allowed' : 'text-blue-600 hover:bg-blue-50'
        }`}
        title="Editar"
      >
        <Edit3 className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(sport)}
        disabled={isSubmitting}
        className={`p-2 rounded-lg transition-colors ${
          isSubmitting ? 'text-secondary-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'
        }`}
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </>
)

/**
 * Fila de deporte arrastrable. Usa un "handle" dedicado (GripVertical) para
 * iniciar el arrastre, de modo que los botones de editar/eliminar sigan siendo
 * clicables sin disparar el reordenamiento.
 */
const SortableSportItem = ({ sport, onEdit, onDelete, isSubmitting, onDragEnd }) => {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={sport}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
      className="list-none"
    >
      <div className="flex items-center gap-3 border border-secondary-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
        <button
          type="button"
          onPointerDown={(event) => dragControls.start(event)}
          className="cursor-grab active:cursor-grabbing touch-none p-1 text-secondary-400 hover:text-secondary-600"
          title="Arrastrar para reordenar"
          aria-label="Arrastrar para reordenar"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <SportRowContent
          sport={sport}
          onEdit={onEdit}
          onDelete={onDelete}
          isSubmitting={isSubmitting}
        />
      </div>
    </Reorder.Item>
  )
}

/**
 * SPORTS MANAGEMENT MODULE
 * Módulo de gestión de deportes completamente integrado con el backend.
 *
 * ✅ INTEGRADO CON APIs REALES:
 * - Carga inicial desde backend (loadSportTypes)
 * - Crear deportes (addSportType + API)
 * - Actualizar deportes (updateSportType + API)
 * - Eliminar deportes (deleteSportType + API con soft delete)
 * - Manejo de estados async (loading, errors)
 * - Validaciones frontend y backend
 */
const SportsManagementModule = () => {
  // ✅ USAR fieldStore QUE ESTÁ INTEGRADO CON BACKEND
  const {
    sportTypes,
    loadSportTypes,
    addSportType,
    updateSportType,
    deleteSportType,
    reorderSportTypes,
    isLoading,
  } = useFieldStore()

  // Estados locales del componente
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSport, setEditingSport] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    color: '#22c55e',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Orden local para el arrastre. Se sincroniza con el store; mantenerlo aparte
  // permite un arrastre fluido sin re-render por cada movimiento intermedio.
  const [orderedSports, setOrderedSports] = useState([])
  const [isSavingOrder, setIsSavingOrder] = useState(false)

  // Iconos disponibles para deportes
  const availableIcons = [
    { value: '⚽', label: 'Fútbol' },
    { value: '🏀', label: 'Básquet' },
    { value: '🏐', label: 'Vóley' },
    { value: '🎾', label: 'Tenis' },
    { value: '🏓', label: 'Ping Pong' },
    { value: '🏸', label: 'Bádminton' },
    { value: '🏑', label: 'Hockey' },
    { value: '🥅', label: 'Portería' },
    { value: '⚾', label: 'Béisbol' },
    { value: '🏈', label: 'Rugby' },
    { value: '🏃', label: 'Atletismo' },
    { value: '🤸', label: 'Gimnasia' },
    { value: '🥊', label: 'Boxeo' },
    { value: '🤼', label: 'Lucha' },
    { value: '🏟️', label: 'Estadio' },
    { value: '🎯', label: 'Target' },
    { value: '🏹', label: 'Arquería' },
    { value: '🛹', label: 'Skate' },
    { value: '🚴', label: 'Ciclismo' },
    { value: '🏊', label: 'Natación' },
  ]

  // Colores predefinidos
  const predefinedColors = [
    '#22c55e',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#6366f1',
  ]

  // ✅ CARGAR DEPORTES DESDE EL BACKEND AL MONTAR EL COMPONENTE
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Cargando deportes desde el backend...')
        await loadSportTypes()
        console.log('✅ Deportes cargados exitosamente')
      } catch (err) {
        console.error('❌ Error al cargar deportes:', err)
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar',
          text: 'No se pudieron cargar los deportes. Por favor, recarga la página.',
          confirmButtonColor: '#ef4444',
        })
      }
    }

    fetchData()
  }, []) // Solo ejecutar al montar

  // Mantener el orden local sincronizado con el store (carga, alta, edición,
  // eliminación o reordenamiento persistido actualizan sportTypes).
  useEffect(() => {
    if (Array.isArray(sportTypes)) {
      setOrderedSports(sportTypes)
    }
  }, [sportTypes])

  // Filtrar deportes según búsqueda
  const filteredSports = Array.isArray(sportTypes)
    ? sportTypes.filter((sport) => sport?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

  // Con búsqueda activa el arrastre se deshabilita para no romper el orden global.
  const isSearching = searchTerm.trim() !== ''

  // Actualiza el orden local mientras se arrastra (no persiste aún).
  const handleReorder = (newOrder) => {
    setOrderedSports(newOrder)
  }

  // Persiste el nuevo orden al soltar, solo si realmente cambió.
  const handlePersistOrder = async () => {
    const newIds = orderedSports.map((sport) => sport.id)
    const currentIds = sportTypes.map((sport) => sport.id)
    if (newIds.join(',') === currentIds.join(',')) return

    setIsSavingOrder(true)
    try {
      await reorderSportTypes(newIds)
    } catch (err) {
      console.error('❌ Error al reordenar deportes:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error al reordenar',
        text: err.message || 'No se pudo guardar el nuevo orden. Intenta nuevamente.',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setIsSavingOrder(false)
    }
  }

  const handleOpenAddModal = () => {
    setEditingSport(null)
    setFormData({
      name: '',
      icon: '⚽',
      description: '',
      color: '#22c55e',
    })
    setErrors({})
    setShowAddModal(true)
  }

  const handleOpenEditModal = (sport) => {
    setEditingSport(sport)
    setFormData({
      name: sport.name,
      icon: sport.icon || '⚽',
      description: sport.description || '',
      color: sport.color || '#22c55e',
    })
    setErrors({})
    setShowAddModal(true)
  }

  /**
   * ✅ VALIDACIÓN MEJORADA
   * Valida el formulario con reglas frontend
   */
  const validateForm = () => {
    const newErrors = {}

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'El nombre no puede exceder 50 caracteres'
    }

    // Validar icono
    if (!formData.icon) {
      newErrors.icon = 'Selecciona un icono'
    }

    // Validar color
    if (!formData.color) {
      newErrors.color = 'Selecciona un color'
    }

    // Verificar duplicados en estado local (validación rápida)
    if (!editingSport || editingSport.name.toLowerCase() !== formData.name.trim().toLowerCase()) {
      const isDuplicate = sportTypes.some(
        (s) =>
          s.name.toLowerCase() === formData.name.trim().toLowerCase() && s.id !== editingSport?.id
      )
      if (isDuplicate) {
        newErrors.name = 'Ya existe un deporte con este nombre'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * ✅ SUBMIT INTEGRADO CON BACKEND
   * Maneja tanto creación como actualización de deportes
   */
  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      if (editingSport) {
        // ✅ ACTUALIZAR DEPORTE EXISTENTE - LLAMADA AL BACKEND
        console.log('🔄 Actualizando deporte:', editingSport.id)

        await updateSportType(editingSport.id, {
          name: formData.name.trim(),
          icon: formData.icon,
          color: formData.color,
          description: formData.description.trim(),
          is_active: true,
          status: 'active',
        })

        console.log('✅ Deporte actualizado exitosamente')

        Swal.fire({
          icon: 'success',
          title: 'Deporte Actualizado',
          text: 'El deporte se ha actualizado exitosamente',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        // ✅ CREAR NUEVO DEPORTE - LLAMADA AL BACKEND
        console.log('🔄 Creando nuevo deporte:', formData.name)

        await addSportType({
          name: formData.name.trim(),
          icon: formData.icon,
          color: formData.color,
          description: formData.description.trim(),
          is_active: true,
          status: 'active',
        })

        console.log('✅ Deporte creado exitosamente')

        Swal.fire({
          icon: 'success',
          title: 'Deporte Creado',
          text: 'El nuevo deporte se ha creado exitosamente',
          timer: 2000,
          showConfirmButton: false,
        })
      }

      setShowAddModal(false)
      setFormData({
        name: '',
        icon: '⚽',
        description: '',
        color: '#22c55e',
      })
      setErrors({})
    } catch (err) {
      console.error('❌ Error al guardar deporte:', err)

      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: err.message || 'No se pudo guardar el deporte. Por favor, intenta nuevamente.',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * ✅ DELETE INTEGRADO CON BACKEND
   * Elimina un deporte (soft delete) en la base de datos.
   * Antes de confirmar, consulta cuántas canchas están asociadas para
   * mostrar un mensaje informativo al usuario.
   */
  const handleDelete = async (sport) => {
    // Consultar cuántas canchas usan este deporte para el mensaje informativo.
    // Si falla la consulta, continuamos con el flujo sin bloquear la eliminación.
    let fieldsCount = 0
    try {
      const token = useAuthStore.getState().token
      fieldsCount = await fetchSportTypeFieldsCount(sport.id, token)
    } catch (err) {
      console.warn('⚠️ No se pudo obtener el conteo de canchas asociadas:', err.message)
    }

    const infoMessage =
      fieldsCount > 0
        ? `<div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left">
             <p class="text-sm font-semibold text-amber-800 mb-1">
               ⚠️ Este deporte está asociado a ${fieldsCount} ${fieldsCount === 1 ? 'cancha registrada' : 'canchas registradas'}.
             </p>
             <p class="text-xs text-amber-700">
               Las canchas existentes conservarán su información y seguirán funcionando normalmente.
               El deporte dejará de estar disponible para asignar a nuevas canchas.
             </p>
           </div>`
        : `<p class="text-sm text-gray-600">Este deporte no está asociado a ninguna cancha.</p>`

    const result = await Swal.fire({
      title: '¿Eliminar Deporte?',
      html: `
        <div class="text-left">
          <p class="mb-2">¿Estás seguro de eliminar el deporte <strong>${sport.name}</strong>?</p>
          <p class="text-sm text-gray-600 mb-2">Esta acción marcará el deporte como inactivo en el sistema.</p>
          ${infoMessage}
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          // ✅ ELIMINAR DEPORTE - LLAMADA AL BACKEND (SOFT DELETE)
          console.log('🔄 Eliminando deporte:', sport.id)
          await deleteSportType(sport.id)
          console.log('✅ Deporte eliminado exitosamente')
          return true
        } catch (err) {
          console.error('❌ Error al eliminar deporte:', err)
          Swal.showValidationMessage(`Error: ${err.message || 'No se pudo eliminar el deporte'}`)
          return false
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    })

    if (result.isConfirmed) {
      Swal.fire({
        icon: 'success',
        title: 'Deporte Eliminado',
        text: 'El deporte se ha eliminado exitosamente',
        timer: 2000,
        showConfirmButton: false,
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-custom p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
              <Trophy className="w-7 h-7 text-primary-600" />
              Gestión de Deportes
              {isLoading && <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />}
            </h2>
            <p className="text-secondary-600 mt-1">
              Administra los deportes disponibles para las canchas
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              isLoading
                ? 'bg-secondary-300 cursor-not-allowed text-secondary-500'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            Nuevo Deporte
          </button>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Buscar deportes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary-900">{sportTypes.length}</p>
                <p className="text-sm text-primary-700">Total Deportes</p>
              </div>
              <Activity className="w-8 h-8 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de deportes */}
      <div className="bg-white rounded-xl shadow-custom overflow-hidden">
        {isLoading ? (
          // ✅ ESTADO DE CARGA
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-3" />
            <p className="text-secondary-600">Cargando deportes...</p>
          </div>
        ) : (isSearching ? filteredSports : orderedSports).length > 0 ? (
          <div className="p-6">
            {/* Aviso de reordenamiento / estado de guardado */}
            <div className="flex items-center justify-between mb-4 gap-3">
              {isSearching ? (
                <p className="text-sm text-secondary-500">
                  Limpia la búsqueda para reordenar los deportes.
                </p>
              ) : (
                <p className="text-sm text-secondary-500 flex items-center gap-2">
                  <GripVertical className="w-4 h-4 flex-shrink-0" />
                  Arrastra para cambiar el orden en que los deportes aparecen al reservar.
                </p>
              )}
              {isSavingOrder && (
                <span className="text-xs text-primary-600 flex items-center gap-1 flex-shrink-0">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Guardando orden...
                </span>
              )}
            </div>

            {isSearching ? (
              // Vista de búsqueda: lista estática (no arrastrable).
              <div className="space-y-3">
                {filteredSports.map((sport) => (
                  <div
                    key={sport.id}
                    className="flex items-center gap-3 border border-secondary-200 rounded-lg p-3 bg-white"
                  >
                    <SportRowContent
                      sport={sport}
                      onEdit={handleOpenEditModal}
                      onDelete={handleDelete}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                ))}
              </div>
            ) : (
              // Vista normal: lista arrastrable para definir el orden global.
              <Reorder.Group
                axis="y"
                values={orderedSports}
                onReorder={handleReorder}
                className="space-y-3"
              >
                {orderedSports.map((sport) => (
                  <SortableSportItem
                    key={sport.id}
                    sport={sport}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDelete}
                    isSubmitting={isSubmitting}
                    onDragEnd={handlePersistOrder}
                  />
                ))}
              </Reorder.Group>
            )}
          </div>
        ) : (
          // ✅ ESTADO VACÍO
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
            <p className="text-secondary-500">
              {searchTerm ? 'No se encontraron deportes' : 'No hay deportes registrados'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de agregar/editar */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-secondary-900">
                    {editingSport ? 'Editar Deporte' : 'Nuevo Deporte'}
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-secondary-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Nombre del Deporte *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        // Limpiar error al escribir
                        if (errors.name) {
                          setErrors({ ...errors, name: null })
                        }
                      }}
                      onBlur={() => {
                        // Validar al perder el foco
                        if (formData.name.trim() && formData.name.trim().length < 3) {
                          setErrors({
                            ...errors,
                            name: 'El nombre debe tener al menos 3 caracteres',
                          })
                        }
                      }}
                      maxLength={50}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 transition-colors ${
                        errors.name ? 'border-red-500 focus:ring-red-200' : 'border-secondary-300'
                      }`}
                      placeholder="Ej: Fútbol 11"
                      disabled={isSubmitting}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {errors.name && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name}
                        </p>
                      )}
                      <p className="text-xs text-secondary-500 ml-auto">
                        {formData.name.length}/50
                      </p>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Descripción (Opcional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      maxLength={200}
                      className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 transition-colors resize-none"
                      rows="3"
                      placeholder="Describe brevemente este deporte..."
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-secondary-500 text-right mt-1">
                      {formData.description.length}/200
                    </p>
                  </div>

                  {/* Icono */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Icono *
                    </label>
                    <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                      {availableIcons.map((icon) => (
                        <button
                          key={icon.value}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, icon: icon.value })
                            if (errors.icon) {
                              setErrors({ ...errors, icon: null })
                            }
                          }}
                          disabled={isSubmitting}
                          className={`p-3 text-2xl border-2 rounded-lg transition-all ${
                            formData.icon === icon.value
                              ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                              : 'border-secondary-200 hover:border-primary-300 hover:bg-primary-25'
                          } ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                          title={icon.label}
                        >
                          {icon.value}
                        </button>
                      ))}
                    </div>
                    {errors.icon && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.icon}
                      </p>
                    )}
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Color del Deporte *
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => {
                            setFormData({ ...formData, color: e.target.value })
                            if (errors.color) {
                              setErrors({ ...errors, color: null })
                            }
                          }}
                          disabled={isSubmitting}
                          className="w-20 h-10 border border-secondary-300 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, color })
                              if (errors.color) {
                                setErrors({ ...errors, color: null })
                              }
                            }}
                            disabled={isSubmitting}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              formData.color === color
                                ? 'border-secondary-900 ring-2 ring-offset-1 ring-secondary-300 scale-110'
                                : 'border-white hover:border-secondary-300 hover:scale-105'
                            } shadow-md ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    {errors.color && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.color}
                      </p>
                    )}
                  </div>

                  {/* Vista previa */}
                  <div className="bg-secondary-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-secondary-700 mb-2">Vista Previa:</p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: formData.color + '20' }}
                      >
                        {formData.icon || '⚽'}
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900">
                          {formData.name || 'Nombre del deporte'}
                        </p>
                        {formData.description && (
                          <p className="text-sm text-secondary-600">{formData.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                      isSubmitting
                        ? 'border-secondary-200 text-secondary-400 cursor-not-allowed'
                        : 'border-secondary-300 text-secondary-700 hover:bg-secondary-50'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                      isSubmitting
                        ? 'bg-primary-400 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700'
                    } text-white`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {editingSport ? 'Actualizar' : 'Crear'} Deporte
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SportsManagementModule
