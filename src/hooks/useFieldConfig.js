import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { INITIAL_CONFIG, getSuggestedCapacity } from '../utils/field-config/fieldConfigConstants'
import {
  createMaintenanceItem,
  createSpecialPricingItem,
  validateImageUrl,
} from '../utils/field-config/fieldConfigHelpers'
import { API_CONFIG, getToken } from '../config/api.config'
import { fetchImagesByField, deleteFieldImageAPI } from '../services/fieldImages/fieldImagesService'
import { fetchFieldConfig, updateFieldConfig } from '../services/fieldConfig'
import useFieldStore from '../store/modules/fieldStore'

const useFieldConfig = (field, isOpen, onClose, onSave) => {
  const [config, setConfig] = useState(INITIAL_CONFIG)
  const [activeTab, setActiveTab] = useState('schedule')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadFieldData = async () => {
      if (isOpen && field) {
        try {
          // Obtener token
          const token = getToken()

          // Cargar configuración completa desde la base de datos
          let loadedConfig = { ...INITIAL_CONFIG }
          try {
            const configData = await fetchFieldConfig(field.id, token)
            loadedConfig = {
              ...INITIAL_CONFIG,
              ...configData,
              schedule: configData.schedule || INITIAL_CONFIG.schedule,
              maintenanceSchedule: configData.maintenanceSchedule || [],
              specialPricing: configData.specialPricing || [],
              amenities: configData.amenities || [],
              rules: configData.rules || [],
              capacity: configData.capacity || 22,
              fieldType: configData.fieldType || 'football',
              isActive: configData.isActive !== undefined ? configData.isActive : true,
              equipment: configData.equipment || {},
              cancellationPolicy:
                configData.cancellationPolicy || INITIAL_CONFIG.cancellationPolicy,
              requiresManualConfirmation:
                configData.requiresManualConfirmation ??
                field.requiresManualConfirmation ??
                false,
            }
          } catch (configError) {
            console.warn(
              'Error al cargar configuración de la cancha, usando datos del campo:',
              configError
            )
            // Fallback a datos del campo si falla la carga de configuración
            loadedConfig = {
              ...INITIAL_CONFIG,
              schedule: field.schedule || INITIAL_CONFIG.schedule,
              maintenanceSchedule: field.maintenanceSchedule || [],
              specialPricing: field.specialPricing || [],
              amenities: field.amenities || [],
              rules: field.rules || [],
              capacity: field.capacity || 22,
              fieldType: field.fieldType || 'football',
              isActive: field.isActive !== undefined ? field.isActive : true,
              equipment: field.equipment || {},
              cancellationPolicy: field.cancellationPolicy || INITIAL_CONFIG.cancellationPolicy,
              requiresManualConfirmation: field.requiresManualConfirmation ?? false,
            }
          }

          // Cargar imágenes desde la base de datos
          let loadedImages = []
          try {
            const images = await fetchImagesByField(field.id, token)
            // Extraer solo las URLs ordenadas por order_index
            loadedImages = images
              .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
              .map((img) => img.image_url)
          } catch (imageError) {
            console.warn('Error al cargar imágenes de la cancha:', imageError)
            // Continuar con array vacío si falla
          }

          setConfig({
            ...loadedConfig,
            customImages: loadedImages,
          })
          setActiveTab('schedule')
        } catch (error) {
          console.error('Error al cargar datos de la cancha:', error)
          // Cargar configuración por defecto en caso de error
          setConfig({ ...INITIAL_CONFIG })
        }
      }
    }

    loadFieldData()
  }, [isOpen, field])

  const handleScheduleChange = (day, field, value) => {
    setConfig((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value,
        },
      },
    }))
  }

  const handleAddMaintenance = () => {
    const newMaintenance = createMaintenanceItem()
    setConfig((prev) => ({
      ...prev,
      maintenanceSchedule: [...prev.maintenanceSchedule, newMaintenance],
    }))
  }

  const handleUpdateMaintenance = (id, field, value) => {
    setConfig((prev) => ({
      ...prev,
      maintenanceSchedule: prev.maintenanceSchedule.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }))
  }

  const handleRemoveMaintenance = (id) => {
    setConfig((prev) => ({
      ...prev,
      maintenanceSchedule: prev.maintenanceSchedule.filter((item) => item.id !== id),
    }))
  }

  const handleAddSpecialPrice = () => {
    const newPricing = createSpecialPricingItem()
    setConfig((prev) => ({
      ...prev,
      specialPricing: [...prev.specialPricing, newPricing],
    }))
  }

  const handleUpdateSpecialPrice = (id, field, value) => {
    setConfig((prev) => ({
      ...prev,
      specialPricing: prev.specialPricing.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }))
  }

  const handleRemoveSpecialPrice = (id) => {
    setConfig((prev) => ({
      ...prev,
      specialPricing: prev.specialPricing.filter((item) => item.id !== id),
    }))
  }

  /**
   * Activa/desactiva una amenidad del catálogo en la configuración.
   * El state guarda objetos {key,label,icon_name,color_class} para que el
   * GeneralTab pueda render directamente.
   */
  const handleToggleAmenity = (key, isChecked) => {
    setConfig((prev) => {
      const current = Array.isArray(prev.amenities) ? prev.amenities : []
      if (isChecked) {
        if (current.some((a) => a?.key === key)) return prev
        return { ...prev, amenities: [...current, { key }] }
      }
      return { ...prev, amenities: current.filter((a) => a?.key !== key) }
    })
  }

  const handleAddRule = async () => {
    const { value: rule } = await Swal.fire({
      title: 'Nueva Regla',
      html: `
        <div class="text-left">
          <p class="text-sm text-gray-600 mb-4">Define una regla o norma para el uso de tu cancha</p>
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p class="text-xs text-amber-800 font-medium mb-2">Ejemplos de reglas:</p>
            <ul class="text-xs text-amber-700 space-y-1">
              <li>• No se permiten tacos metálicos</li>
              <li>• Prohibido fumar en las instalaciones</li>
              <li>• Respetar los horarios de reserva</li>
              <li>• Cuidar las instalaciones y equipamiento</li>
              <li>• No consumir alcohol durante el juego</li>
            </ul>
          </div>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Ej: No se permiten tacos metálicos',
      showCancelButton: true,
      confirmButtonText:
        '<span style="display: flex; align-items: center; gap: 8px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Agregar</span>',
      cancelButtonText:
        '<span style="display: flex; align-items: center; gap: 8px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Cancelar</span>',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#64748b',
      showCloseButton: true,
      allowEscapeKey: true,
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-xl font-bold text-gray-800',
        htmlContainer: 'text-gray-700',
        confirmButton:
          'rounded-lg px-6 py-2.5 font-medium transition-all duration-200 hover:shadow-lg',
        cancelButton:
          'rounded-lg px-6 py-2.5 font-medium transition-all duration-200 hover:shadow-lg',
        input:
          'rounded-lg border-2 border-gray-200 px-4 py-3 text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all',
      },
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Por favor ingresa una regla válida'
        }
        if (value.trim().length < 5) {
          return 'La regla debe tener al menos 5 caracteres'
        }
        if (value.trim().length > 200) {
          return 'No puede exceder los 200 caracteres'
        }
      },
    })

    if (rule && rule.trim()) {
      setConfig((prev) => ({
        ...prev,
        rules: [...prev.rules, rule.trim()],
      }))

      // Mostrar confirmación
      Swal.fire({
        icon: 'success',
        title: 'Regla Agregada',
        text: `"${rule.trim()}" ha sido agregada exitosamente`,
        timer: 2000,
        showConfirmButton: false,
        showCloseButton: true,
        allowEscapeKey: true,
        toast: true,
        position: 'top-end',
      })
    }
  }

  const handleRemoveRule = (index) => {
    setConfig((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index),
    }))
  }

  const handleAddCustomImage = async () => {
    const { value: imageUrl } = await Swal.fire({
      title: 'Agregar Imagen Personalizada',
      html: `
        <div class="text-left">
          <p class="text-sm text-gray-600 mb-4">Ingresa la URL de una imagen de tu cancha</p>
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <p class="text-xs text-purple-800 font-medium mb-2">Requisitos:</p>
            <ul class="text-xs text-purple-700 space-y-1">
              <li>• La URL debe comenzar con http:// o https://</li>
              <li>• Formatos admitidos: JPG, PNG, GIF, WebP</li>
              <li>• Se recomienda usar imágenes de buena calidad</li>
              <li>• Ejemplo: https://ejemplo.com/imagen.jpg</li>
            </ul>
          </div>
        </div>
      `,
      input: 'url',
      inputPlaceholder: 'https://ejemplo.com/imagen.jpg',
      showCancelButton: true,
      confirmButtonText:
        '<span style="display: flex; align-items: center; gap: 8px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Agregar</span>',
      cancelButtonText:
        '<span style="display: flex; align-items: center; gap: 8px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Cancelar</span>',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#64748b',
      showCloseButton: true,
      allowEscapeKey: true,
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-xl font-bold text-gray-800',
        htmlContainer: 'text-gray-700',
        confirmButton:
          'rounded-lg px-6 py-2.5 font-medium transition-all duration-200 hover:shadow-lg',
        cancelButton:
          'rounded-lg px-6 py-2.5 font-medium transition-all duration-200 hover:shadow-lg',
        input:
          'rounded-lg border-2 border-gray-200 px-4 py-3 text-base focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all',
      },
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Por favor ingresa una URL'
        }
        if (!validateImageUrl(value)) {
          return 'La URL no es válida. Debe comenzar con http:// o https:// y terminar en .jpg, .jpeg, .png, .gif o .webp'
        }
      },
    })

    if (imageUrl && imageUrl.trim()) {
      setConfig((prev) => ({
        ...prev,
        customImages: [...prev.customImages, imageUrl.trim()],
      }))

      // Mostrar confirmación con preview de la imagen
      Swal.fire({
        icon: 'success',
        title: 'Imagen Agregada',
        html: `
          <p class="text-sm text-gray-600 mb-3">La imagen ha sido agregada exitosamente</p>
          <div class="rounded-lg overflow-hidden border-2 border-green-200">
            <img src="${imageUrl.trim()}" alt="Preview" class="w-full h-auto" style="max-height: 200px; object-fit: cover;" />
          </div>
        `,
        timer: 3000,
        showConfirmButton: false,
        showCloseButton: true,
        allowEscapeKey: true,
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
        },
      })
    }
  }

  // NUEVA función para subir archivo físico
  const handleUploadCustomImage = async (file) => {
    try {
      // Mostrar loading
      Swal.fire({
        title: 'Subiendo imagen...',
        html: `
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p class="text-sm text-gray-600">Procesando archivo: ${file.name}</p>
            <p class="text-xs text-gray-500 mt-2">Tamaño: ${(file.size / 1024).toFixed(2)} KB</p>
          </div>
        `,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading()
        },
      })

      // Crear FormData
      const formData = new FormData()
      formData.append('image', file)
      formData.append('field_id', field.id)
      formData.append('category', 'general')
      formData.append('is_primary', 'false')

      // Obtener token
      const token = getToken()

      // Llamar a API de upload
      const response = await fetch(API_CONFIG.FIELD_IMAGES.UPLOAD, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          // NO agregar Content-Type, FormData lo establece automáticamente
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir imagen')
      }

      // Agregar URL de la imagen al estado local
      setConfig((prev) => ({
        ...prev,
        customImages: [...prev.customImages, data.data.image_url],
      }))

      // Mostrar éxito con preview
      Swal.fire({
        icon: 'success',
        title: 'Imagen Subida',
        html: `
          <p class="text-sm text-gray-600 mb-3">
            La imagen ha sido subida y guardada exitosamente
          </p>
          <div class="rounded-lg overflow-hidden border-2 border-green-200">
            <img
              src="${data.data.full_url}"
              alt="Preview"
              class="w-full h-auto"
              style="max-height: 200px; object-fit: cover;"
            />
          </div>
          <div class="mt-3 text-xs text-gray-500">
            <p>Nombre: ${data.data.filename}</p>
            <p>Tamaño: ${(data.data.size / 1024).toFixed(2)} KB</p>
          </div>
        `,
        timer: 4000,
        showConfirmButton: true,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#22c55e',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
        },
      })
    } catch (error) {
      console.error('Error al subir imagen:', error)

      Swal.fire({
        icon: 'error',
        title: 'Error al Subir Imagen',
        text: error.message || 'Ocurrió un error al procesar la imagen',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#22c55e',
      })
    }
  }

  const handleRemoveCustomImage = async (index) => {
    try {
      const imageToRemove = config.customImages[index]

      // Confirmar eliminación
      const result = await Swal.fire({
        title: '¿Eliminar imagen?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
        },
      })

      if (result.isConfirmed) {
        // Si es una imagen gestionada (proxy /api/media, Wasabi o legacy /uploads), eliminar de BD
        if (
          imageToRemove.startsWith('/api/media/') ||
          imageToRemove.includes('wasabisys.com') ||
          imageToRemove.startsWith('/uploads/')
        ) {
          try {
            // Obtener todas las imágenes para encontrar el ID
            const token = getToken()
            const images = await fetchImagesByField(field.id, token)
            const imageRecord = images.find((img) => img.image_url === imageToRemove)

            if (imageRecord) {
              await deleteFieldImageAPI(imageRecord.id, token)
              console.log(`✅ Imagen ${imageRecord.id} eliminada de BD`)
            }
          } catch (error) {
            console.error('Error al eliminar de BD:', error)
            // Continuar con eliminación del state aunque falle BD
            Swal.fire({
              icon: 'warning',
              title: 'Advertencia',
              text: 'La imagen se eliminará de la vista pero hubo un error al eliminar del servidor',
              confirmButtonColor: '#22c55e',
            })
          }
        }

        // Eliminar del state local
        setConfig((prev) => ({
          ...prev,
          customImages: prev.customImages.filter((_, i) => i !== index),
        }))

        Swal.fire({
          icon: 'success',
          title: 'Imagen Eliminada',
          text: 'La imagen ha sido eliminada exitosamente',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
        })
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar la imagen',
        confirmButtonColor: '#22c55e',
      })
    }
  }

  const handleCancellationChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      cancellationPolicy: {
        ...prev.cancellationPolicy,
        [field]: value,
      },
    }))
  }

  const handleGeneralChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleFieldTypeChange = (newType) => {
    const suggestedCapacity = getSuggestedCapacity(newType)
    setConfig((prev) => ({
      ...prev,
      fieldType: newType,
      sportType: newType,
      capacity: suggestedCapacity,
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Obtener token
      const token = getToken()

      // Guardar configuración en la base de datos y obtener respuesta con status actualizado
      const backendResponse = await updateFieldConfig(field.id, config, token)

      // También llamar a onSave para actualizar el estado local del store
      // IMPORTANTE: Usar el status del backend (puede haber cambiado a 'maintenance' si hay mantenimiento activo)
      const updatedField = {
        ...field,
        ...config,
        // El status del backend tiene prioridad (refleja cambios por mantenimiento en curso)
        status: backendResponse?.status || field.status,
        // ✅ FIX: Asegurar que cancellationPolicy se actualiza correctamente
        cancellationPolicy: config.cancellationPolicy ||
          backendResponse?.cancellationPolicy || {
            allowCancellation: true,
            hoursBeforeEvent: 24,
            refundPercentage: 0,
          },
        updatedAt: new Date().toISOString(),
      }

      console.log('💾 [SAVE_CONFIG] Guardando configuración con cancellationPolicy:', {
        fieldId: field.id,
        fieldName: field.name,
        cancellationPolicy: updatedField.cancellationPolicy,
      })

      await onSave(field.id, updatedField)

      // Resincronizar canchas desde el backend para que el store refleje el
      // status efectivo, los maintenanceSchedules (plural) reales y cualquier
      // otra derivación que solo el backend conoce. Sin esto, la landing puede
      // quedar viendo un snapshot stale del optimistic merge anterior.
      try {
        await useFieldStore.getState().loadFields()
      } catch (refreshError) {
        console.warn('No se pudo resincronizar canchas tras guardar config:', refreshError)
      }

      Swal.fire({
        icon: 'success',
        title: 'Configuración Guardada',
        text: `La configuración de ${field.name} ha sido actualizada correctamente en la base de datos`,
        timer: 2000,
        showConfirmButton: false,
        showCloseButton: true,
        allowEscapeKey: true,
      })

      onClose()
    } catch (error) {
      console.error('Error al guardar configuración:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar la configuración',
        confirmButtonColor: '#22c55e',
        showCloseButton: true,
        allowEscapeKey: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    config,
    activeTab,
    setActiveTab,
    isLoading,
    handleScheduleChange,
    handleAddMaintenance,
    handleUpdateMaintenance,
    handleRemoveMaintenance,
    handleAddSpecialPrice,
    handleUpdateSpecialPrice,
    handleRemoveSpecialPrice,
    handleToggleAmenity,
    handleAddRule,
    handleRemoveRule,
    handleAddCustomImage,
    handleUploadCustomImage,
    handleRemoveCustomImage,
    handleCancellationChange,
    handleGeneralChange,
    handleFieldTypeChange,
    handleSave,
  }
}

export default useFieldConfig
