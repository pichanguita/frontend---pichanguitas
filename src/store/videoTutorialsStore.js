import { create } from 'zustand'
import {
  fetchVideoTutorials,
  updateVideoTutorial as updateVideoTutorialAPI,
} from '../services/videoTutorials/videoTutorialsService'

/**
 * Store de video tutoriales.
 *
 * Decidido: SIN persist para que la landing siempre lea del backend.
 * Evita el bug "el admin ve el cambio en su navegador pero el cliente no".
 */
const useVideoTutorialsStore = create((set, get) => ({
  videos: [],
  isLoading: false,
  error: null,

  /**
   * Carga los tutoriales activos del backend.
   * Idempotente: deduplica peticiones en vuelo.
   */
  loadVideos: async () => {
    if (get().isLoading) return get().videos
    set({ isLoading: true, error: null })
    try {
      const data = await fetchVideoTutorials()
      set({ videos: data, isLoading: false })
      return data
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Actualiza un tutorial y refresca el state local con la respuesta del backend.
   */
  updateVideo: async (slug, payload) => {
    const updated = await updateVideoTutorialAPI(slug, payload)
    set((state) => ({
      videos: state.videos.map((v) => (v.slug === slug ? updated : v)),
    }))
    return updated
  },
}))

export default useVideoTutorialsStore
