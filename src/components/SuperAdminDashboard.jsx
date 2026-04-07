import React, { useState, useMemo, useEffect, useCallback } from 'react'
import useBookingStore from '../store/bookingStore'
import useFieldStore from '../store/modules/fieldStore'
import useAuthStore from '../store/authStore'
import usePaymentStore from '../store/paymentStore'
import { exportIncomeToExcel, exportReservationsToExcel } from '../utils/reportGenerator'
import * as XLSX from 'xlsx'
import Swal from 'sweetalert2'
import { USER_ROLES, FIELD_STATUS, FIELD_APPROVAL_STATUS } from '@/constants'
import {
  getDistrictStats,
  getTrendData,
  calculateKPIs,
  districtCenters,
} from '@/utils/superadmin/dashboardHelpers'
import {
  getReservationRevenue,
  getReservationTotalPrice,
  filterReservationsByDateRange,
  getDateRangeText,
} from '@/utils/reports/calculators/revenueCalculator'
import StatsCards from './superadmin/dashboard/stats/StatsCards'
import DashboardFilters from './superadmin/dashboard/filters/DashboardFilters'
import MapView from './superadmin/dashboard/views/MapView'
import ChartsView from './superadmin/dashboard/views/ChartsView'
import TableView from './superadmin/dashboard/views/TableView'
import ReportsView from './superadmin/dashboard/views/ReportsView'

