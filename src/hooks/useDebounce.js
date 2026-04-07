import { useState, useEffect } from 'react'

/**
 * useDebounce - Hook para debounce de valores
 * Retrasa la actualización de un valor hasta que pase un tiempo sin cambios
 *
 * @param {any} value - Valor a aplicar debounce
 * @param {number} delay - Tiempo de espera en milisegundos (default: 300ms)
 * @returns {any} - Valor debounced
 *
 * @example
 * const searchQuery = 'Fútbol'
 * const debouncedQuery = useDebounce(searchQuery, 500)
 *
 * useEffect(() => {
 *   // Esta búsqueda solo se ejecuta después de 500ms sin cambios
 *   fetchResults(debouncedQuery)
 * }, [debouncedQuery])
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Establecer un timeout para actualizar el valor debounced
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: cancelar el timeout si el valor cambia antes del delay
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default useDebounce
