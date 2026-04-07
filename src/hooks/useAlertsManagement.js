import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { USER_ROLES } from '@/constants'

export const useAlertsManagement = (user, alertStore, fields) => {
  const {
    alerts: storeAlerts,
    filters,
    setFilters,
    getFilteredAlerts,
    markAsReadAPI,
    markAllAsReadAPI,
    deleteAlertAPI,
    getUnreadCount,
    updateAlert,
  } = alertStore

  const [alerts, setAlerts] = useState([])
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)

  const unreadCount = getUnreadCount(user?.role === USER_ROLES.ADMIN ? user?.id : null)

  // Load filtered alerts - usar storeAlerts para re-render cuando cambien
  useEffect(() => {
    const filteredAlerts = getFilteredAlerts(
      user?.role,
      user?.role === USER_ROLES.ADMIN ? user?.id : null
    )
    setAlerts(filteredAlerts)
  }, [filters, user, getFilteredAlerts, storeAlerts])

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleMarkAsRead = async (alertId) => {
    try {
      await markAsReadAPI(alertId)
    } catch (error) {
      console.error('Error al marcar como leída:', error)
    }
  }

  const handleDelete = async (alertId) => {
    try {
      await deleteAlertAPI(alertId)
    } catch (error) {
      console.error('Error al eliminar alerta:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadAPI()
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
    }
  }

  const handleClearAll = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todas las alertas?')) {
      // Eliminar todas las alertas una por una usando la API
      try {
        for (const alert of alerts) {
          await deleteAlertAPI(alert.id)
        }
      } catch (error) {
        console.error('Error al limpiar alertas:', error)
      }
    }
  }

  const handleEdit = (alert) => {
    setEditingReservation({
      id: alert.id,
      alertId: alert.id,
      customerName: alert.customerName || '',
      customerPhone: alert.customerPhone || '',
      fieldId: alert.fieldId || '',
      date: alert.reservationData?.date || '',
      startTime: alert.reservationData?.startTime || '',
      endTime: alert.reservationData?.endTime || '',
      totalAmount: alert.reservationData?.totalAmount || 0,
      paymentStatus: alert.reservationData?.paymentStatus || 'pending',
      notes: alert.reservationData?.notes || '',
    })
    setShowEditModal(true)
  }

  const handleReservationChange = (updates) => {
    setEditingReservation((prev) => ({
      ...prev,
      ...updates,
    }))
  }

  const handleSaveEdit = () => {
    if (!editingReservation) return

    // Validate required fields
    if (
      !editingReservation.customerName ||
      !editingReservation.customerPhone ||
      !editingReservation.date ||
      !editingReservation.startTime ||
      !editingReservation.endTime
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor completa todos los campos requeridos',
        confirmButtonColor: '#22c55e',
        showCloseButton: true,
        allowEscapeKey: true,
      })
      return
    }

    // Update alert with new data
    const updatedAlert = alerts.find((a) => a.id === editingReservation.alertId)
    if (updatedAlert) {
      const newAlert = {
        ...updatedAlert,
        customerName: editingReservation.customerName,
        customerPhone: editingReservation.customerPhone,
        fieldId: editingReservation.fieldId,
        fieldName: fields.find((f) => f.id === editingReservation.fieldId)?.name || '',
        reservationData: {
          ...updatedAlert.reservationData,
          date: editingReservation.date,
          startTime: editingReservation.startTime,
          endTime: editingReservation.endTime,
          totalAmount: editingReservation.totalAmount,
          paymentStatus: editingReservation.paymentStatus,
          notes: editingReservation.notes,
        },
      }

      if (updateAlert) {
        updateAlert(editingReservation.alertId, newAlert)
      }

      Swal.fire({
        icon: 'success',
        title: 'Reserva Actualizada',
        text: 'Los datos de la reserva han sido actualizados exitosamente',
        timer: 2000,
        showConfirmButton: false,
        showCloseButton: true,
        allowEscapeKey: true,
      })

      setShowEditModal(false)
      setEditingReservation(null)
    }
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingReservation(null)
  }

  return {
    alerts,
    filters,
    unreadCount,
    showEditModal,
    editingReservation,
    handleFiltersChange,
    handleMarkAsRead,
    handleDelete,
    handleMarkAllAsRead,
    handleClearAll,
    handleEdit,
    handleReservationChange,
    handleSaveEdit,
    handleCloseEditModal,
  }
}