const SuperAdminDashboard = () => {
  const { fields } = useFieldStore()
  const { existingReservations } = useBookingStore()
  const { users, token } = useAuthStore()
  const { monthlyPendingAmount, loadMonthlyPendingAmount } = usePaymentStore()

  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [viewMode, setViewMode] = useState('map')
  const [dateRange, setDateRange] = useState('month')
  const [mapCenter, setMapCenter] = useState([-12.5, -75.0])
  const [mapZoom, setMapZoom] = useState(6)

  // Estados para reportes
  const [isExporting, setIsExporting] = useState(false)
  const [exportingReportId, setExportingReportId] = useState(null)

  useEffect(() => {
    if (token) {
      loadMonthlyPendingAmount()
    }
  }, [token, loadMonthlyPendingAmount])

  const filteredFields = useMemo(() => {
    if (!Array.isArray(fields)) return []
    return fields.filter((f) => {
      const matchesDepartment =
        selectedDepartment === 'all' || f.departamento === selectedDepartment
      const matchesDistrict = selectedDistrict === 'all' || f.distrito === selectedDistrict
      return matchesDepartment && matchesDistrict
    })
  }, [fields, selectedDepartment, selectedDistrict])

  const districtStats = useMemo(
    () => getDistrictStats(fields, existingReservations, selectedDepartment, filteredFields),
    [fields, existingReservations, selectedDepartment, filteredFields]
  )

  const trendData = useMemo(
    () => getTrendData(existingReservations, fields),
    [existingReservations, fields]
  )

  const kpis = useMemo(
    () => calculateKPIs(fields, existingReservations),
    [fields, existingReservations]
  )

  const totalAdmins = useMemo(
    () => users.filter((u) => u.role === USER_ROLES.ADMIN).length,
    [users]
  )

  const barChartData = useMemo(
    () =>
      districtStats.map((stat) => ({
        distrito: stat.name,
        canchas: stat.totalFields,
        activas: stat.activeFields,
        reservas: stat.totalReservations,
      })),
    [districtStats]
  )

  const pieChartData = useMemo(() => {
    if (!Array.isArray(fields)) return []
    return [
      { name: 'Activas', value: fields.filter((f) => f.status === FIELD_STATUS.AVAILABLE).length },
      {
        name: 'Mantenimiento',
        value: fields.filter((f) => f.status === FIELD_STATUS.MAINTENANCE).length,
      },
      { name: 'Pendientes', value: fields.filter((f) => f.approvalStatus === FIELD_APPROVAL_STATUS.PENDING).length },
      { name: 'Cerradas', value: fields.filter((f) => f.status === FIELD_STATUS.CLOSED).length },
    ]
  }, [fields])

  const handleDistrictClick = (district) => {
    setSelectedDistrict(district)
    if (district !== 'all' && districtCenters[district]) {
      setMapCenter(districtCenters[district])
      setMapZoom(14)
    } else {
      setMapCenter([-12.5, -75.0])
      setMapZoom(6)
    }
  }

  // Función helper para ejecutar exportaciones con loading
  const executeExport = useCallback(async (reportId, exportFn) => {
    setIsExporting(true)
    setExportingReportId(reportId)

    try {
      // Pequeño delay para que se muestre el loading
      await new Promise((resolve) => setTimeout(resolve, 100))
      await exportFn()

      Swal.fire({
        icon: 'success',
        title: 'Reporte Generado',
        text: 'El reporte se ha descargado exitosamente',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el reporte: ' + error.message,
      })
    } finally {
      setIsExporting(false)
      setExportingReportId(null)
    }
  }, [])

  const handleExportIncome = useCallback(() => {
    executeExport('income', () => {
      exportIncomeToExcel(existingReservations, fields, dateRange)
    })
  }, [executeExport, existingReservations, fields, dateRange])

  const handleExportReservations = useCallback(() => {
    executeExport('reservations', () => {
      const filteredReservations = filterReservationsByDateRange(existingReservations, dateRange)
      exportReservationsToExcel(filteredReservations, fields)
    })
  }, [executeExport, existingReservations, fields, dateRange])

  const handleExportFields = useCallback(() => {
    executeExport('fields', () => {
      const filteredReservations = filterReservationsByDateRange(existingReservations, dateRange)

      const fieldsData = fields.map((field) => {
        const fieldReservations = filteredReservations.filter((r) => r.fieldId === field.id)

        // Usar función centralizada para cálculo de ingresos
        const revenue = fieldReservations.reduce((sum, r) => {
          return sum + getReservationRevenue(r, field)
        }, 0)

        return {
          Nombre: field.name,
          Dirección: field.address,
          Distrito: field.distrito,
          Departamento: field.departamento,
          Estado:
            field.approvalStatus === FIELD_APPROVAL_STATUS.PENDING
              ? 'Pendiente Aprobación'
              : field.approvalStatus === FIELD_APPROVAL_STATUS.REJECTED
                ? 'Rechazada'
                : field.status === FIELD_STATUS.AVAILABLE
                  ? 'Disponible'
                  : field.status === FIELD_STATUS.MAINTENANCE
                    ? 'Mantenimiento'
                    : 'Cerrada',
          Deportes: field.sportTypes?.join(', ') || 'N/A',
          'Precio/Hora (S/)': field.pricePerHour,
          'Total Reservas': fieldReservations.length,
          'Ingresos (S/)': revenue.toFixed(2),
          Administrador: field.adminName || 'Sin asignar',
          'Teléfono Admin': field.adminPhone || 'N/A',
          'Email Admin': field.adminEmail || 'N/A',
        }
      })

      const ws = XLSX.utils.json_to_sheet(fieldsData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Canchas')

      // Agregar hoja de resumen
      const summaryData = [
        {
          Período: getDateRangeText(dateRange),
          'Total Canchas': fields.length,
          'Canchas Activas': fields.filter((f) => f.status === FIELD_STATUS.AVAILABLE).length,
          'Total Reservas': filteredReservations.length,
          'Ingresos Totales (S/)': fieldsData
            .reduce((sum, f) => sum + parseFloat(f['Ingresos (S/)']), 0)
            .toFixed(2),
          'Fecha de Generación': new Date().toLocaleDateString('es-PE'),
        },
      ]
      const wsSummary = XLSX.utils.json_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen')

      const fecha = new Date().toLocaleDateString('es-PE').replace(/\//g, '-')
      XLSX.writeFile(wb, `Reporte_Canchas_${fecha}.xlsx`)
    })
  }, [executeExport, existingReservations, fields, dateRange])

  const handleExportCustomers = useCallback(() => {
    executeExport('customers', () => {
      const filteredReservations = filterReservationsByDateRange(existingReservations, dateRange)
      const customers = users.filter((u) => u.role === USER_ROLES.CUSTOMER)

      const customersData = customers.map((customer) => {
        // Buscar por ID primero (más confiable), luego por nombre
        const customerReservations = filteredReservations.filter(
          (r) =>
            r.customerId === customer.id ||
            r.userId === customer.id ||
            (r.customerName &&
              r.customerName.toLowerCase().trim() === customer.name?.toLowerCase().trim())
        )

        // Usar función centralizada para cálculo de ingresos
        const totalSpent = customerReservations.reduce((sum, r) => {
          const field = fields.find((f) => f.id === r.fieldId)
          return sum + getReservationRevenue(r, field)
        }, 0)

        return {
          Nombre: customer.name,
          Email: customer.email || 'N/A',
          Teléfono: customer.phone || 'N/A',
          DNI: customer.dni || 'N/A',
          'Total Reservas': customerReservations.length,
          'Total Gastado (S/)': totalSpent.toFixed(2),
          'Promedio por Reserva (S/)':
            customerReservations.length > 0
              ? (totalSpent / customerReservations.length).toFixed(2)
              : '0.00',
          'Fecha Registro': customer.createdAt
            ? new Date(customer.createdAt).toLocaleDateString('es-PE')
            : 'N/A',
        }
      })

      const ws = XLSX.utils.json_to_sheet(customersData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Clientes')

      // Agregar hoja de resumen
      const summaryData = [
        {
          Período: getDateRangeText(dateRange),
          'Total Clientes': customers.length,
          'Clientes con Reservas': customersData.filter((c) => c['Total Reservas'] > 0).length,
          'Total Gastado (S/)': customersData
            .reduce((sum, c) => sum + parseFloat(c['Total Gastado (S/)']), 0)
            .toFixed(2),
          'Fecha de Generación': new Date().toLocaleDateString('es-PE'),
        },
      ]
      const wsSummary = XLSX.utils.json_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen')

      const fecha = new Date().toLocaleDateString('es-PE').replace(/\//g, '-')
      XLSX.writeFile(wb, `Reporte_Clientes_${fecha}.xlsx`)
    })
  }, [executeExport, existingReservations, fields, users, dateRange])

  const handleExportAdmins = useCallback(() => {
    executeExport('admins', () => {
      const filteredReservations = filterReservationsByDateRange(existingReservations, dateRange)
      const admins = users.filter((u) => u.role === USER_ROLES.ADMIN)

      const adminsData = admins.map((admin) => {
        const managedFields = fields.filter((f) => f.adminId === admin.id)
        const totalReservations = filteredReservations.filter((r) =>
          managedFields.some((f) => f.id === r.fieldId)
        )

        // Usar función centralizada para cálculo de ingresos
        const totalRevenue = totalReservations.reduce((sum, r) => {
          const field = fields.find((f) => f.id === r.fieldId)
          return sum + getReservationRevenue(r, field)
        }, 0)

        return {
          Nombre: admin.name,
          Email: admin.email || 'N/A',
          Teléfono: admin.phone || 'N/A',
          'Canchas Administradas': managedFields.length,
          'Nombres de Canchas': managedFields.map((f) => f.name).join(', ') || 'Ninguna',
          'Total Reservas': totalReservations.length,
          'Ingresos Generados (S/)': totalRevenue.toFixed(2),
          Estado: admin.status || 'Activo',
        }
      })

      const ws = XLSX.utils.json_to_sheet(adminsData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Administradores')

      // Agregar hoja de resumen
      const summaryData = [
        {
          Período: getDateRangeText(dateRange),
          'Total Administradores': admins.length,
          'Total Canchas Administradas': adminsData.reduce(
            (sum, a) => sum + a['Canchas Administradas'],
            0
          ),
          'Total Reservas': adminsData.reduce((sum, a) => sum + a['Total Reservas'], 0),
          'Ingresos Totales (S/)': adminsData
            .reduce((sum, a) => sum + parseFloat(a['Ingresos Generados (S/)']), 0)
            .toFixed(2),
          'Fecha de Generación': new Date().toLocaleDateString('es-PE'),
        },
      ]
      const wsSummary = XLSX.utils.json_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen')

      const fecha = new Date().toLocaleDateString('es-PE').replace(/\//g, '-')
      XLSX.writeFile(wb, `Reporte_Administradores_${fecha}.xlsx`)
    })
  }, [executeExport, existingReservations, fields, users, dateRange])

  const handleExportGeneral = useCallback(() => {
    executeExport('general', () => {
      const filteredReservations = filterReservationsByDateRange(existingReservations, dateRange)
      const wb = XLSX.utils.book_new()

      // Recalcular KPIs con reservas filtradas
      const filteredTotalRevenue = filteredReservations.reduce((sum, r) => {
        const field = fields.find((f) => f.id === r.fieldId)
        return sum + getReservationRevenue(r, field)
      }, 0)

      const filteredTotalPending = filteredReservations.reduce((sum, r) => {
        const field = fields.find((f) => f.id === r.fieldId)
        const totalPrice = getReservationTotalPrice(r, field)
        const revenue = getReservationRevenue(r, field)
        return sum + (totalPrice - revenue)
      }, 0)

      const generalData = [
        {
          'Período del Reporte': getDateRangeText(dateRange),
          'Total Canchas': kpis.totalFields,
          'Canchas Activas': kpis.activeFields,
          'Total Reservas (Período)': filteredReservations.length,
          'Reservas Hoy': kpis.todayReservations,
          'Ingresos (Período) (S/)': filteredTotalRevenue.toFixed(2),
          'Pagos Pendientes (Período) (S/)': filteredTotalPending.toFixed(2),
          'Total Administradores': totalAdmins,
          'Total Clientes': users.filter((u) => u.role === USER_ROLES.CUSTOMER).length,
          'Fecha de Reporte': new Date().toLocaleDateString('es-PE'),
        },
      ]
      const ws1 = XLSX.utils.json_to_sheet(generalData)
      XLSX.utils.book_append_sheet(wb, ws1, 'Resumen General')

      const districtData = districtStats.map((stat) => ({
        Distrito: stat.name,
        'Total Canchas': stat.totalFields,
        'Canchas Activas': stat.activeFields,
        'En Mantenimiento': stat.maintenanceFields,
        'Total Reservas': stat.totalReservations,
        'Ingresos (S/)': stat.revenue,
        'Tipos de Deporte': stat.sports,
      }))
      const ws2 = XLSX.utils.json_to_sheet(districtData)
      XLSX.utils.book_append_sheet(wb, ws2, 'Por Distrito')

      const statusData = pieChartData.map((item) => ({
        Estado: item.name,
        Cantidad: item.value,
        Porcentaje:
          kpis.totalFields > 0 ? ((item.value / kpis.totalFields) * 100).toFixed(1) + '%' : '0%',
      }))
      const ws3 = XLSX.utils.json_to_sheet(statusData)
      XLSX.utils.book_append_sheet(wb, ws3, 'Estado Canchas')

      const ws4 = XLSX.utils.json_to_sheet(trendData)
      XLSX.utils.book_append_sheet(wb, ws4, 'Tendencia 7 Días')

      const fecha = new Date().toLocaleDateString('es-PE').replace(/\//g, '-')
      XLSX.writeFile(wb, `Reporte_General_Completo_${fecha}.xlsx`)
    })
  }, [
    executeExport,
    existingReservations,
    fields,
    users,
    dateRange,
    kpis,
    totalAdmins,
    districtStats,
    pieChartData,
    trendData,
  ])

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          Dashboard Interactivo
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Vista general de todas las canchas en Apurímac
        </p>
      </div>

      <StatsCards
        totalFields={kpis.totalFields}
        activeFields={kpis.activeFields}
        totalReservations={kpis.totalReservations}
        todayReservations={kpis.todayReservations}
        totalRevenue={kpis.totalRevenue}
        totalPending={monthlyPendingAmount}
        totalAdmins={totalAdmins}
      />

      <DashboardFilters
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        handleDistrictClick={handleDistrictClick}
        viewMode={viewMode}
        setViewMode={setViewMode}
        dateRange={dateRange}
        setDateRange={setDateRange}
        fields={fields}
      />

      {viewMode === 'map' && (
        <MapView
          filteredFields={filteredFields}
          selectedDistrict={selectedDistrict}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          districtStats={districtStats}
          onDistrictClick={handleDistrictClick}
        />
      )}

      {viewMode === 'charts' && (
        <ChartsView
          barChartData={barChartData}
          pieChartData={pieChartData}
          trendData={trendData}
          districtStats={districtStats}
        />
      )}

      {viewMode === 'grid' && (
        <TableView
          filteredFields={filteredFields}
          selectedDistrict={selectedDistrict}
          existingReservations={existingReservations}
        />
      )}

      {viewMode === 'reports' && (
        <ReportsView
          onExportIncome={handleExportIncome}
          onExportReservations={handleExportReservations}
          onExportFields={handleExportFields}
          onExportCustomers={handleExportCustomers}
          onExportAdmins={handleExportAdmins}
          onExportGeneral={handleExportGeneral}
          isLoading={isExporting}
          loadingReportId={exportingReportId}
          dateRange={dateRange}
        />
      )}
    </div>
  )
}

export default SuperAdminDashboard
