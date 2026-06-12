import { useState, useEffect } from 'react'
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
  // Filtro de cancha y canchas visibles vigentes al abrir el modal de reservas del día.
  const [dayFieldFilter, setDayFieldFilter] = useState(null)
  const [dayVisibleFieldIds, setDayVisibleFieldIds] = useState(null)

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

  // Redirect to login if not authenticated.
  // La expiración por tiempo la maneja useSessionWatcher (global), que al
  // vencer el JWT ejecuta logout → isAuthenticated=false → este guard redirige.
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
    setDayFieldFilter(dayData.fieldFilter ?? null)
    setDayVisibleFieldIds(dayData.visibleFieldIds ?? null)

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
    setDayFieldFilter(null)
    setDayVisibleFieldIds(null)
  }

  return {
    activeTab,
    setActiveTab,
    selectedField,
    selectedUser,
    selectedDate,
    selectedDayReservations,
    dayFieldFilter,
    dayVisibleFieldIds,
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
