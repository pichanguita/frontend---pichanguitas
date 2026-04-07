import React from 'react'

const ExistingClientSelector = ({ customers, selectedCustomerId, onSelectCustomer, isLoading }) => {
  // ✅ Verificar si customers es array o objeto
  const customerList = Array.isArray(customers) ? customers : Object.values(customers)

  // ✅ Buscar el cliente seleccionado correctamente
  const selectedCustomer = Array.isArray(customers)
    ? customers.find((c) => c.id === parseInt(selectedCustomerId))
    : customers[selectedCustomerId]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Cliente *</label>
      <select
        value={selectedCustomerId}
        onChange={(e) => onSelectCustomer(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        disabled={isLoading}
      >
        <option value="">-- Seleccionar un cliente --</option>
        {customerList.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.name} - {customer.phoneNumber || customer.phone_number || ''}
          </option>
        ))}
      </select>
      {selectedCustomerId && selectedCustomer && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Total de reservas:</strong> {selectedCustomer.totalReservations || 0}
          </p>
          {selectedCustomer.email && (
            <p className="text-sm text-blue-700 mt-1">Email: {selectedCustomer.email}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ExistingClientSelector
