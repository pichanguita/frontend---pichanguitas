import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  User,
  Plus,
  Search,
  Eye,
  Trash2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  Star,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import useAuthStore from '../store/authStore'
import SimpleClientRegistrationModal from './SimpleClientRegistrationModal'
import { fetchMyClients, createCustomerAPI, deleteCustomerAPI } from '@/services/customers'

const MySwal = withReactContent(Swal)

const ClientCard = ({ client, onDelete, onViewDetails }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between">
        <div className="flex-1 mb-4 lg:mb-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{client.name}</h4>
                {client.isVIP && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full mt-1">
                    <Star className="w-3 h-3 mr-1" fill="currentColor" />
                    VIP
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              <span>{client.phoneNumber}</span>
            </div>

            {client.email && (
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                <span>{client.email}</span>
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{client.totalReservations}</p>
                <p className="text-xs">Reservas</p>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{client.totalHours} hrs</p>
                <p className="text-xs">Horas jugadas</p>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
              <div>
                <p className="font-medium text-primary-600">S/ {client.totalSpent.toFixed(2)}</p>
                <p className="text-xs">Total gastado</p>
              </div>
            </div>

            {client.availableFreeHours > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                <div>
                  <p className="font-medium text-yellow-600">{client.availableFreeHours} hrs</p>
                  <p className="text-xs">Horas gratis</p>
                </div>
              </div>
            )}
          </div>

          {/* Notas */}
          {client.notes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-800 mb-1">Notas:</p>
              <p className="text-sm text-gray-700">{client.notes}</p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:ml-4">
          <button
            onClick={() => onViewDetails(client)}
            className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalles
          </button>

          <button
            onClick={() => onDelete(client)}
            className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Registrado: {new Date(client.createdAt).toLocaleDateString('es-PE')}</span>
          {client.lastReservation && (
            <span>
              Última reserva: {new Date(client.lastReservation).toLocaleDateString('es-PE')}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const MyClientsModule = () => {
  const { user, token } = useAuthStore()

  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Función para cargar clientes desde la API
  const loadClients = useCallback(async () => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const customersList = await fetchMyClients()

      setClients(customersList || [])
      setFilteredClients(customersList || [])
    } catch (err) {
      console.error('❌ Error loading clients:', err)
      setError(err.message || 'Error al cargar clientes')
      setClients([])
      setFilteredClients([])
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients()
  }, [loadClients])

  // Filtro por búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.phoneNumber.includes(searchTerm) ||
          (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredClients(filtered)
    } else {
      setFilteredClients(clients)
    }
  }, [clients, searchTerm])

  // Early return después de TODOS los hooks
  if (!user) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <p className="text-gray-500">Cargando información del usuario...</p>
      </div>
    )
  }

  const handleNewClient = async (clientData) => {
    try {
      // Crear cliente mediante la API
      const customerPayload = {
        phone_number: clientData.phoneNumber,
        name: clientData.name,
        email: clientData.email || null,
        notes: clientData.notes || '',
      }

      await createCustomerAPI(customerPayload, token)

      // Recargar clientes desde la API
      await loadClients()
      setIsRegistrationModalOpen(false)

      MySwal.fire({
        title: 'Cliente Registrado',
        text: `${clientData.name} ha sido registrado exitosamente`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error('Error creating client:', error)
      MySwal.fire({
        title: 'Error',
        text: error.message || 'No se pudo registrar el cliente. Intenta nuevamente.',
        icon: 'error',
      })
      // Propagar el error para que el modal NO limpie el formulario
      throw error
    }
  }

  const handleDeleteClient = async (client) => {
    const result = await MySwal.fire({
      title: '¿Eliminar cliente?',
      html: `
        <div class="text-left">
          <p><strong>Cliente:</strong> ${client.name}</p>
          <p><strong>Teléfono:</strong> ${client.phoneNumber}</p>
          <p><strong>Reservas realizadas:</strong> ${client.totalReservations}</p>
          <div class="mt-4 p-3 bg-red-50 border border-red-200 rounded">
            <p class="text-sm text-red-700">
              ⚠️ Esta acción no se puede deshacer. Se eliminará el registro del cliente.
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      try {
        await deleteCustomerAPI(client.id, token)
        await loadClients()

        MySwal.fire({
          title: 'Cliente Eliminado',
          text: 'El cliente ha sido eliminado exitosamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        MySwal.fire({
          title: 'Error',
          text: error.message || 'No se pudo eliminar el cliente',
          icon: 'error',
        })
      }
    }
  }

  const handleViewDetails = (client) => {
    MySwal.fire({
      title: `Detalles de ${client.name}`,
      html: `
        <div class="text-left space-y-3">
          <div><strong>Teléfono:</strong> ${client.phoneNumber}</div>
          <div><strong>Email:</strong> ${client.email || 'No especificado'}</div>
          <div><strong>Total Reservas:</strong> ${client.totalReservations}</div>
          <div><strong>Horas Jugadas:</strong> ${client.totalHours} hrs</div>
          <div><strong>Total Gastado:</strong> S/ ${client.totalSpent.toFixed(2)}</div>
          <div><strong>Horas Gratis Ganadas:</strong> ${client.earnedFreeHours} hrs</div>
          <div><strong>Horas Gratis Disponibles:</strong> ${client.availableFreeHours} hrs</div>
          ${client.notes ? `<div><strong>Notas:</strong> ${client.notes}</div>` : ''}
          <div><strong>Registrado:</strong> ${new Date(client.createdAt).toLocaleDateString('es-PE')}</div>
          ${client.lastReservation ? `<div><strong>Última Reserva:</strong> ${new Date(client.lastReservation).toLocaleDateString('es-PE')}</div>` : ''}
        </div>
      `,
      width: 600,
      confirmButtonText: 'Cerrar',
    })
  }

  // Estadísticas
  const stats = {
    total: clients.length,
    vip: clients.filter((c) => c.isVIP).length,
    withFreeHours: clients.filter((c) => c.availableFreeHours > 0).length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0),
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-7 h-7 mr-3 text-primary-600" />
            Mis Clientes
          </h1>
          <p className="text-gray-600 mt-1">Clientes que han reservado en tus canchas</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadClients}
            disabled={isLoading}
            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            title="Actualizar lista"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsRegistrationModalOpen(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Cliente
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
            <button onClick={loadClients} className="ml-auto text-sm underline">
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Clientes</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Clientes VIP</p>
              <p className="text-xl font-bold text-yellow-600">{stats.vip}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-xl font-bold text-green-600">S/ {stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Con Horas Gratis</p>
              <p className="text-xl font-bold text-purple-600">{stats.withFreeHours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Cargando clientes...</p>
            </div>
          </div>
        ) : filteredClients.length > 0 ? (
          <AnimatePresence>
            {filteredClients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onDelete={handleDeleteClient}
                onViewDetails={handleViewDetails}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <div className="text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {searchTerm
                  ? 'No se encontraron clientes'
                  : 'No tienes clientes que hayan reservado aún'}
              </h3>
              {!searchTerm && (
                <p className="text-gray-400 mb-4">
                  Los clientes aparecerán aquí cuando hagan reservas en tus canchas
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Registro */}
      <SimpleClientRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onSave={handleNewClient}
      />
    </div>
  )
}

export default MyClientsModule
