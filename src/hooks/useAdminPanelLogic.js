import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ADMIN_TABS } from '../constants'

const SESSION_CHECK_INTERVAL_MS = 60000

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

  const checkSessionRef = useRef(checkSession)
  checkSessionRef.current = checkSession

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

  // Validación periódica del JWT + al volver a la pestaña (visibilitychange).
  // El interceptor global cubre el caso de respuesta del backend; aquí
  // detectamos expiración por tiempo aunque el usuario no haga peticiones.
  useEffect(() => {
    if (!isAuthenticated) return

    if (!checkSessionRef.current()) return

    const intervalId = setInterval(() => {
      checkSessionRef.current()
    }, SESSION_CHECK_INTERVAL_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSessionRef.current()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
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
