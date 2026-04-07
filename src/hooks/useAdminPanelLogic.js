import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_TABS } from '../constants'

export const useAdminPanelLogic = ({
  user,
  isAuthenticated,
  isSuperAdmin,
  existingReservations,
  openModal,
  closeModal,
  addActivityLog,
  logout,
  checkSession,
  extendSession,
}) => {
  const navigate = useNavigate()

  // Determine initial tab based on user role
  const [activeTab, setActiveTab] = useState(() => {
    return ADMIN_TABS.OVERVIEW
  })

  const [selectedField, setSelectedField] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDayReservations, setSelectedDayReservations] = useState([])

  // Refs para evitar re-renders en useEffect
  const lastActivityRef = useRef(0)
  const checkSessionRef = useRef(checkSession)
  const extendSessionRef = useRef(extendSession)
  const THROTTLE_INTERVAL = 60000 // Solo extender sesion cada 60 segundos

  // Actualizar refs en cada render (sin useEffect)
  checkSessionRef.current = checkSession
  extendSessionRef.current = extendSession

  // Set initial tab based on user role
  useEffect(() => {
    if (activeTab === ADMIN_TABS.OVERVIEW) {
      if (isSuperAdmin()) {
        setActiveTab(ADMIN_TABS.DASHBOARD)
      } else {
        setActiveTab(ADMIN_TABS.RESUMEN)
      }
    }
  }, [user, isSuperAdmin])

  // Session management
  useEffect(() => {
    if (!isAuthenticated) return

    try {
      if (!checkSessionRef.current()) {
        return
      }

      const handleActivity = () => {
        const now = Date.now()
        // Throttle: solo extender sesion si paso el intervalo minimo
        if (now - lastActivityRef.current >= THROTTLE_INTERVAL) {
          lastActivityRef.current = now
          extendSessionRef.current()
        }
      }

      // Solo eventos que indican actividad real, no mousemove continuo
      const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click']
      events.forEach((event) => {
        document.addEventListener(event, handleActivity, { passive: true })
      })

      const inactivityTimer = setInterval(() => {
        checkSessionRef.current()
      }, 60000)

      return () => {
        events.forEach((event) => {
          document.removeEventListener(event, handleActivity)
        })
        clearInterval(inactivityTimer)
      }
    } catch (error) {
      console.error('Error in useEffect:', error)
    }
  }, [isAuthenticated])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Handlers
  const handleLogout = () => {
    try {
      addActivityLog('admin_logout', { timestamp: new Date().toISOString() })
      logout()
    } catch (error) {
      console.error('Error during logout:', error)
      logout()
    }
  }

  const handleEditField = (field) => {
    setSelectedField(field)
    openModal('editField')
  }

  const handleConfigField = (field) => {
    setSelectedField(field)
    openModal('configField')
  }

  const handleViewField = (field) => {
    setSelectedField(field)
    openModal('details')
  }

  const handleDateClick = (dayData) => {
    setSelectedDate(dayData.date)

    // Formatear la fecha en hora local como YYYY-MM-DD
    const date = new Date(dayData.date)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    const dayReservations = existingReservations.filter((reservation) => {
      // Normalizar la fecha de la reserva (puede venir como ISO completo)
      const resDate = reservation.date ? reservation.date.split('T')[0] : ''
      return resDate === dateStr
    })

    if (dayReservations.length > 0) {
      setSelectedDayReservations(dayReservations)
      openModal('dayReservations')
    } else {
      openModal('clientRegistration')
    }
  }

  // Modal closers
  const closeEditFieldModal = () => {
    closeModal('editField')
    setSelectedField(null)
  }

  const closeConfigFieldModal = () => {
    closeModal('configField')
    setSelectedField(null)
  }

  const closeDetailsModal = () => {
    closeModal('details')
    setSelectedField(null)
  }

  const closeEditUserModal = () => {
    closeModal('editUser')
    setSelectedUser(null)
  }

  const closeClientRegistrationModal = () => {
    closeModal('clientRegistration')
    setSelectedDate(null)
  }

  const closeDayReservationsModal = () => {
    closeModal('dayReservations')
    setSelectedDate(null)
    setSelectedDayReservations([])
  }

  return {
    activeTab,
    setActiveTab,
    selectedField,
    selectedUser,
    selectedDate,
    selectedDayReservations,
    handleLogout,
    handleEditField,
    handleConfigField,
    handleViewField,
    handleDateClick,
    closeEditFieldModal,
    closeConfigFieldModal,
    closeDetailsModal,
    closeEditUserModal,
    closeClientRegistrationModal,
    closeDayReservationsModal,
  }
}
