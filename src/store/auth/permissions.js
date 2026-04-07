// Acciones de verificación de permisos y roles
export const createPermissions = (set, get) => ({
  // Verificar si es super admin
  isSuperAdmin: () => {
    const { user } = get()
    return user && user.role === 'super_admin'
  },

  // Verificar si puede gestionar usuarios
  canManageUsers: () => {
    const { user } = get()
    return user && user.role === 'super_admin'
  },

  // Verificar si puede gestionar una cancha específica
  canManageField: (fieldId) => {
    const { user } = get()
    if (!user) return false

    // Super admin puede gestionar todas las canchas
    if (user.role === 'super_admin') return true

    // Admin general puede gestionar todas las canchas
    if (user.role === 'admin' && user.adminType === 'general') return true

    // Admin de cancha específica solo puede gestionar sus canchas asignadas
    // Soporta: 'field', 'field_owner', 'field_admin'
    if (user.role === 'admin' && ['field', 'field_owner', 'field_admin'].includes(user.adminType)) {
      return user.managedFields && user.managedFields.includes(fieldId)
    }

    return false
  },

  // Obtener canchas que el usuario puede gestionar
  getManagedFields: () => {
    const { user } = get()
    if (!user) return []

    // Super admin y admin general pueden gestionar todas
    if (user.role === 'super_admin' || (user.role === 'admin' && user.adminType === 'general')) {
      return [] // Array vacío significa "todas las canchas"
    }

    // Admin de cancha específica solo sus canchas asignadas
    // Soporta: 'field', 'field_owner', 'field_admin'
    if (user.role === 'admin' && ['field', 'field_owner', 'field_admin'].includes(user.adminType)) {
      return user.managedFields || []
    }

    return []
  },

  // Obtener tipo de administrador
  getAdminType: () => {
    const { user } = get()
    if (!user) return null

    if (user.role === 'super_admin') return 'super_admin'
    if (user.role === 'admin') return user.adminType || 'general'

    return null
  },

  // Verificar si es un cliente
  isCustomer: () => {
    const { user } = get()
    return user && user.role === 'customer'
  },
})
