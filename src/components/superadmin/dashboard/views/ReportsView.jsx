import React from 'react'
import { DollarSign, Calendar, MapPin, Users, FileText, Loader2 } from 'lucide-react'

const ReportCard = ({
  icon: Icon,
  iconBgColor,
  iconColor,
  title,
  description,
  buttonColor,
  onClick,
  isLoading,
  loadingReportId,
  reportId,
}) => {
  const isThisLoading = isLoading && loadingReportId === reportId

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`${iconBgColor} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`w-full ${buttonColor} text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isThisLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando...
          </>
        ) : (
          'Generar Reporte'
        )}
      </button>
    </div>
  )
}

const ReportsView = ({
  onExportIncome,
  onExportReservations,
  onExportFields,
  onExportCustomers,
  onExportAdmins,
  onExportGeneral,
  isLoading = false,
  loadingReportId = null,
  dateRange = 'all',
}) => {
  const dateRangeTexts = {
    week: 'Última semana',
    month: 'Último mes',
    quarter: 'Último trimestre',
    year: 'Último año',
    all: 'Todo el historial',
  }

  const reports = [
    {
      id: 'income',
      icon: DollarSign,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Reporte de Ingresos',
      description: 'Resumen detallado de ingresos por canchas y periodos',
      buttonColor: 'bg-green-600 hover:bg-green-700',
      onClick: onExportIncome,
    },
    {
      id: 'reservations',
      icon: Calendar,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Reporte de Reservas',
      description: 'Historial completo de reservas y estadísticas',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      onClick: onExportReservations,
    },
    {
      id: 'fields',
      icon: MapPin,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Reporte de Canchas',
      description: 'Estado y utilización de todas las canchas',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      onClick: onExportFields,
    },
    {
      id: 'customers',
      icon: Users,
      iconBgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
      title: 'Reporte de Clientes',
      description: 'Análisis de clientes y comportamiento de reserva',
      buttonColor: 'bg-amber-600 hover:bg-amber-700',
      onClick: onExportCustomers,
    },
    {
      id: 'admins',
      icon: Users,
      iconBgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      title: 'Reporte de Admins',
      description: 'Actividad y gestión de administradores',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700',
      onClick: onExportAdmins,
    },
    {
      id: 'general',
      icon: FileText,
      iconBgColor: 'bg-gray-100',
      iconColor: 'text-gray-600',
      title: 'Reporte General',
      description: 'Reporte completo del sistema con todas las métricas',
      buttonColor: 'bg-gray-600 hover:bg-gray-700',
      onClick: onExportGeneral,
    },
  ]

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-6">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
          Generación de Reportes
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>
            Período: <span className="font-medium text-gray-700">{dateRangeTexts[dateRange]}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            {...report}
            isLoading={isLoading}
            loadingReportId={loadingReportId}
            reportId={report.id}
          />
        ))}
      </div>

      {isLoading && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando reporte, por favor espere...
          </p>
        </div>
      )}
    </div>
  )
}

export default ReportsView
