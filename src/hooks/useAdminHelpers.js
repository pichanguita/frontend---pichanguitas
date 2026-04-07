import { useMemo } from 'react'

/**
 * Hook para funciones helper del Admin Panel con memoization
 * Optimiza cálculos que antes se ejecutaban en cada render
 *
 * Elimina ~50 líneas y mejora performance significativamente
 */
export const useAdminHelpers = ({ user, fields, existingReservations }) => {
  // Obtener reservas de hoy (memoizado)
  const todayReservations = useMemo(() => {
    try {
      const today = new Date().toISOString().split('T')[0]
      return existingReservations.filter((res) => res.date === today)
    } catch (error) {
      console.error('Error getting today reservations:', error)
      return []
    }
  }, [existingReservations])

  // Obtener campos visibles según el rol del usuario (memoizado)
  const visibleFields = useMemo(() => {
    try {
      if (!user || !fields) return []

      // Super admin y admin general ven todas las canchas
      if (user.role === 'super_admin' || (user.role === 'admin' && user.adminType === 'general')) {
        return fields
      }

      // Admin de cancha específica solo ve sus canchas asignadas
      if (user.role === 'admin' && user.adminType === 'field') {
        const managedFieldIds = user.managedFields || []
        return fields.filter((field) => managedFieldIds.includes(field.id))
      }

      return []
    } catch (error) {
      console.error('Error in getVisibleFields:', error)
      return []
    }
  }, [user, fields])

  // Calcular utilización de campos (memoizado)
  const fieldUtilization = useMemo(() => {
    try {
      const totalSlots = visibleFields.length * 7
      const occupiedSlots = todayReservations.length
      return totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0
    } catch (error) {
      console.error('Error calculating utilization:', error)
      return 0
    }
  }, [visibleFields, todayReservations])

  return {
    todayReservations,
    visibleFields,
    fieldUtilization,
  }
}
