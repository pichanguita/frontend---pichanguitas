/**
 * Módulo: Acciones de Clientes Admin
 *
 * Gestiona los clientes registrados por administradores de canchas
 */

import {
  createAdminClient,
  updateAdminClientHelper,
  deleteAdminClientHelper,
  getAdminClientsByAdminHelper,
} from '../../utils/booking-store/adminClientsHelpers'

export const createAdminClientActions = (set, get) => ({
  getAdminRegisteredClients: () => {
    return get().adminClients
  },

  addAdminClient: (clientData, adminId) => {
    const newClient = createAdminClient(clientData, adminId)
    set({ adminClients: [...get().adminClients, newClient] })
    return newClient
  },

  updateAdminClient: (clientId, updatedData) => {
    const updatedClients = updateAdminClientHelper(get().adminClients, clientId, updatedData)
    set({ adminClients: updatedClients })
    return true
  },

  deleteAdminClient: (clientId) => {
    const updatedClients = deleteAdminClientHelper(get().adminClients, clientId)
    set({ adminClients: updatedClients })
    return true
  },

  getAdminClientsByAdmin: (adminId) => {
    return getAdminClientsByAdminHelper(get().adminClients, adminId)
  },
})
