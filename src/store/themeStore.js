import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
  persist(
    (set) => ({
      isDarkMode: false, // Por defecto modo claro

      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      setDarkMode: (value) => set({ isDarkMode: value }),
    }),
    {
      name: 'theme-storage', // Guardar en localStorage
    }
  )
)

export default useThemeStore
