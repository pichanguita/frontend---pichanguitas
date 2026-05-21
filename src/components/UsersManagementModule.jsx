import React, { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  FileText,
  Activity,
  Eye,
  EyeOff,
  Building,
  MapPin,
  Phone,
  Clock,
  X,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import useFieldStore from '../store/modules/fieldStore'
import NewAdminModal from './NewAdminModal'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import { getUserFields, getMonthsAndDays } from '../utils/userManagementHelpers'
import { API_CONFIG } from '../config/api.config'
import useUserFilters from '../hooks/useUserFilters'
import UserStatsCards from './users/UserStatsCards'
import UserFilters from './users/UserFilters'
import UserTable from './users/UserTable'
import { fetchUsers, createUserAPI } from '../services/users/usersService'
import { fetchUserActivityLogs } from '../services/activityLogs/activityLogsService'
import { formatPhone, unformatPhone } from './NewFieldModal/utils/fieldValidators'

const UsersManagementModule = () => {
  const { token, user: currentUser } = useAuthStore()
  const { fields, loadFields } = useFieldStore()
  const [loading, setLoading] = useState(true)
  const [backendUsers, setBackendUsers] = useState([])
  // Cache de actividad por userId (se llena on-demand al expandir la fila)
  const [activityByUserId, setActivityByUserId] = useState({})

  // Cargar usuarios y campos desde el backend al montar el componente
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Iniciando carga de usuarios y campos...')
        console.log('Token disponible:', token ? 'Sí' : 'No')

        setLoading(true)

        // Cargar usuarios y campos en paralelo
        const [usersData] = await Promise.all([
          fetchUsers({}, token),
          loadFields(), // Cargar campos para poder asociarlos a usuarios
        ])

        console.log('✅ Usuarios cargados desde backend:', usersData.length)
        console.log('📋 Datos recibidos:', usersData)
        console.log('🏟️ Campos cargados:', fields.length)

        setBackendUsers(usersData)
      } catch (error) {
        console.error('❌ Error al cargar datos:', error)
        console.error('Detalles del error:', error.message)

        Swal.fire({
          icon: 'error',
          title: 'Error al cargar datos',
          text: error.message || 'No se pudieron cargar los datos desde el servidor',
          confirmButtonColor: '#22c55e',
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [token, loadFields])

  // Filtrar solo administradores de campo (field admins)
  const fieldAdmins = backendUsers.filter((u) => u.role === 'admin')

  // Custom hook para filtrado
  const {
    searchTerm,
    filterStatus,
    filterMonths,
    setSearchTerm,
    setFilterStatus,
    setFilterMonths,
    filteredUsers,
    stats,
    resetFilters,
    hasActiveFilters,
  } = useUserFilters(fieldAdmins, fields)

  // Estados para modales
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [showPassword, setShowPassword] = useState({})

  // Estados para formulario de edición
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    newPassword: '',
  })
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch de logs desde el backend (lazy, se invoca al expandir la fila)
  const ensureUserActivityLoaded = async (userId) => {
    if (activityByUserId[userId]) return activityByUserId[userId]
    try {
      const { items } = await fetchUserActivityLogs(userId)
      setActivityByUserId((prev) => ({ ...prev, [userId]: items }))
      return items
    } catch (error) {
      console.error('Error al cargar actividad del usuario', userId, error)
      setActivityByUserId((prev) => ({ ...prev, [userId]: [] }))
      return []
    }
  }

  // Lee del cache (puede devolver array vacío si aún no cargó)
  const getUserActivity = (userId) => activityByUserId[userId] || []

  // Handlers de CRUD
  const handleToggleBlock = async (user) => {
    Swal.fire({
      title: `¿${user.isBlocked ? 'Desbloquear' : 'Bloquear'} usuario?`,
      text: `Se ${user.isBlocked ? 'desbloqueará' : 'bloqueará'} el acceso del usuario ${user.name}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: user.isBlocked ? '#22c55e' : '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: user.isBlocked ? 'Sí, desbloquear' : 'Sí, bloquear',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Importar función de API
          const { updateUserAPI } = await import('../services/users/usersService')

          // Actualizar el campo is_blocked
          const newBlockedState = !user.isBlocked
          await updateUserAPI(
            user.id,
            {
              is_blocked: newBlockedState,
              block_until: null, // Bloqueo permanente (manual), no temporal
            },
            token
          )

          // Recargar la lista de usuarios
          const usersData = await fetchUsers({}, token)
          setBackendUsers(usersData)

          Swal.fire({
            icon: 'success',
            title: 'Usuario actualizado',
            text: `El usuario ha sido ${user.isBlocked ? 'desbloqueado' : 'bloqueado'}`,
            confirmButtonColor: '#22c55e',
          })
        } catch (error) {
          console.error('Error al actualizar bloqueo:', error)
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo actualizar el bloqueo del usuario',
            confirmButtonColor: '#22c55e',
          })
        }
      }
    })
  }

  const handleDeleteUser = async (user) => {
    Swal.fire({
      title: '¿Eliminar usuario?',
      html: `Se eliminará permanentemente el usuario:<br/><strong>${user.name}</strong>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Importar función de API
          const { deleteUserAPI } = await import('../services/users/usersService')

          // Eliminar en el backend
          await deleteUserAPI(user.id, token)

          // Recargar la lista de usuarios
          const usersData = await fetchUsers({}, token)
          setBackendUsers(usersData)

          Swal.fire({
            icon: 'success',
            title: 'Usuario eliminado',
            text: 'El usuario ha sido eliminado exitosamente',
            confirmButtonColor: '#22c55e',
          })
        } catch (error) {
          console.error('Error al eliminar usuario:', error)
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.message || 'No se pudo eliminar el usuario',
            confirmButtonColor: '#22c55e',
          })
        }
      }
    })
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setEditFormData({
      name: user.name || '',
      email: user.email || '',
      phone: formatPhone(user.phone || ''),
      newPassword: '',
    })
    setShowEditModal(true)
  }

  // Handler para actualizar usuario
  const handleUpdateUser = async () => {
    if (!selectedUser) return

    // Validaciones básicas
    if (!editFormData.name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre es requerido',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    if (!editFormData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ingresa un email válido',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    const phoneDigits = unformatPhone(editFormData.phone || '')
    if (phoneDigits && phoneDigits.length !== 9) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El teléfono debe tener 9 dígitos',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    setIsUpdating(true)

    try {
      // Importar funciones de API
      const { updateUserAPI, changePasswordAPI } = await import('../services/users/usersService')
      const { getToken } = await import('../config/api.config')

      const authToken = getToken()

      // 1. Actualizar datos básicos del usuario
      const updatePayload = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: phoneDigits || null,
      }

      await updateUserAPI(selectedUser.id, updatePayload, authToken)

      // 2. Si hay nueva contraseña, actualizarla
      if (editFormData.newPassword && editFormData.newPassword.length >= 6) {
        await changePasswordAPI(
          selectedUser.id,
          {
            new_password: editFormData.newPassword,
          },
          authToken
        )
      }

      // 3. Recargar usuarios
      const { fetchUsers } = await import('../services/users/usersService')
      const usersData = await fetchUsers({}, authToken)
      setBackendUsers(usersData)

      // 4. Cerrar modal y mostrar éxito
      setShowEditModal(false)
      Swal.fire({
        icon: 'success',
        title: 'Usuario actualizado',
        text: `Los datos de ${editFormData.name} han sido actualizados correctamente`,
        confirmButtonColor: '#22c55e',
      })
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar el usuario',
        confirmButtonColor: '#22c55e',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleViewDetails = (user) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  // Crear nuevo usuario
  const handleCreateUser = async (userData) => {
    try {
      console.log('📝 Creando nuevo usuario:', userData)

      // Preparar datos para enviar al backend
      const userPayload = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role_id: 2, // Admin de Cancha (field admin)
        admin_type: 'field_owner', // Tipo de administrador
        is_active: true,
        status: 'active',
      }

      // Llamar al backend
      const newUser = await createUserAPI(userPayload, token)

      console.log('✅ Usuario creado exitosamente:', newUser)

      // Recargar la lista de usuarios
      const updatedUsers = await fetchUsers({}, token)
      setBackendUsers(updatedUsers)

      Swal.fire({
        icon: 'success',
        title: '¡Usuario creado!',
        text: `El administrador ${userData.name} ha sido registrado exitosamente`,
        confirmButtonColor: '#22c55e',
      })

      return newUser
    } catch (error) {
      console.error('❌ Error al crear usuario:', error)
      throw error
    }
  }

  // Exportar todos los usuarios filtrados a Excel
  const exportAllUsersToExcel = () => {
    // Verificar que hay usuarios para exportar
    if (!filteredUsers || filteredUsers.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay usuarios para exportar',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    console.log('📊 Exportando usuarios:', filteredUsers.length)

    // Datos de usuarios con más detalles
    const usersData = filteredUsers.map((user) => {
      const userFields = getUserFields(user.id, fields)
      const fieldsNames = userFields.map((f) => f.name).join(', ') || 'Ninguna'
      const monthsAndDays = getMonthsAndDays(user.createdAt || user.date_time_registration)
      const activities = getUserActivity(user.id)
      const lastActivity = activities[0] || null

      return {
        ID: user.id,
        'Nombre Completo': user.name || 'N/A',
        Email: user.email || 'N/A',
        Teléfono: user.username || user.phone_number || 'N/A',
        Rol:
          user.role === 'super_admin'
            ? 'Super Admin'
            : user.role === 'admin'
              ? 'Administrador'
              : user.role || 'N/A',
        Acceso: user.isBlocked === true || user.is_blocked === true ? 'Bloqueado' : 'Permitido',
        Establecimiento:
          user.fieldAssignment?.fieldName || user.establishment_name || 'Sin asignación',
        'N° Canchas': userFields.length,
        'Canchas Asignadas': fieldsNames,
        'Meses Registrado': monthsAndDays.months,
        'Días Adicionales': monthsAndDays.days,
        Antigüedad: monthsAndDays.text,
        'Fecha Registro':
          user.createdAt || user.date_time_registration
            ? new Date(user.createdAt || user.date_time_registration).toLocaleDateString('es-PE')
            : 'N/A',
        'Hora Registro':
          user.createdAt || user.date_time_registration
            ? new Date(user.createdAt || user.date_time_registration).toLocaleTimeString('es-PE')
            : 'N/A',
        'Última Actividad': lastActivity
          ? typeof lastActivity.action === 'string'
            ? lastActivity.action
            : 'Actividad registrada'
          : 'Sin actividad',
        'Fecha Últ. Actividad': lastActivity?.timestamp
          ? new Date(lastActivity.timestamp).toLocaleString('es-PE')
          : 'N/A',
        'Total Actividades': activities.length,
      }
    })

    // Datos detallados de canchas por usuario
    const fieldsData = []
    filteredUsers.forEach((user) => {
      const userFields = getUserFields(user.id, fields)
      userFields.forEach((field) => {
        fieldsData.push({
          'ID Usuario': user.id,
          Administrador: user.name,
          'Email Admin': user.email,
          'ID Cancha': field.id,
          'Nombre Cancha': field.name,
          Dirección: field.address || 'Sin dirección',
          Distrito: field.district_name || 'N/A',
          'Tipo Deporte': field.sport_type_name || field.sportType?.name || 'N/A',
          'Precio/Hora': field.pricePerHour || field.price_per_hour || 0,
          Capacidad: field.capacity || field.max_players || 'N/A',
          'Estado Cancha':
            field.status === 'available'
              ? 'Disponible'
              : field.status === 'maintenance'
                ? 'Mantenimiento'
                : 'No disponible',
          Aprobada: field.is_approved ? 'Sí' : 'No',
          'Teléfono Cancha': field.phone || field.contact_phone || 'N/A',
          'Horario Apertura': field.opening_time || 'N/A',
          'Horario Cierre': field.closing_time || 'N/A',
          'Fecha Creación': field.date_time_registration
            ? new Date(field.date_time_registration).toLocaleDateString('es-PE')
            : 'N/A',
        })
      })
    })

    // Resumen mejorado
    const summaryData = [
      { Métrica: 'Total de Usuarios', Valor: stats.total },
      { Métrica: 'Acceso Permitido', Valor: stats.allowed },
      { Métrica: 'Bloqueados', Valor: stats.blocked },
      { Métrica: 'Usuarios con Canchas', Valor: stats.withFields },
      { Métrica: 'Usuarios sin Canchas', Valor: stats.total - stats.withFields },
      { Métrica: 'Total Canchas Registradas', Valor: fieldsData.length },
      { Métrica: 'Usuarios Exportados', Valor: filteredUsers.length },
      { Métrica: 'Fecha de Exportación', Valor: new Date().toLocaleString('es-PE') },
      { Métrica: 'Generado por', Valor: currentUser?.name || 'Sistema' },
    ]

    // Crear workbook con múltiples hojas
    const wb = XLSX.utils.book_new()

    // Hoja 1: Resumen
    const wsSummary = XLSX.utils.json_to_sheet(summaryData)
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 30 }]
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen')

    // Hoja 2: Usuarios
    const wsUsers = XLSX.utils.json_to_sheet(usersData)
    wsUsers['!cols'] = [
      { wch: 8 }, // ID
      { wch: 25 }, // Nombre
      { wch: 30 }, // Email
      { wch: 12 }, // Teléfono
      { wch: 15 }, // Rol
      { wch: 12 }, // Acceso
      { wch: 25 }, // Establecimiento
      { wch: 10 }, // N° Canchas
      { wch: 40 }, // Canchas Asignadas
      { wch: 8 }, // Meses
      { wch: 8 }, // Días
      { wch: 20 }, // Antigüedad
      { wch: 12 }, // Fecha Reg
      { wch: 10 }, // Hora Reg
      { wch: 25 }, // Últ Actividad
      { wch: 18 }, // Fecha Últ Act
      { wch: 12 }, // Total Act
    ]
    XLSX.utils.book_append_sheet(wb, wsUsers, 'Usuarios')

    // Hoja 3: Canchas (si hay datos)
    if (fieldsData.length > 0) {
      const wsFields = XLSX.utils.json_to_sheet(fieldsData)
      wsFields['!cols'] = [
        { wch: 10 }, // ID Usuario
        { wch: 20 }, // Administrador
        { wch: 25 }, // Email Admin
        { wch: 10 }, // ID Cancha
        { wch: 25 }, // Nombre Cancha
        { wch: 35 }, // Dirección
        { wch: 15 }, // Distrito
        { wch: 15 }, // Tipo Deporte
        { wch: 12 }, // Precio
        { wch: 10 }, // Capacidad
        { wch: 15 }, // Estado
        { wch: 10 }, // Aprobada
        { wch: 12 }, // Teléfono
        { wch: 12 }, // Hora Apertura
        { wch: 12 }, // Hora Cierre
        { wch: 12 }, // Fecha Creación
      ]
      XLSX.utils.book_append_sheet(wb, wsFields, 'Canchas')
    }

    const fileName = `Reporte_Usuarios_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    Swal.fire({
      icon: 'success',
      title: 'Excel Descargado',
      text: `Se exportaron ${filteredUsers.length} usuarios y ${fieldsData.length} canchas`,
      confirmButtonColor: '#22c55e',
    })
  }

  // Mostrar loading mientras se cargan los usuarios
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">
              Gestión de Usuarios y Registros
            </h2>
            <p className="text-secondary-600 mt-1">
              Administradores de canchas con su historial de actividad
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportAllUsersToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              title="Exportar todos los usuarios a Excel"
            >
              <FileText className="w-5 h-5" />
              <span>Exportar Excel</span>
            </button>
            <button
              onClick={() => setShowNewUserModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Nuevo Usuario</span>
            </button>
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-primary-600" />
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <UserStatsCards stats={stats} />
      </div>

      {/* Filtros y búsqueda */}
      <UserFilters
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        filterMonths={filterMonths}
        hasActiveFilters={hasActiveFilters}
        filteredCount={filteredUsers.length}
        totalCount={fieldAdmins.length}
        onSearchChange={setSearchTerm}
        onStatusChange={setFilterStatus}
        onMonthsChange={setFilterMonths}
        onResetFilters={resetFilters}
      />

      {/* Tabla de usuarios */}
      <UserTable
        users={filteredUsers}
        fields={fields}
        getUserFields={(userId) => getUserFields(userId, fields)}
        getUserActivity={getUserActivity}
        onLoadUserActivity={ensureUserActivityLoaded}
        onToggleBlock={handleToggleBlock}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onViewDetails={handleViewDetails}
        isSuperAdmin={currentUser?.id_rol === 1 || currentUser?.role === 'super_admin'}
      />

      {/* Modal de detalles de canchas - Mejorado */}
      {showDetailsModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header fijo */}
            <div className="p-6 border-b border-secondary-200 bg-gradient-to-r from-primary-600 to-primary-700 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Canchas de {selectedUser.name}</h3>
                  <p className="text-primary-100 text-sm mt-1">
                    {getUserFields(selectedUser.id, fields).length} cancha(s) administrada(s)
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {getUserFields(selectedUser.id, fields).map((field) => {
                  // Obtener la primera imagen del array de imágenes o de image_url
                  const imageUrl = field.images?.[0] || field.image_url || field.imageUrl
                  const fullImageUrl = imageUrl
                    ? imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
                      ? imageUrl
                      : imageUrl.startsWith('/')
                        ? `${API_CONFIG.BASE_URL}${imageUrl}`
                        : imageUrl
                    : null

                  return (
                    <div
                      key={field.id}
                      className="border border-secondary-200 rounded-xl overflow-hidden hover:shadow-lg transition-all bg-white"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Imagen de la cancha */}
                        <div className="md:w-1/3 h-48 md:h-auto bg-secondary-100 relative">
                          {fullImageUrl ? (
                            <img
                              src={fullImageUrl}
                              alt={field.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div
                            className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 ${fullImageUrl ? 'hidden' : ''}`}
                          >
                            <Building className="w-16 h-16 text-primary-400" />
                          </div>
                          {/* Badges superpuestos */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                                field.status === 'available'
                                  ? 'bg-green-500 text-white'
                                  : field.status === 'maintenance'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-red-500 text-white'
                              }`}
                            >
                              {field.status === 'available'
                                ? 'Disponible'
                                : field.status === 'maintenance'
                                  ? 'Mantenimiento'
                                  : 'No disponible'}
                            </span>
                            {field.is_approved !== undefined && (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                                  field.is_approved
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-orange-500 text-white'
                                }`}
                              >
                                {field.is_approved ? 'Aprobada' : 'Pendiente'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Información de la cancha */}
                        <div className="md:w-2/3 p-5">
                          {/* Encabezado */}
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-bold text-secondary-900">{field.name}</h4>
                              <p className="text-sm text-secondary-500">ID: {field.id}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary-600">
                                S/ {field.pricePerHour || field.price_per_hour || 0}
                              </p>
                              <p className="text-xs text-secondary-500">por hora</p>
                            </div>
                          </div>

                          {/* Grid de información */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Ubicación */}
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-secondary-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-secondary-500">Ubicación</p>
                                <p className="text-sm font-medium text-secondary-900">
                                  {field.address || 'Sin dirección'}
                                </p>
                                {field.district_name && (
                                  <p className="text-xs text-secondary-500">
                                    {field.district_name}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Tipo de deporte */}
                            <div className="flex items-start gap-2">
                              <Activity className="w-4 h-4 text-secondary-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-secondary-500">Tipo de cancha</p>
                                <p className="text-sm font-medium text-secondary-900">
                                  {field.sport_type_name ||
                                    field.sportType?.name ||
                                    'No especificado'}
                                </p>
                              </div>
                            </div>

                            {/* Capacidad */}
                            <div className="flex items-start gap-2">
                              <Users className="w-4 h-4 text-secondary-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-secondary-500">Capacidad</p>
                                <p className="text-sm font-medium text-secondary-900">
                                  {field.capacity || field.max_players || 'No especificada'}{' '}
                                  personas
                                </p>
                              </div>
                            </div>

                            {/* Teléfono */}
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-secondary-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-secondary-500">Contacto</p>
                                <p className="text-sm font-medium text-secondary-900">
                                  {field.phone || field.contact_phone || 'No registrado'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Horarios */}
                          {(field.opening_time || field.closing_time) && (
                            <div className="flex items-center gap-2 mb-4 p-3 bg-secondary-50 rounded-lg">
                              <Clock className="w-4 h-4 text-secondary-400" />
                              <div>
                                <p className="text-xs text-secondary-500">Horario de atención</p>
                                <p className="text-sm font-medium text-secondary-900">
                                  {field.opening_time || '06:00'} - {field.closing_time || '23:00'}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Amenidades */}
                          {field.amenities && field.amenities.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs text-secondary-500 mb-2">Servicios</p>
                              <div className="flex flex-wrap gap-1">
                                {field.amenities.slice(0, 6).map((amenity) => (
                                  <span
                                    key={amenity.key}
                                    className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full"
                                  >
                                    {amenity.label}
                                  </span>
                                ))}
                                {field.amenities.length > 6 && (
                                  <span className="px-2 py-1 bg-secondary-100 text-secondary-600 text-xs rounded-full">
                                    +{field.amenities.length - 6} más
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Descripción */}
                          {field.description && (
                            <div className="mb-4">
                              <p className="text-xs text-secondary-500 mb-1">Descripción</p>
                              <p className="text-sm text-secondary-700 line-clamp-2">
                                {field.description}
                              </p>
                            </div>
                          )}

                          {/* Footer con fechas */}
                          <div className="flex items-center justify-between pt-3 border-t border-secondary-100 text-xs text-secondary-500">
                            <span>
                              Creada:{' '}
                              {field.date_time_registration
                                ? new Date(field.date_time_registration).toLocaleDateString('es-PE')
                                : 'N/A'}
                            </span>
                            {field.date_time_modification && (
                              <span>
                                Actualizada:{' '}
                                {new Date(field.date_time_modification).toLocaleDateString('es-PE')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {getUserFields(selectedUser.id, fields).length === 0 && (
                  <div className="text-center py-12">
                    <Building className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
                    <p className="text-lg font-medium text-secondary-500">Sin canchas asignadas</p>
                    <p className="text-sm text-secondary-400">
                      Este usuario no administra ninguna cancha
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer fijo */}
            <div className="p-4 border-t border-secondary-200 bg-secondary-50 flex-shrink-0">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-2.5 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-secondary-200">
              <h3 className="text-xl font-bold text-secondary-900">Editar Usuario</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={editFormData.phone}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: formatPhone(e.target.value) })
                  }
                  maxLength={11}
                  placeholder="999 999 999"
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  disabled={isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Nueva contraseña (dejar vacío para mantener la actual)
                </label>
                <div className="relative">
                  <input
                    type={showPassword[selectedUser.id] ? 'text' : 'password'}
                    value={editFormData.newPassword}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, newPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-10 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    disabled={isUpdating}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        [selectedUser.id]: !showPassword[selectedUser.id],
                      })
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
                    disabled={isUpdating}
                  >
                    {showPassword[selectedUser.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {editFormData.newPassword && editFormData.newPassword.length < 6 && (
                  <p className="text-xs text-red-600 mt-1">
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-secondary-200 flex space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 bg-secondary-200 hover:bg-secondary-300 text-secondary-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdating}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateUser}
                className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear nuevo usuario */}
      <NewAdminModal
        isOpen={showNewUserModal}
        onClose={() => setShowNewUserModal(false)}
        onSave={handleCreateUser}
      />
    </div>
  )
}

export default UsersManagementModule
