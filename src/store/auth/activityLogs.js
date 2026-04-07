// Acciones de registro de actividades
export const createActivityLogs = (set, get) => ({
  // Agregar log de actividad
  addActivityLog: (action, details = {}) => {
    const { user, activityLogs } = get()
    if (!user) return

    const log = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      action,
      details,
      timestamp: new Date().toISOString(),
      ip: '192.168.1.1', // En producción esto vendría del servidor
      userAgent: navigator.userAgent,
    }

    set({
      activityLogs: [log, ...activityLogs].slice(0, 1000), // Mantener últimos 1000 logs
    })
  },
})
