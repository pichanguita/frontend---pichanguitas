import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { securityConfig } from '../data/auth'
import {
  createAuthActions,
  createUserManagement,
  createPermissions,
  createCustomerRegistration,
  createActivityLogs,
} from './auth'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ========================================
      // ESTADO INICIAL
      // ========================================
      isAuthenticated: false,
      user: null,
      token: null,
      loginAttempts: 0,
      lastLoginAttempt: null,
      isBlocked: false,
      sessionExpiry: null,

      // Datos de usuarios (se cargan desde el backend)
      users: [],

      // Configuración de seguridad
      security: securityConfig,

      // Logs de actividad
      activityLogs: [],

      // ========================================
      // ACCIONES - Autenticación y Sesión
      // ========================================
      ...createAuthActions(set, get),

      // ========================================
      // ACCIONES - Gestión de Usuarios
      // ========================================
      ...createUserManagement(set, get),

      // ========================================
      // ACCIONES - Permisos y Roles
      // ========================================
      ...createPermissions(set, get),

      // ========================================
      // ACCIONES - Registro de Clientes
      // ========================================
      ...createCustomerRegistration(set, get),

      // ========================================
      // ACCIONES - Logs de Actividad
      // ========================================
      ...createActivityLogs(set, get),
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        loginAttempts: state.loginAttempts,
        lastLoginAttempt: state.lastLoginAttempt,
        isBlocked: state.isBlocked,
        sessionExpiry: state.sessionExpiry,
        // NO guardar users, siempre usar los del código
        activityLogs: state.activityLogs,
      }),
    }
  )
)

export default useAuthStore
