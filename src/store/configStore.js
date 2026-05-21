import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { API_CONFIG, getAuthHeaders } from '../config/api.config'
import { resolveMediaUrl } from '../utils/mediaUrl'

// ========================================
// ESQUEMAS POR DEFECTO (solo imágenes y social — videos viven en BD vía useVideoTutorialsStore)
// ========================================

const defaultImages = {
  logo: {
    url: '/LOGO.png',
    alt: 'Logo Canchas Apurímac',
    type: 'url',
    category: 'header',
  },
  heroBackground: {
    url: '',
    alt: 'Fondo Hero',
    type: 'url',
    category: 'hero',
  },
  heroIllustration: {
    url: '',
    alt: 'Ilustración Hero',
    type: 'url',
    category: 'hero',
  },
  promoBanner: {
    url: '',
    alt: 'Banner Promocional',
    type: 'url',
    category: 'other',
  },
}

const defaultSocialMedia = [
  { id: 'facebook', name: 'Facebook', url: '', icon: 'Facebook', color: '#1877f2', enabled: false },
  { id: 'instagram', name: 'Instagram', url: '', icon: 'Instagram', color: '#e1306c', enabled: false },
  { id: 'twitter', name: 'Twitter', url: '', icon: 'Twitter', color: '#1da1f2', enabled: false },
  { id: 'whatsapp', name: 'WhatsApp', url: '', icon: 'MessageCircle', color: '#25d366', enabled: false, isPhone: true },
  { id: 'youtube', name: 'YouTube', url: '', icon: 'Youtube', color: '#ff0000', enabled: false },
  { id: 'tiktok', name: 'TikTok', url: '', icon: 'Music', color: '#000000', enabled: false },
]

