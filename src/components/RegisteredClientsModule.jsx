import React, { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Search,
  RefreshCw,
  Key,
  Mail,
  Phone,
  Calendar,
  User,
  Check,
  FileText,
  Filter,
  X,
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import { fetchUsers, resetPasswordAPI } from '../services/users/usersService'

const RegisteredClientsModule = () => {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [resettingPassword, setResettingPassword] = useState(null)

  // Cargar clientes registrados (role_id = 3)
  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true)
        const usersData = await fetchUsers({ role_id: 3 }, token)
        setClients(usersData)
      } catch (error) {
        console.error('Error al cargar clientes:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudieron cargar los clientes',
          confirmButtonColor: '#22c55e',
        })
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [token])

  // Filtrar clientes
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.username?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && client.isActive) ||
        (filterStatus === 'inactive' && !client.isActive)

      return matchesSearch && matchesStatus
    })
  }, [clients, searchTerm, filterStatus])

  // Estadísticas
  const stats = useMemo(
    () => ({
      total: clients.length,
      active: clients.filter((c) => c.isActive).length,
      inactive: clients.filter((c) => !c.isActive).length,
    }),
    [clients]
  )

  // Handler para resetear contraseña
  const handleResetPassword = async (client) => {
    const result = await Swal.fire({
      title: 'Resetear contraseña',
      html: `
        <div class="text-left">
          <p class="mb-2">Se generará una contraseña temporal para:</p>
          <p class="font-semibold text-lg">${client.name}</p>
          <p class="text-sm text-gray-500">${client.email}</p>
          <p class="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            La contraseña temporal deberá ser cambiada por el cliente en su próximo inicio de sesión.
          </p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Generar contraseña',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      setResettingPassword(client.id)
      try {
        const response = await resetPasswordAPI(client.id, token)

        await Swal.fire({
          title: 'Contraseña reseteada',
          html: `
            <div class="text-left">
              <p class="mb-3">La contraseña temporal para <strong>${response.userName || client.name}</strong> es:</p>
              <div class="bg-gray-100 p-4 rounded-lg flex items-center justify-between">
                <code class="text-xl font-mono font-bold text-primary-600">${response.temporaryPassword}</code>
                <button
                  id="copy-pwd-btn"
                  class="ml-3 p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  title="Copiar contraseña"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                  </svg>
                </button>
              </div>
              <p class="mt-4 text-sm text-gray-600">
                <strong>Email del cliente:</strong> ${response.userEmail || client.email}
              </p>
              <p class="mt-2 text-sm text-amber-600">
                Comunique esta contraseña al cliente de forma segura.
              </p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#22c55e',
          didOpen: () => {
            const copyBtn = document.getElementById('copy-pwd-btn')
            if (copyBtn) {
              copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(response.temporaryPassword)
                copyBtn.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                `
                setTimeout(() => {
                  copyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                  `
                }, 2000)
              })
            }
          },
        })
      } catch (error) {
        console.error('Error al resetear contraseña:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo resetear la contraseña',
          confirmButtonColor: '#22c55e',
        })
      } finally {
        setResettingPassword(null)
      }
    }
  }

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  // Exportar a Excel
  const exportToExcel = () => {
    if (filteredClients.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay clientes para exportar',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    const exportData = filteredClients.map((client) => ({
      ID: client.id,
      Nombre: client.name || 'N/A',
      Email: client.email || 'N/A',
      Teléfono: client.phone || client.username || 'N/A',
      Estado: client.isActive ? 'Activo' : 'Inactivo',
      'Fecha Registro': formatDate(client.createdAt || client.dateTimeRegistration),
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    ws['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 35 }, { wch: 15 }, { wch: 10 }, { wch: 15 }]

    XLSX.utils.book_append_sheet(wb, ws, 'Clientes Registrados')
    XLSX.writeFile(wb, `Clientes_Registrados_${new Date().toISOString().split('T')[0]}.xlsx`)

    Swal.fire({
      icon: 'success',
      title: 'Excel Descargado',
      text: `Se exportaron ${filteredClients.length} clientes`,
      timer: 2000,
      showConfirmButton: false,
    })
  }

  // Recargar datos
  const handleRefresh = async () => {
    try {
      setLoading(true)
      const usersData = await fetchUsers({ role_id: 3 }, token)
      setClients(usersData)
      Swal.fire({
        icon: 'success',
        title: 'Datos actualizados',
        timer: 1500,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron actualizar los datos',
        confirmButtonColor: '#22c55e',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Cargando clientes registrados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-primary-600" />
              Clientes Registrados
            </h2>
            <p className="text-secondary-600 mt-1">
              Usuarios con cuenta que pueden iniciar sesión en la plataforma
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Clientes</p>
                <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Activos</p>
                <p className="text-3xl font-bold text-green-700">{stats.active}</p>
              </div>
              <Check className="w-10 h-10 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Inactivos</p>
                <p className="text-3xl font-bold text-red-700">{stats.inactive}</p>
              </div>
              <X className="w-10 h-10 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-secondary-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-secondary-500">
          Mostrando {filteredClients.length} de {clients.length} clientes
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-secondary-500">No se encontraron clientes</p>
            <p className="text-sm text-secondary-400 mt-1">
              {searchTerm || filterStatus !== 'all'
                ? 'Intenta con otros filtros de búsqueda'
                : 'Aún no hay clientes registrados en la plataforma'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    Registro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-secondary-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-secondary-50 transition-colors">
                    {/* Cliente */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">
                            {client.name || 'Sin nombre'}
                          </p>
                          <p className="text-sm text-secondary-500">ID: {client.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-secondary-400" />
                          <span className="text-secondary-700">{client.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-secondary-400" />
                          <span className="text-secondary-700">
                            {client.phone || client.username || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Registro */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-secondary-600">
                        <Calendar className="w-4 h-4 text-secondary-400" />
                        {formatDate(client.createdAt || client.dateTimeRegistration)}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          client.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {client.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleResetPassword(client)}
                          disabled={resettingPassword === client.id}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Resetear contraseña"
                        >
                          {resettingPassword === client.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                              Reseteando...
                            </>
                          ) : (
                            <>
                              <Key className="w-4 h-4" />
                              Resetear Contraseña
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default RegisteredClientsModule
