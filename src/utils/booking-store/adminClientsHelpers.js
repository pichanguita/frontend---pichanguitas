/**
 * Helpers para gestión de clientes registrados por admin
 */

/**
 * Crear un nuevo cliente registrado por admin
 */
export const createAdminClient = (clientData, adminId) => {
  return {
    id: `admin-client-${Date.now()}`,
    ...clientData,
    registeredBy: adminId,
    registeredAt: new Date().toISOString(),
    type: 'admin_registered',
    status: 'confirmed',
  }
}

/**
 * Actualizar un cliente admin
 */
export const updateAdminClientHelper = (clients, clientId, updatedData) => {
  return clients.map((client) => (client.id === clientId ? { ...client, ...updatedData } : client))
}

/**
 * Eliminar un cliente admin
 */
export const deleteAdminClientHelper = (clients, clientId) => {
  return clients.filter((client) => client.id !== clientId)
}

/**
 * Obtener clientes por admin específico
 */
export const getAdminClientsByAdminHelper = (clients, adminId) => {
  return clients.filter((client) => client.registeredBy === adminId)
}
