import { loginUser } from '@/services/auth'
import { changePasswordAPI, updateMyProfileAPI } from '../../services/users/usersService'

// Acciones de autenticacion y sesion
export const createAuthActions = (set, get) => ({
  // Login
  login: async (credentials) => {
    const { username, password } = credentials
    const { security } = get()

    try {
      // Llamar a la API real del backend
      const response = await loginUser({
        identifier: username, // El backend acepta username, email o phone como "identifier"
        password: password,
      })

      // Extraer datos de la respuesta de la API
      const { token, user } = response

      if (!user) {
        throw new Error('Error en la respuesta del servidor')
      }

      // Calcular expiración de sesión
      const sessionExpiry = Date.now() + security.sessionDuration

      // Actualizar el estado con los datos del usuario autenticado
      set({
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name || user.username,
          role: user.role,
          id_rol: user.id_rol, // ID numerico del rol desde el backend
          adminType: user.adminType, // Tipo de admin (field, general, etc.)
          permissions: user.permissions || [],
          phone: user.phone || null,
          fieldId: user.fieldId || null,
          customerId: user.customerId || null, // ID del customer para filtrar reservas
          isActive: user.isActive !== false,
          managedFields: user.managedFields || [],
          lastLogin: new Date().toISOString(),
        },
        token,
        loginAttempts: 0,
        lastLoginAttempt: null,
        isBlocked: false,
        sessionExpiry,
      })

      return {
        success: true,
        user: user.name || user.username,
      }
    } catch (error) {
      console.error('Error en login:', error)
      throw new Error(error.message || 'Error al iniciar sesión')
    }
  },

  // Logout
  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      token: null,
      sessionExpiry: null,
    })
  },

  // Verificar sesión
  checkSession: () => {
    const { sessionExpiry, isAuthenticated } = get()

    if (isAuthenticated && sessionExpiry) {
      if (Date.now() > sessionExpiry) {
        get().logout()
        return false
      }
    }
    return isAuthenticated
  },

  // Extender sesión
  extendSession: () => {
    const { security } = get()
    set({
      sessionExpiry: Date.now() + security.sessionDuration,
    })
  },

  // Obtener tiempo restante de bloqueo
  getBlockTimeRemaining: () => {
    const { lastLoginAttempt, security } = get()
    if (!lastLoginAttempt) return 0

    const elapsed = Date.now() - lastLoginAttempt
    const remaining = security.blockDuration - elapsed
    return Math.max(0, remaining)
  },

  // Verificar permiso
  hasPermission: (permission) => {
    const { user } = get()
    if (!user || !user.permissions) return false

    // Si permissions es un array de objetos, buscar por el campo 'name'
    if (Array.isArray(user.permissions) && user.permissions.length > 0) {
      if (typeof user.permissions[0] === 'object') {
        return user.permissions.some((p) => p.name === permission)
      }
      // Si es un array de strings simple
      return user.permissions.includes(permission)
    }

    return false
  },

  // Actualizar perfil de usuario (llama al backend)
  updateUserProfile: async (profileData) => {
    const { user, token, users } = get()
    if (!user) throw new Error('No hay usuario autenticado')

    // Llamar al API del backend para persistir los cambios
    const updatedUserFromAPI = await updateMyProfileAPI(profileData, token)

    // Actualizar el estado local con los datos del backend
    const updatedUser = {
      ...user,
      name: updatedUserFromAPI.name || user.name,
      email: updatedUserFromAPI.email || user.email,
      phone: updatedUserFromAPI.phone || user.phone,
    }

    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...updatedUser, password: u.password } : u
    )

    set({
      user: updatedUser,
      users: updatedUsers,
    })

    return updatedUserFromAPI
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    const { user, token } = get()
    if (!user) throw new Error('No hay usuario autenticado')

    if (!currentPassword || currentPassword.trim().length === 0) {
      throw new Error('La contraseña actual es requerida')
    }

    if (!newPassword || newPassword.trim().length === 0) {
      throw new Error('La nueva contraseña no puede estar vacía')
    }

    // Llamar al API del backend
    await changePasswordAPI(
      user.id,
      {
        current_password: currentPassword,
        new_password: newPassword,
      },
      token
    )

    return true
  },
})
