import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { X, Bell, CheckCircle, AlertTriangle, Info, XCircle, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAlertStore from '../store/alertStore'

const ToastNotification = () => {
  const { alerts, markAsRead, markAsReadAPI } = useAlertStore()
  const [visibleToasts, setVisibleToasts] = useState([])
  const dismissedIdsRef = useRef(new Set())
  const timersRef = useRef({})

  const handleCloseNotification = useCallback(
    (alertId) => {
      // Limpiar el timer si existe
      if (timersRef.current[alertId]) {
        clearTimeout(timersRef.current[alertId])
        delete timersRef.current[alertId]
      }

      // Agregar a descartados usando ref (no causa re-render)
      dismissedIdsRef.current.add(alertId)

      // Buscar la alerta para determinar si es del backend
      const alert = alerts.find((a) => a.id === alertId)
      const isBackendAlert = alert && typeof alert.id === 'number'

      // Marcar como leida (local para alertas locales, API para alertas del backend)
      // NO eliminamos la alerta, solo la marcamos como leída para que:
      // 1. Desaparezca del toast (ya no es unread)
      // 2. Se mantenga en el historial del Centro de Alertas
      if (isBackendAlert && markAsReadAPI) {
        markAsReadAPI(alertId).catch((err) =>
          console.warn('Error marcando alerta como leida:', err)
        )
      } else {
        markAsRead(alertId)
      }
    },
    [alerts, markAsRead, markAsReadAPI]
  )

  // Usar useMemo para calcular las alertas visibles sin causar re-renders innecesarios
  // Compatible con alertas locales (status: 'unread') y alertas del backend (is_read: false)
  const unreadAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const isUnread =
        alert.status === 'unread' ||
        alert.is_read === false ||
        (!alert.status && alert.is_read !== true)
      return isUnread && !dismissedIdsRef.current.has(alert.id)
    })
  }, [alerts])

  useEffect(() => {
    // Mostrar máximo 5 notificaciones a la vez
    const toShow = unreadAlerts.slice(0, 5)

    // Solo actualizar si realmente cambió el contenido
    setVisibleToasts((prev) => {
      if (prev.length !== toShow.length) return toShow
      if (prev.every((t, i) => t.id === toShow[i]?.id)) return prev
      return toShow
    })
  }, [unreadAlerts])

  // Auto-dismiss en efecto separado
  useEffect(() => {
    // Limpiar timers existentes para toasts que ya no están visibles
    const visibleIds = new Set(visibleToasts.map((t) => t.id))
    Object.keys(timersRef.current).forEach((id) => {
      if (!visibleIds.has(id)) {
        clearTimeout(timersRef.current[id])
        delete timersRef.current[id]
      }
    })

    // Crear nuevos timers solo para toasts que no tienen uno
    visibleToasts.forEach((alert) => {
      if (
        alert.priority !== 'high' &&
        !dismissedIdsRef.current.has(alert.id) &&
        !timersRef.current[alert.id]
      ) {
        timersRef.current[alert.id] = setTimeout(() => {
          handleCloseNotification(alert.id)
        }, 8000)
      }
    })

    return () => {
      // Limpiar todos los timers al desmontar
      Object.values(timersRef.current).forEach((timer) => clearTimeout(timer))
      timersRef.current = {}
    }
  }, [visibleToasts, handleCloseNotification])

  const getIcon = (type, _priority) => {
    switch (type) {
      case 'new_reservation':
        return Calendar
      case 'field_approved':
      case 'success':
        return CheckCircle
      case 'field_rejected':
      case 'error':
        return XCircle
      case 'warning':
      case 'maintenance':
        return AlertTriangle
      case 'info':
      default:
        return Info
    }
  }

  const getColorClasses = (type, priority) => {
    if (priority === 'high') {
      return {
        bg: 'bg-red-50 border-red-200',
        icon: 'text-red-600 bg-red-100',
        title: 'text-red-900',
        text: 'text-red-700',
        button: 'text-red-600 hover:bg-red-100',
      }
    }

    switch (type) {
      case 'new_reservation':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600 bg-blue-100',
          title: 'text-blue-900',
          text: 'text-blue-700',
          button: 'text-blue-600 hover:bg-blue-100',
        }
      case 'field_approved':
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-600 bg-green-100',
          title: 'text-green-900',
          text: 'text-green-700',
          button: 'text-green-600 hover:bg-green-100',
        }
      case 'field_rejected':
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600 bg-red-100',
          title: 'text-red-900',
          text: 'text-red-700',
          button: 'text-red-600 hover:bg-red-100',
        }
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          icon: 'text-amber-600 bg-amber-100',
          title: 'text-amber-900',
          text: 'text-amber-700',
          button: 'text-amber-600 hover:bg-amber-100',
        }
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600 bg-gray-100',
          title: 'text-gray-900',
          text: 'text-gray-700',
          button: 'text-gray-600 hover:bg-gray-100',
        }
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'ahora'

    const date = new Date(timestamp)

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) return 'ahora'

    const now = new Date()
    const diff = Math.floor((now - date) / 1000) // diferencia en segundos

    if (diff < 60) return 'hace un momento'
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
    return date.toLocaleDateString('es-PE')
  }

  const toastVariants = {
    initial: {
      opacity: 0,
      y: -50,
      scale: 0.3,
      x: 100,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.5,
      x: 100,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      <AnimatePresence>
        {visibleToasts.map((alert) => {
          const Icon = getIcon(alert.type, alert.priority)
          const colors = getColorClasses(alert.type, alert.priority)

          return (
            <motion.div
              key={alert.id}
              variants={toastVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`
                min-w-[320px] max-w-md p-4 rounded-xl shadow-2xl border pointer-events-auto relative
                ${colors.bg}
              `}
            >
              <div className="flex items-start gap-3">
                {/* Icono */}
                <div className={`p-2 rounded-lg flex-shrink-0 ${colors.icon}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`font-semibold text-sm ${colors.title}`}>{alert.title}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        e.preventDefault()
                        handleCloseNotification(alert.id)
                      }}
                      className={`
                        p-2 rounded-lg transition-all flex-shrink-0 
                        hover:scale-110 cursor-pointer relative
                        ${colors.button}
                      `}
                      aria-label="Cerrar notificación"
                      type="button"
                      style={{ zIndex: 10 }}
                    >
                      <X className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                  </div>

                  <p className={`text-sm mt-1 ${colors.text}`}>{alert.message}</p>

                  {/* Timestamp y prioridad */}
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${colors.text} opacity-75`}>
                      {formatTime(alert.createdAt || alert.date_time_registration)}
                    </span>
                    {alert.priority === 'high' && (
                      <span className="flex items-center gap-1">
                        <Bell className="w-3 h-3 text-red-600 animate-pulse" />
                        <span className="text-xs font-semibold text-red-600">Importante</span>
                      </span>
                    )}
                  </div>

                  {/* Acciones rápidas */}
                  {alert.actions && alert.actions.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {alert.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            action.handler()
                            handleCloseNotification(alert.id)
                          }}
                          className={`
                            px-3 py-1 rounded-lg text-xs font-medium transition-colors
                            ${
                              action.primary
                                ? 'bg-primary-600 text-white hover:bg-primary-700'
                                : `${colors.button} ${colors.text}`
                            }
                          `}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Barra de progreso para auto-dismiss */}
              {alert.priority !== 'high' && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-current opacity-20 rounded-b-xl"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 8, ease: 'linear' }}
                />
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Indicador de más notificaciones */}
      {unreadAlerts.length > 5 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-secondary-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium pointer-events-auto"
        >
          +{unreadAlerts.length - 5} más notificaciones
        </motion.div>
      )}
    </div>
  )
}

export default ToastNotification
