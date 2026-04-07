import { useState, useEffect, useCallback } from 'react'

/**
 * useLocalStorage - Hook para persistir estado en localStorage
 * Sincroniza automáticamente el estado con localStorage
 *
 * @param {string} key - Clave de localStorage
 * @param {any} initialValue - Valor inicial si no existe en localStorage
 * @returns {[any, function, function]} - [value, setValue, removeValue]
 *
 * @example
 * const [sportsDraft, setSportsDraft, clearSportsDraft] = useLocalStorage('sports_draft', [])
 *
 * // Guardar deportes seleccionados
 * setSportsDraft(['Fútbol', 'Básquetbol'])
 *
 * // Limpiar borrador
 * clearSportsDraft()
 */
export const useLocalStorage = (key, initialValue) => {
  // Estado para almacenar nuestro valor
  // Se pasa la función de inicialización a useState para que solo se ejecute una vez
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      // Obtener del localStorage por key
      const item = window.localStorage.getItem(key)

      // Parsear JSON almacenado o si no existe devolver initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // Si hay error (ej: JSON inválido), devolver initialValue
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Función para establecer el valor
  const setValue = useCallback(
    (value) => {
      try {
        // Permitir que value sea una función para mantener consistencia con useState
        const valueToStore = value instanceof Function ? value(storedValue) : value

        // Guardar estado
        setStoredValue(valueToStore)

        // Guardar en localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // Función para remover el valor
  const removeValue = useCallback(() => {
    try {
      // Remover del estado
      setStoredValue(initialValue)

      // Remover de localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Escuchar cambios de localStorage en otras pestañas/ventanas
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error)
        }
      } else if (e.key === key && e.newValue === null) {
        // El valor fue removido
        setStoredValue(initialValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

export default useLocalStorage
