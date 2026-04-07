import React from 'react'
import { Search } from 'lucide-react'

/**
 * Componente de filtros, búsqueda y tabs para gestión de pagos
 */
const PaymentFilters = ({
  searchTerm,
  setSearchTerm,
  selectedField,
  setSelectedField,
  selectedDateRange,
  setSelectedDateRange,
  activeTab,
  setActiveTab,
  fields,
  paymentStats,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-custom p-6">
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Búsqueda */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Buscar por cliente o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Filtro por campo */}
        <select
          value={selectedField}
          onChange={(e) => setSelectedField(e.target.value)}
          className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">Todas las canchas</option>
          {fields.map((field) => (
            <option key={field.id} value={field.id}>
              {field.name}
            </option>
          ))}
        </select>

        {/* Filtro por fecha */}
        <select
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value)}
          className="px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">Todas las fechas</option>
          <option value="today">Hoy</option>
          <option value="week">Última semana</option>
          <option value="month">Este mes</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-secondary-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === 'pending'
              ? 'text-primary-600'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          Pendientes
          {paymentStats.pendingCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {paymentStats.pendingCount}
            </span>
          )}
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === 'overdue'
              ? 'text-primary-600'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          Por Confirmar
          {paymentStats.overdueCount > 0 && (
            <span className="ml-2 bg-amber-500 text-white text-xs rounded-full px-2 py-0.5">
              {paymentStats.overdueCount}
            </span>
          )}
          {activeTab === 'overdue' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === 'completed'
              ? 'text-primary-600'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          Completados
          {activeTab === 'completed' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('no_show')}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === 'no_show'
              ? 'text-primary-600'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          No se Presentaron
          {paymentStats.noShowCount > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
              {paymentStats.noShowCount}
            </span>
          )}
          {activeTab === 'no_show' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === 'cancelled'
              ? 'text-primary-600'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          Canceladas
          {paymentStats.cancelledCount > 0 && (
            <span className="ml-2 bg-gray-500 text-white text-xs rounded-full px-2 py-0.5">
              {paymentStats.cancelledCount}
            </span>
          )}
          {activeTab === 'cancelled' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === 'all' ? 'text-primary-600' : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          Todos
          {activeTab === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
          )}
        </button>
      </div>
    </div>
  )
}

export default PaymentFilters
