import React from 'react'
import { Activity, DollarSign, Calendar, Users } from 'lucide-react'
import { useMetricsDashboard } from '../hooks/useMetricsDashboard'
import { formatCurrency } from '../utils/metrics/formatters'
import MetricsHeader from './metrics/MetricsHeader'
import MetricCard from './metrics/MetricCard'
import PeakHoursChart from './metrics/PeakHoursChart'
import FieldPerformanceChart from './metrics/FieldPerformanceChart'
import SummaryPanel from './metrics/SummaryPanel'

const MetricsDashboard = () => {
  const {
    metrics,
    selectedPeriod,
    selectedField,
    selectedDepartment,
    selectedDistrict,
    visibleFields,
    availableDepartments,
    availableDistricts,
    setSelectedPeriod,
    setSelectedField,
    setSelectedDepartment,
    setSelectedDistrict,
    calculateMetrics,
    exportMetrics,
  } = useMetricsDashboard()

  const handleDepartmentChange = (value) => {
    setSelectedDepartment(value)
    setSelectedDistrict('all')
    setSelectedField('all')
  }

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value)
    setSelectedField('all')
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header con controles */}
      <MetricsHeader
        selectedPeriod={selectedPeriod}
        selectedField={selectedField}
        selectedDepartment={selectedDepartment}
        selectedDistrict={selectedDistrict}
        availableDepartments={availableDepartments}
        availableDistricts={availableDistricts}
        visibleFields={visibleFields}
        onPeriodChange={setSelectedPeriod}
        onFieldChange={setSelectedField}
        onDepartmentChange={handleDepartmentChange}
        onDistrictChange={handleDistrictChange}
        onRefresh={calculateMetrics}
        onExport={exportMetrics}
      />

      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Porcentaje de Ocupación */}
        <MetricCard
          title="Ocupación"
          value={`${metrics.occupancyRate}%`}
          icon={Activity}
          trend={metrics.occupancyTrend}
          showProgress={true}
          progressValue={metrics.occupancyRate}
          delay={0}
        />

        {/* Ingresos */}
        <MetricCard
          title="Ingresos"
          value={formatCurrency(metrics.monthlyIncome)}
          icon={DollarSign}
          iconBgColor="bg-green-100 text-green-600"
          delay={0.1}
        />

        {/* Total Reservas */}
        <MetricCard
          title="Reservas"
          value={metrics.totalReservations}
          subtitle={`Promedio: ${metrics.averageBookingDuration}h`}
          icon={Calendar}
          iconBgColor="bg-blue-100 text-blue-600"
          delay={0.2}
        />

        {/* Clientes Activos */}
        <MetricCard
          title="Clientes Únicos"
          value={metrics.activeClients}
          subtitle="En el período"
          icon={Users}
          iconBgColor="bg-purple-100 text-purple-600"
          delay={0.3}
        />
      </div>

      {/* Gráficos y tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Horarios Pico */}
        <PeakHoursChart peakHours={metrics.peakHours} />

        {/* Rendimiento por Cancha */}
        <FieldPerformanceChart
          fieldPerformance={metrics.fieldPerformance}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Resumen adicional */}
      <SummaryPanel
        selectedPeriod={selectedPeriod}
        occupancyRate={metrics.occupancyRate}
        incomeGrowth={metrics.incomeGrowth}
      />
    </div>
  )
}

export default MetricsDashboard
