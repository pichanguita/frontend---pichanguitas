import React from 'react'
import usePaymentManagement from '../hooks/usePaymentManagement'
import PaymentStatsCards from './payment-management/PaymentStatsCards'
import PaymentFilters from './payment-management/PaymentFilters'
import PaymentReservationsTable from './payment-management/PaymentReservationsTable'
import PaymentSummaryFooter from './payment-management/PaymentSummaryFooter'

const PaymentManagementModule = ({ readOnly = false }) => {
  const {
    // Estado
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    selectedDateRange,
    setSelectedDateRange,
    selectedField,
    setSelectedField,
    isLoadingData,

    // Datos calculados
    paymentStats,
    filteredReservations,
    fields,

    // Handlers
    handleNoShow,
    handleCompletePayment,

    // Utilidades
    ADVANCE_PERCENTAGE,
    calculateAmounts,
    canRegisterPayment,
  } = usePaymentManagement()

  // Mostrar indicador de carga mientras se cargan los datos
  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Cargando datos de pagos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <PaymentStatsCards paymentStats={paymentStats} ADVANCE_PERCENTAGE={ADVANCE_PERCENTAGE} />

      {/* Filtros y búsqueda */}
      <PaymentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedField={selectedField}
        setSelectedField={setSelectedField}
        selectedDateRange={selectedDateRange}
        setSelectedDateRange={setSelectedDateRange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fields={fields}
        paymentStats={paymentStats}
      />

      {/* Lista de reservas */}
      <PaymentReservationsTable
        filteredReservations={filteredReservations}
        fields={fields}
        ADVANCE_PERCENTAGE={ADVANCE_PERCENTAGE}
        calculateAmounts={calculateAmounts}
        canRegisterPayment={canRegisterPayment}
        handleCompletePayment={handleCompletePayment}
        handleNoShow={handleNoShow}
        readOnly={readOnly}
        activeTab={activeTab}
      />

      {/* Resumen de totales */}
      <PaymentSummaryFooter
        filteredReservations={filteredReservations}
        calculateAmounts={calculateAmounts}
        activeTab={activeTab}
      />
    </div>
  )
}

export default PaymentManagementModule
