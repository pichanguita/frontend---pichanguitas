import React, { useState } from 'react'
import {
  Users,
  Mail,
  Phone,
  MapPin,
  Eye,
  Power,
  Activity,
  Edit,
  Trash2,
  Calendar,
  Gift,
  Building,
  LogIn,
  Settings,
  FileText,
  RefreshCw,
  Copy,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'
import {
  getMonthsAndDays,
  getRegistrationColor,
  checkUserAnniversary,
  formatDate,
  exportToExcel,
  generateSimplePassword,
} from '../../utils/userManagementHelpers'
import { getToken } from '../../config/api.config'

/**
 * Componente de tabla de usuarios con funcionalidad expandible
 * @param {Object} props - Props del componente
 * @param {Array} props.users - Array de usuarios filtrados
 * @param {Array} props.fields - Array de todas las canchas
 * @param {Function} props.getUserFields - Función para obtener canchas de un usuario
 * @param {Function} props.getUserActivity - Función para obtener actividad de un usuario
 * @param {Function} props.onToggleBlock - Handler para bloquear/desbloquear acceso (is_blocked)
 * @param {Function} props.onEditUser - Handler para editar usuario
 * @param {Function} props.onDeleteUser - Handler para eliminar usuario
 * @param {Function} props.onViewDetails - Handler para ver detalles de canchas
 */
const UserTable = ({
  users,
  getUserFields,
  getUserActivity,
  onToggleBlock,
  onEditUser,
  onDeleteUser,
  onViewDetails,
  isSuperAdmin = false,
}) => {
  const [, setShowPassword] = useState({})
  const [expandedUserId, setExpandedUserId] = useState(null)
  const [activityTab, setActivityTab] = useState('all')
  const [passwordModal, setPasswordModal] = useState({ show: false, userId: null, password: '' })
  const [copied, setCopied] = useState(false)
  const [resetLoading, setResetLoading] = useState({})
  const [confirmModal, setConfirmModal] = useState({ show: false, user: null })
  const [errorModal, setErrorModal] = useState({ show: false, message: '' })

  // Función para obtener el color según meses cumplidos
  const getMonthColor = (months) => {
    if (months === 0) {
      return {
        bg: 'bg-slate-100',
        border: 'border-slate-400',
        text: 'text-slate-800',
        icon: 'text-slate-600',
        emoji: '⚪',
      }
    }
    if (months === 1) {
      return {
        bg: 'bg-sky-100',
        border: 'border-sky-500',
        text: 'text-sky-800',
        icon: 'text-sky-600',
        emoji: '🔵',
      }
    }
    if (months === 2) {
      return {
        bg: 'bg-emerald-100',
        border: 'border-emerald-500',
        text: 'text-emerald-800',
        icon: 'text-emerald-600',
        emoji: '🟢',
      }
    }
    if (months === 3) {
      return {
        bg: 'bg-amber-100',
        border: 'border-amber-500',
        text: 'text-amber-800',
        icon: 'text-amber-600',
        emoji: '🟡',
      }
    }
    if (months === 4) {
      return {
        bg: 'bg-orange-100',
        border: 'border-orange-500',
        text: 'text-orange-800',
        icon: 'text-orange-600',
        emoji: '🟠',
      }
    }
    if (months === 5) {
      return {
        bg: 'bg-violet-100',
        border: 'border-violet-500',
        text: 'text-violet-800',
        icon: 'text-violet-600',
        emoji: '🟣',
      }
    }
    if (months === 6) {
      return {
        bg: 'bg-fuchsia-100',
        border: 'border-fuchsia-500',
        text: 'text-fuchsia-800',
        icon: 'text-fuchsia-600',
        emoji: '🟪',
      }
    }
    if (months === 7) {
      return {
        bg: 'bg-rose-100',
        border: 'border-rose-500',
        text: 'text-rose-800',
        icon: 'text-rose-600',
        emoji: '🌹',
      }
    }
    if (months === 8) {
      return {
        bg: 'bg-pink-100',
        border: 'border-pink-500',
        text: 'text-pink-800',
        icon: 'text-pink-600',
        emoji: '💗',
      }
    }
    if (months === 9) {
      return {
        bg: 'bg-cyan-100',
        border: 'border-cyan-500',
        text: 'text-cyan-800',
        icon: 'text-cyan-600',
        emoji: '🔷',
      }
    }
    if (months === 10) {
      return {
        bg: 'bg-teal-100',
        border: 'border-teal-500',
        text: 'text-teal-800',
        icon: 'text-teal-600',
        emoji: '💎',
      }
    }
    if (months === 11) {
      return {
        bg: 'bg-lime-100',
        border: 'border-lime-500',
        text: 'text-lime-800',
        icon: 'text-lime-600',
        emoji: '🍏',
      }
    }
    return {
      bg: 'bg-gradient-to-r from-purple-100 to-pink-100',
      border: 'border-purple-500',
      text: 'text-purple-800',
      icon: 'text-purple-600',
      emoji: '⭐',
    }
  }

  // Función para obtener icono de actividad
  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return <LogIn className="w-3 h-3" />
      case 'field':
        return <Building className="w-3 h-3" />
      case 'reservation':
        return <Calendar className="w-3 h-3" />
      case 'settings':
        return <Settings className="w-3 h-3" />
      default:
        return <Activity className="w-3 h-3" />
    }
  }

  // Handler para exportar actividad individual
  const handleExportActivity = (user) => {
    const activities = getUserActivity(user.id)
    exportToExcel(user, activities)
  }

  // Handler para expandir/contraer actividades
  const handleToggleExpand = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId)
    if (expandedUserId !== userId) {
      setActivityTab('all')
    }
  }

  // Handler para mostrar modal de confirmación
  const handleShowConfirmModal = (user) => {
    setConfirmModal({ show: true, user })
  }

  // Handler para cancelar confirmación
  const handleCancelConfirm = () => {
    setConfirmModal({ show: false, user: null })
  }

  // Handler para resetear contraseña (después de confirmar)
  const handleResetPassword = async () => {
    const user = confirmModal.user
    if (!user) return

    // Cerrar modal de confirmación
    setConfirmModal({ show: false, user: null })

    try {
      setResetLoading((prev) => ({ ...prev, [user.id]: true }))

      // Generar nueva contraseña
      const newPassword = generateSimplePassword()

      // Obtener token correctamente desde localStorage
      const token = getToken()

      if (!token) {
        setErrorModal({
          show: true,
          message: 'No se encontró token de autenticación. Por favor inicia sesión nuevamente.',
        })
        return
      }

      // Llamar al API para actualizar la contraseña
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/${user.id}/password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ new_password: newPassword }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Error al resetear contraseña')
      }

      // Mostrar modal con la nueva contraseña
      setPasswordModal({ show: true, userId: user.id, password: newPassword })
      setCopied(false)
    } catch (error) {
      console.error('Error al resetear contraseña:', error)
      setErrorModal({
        show: true,
        message: error.message || 'Error al generar nueva contraseña. Por favor intenta de nuevo.',
      })
    } finally {
      setResetLoading((prev) => ({ ...prev, [user.id]: false }))
    }
  }

  // Handler para copiar contraseña
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(passwordModal.password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handler para cerrar modal
  const handleCloseModal = () => {
    setPasswordModal({ show: false, userId: null, password: '' })
    setCopied(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50 border-b border-secondary-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Contraseña
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Establecimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Canchas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Acceso
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Última Actividad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Registro
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Meses Cumplidos
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-secondary-700 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-secondary-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-6 py-12 text-center text-secondary-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
                  <p className="text-lg font-medium">No se encontraron usuarios</p>
                  <p className="text-sm mt-1">Intenta ajustar los filtros de búsqueda</p>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const userFields = getUserFields(user.id)
                const activities = getUserActivity(user.id)
                const lastActivity = activities[0] || null

                const monthsAndDays = getMonthsAndDays(user.createdAt)
                const monthsCompleted = monthsAndDays.months
                const isAnniversary = checkUserAnniversary(user.createdAt)
                const registrationColors = getRegistrationColor(user.createdAt)
                const monthColors = getMonthColor(monthsCompleted)

                return (
                  <React.Fragment key={user.id}>
                    <tr>
                      {/* Columna Usuario */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-bold">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-secondary-900">{user.name}</p>
                            <p className="text-xs text-secondary-500">ID: {user.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Columna Contacto */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-secondary-600">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                          <div className="flex items-center text-sm text-secondary-600">
                            <Phone className="w-3 h-3 mr-1" />
                            {user.username || 'N/A'}
                          </div>
                        </div>
                      </td>

                      {/* Columna Contraseña */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleShowConfirmModal(user)}
                            disabled={resetLoading[user.id]}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
                            title="Generar nueva contraseña temporal"
                          >
                            {resetLoading[user.id] ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                Generando...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Resetear
                              </>
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Columna Establecimiento */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {userFields.length > 0 ? (
                            <>
                              <p className="text-sm font-medium text-secondary-900">
                                {userFields[0].name}
                                {userFields.length > 1 && (
                                  <span className="text-xs text-secondary-500 ml-1">
                                    (+{userFields.length - 1} más)
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center text-xs text-secondary-500">
                                <MapPin className="w-3 h-3 mr-1" />
                                {userFields[0].distrito || userFields[0].address || 'Sin dirección'}
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-secondary-400">
                                Sin asignación
                              </p>
                              <div className="flex items-center text-xs text-secondary-400">
                                <MapPin className="w-3 h-3 mr-1" />
                                Sin dirección
                              </div>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Columna Canchas */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-secondary-900">
                            {userFields.length}
                          </span>
                          {userFields.length > 0 && (
                            <button
                              onClick={() => onViewDetails(user)}
                              className="text-primary-600 hover:text-primary-700"
                              title="Ver canchas"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Columna Estado (Acceso) */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {user.isBlocked ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <Power className="w-3 h-3 mr-1" />
                              Bloqueado
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              Permitido
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Columna Última Actividad */}
                      <td className="px-6 py-4">
                        <div className="text-xs text-secondary-600">
                          {lastActivity ? (
                            <div>
                              <p className="font-medium">
                                {typeof lastActivity.action === 'string'
                                  ? lastActivity.action
                                  : 'Actividad registrada'}
                              </p>
                              <p className="text-secondary-500">
                                {formatDate(lastActivity.timestamp)}
                              </p>
                            </div>
                          ) : user.lastLogin || user.last_login ? (
                            <div>
                              <p className="font-medium text-green-600">Último acceso</p>
                              <p className="text-secondary-500">
                                {formatDate(user.lastLogin || user.last_login)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-secondary-400">Sin actividad registrada</span>
                          )}
                        </div>
                      </td>

                      {/* Columna Registro */}
                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex flex-col items-start px-3 py-2 rounded-lg border ${registrationColors.bg} ${registrationColors.border}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${registrationColors.badge}`}
                            >
                              {registrationColors.badgeText}
                            </span>
                            <Calendar className={`w-3 h-3 ${registrationColors.text}`} />
                          </div>
                          <p className={`text-xs font-medium ${registrationColors.text}`}>
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </td>

                      {/* Columna Meses Cumplidos */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`inline-flex flex-col items-center gap-1 px-4 py-2 ${monthColors.bg} border-2 ${monthColors.border} rounded-lg ${isAnniversary ? 'animate-pulse shadow-lg' : 'shadow-sm'}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{monthColors.emoji}</span>
                              <span className={`text-sm font-bold ${monthColors.text}`}>
                                {monthsAndDays.text}
                              </span>
                            </div>
                          </div>
                          {isAnniversary && (
                            <span className="text-xs text-purple-600 mt-1 font-medium flex items-center gap-1">
                              <Gift className="w-3 h-3" />
                              🎉 Aniversario hoy
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Columna Acciones */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => onToggleBlock(user)}
                            className={`transition-colors p-2 rounded-lg ${
                              !user.isBlocked
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                            title={
                              user.isBlocked
                                ? 'Desbloquear acceso de usuario'
                                : 'Bloquear acceso de usuario'
                            }
                          >
                            <Power className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleExpand(user.id)}
                            className={`transition-colors ${
                              expandedUserId === user.id
                                ? 'text-purple-700 bg-purple-100 px-2 py-1 rounded'
                                : 'text-purple-600 hover:text-purple-700'
                            }`}
                            title="Ver registros de actividad"
                          >
                            <Activity className="w-4 h-4" />
                            {expandedUserId === user.id && (
                              <span className="ml-1 text-xs">Ocultar</span>
                            )}
                          </button>
                          <button
                            onClick={() => onEditUser(user)}
                            className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-blue-50"
                            title="Editar usuario"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isSuperAdmin && (
                            <button
                              onClick={() => onDeleteUser(user)}
                              className="text-red-600 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Fila expandible con actividades */}
                    {expandedUserId === user.id && (
                      <tr>
                        <td colSpan="10" className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-secondary-900">
                                Historial de Actividad - {user.name}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <select
                                  value={activityTab}
                                  onChange={(e) => setActivityTab(e.target.value)}
                                  className="text-sm px-3 py-1 border border-secondary-200 rounded-lg"
                                >
                                  <option value="all">Todas las actividades</option>
                                  <option value="login">Solo accesos</option>
                                  <option value="field">Solo canchas</option>
                                  <option value="reservation">Solo reservas</option>
                                </select>
                                <button
                                  onClick={() => handleExportActivity(user)}
                                  className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Excel
                                </button>
                              </div>
                            </div>

                            {/* Lista de actividades */}
                            <div className="max-h-80 overflow-y-auto space-y-2">
                              {getUserActivity(user.id)
                                .filter(
                                  (activity) =>
                                    activityTab === 'all' || activity.type === activityTab
                                )
                                .slice(0, 10)
                                .map((activity) => (
                                  <div
                                    key={activity.id}
                                    className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-secondary-200"
                                  >
                                    <div className="p-1.5 bg-secondary-100 rounded">
                                      {getActivityIcon(activity.type)}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <p className="text-sm font-medium text-secondary-900">
                                            {typeof activity.action === 'string'
                                              ? activity.action
                                              : 'Actividad registrada'}
                                          </p>
                                          <p className="text-xs text-secondary-600 mt-0.5">
                                            {typeof activity.details === 'string'
                                              ? activity.details
                                              : activity.details?.description || ''}
                                          </p>
                                          <p className="text-xs text-secondary-500 mt-1">
                                            {formatDate(activity.timestamp)}
                                            {activity.ip && ` • IP: ${activity.ip}`}
                                            {activity.amount && ` • ${activity.amount}`}
                                          </p>
                                        </div>
                                        {activity.status && (
                                          <span
                                            className={`text-xs px-2 py-1 rounded-full ${
                                              activity.status === 'error'
                                                ? 'bg-red-100 text-red-700'
                                                : activity.status === 'warning'
                                                  ? 'bg-yellow-100 text-yellow-700'
                                                  : activity.status === 'success'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-blue-100 text-blue-700'
                                            }`}
                                          >
                                            {activity.status === 'error'
                                              ? 'Error'
                                              : activity.status === 'warning'
                                                ? 'Advertencia'
                                                : activity.status === 'success'
                                                  ? 'Éxito'
                                                  : 'Info'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>

                            {/* Resumen rápido */}
                            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-secondary-200">
                              <div className="text-center">
                                <p className="text-lg font-bold text-blue-600">
                                  {
                                    getUserActivity(user.id).filter((a) => a.type === 'login')
                                      .length
                                  }
                                </p>
                                <p className="text-xs text-secondary-600">Accesos</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-purple-600">
                                  {
                                    getUserActivity(user.id).filter((a) => a.type === 'field')
                                      .length
                                  }
                                </p>
                                <p className="text-xs text-secondary-600">Cambios Canchas</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-green-600">
                                  {
                                    getUserActivity(user.id).filter((a) => a.type === 'reservation')
                                      .length
                                  }
                                </p>
                                <p className="text-xs text-secondary-600">Reservas</p>
                              </div>
                              <div className="text-center">
                                <p className="text-lg font-bold text-orange-600">
                                  {
                                    getUserActivity(user.id).filter((a) => a.type === 'settings')
                                      .length
                                  }
                                </p>
                                <p className="text-xs text-secondary-600">Configuración</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación elegante */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scaleIn">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-5">
              <div className="flex items-center justify-center">
                <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-full p-3 mb-2">
                  <RefreshCw className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white text-center">Resetear Contraseña</h3>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <p className="text-center text-secondary-700 text-lg">
                  ¿Generar nueva contraseña temporal para
                </p>
                <p className="text-center font-bold text-2xl text-blue-600 mt-2">
                  {confirmModal.user?.name}?
                </p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      La contraseña actual será <strong>reemplazada permanentemente</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div className="bg-secondary-50 px-6 py-4 flex items-center justify-end space-x-3">
              <button
                onClick={handleCancelConfirm}
                className="px-5 py-2.5 text-secondary-700 bg-white hover:bg-secondary-100 border border-secondary-300 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
              >
                Sí, Generar Contraseña
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de contraseña generada */}
      {passwordModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scaleIn">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-full p-2 mr-3">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">¡Contraseña Generada!</h3>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-4">
              {/* Contraseña con efecto de cristal */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-5 shadow-inner">
                <p className="text-sm text-secondary-600 mb-3 text-center font-medium">
                  Nueva contraseña temporal:
                </p>
                <div className="flex items-center justify-between bg-white rounded-xl px-5 py-4 border-2 border-blue-300 shadow-lg">
                  <code className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-wider">
                    {passwordModal.password}
                  </code>
                  <button
                    onClick={handleCopyPassword}
                    className={`ml-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                      copied
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md'
                    }`}
                    title="Copiar contraseña"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Mensaje de éxito al copiar */}
              {copied && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg p-4 animate-slideIn">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        ¡Contraseña copiada al portapapeles!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Advertencia importante */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Importante:</strong> Esta contraseña ya está guardada en la base de
                      datos. Cópiala ahora y compártela con el usuario de forma segura.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-secondary-50 px-6 py-4 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-5 py-2.5 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Error elegante */}
      {errorModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scaleIn">
            {/* Header con gradiente rojo */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-5">
              <div className="flex items-center justify-center">
                <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-full p-3 mb-2">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white text-center">
                Error al Generar Contraseña
              </h3>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-4">
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{errorModal.message}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Soluciones:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                  <li>Verifica tu conexión a internet</li>
                  <li>Intenta cerrar sesión y volver a iniciar</li>
                  <li>Contacta al soporte si el problema persiste</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-secondary-50 px-6 py-4 flex justify-end">
              <button
                onClick={() => setErrorModal({ show: false, message: '' })}
                className="px-5 py-2.5 bg-gradient-to-r from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserTable
