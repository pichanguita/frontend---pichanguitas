import { useState, useEffect, useMemo } from 'react'
import { useDebounce } from './useDebounce'
import { validateSportSelection } from '../services/sportsService'

/**
 * useSportsValidation - Hook para validación en tiempo real de deportes
 * Valida con debounce para no validar en cada keystroke
 *
 * @param {string[]} selectedSports - Array de deportes seleccionados
 * @param {object} options - Opciones de configuración
 * @param {boolean} options.enabled - Si la validación está habilitada (default: true)
 * @param {number} options.debounceDelay - Delay del debounce en ms (default: 300)
 * @param {number} options.minSelection - Mínimo de deportes requeridos (default: 1)
 * @returns {object} - { error, isValid, isValidating }
 *
 * @example
 * const { error, isValid, isValidating } = useSportsValidation(selectedSports, {
 *   enabled: true,
 *   debounceDelay: 500,
 *   minSelection: 1
 * })
 */
export const useSportsValidation = (selectedSports, options = {}) => {
  const { enabled = true, debounceDelay = 300, minSelection = 1 } = options

  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState(null)

  // Aplicar debounce al array de deportes seleccionados
  const debouncedSports = useDebounce(selectedSports, debounceDelay)

  // Validar cuando cambie el valor debounced
  useEffect(() => {
    if (!enabled) {
      setError(null)
      setIsValidating(false)
      return
    }

    // Marcar como validando
    setIsValidating(true)

    // Simular un pequeño delay para mostrar el estado de validación
    const validationTimeout = setTimeout(() => {
      // Validación básica: al menos 1 deporte
      const basicValidation = validateSportSelection(debouncedSports)

      if (!basicValidation.isValid) {
        setError(basicValidation.error)
        setIsValidating(false)
        return
      }

      // Validación de mínimo de deportes si se especifica
      if (minSelection > 1 && debouncedSports.length < minSelection) {
        setError(`Debes seleccionar al menos ${minSelection} deportes`)
        setIsValidating(false)
        return
      }

      // Todo OK
      setError(null)
      setIsValidating(false)
    }, 100)

    return () => {
      clearTimeout(validationTimeout)
    }
  }, [debouncedSports, enabled, minSelection])

  // Calcular isValid de forma memoizada
  const isValid = useMemo(() => {
    return error === null && debouncedSports.length >= minSelection
  }, [error, debouncedSports.length, minSelection])

  return {
    error,
    isValid,
    isValidating,
  }
}

export default useSportsValidation
