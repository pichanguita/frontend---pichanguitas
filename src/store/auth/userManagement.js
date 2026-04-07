// Acciones de gestión de usuarios
export const createUserManagement = (set, get) => ({
  // Crear usuario
  createUser: (userData) => {
    const { user, users } = get()

    // Solo super_admin puede crear otros usuarios
    if (!user || user.role !== 'super_admin') {
      throw new Error(
        'Sin permisos para crear usuarios. Solo el Super Administrador puede realizar esta acción.'
      )
    }

    // Validar que no exista ya un usuario con el mismo username o email
    const existingUser = users.find(
      (u) => u.username === userData.username || u.email === userData.email
    )
    if (existingUser) {
      throw new Error('Ya existe un usuario con ese nombre de usuario o email')
    }

    const newUser = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
      createdBy: user.id,
    }

    set({
      users: [...users, newUser],
    })

    return newUser
  },

  // Crear administrador
  createAdmin: (adminData) => {
    const { user, users } = get()

    // Solo super_admin puede crear administradores
    if (!user || user.role !== 'super_admin') {
      throw new Error(
        'Sin permisos para crear administradores. Solo el Super Administrador puede realizar esta acción.'
      )
    }

    // Validar que no exista ya un usuario con el mismo username o email
    const existingUser = users.find(
      (u) => u.username === adminData.username || u.email === adminData.email
    )
    if (existingUser) {
      throw new Error('Ya existe un usuario con ese nombre de usuario o email')
    }

    const newAdmin = {
      ...adminData,
      id: `admin-${Date.now()}`,
      role: 'admin',
      permissions: [
        'admin.dashboard',
        'admin.fields.view',
        'admin.fields.create',
        'admin.fields.edit',
        'admin.reservations.view',
        'admin.reservations.manage',
        'admin.customers.view',
        'admin.reviews.view',
        'admin.analytics.view',
        'admin.schedule.manage',
        'admin.pricing.manage',
        'admin.blacklist.manage',
      ],
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
      createdBy: user.id,
    }

    set({
      users: [...users, newAdmin],
    })

    return newAdmin
  },

  // Actualizar usuario
  updateUser: (userId, userData) => {
    const { user, users } = get()
    const targetUser = users.find((u) => u.id === userId)

    if (!user || !targetUser) {
      throw new Error('Usuario no encontrado')
    }

    // Solo super_admin puede actualizar cualquier usuario
    // Los admin pueden actualizar su propio perfil
    if (user.role !== 'super_admin' && user.id !== userId) {
      throw new Error('Sin permisos para actualizar este usuario')
    }

    // Super_admin no puede ser degradado
    if (targetUser.role === 'super_admin' && userData.role && userData.role !== 'super_admin') {
      throw new Error('No se puede cambiar el rol del Super Administrador')
    }

    // Solo super_admin puede cambiar roles
    if (userData.role && user.role !== 'super_admin') {
      throw new Error('Solo el Super Administrador puede cambiar roles de usuario')
    }

    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, ...userData } : u))

    set({ users: updatedUsers })
    return true
  },

  // Eliminar usuario
  deleteUser: (userId) => {
    const { user, users } = get()
    const targetUser = users.find((u) => u.id === userId)

    if (!user || !targetUser) {
      throw new Error('Usuario no encontrado')
    }

    // Solo super_admin puede eliminar usuarios
    if (user.role !== 'super_admin') {
      throw new Error(
        'Sin permisos para eliminar usuarios. Solo el Super Administrador puede realizar esta acción.'
      )
    }

    // No se puede eliminar a sí mismo
    if (userId === user.id) {
      throw new Error('No puedes eliminar tu propio usuario')
    }

    // No se puede eliminar al super_admin
    if (targetUser.role === 'super_admin') {
      throw new Error('No se puede eliminar al Super Administrador')
    }

    const updatedUsers = users.filter((u) => u.id !== userId)
    set({ users: updatedUsers })
    return true
  },

  // Obtener usuarios por rol
  getUsersByRole: (role) => {
    const { users } = get()
    return users.filter((u) => u.role === role && u.isActive)
  },

  // NOTA: Esta función debe ser manejada por el backend
  // En producción, el reset de usuarios debe ser controlado por el servidor
  resetUsersToDefault: () => {
    console.warn('⚠️  resetUsersToDefault() - Esta operación debe manejarse desde el backend')
    // No se resetea localmente - debe venir del backend
    set({ users: [] })
  },

  // Cargar todos los usuarios desde el backend
  loadAllUsers: async () => {
    try {
      const { token } = get()
      if (!token) {
        console.warn('⚠️  No hay token disponible para cargar usuarios')
        return
      }

      const { fetchUsers } = await import('../../services/users/usersService')
      const usersData = await fetchUsers({}, token)

      set({ users: usersData })

      return usersData
    } catch (error) {
      console.error('❌ [authStore.loadAllUsers] Error:', error)
      throw error
    }
  },
})