const useConfigStore = create(
  persist(
    (set, get) => ({
      // ========================================
      // ESTADO INICIAL
      // ========================================
      images: defaultImages,
      socialMedia: defaultSocialMedia,
      contactInfo: {
        phone: '',
        email: '',
        location: 'Perú',
        address: '',
        scheduleWeekdays: 'Lunes - Domingo',
        scheduleHours: '5:00 PM - 12:00 AM',
      },
      isLoadingImages: false,
      isLoadingContact: false,
      error: null,

      // ========================================
      // ACCIONES PARA IMÁGENES
      // ========================================

      // Cargar configuración de imágenes desde el backend (site_config)
      fetchImagesFromBackend: async () => {
        set({ isLoadingImages: true, error: null })
        try {
          const response = await fetch(API_CONFIG.SITE_CONFIG.GET_ALL)

          if (!response.ok) {
            throw new Error('Error al cargar configuración del backend')
          }

          const data = await response.json()

          if (data.success) {
            const backendImages = {}

            Object.keys(data.data).forEach((key) => {
              if (data.data[key].url) {
                const imageUrl = resolveMediaUrl(data.data[key].url)
                backendImages[key] = {
                  url: imageUrl,
                  alt: data.data[key].alt || defaultImages[key]?.alt || key,
                  type: data.data[key].type || 'url',
                  category: defaultImages[key]?.category || 'other',
                  sport: defaultImages[key]?.sport,
                }
              }
            })

            set((state) => ({
              images: {
                ...state.images,
                ...backendImages,
              },
              isLoadingImages: false,
            }))

            return { images: backendImages }
          }
        } catch (error) {
          console.error('Error al cargar configuración:', error)
          set({
            error: error.message,
            isLoadingImages: false,
          })
        }
      },

      updateImage: (imageKey, imageData) => {
        set((state) => ({
          images: {
            ...state.images,
            [imageKey]: {
              ...state.images[imageKey],
              ...imageData,
            },
          },
        }))
      },

      // 🆕 Subir imagen al backend
      uploadImage: async (imageKey, file) => {
        set({ isLoadingImages: true, error: null })
        try {
          const formData = new FormData()
          formData.append('image', file)
          formData.append('key', imageKey)
          formData.append('alt', defaultImages[imageKey]?.alt || imageKey)

          const token = getAuthHeaders().Authorization.replace('Bearer ', '')

          const response = await fetch(API_CONFIG.SITE_CONFIG.UPLOAD_IMAGE, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Error al subir imagen')
          }

          if (data.success) {
            const imageUrl = resolveMediaUrl(data.data.url)
            set((state) => ({
              images: {
                ...state.images,
                [imageKey]: {
                  ...state.images[imageKey],
                  url: imageUrl,
                  type: 'upload',
                },
              },
              isLoadingImages: false,
            }))

            return data.data
          }
        } catch (error) {
          console.error('Error al subir imagen:', error)
          set({
            error: error.message,
            isLoadingImages: false,
          })
          throw error
        }
      },

      // 🆕 Actualizar imagen por URL (backend)
      updateImageUrl: async (imageKey, url) => {
        set({ isLoadingImages: true, error: null })
        try {
          const token = getAuthHeaders().Authorization.replace('Bearer ', '')

          const response = await fetch(API_CONFIG.SITE_CONFIG.UPDATE(imageKey), {
            method: 'PUT',
            headers: {
              ...API_CONFIG.DEFAULT_HEADERS,
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              url,
              alt: defaultImages[imageKey]?.alt || imageKey,
              type: 'url',
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Error al actualizar imagen')
          }

          if (data.success) {
            const imageUrl = resolveMediaUrl(data.data.url)

            // Actualizar store local
            set((state) => ({
              images: {
                ...state.images,
                [imageKey]: {
                  ...state.images[imageKey],
                  url: imageUrl,
                  type: 'url',
                },
              },
              isLoadingImages: false,
            }))

            return data.data
          }
        } catch (error) {
          console.error('Error al actualizar imagen:', error)
          set({
            error: error.message,
            isLoadingImages: false,
          })
          throw error
        }
      },

      // ========================================
      // OBTENER CONFIGURACIÓN
      // ========================================
      getImageUrl: (imageKey) => {
        return get().images[imageKey]?.url || ''
      },

      getAllImages: () => {
        return get().images
      },

      // ========================================
      // ACCIONES PARA REDES SOCIALES
      // ========================================

      // Cargar redes sociales desde el backend
      fetchSocialMedia: async () => {
        try {
          const response = await fetch(API_CONFIG.SOCIAL_MEDIA.GET_ALL)
          const data = await response.json()

          if (data.success && data.data) {
            // Mapear campos del backend al formato del frontend
            const mappedData = data.data.map((item) => ({
              id: item.id,
              name: item.platform,
              url: item.url || '',
              icon: item.icon || 'LinkIcon',
              color: item.color || '#22c55e',
              isPhone: item.is_phone || false,
              enabled: item.enabled !== false,
            }))
            set({ socialMedia: mappedData })
            return mappedData
          }
          return []
        } catch (error) {
          console.error('Error al cargar redes sociales:', error)
          return []
        }
      },

      // Cargar solo las redes habilitadas (para el footer público)
      fetchEnabledSocialMedia: async () => {
        try {
          const response = await fetch(API_CONFIG.SOCIAL_MEDIA.GET_ENABLED)
          const data = await response.json()

          if (data.success && data.data) {
            const mappedData = data.data.map((item) => ({
              id: item.id,
              name: item.platform,
              url: item.url || '',
              icon: item.icon || 'LinkIcon',
              color: item.color || '#22c55e',
              isPhone: item.is_phone || false,
              enabled: true,
            }))
            set({ socialMedia: mappedData })
            return mappedData
          }
          return []
        } catch (error) {
          console.error('Error al cargar redes sociales habilitadas:', error)
          return []
        }
      },

      updateSocialMedia: async (id, data) => {
        try {
          const token = getAuthHeaders().Authorization?.replace('Bearer ', '')

          const response = await fetch(API_CONFIG.SOCIAL_MEDIA.UPDATE(id), {
            method: 'PUT',
            headers: {
              ...API_CONFIG.DEFAULT_HEADERS,
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              platform: data.name,
              url: data.url,
              icon: data.icon,
              color: data.color,
              is_phone: data.isPhone,
              enabled: data.enabled,
            }),
          })

          const result = await response.json()

          if (result.success) {
            set((state) => ({
              socialMedia: state.socialMedia.map((item) =>
                item.id === id ? { ...item, ...data } : item
              ),
            }))
            return result
          }
          throw new Error(result.message || 'Error al actualizar')
        } catch (error) {
          console.error('Error al actualizar red social:', error)
          throw error
        }
      },

      addSocialMedia: async (newSocial) => {
        try {
          const token = getAuthHeaders().Authorization?.replace('Bearer ', '')

          const response = await fetch(API_CONFIG.SOCIAL_MEDIA.CREATE, {
            method: 'POST',
            headers: {
              ...API_CONFIG.DEFAULT_HEADERS,
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              platform: newSocial.name,
              url: newSocial.url,
              icon: newSocial.icon,
              color: newSocial.color,
              is_phone: newSocial.isPhone,
              enabled: true,
            }),
          })

          const result = await response.json()

          if (result.success) {
            const mappedItem = {
              id: result.data.id,
              name: result.data.platform,
              url: result.data.url || '',
              icon: result.data.icon || 'LinkIcon',
              color: result.data.color || '#22c55e',
              isPhone: result.data.is_phone || false,
              enabled: result.data.enabled !== false,
            }
            // El backend es idempotente: si la red ya existía devuelve el mismo id.
            // Evitar appendizar duplicados en el estado local cuando eso ocurre.
            set((state) => {
              const exists = state.socialMedia.some((item) => item.id === mappedItem.id)
              return {
                socialMedia: exists
                  ? state.socialMedia.map((item) => (item.id === mappedItem.id ? mappedItem : item))
                  : [...state.socialMedia, mappedItem],
              }
            })
            return result
          }
          throw new Error(result.message || 'Error al crear')
        } catch (error) {
          console.error('Error al agregar red social:', error)
          throw error
        }
      },

      removeSocialMedia: async (id) => {
        try {
          const token = getAuthHeaders().Authorization?.replace('Bearer ', '')

          const response = await fetch(API_CONFIG.SOCIAL_MEDIA.DELETE(id), {
            method: 'DELETE',
            headers: {
              ...API_CONFIG.DEFAULT_HEADERS,
              Authorization: `Bearer ${token}`,
            },
          })

          const result = await response.json()

          if (result.success) {
            set((state) => ({
              socialMedia: state.socialMedia.filter((item) => item.id !== id),
            }))
            return result
          }
          throw new Error(result.message || 'Error al eliminar')
        } catch (error) {
          console.error('Error al eliminar red social:', error)
          throw error
        }
      },

      toggleSocialMedia: async (id) => {
        try {
          const token = getAuthHeaders().Authorization?.replace('Bearer ', '')

          const response = await fetch(API_CONFIG.SOCIAL_MEDIA.TOGGLE(id), {
            method: 'PATCH',
            headers: {
              ...API_CONFIG.DEFAULT_HEADERS,
              Authorization: `Bearer ${token}`,
            },
          })

          const result = await response.json()

          if (result.success) {
            set((state) => ({
              socialMedia: state.socialMedia.map((item) =>
                item.id === id ? { ...item, enabled: result.data.enabled } : item
              ),
            }))
            return result
          }
          throw new Error(result.message || 'Error al cambiar estado')
        } catch (error) {
          console.error('Error al cambiar estado de red social:', error)
          throw error
        }
      },

      updateAllSocialMedia: (socialMediaData) => {
        set({ socialMedia: socialMediaData })
      },

      getSocialMedia: () => {
        return get().socialMedia
      },

      getEnabledSocialMedia: () => {
        return get().socialMedia.filter((item) => item.enabled && item.url)
      },

      // ========================================
      // ACCIONES PARA INFORMACIÓN DE CONTACTO
      // ========================================
      fetchContactInfo: async () => {
        set({ isLoadingContact: true })
        try {
          const response = await fetch(API_CONFIG.SITE_CONFIG.GET_BY_KEY('contact_info'))

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data) {
              let savedConfig = null

              // Compatibilidad: soportar formato nuevo (directo) y antiguo (en value como string)
              if (data.data.phone || data.data.email || data.data.location) {
                // Formato nuevo: datos directamente en data.data
                savedConfig = {
                  phone: data.data.phone || '',
                  email: data.data.email || '',
                  location: data.data.location || 'Perú',
                  address: data.data.address || '',
                  scheduleWeekdays: data.data.scheduleWeekdays || 'Lunes - Domingo',
                  scheduleHours: data.data.scheduleHours || '5:00 PM - 12:00 AM',
                }
              } else if (data.data.value) {
                // Formato antiguo: datos en value como JSON string
                try {
                  savedConfig = typeof data.data.value === 'string'
                    ? JSON.parse(data.data.value)
                    : data.data.value
                } catch (e) {
                  console.error('Error parseando configuración antigua:', e)
                }
              }

              if (savedConfig) {
                set((state) => ({
                  contactInfo: {
                    ...state.contactInfo,
                    ...savedConfig,
                  },
                  isLoadingContact: false,
                }))
                return savedConfig
              }
            }
          }
          set({ isLoadingContact: false })
          return null
        } catch (error) {
          console.error('Error cargando información de contacto:', error)
          set({ isLoadingContact: false })
          return null
        }
      },

      getContactInfo: () => {
        return get().contactInfo
      },

      updateContactInfo: (newInfo) => {
        set((state) => ({
          contactInfo: {
            ...state.contactInfo,
            ...newInfo,
          },
        }))
      },
    }),
    {
      name: 'config-storage',
      version: 5,
      // No persistir videos: la landing siempre debe leer fresco del backend
      // vía useVideoTutorialsStore. Solo se cachea lo que es estable por sesión.
      partialize: (state) => ({
        images: state.images,
        socialMedia: state.socialMedia,
        contactInfo: state.contactInfo,
      }),
    }
  )
)

export default useConfigStore
