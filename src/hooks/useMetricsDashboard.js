import { useState, useEffect, useCallback, useMemo } from 'react'
import useBookingStore from '../store/bookingStore'
import useFieldStore from '../store/modules/fieldStore'
import useAuthStore from '../store/authStore'
import { API_CONFIG } from '../config/api.config'
import { onlyApprovedFields } from '../utils/fields/adminFields'
import * as XLSX from 'xlsx'

/**
 * Hook personalizado para manejar la lógica del dashboard de métricas
 * Ahora obtiene datos reales desde la API/BD
 *
 * IMPORTANTE: Usa useFieldStore directamente para `fields` porque el getter
 * de bookingStore no dispara re-renders cuando los fields se cargan asincrónicamente.
 */
export const useMetricsDashboard = () => {
  // CORRECCIÓN: Usar useFieldStore directamente para que los re-renders
  // se disparen cuando los fields se carguen asincrónicamente
  const { fields } = useFieldStore()
  useBookingStore()
  const { user, getManagedFields, token } = useAuthStore()

  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedField, setSelectedField] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [metrics, setMetrics] = useState({
    occupancyRate: 0,
    monthlyIncome: 0,
    totalReservations: 0,
    activeClients: 0,
    averageBookingDuration: 0,
    peakHours: [],
    fieldPerformance: [],
    incomeGrowth: 0,
    occupancyTrend: 'stable',
  })
  const [isLoading, setIsLoading] = useState(true)

  // Filter fields based on user permissions - MEMOIZADO para evitar recálculos infinitos.
  // Las métricas (ocupación, ingresos) solo aplican a canchas APROBADAS y operativas;
  // las pendientes/rechazadas no generan actividad y distorsionarían los cálculos.
  const visibleFields = useMemo(() => {
    if (!user || !fields) return []

    if (user.role === 'super_admin' || (user.role === 'admin' && user.adminType === 'general')) {
      return onlyApprovedFields(fields)
    }

    // Soportar 'field', 'field_owner' y 'field_admin' como tipos de admin de cancha
    if (user.role === 'admin' && ['field', 'field_owner', 'field_admin'].includes(user.adminType)) {
      const managedFieldIds = getManagedFields() || []

      // Filtrar por: campos asignados via user_managed_fields O campos donde el user es admin_id
      const userId = Number(user.id)
      return onlyApprovedFields(
        fields.filter((field) => {
          const fieldId = Number(field.id)
          const adminId = Number(field.adminId || field.admin_id)
          const inManaged = managedFieldIds.map(Number).includes(fieldId)
          const isAdmin = adminId === userId
          return inManaged || isAdmin
        })
      )
    }

    return []
  }, [user, fields, getManagedFields])

  const availableDepartments = [
    ...new Set(visibleFields.map((f) => f.departamento || f.department).filter(Boolean)),
  ]
  const availableDistricts = [
    ...new Set(
      visibleFields
        .filter(
          (f) =>
            selectedDepartment === 'all' || (f.departamento || f.department) === selectedDepartment
        )
        .map((f) => f.distrito || f.district)
        .filter(Boolean)
    ),
  ]

  const getStartDate = (now, period) => {
    const date = new Date(now)
    switch (period) {
      case 'day':
        date.setHours(0, 0, 0, 0)
        return date
      case 'week':
        date.setDate(date.getDate() - 7)
        return date
      case 'month':
        date.setMonth(date.getMonth() - 1)
        return date
      case 'year':
        date.setFullYear(date.getFullYear() - 1)
        return date
      default:
        return date
    }
  }

  const calculateOccupancyRate = (reservations, startDate, endDate) => {
    if (reservations.length === 0) return 0

    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    const hoursPerDay = 12

    let filteredFieldsForCalc = visibleFields

    if (selectedDepartment !== 'all') {
      filteredFieldsForCalc = filteredFieldsForCalc.filter(
        (f) => (f.departamento || f.department) === selectedDepartment
      )
    }

    if (selectedDistrict !== 'all') {
      filteredFieldsForCalc = filteredFieldsForCalc.filter(
        (f) => (f.distrito || f.district) === selectedDistrict
      )
    }

    const fieldsCount = selectedField === 'all' ? filteredFieldsForCalc.length : 1
    const totalAvailableHours = daysDiff * hoursPerDay * fieldsCount

    const bookedHours = reservations.reduce((total, res) => {
      return total + (res.timeSlots?.length || 1)
    }, 0)

    return Math.min(100, Math.round((bookedHours / totalAvailableHours) * 100))
  }

  // NOTA: Las funciones calculateIncome, getUniqueClients, calculateAverageDuration,
  // calculatePeakHours y calculateFieldPerformance fueron eliminadas porque no se utilizaban.
  // El cálculo de métricas se hace desde la API.

  const calculateMetrics = useCallback(async () => {
    setIsLoading(true)

    try {
      const now = new Date()
      const startDate = getStartDate(now, selectedPeriod)

      // Formatear fechas para la API
      const dateFrom = startDate.toISOString().split('T')[0]
      const dateTo = now.toISOString().split('T')[0]

      // Determinar qué canchas filtrar
      let filteredFields = visibleFields

      if (selectedDepartment !== 'all') {
        filteredFields = filteredFields.filter(
          (f) => (f.departamento || f.department) === selectedDepartment
        )
      }

      if (selectedDistrict !== 'all') {
        filteredFields = filteredFields.filter(
          (f) => (f.distrito || f.district) === selectedDistrict
        )
      }

      // IDs de canchas para el filtro
      let fieldIds = filteredFields.map((f) => Number(f.id))
      if (selectedField !== 'all') {
        fieldIds = [Number(selectedField)]
      }

      // Construir URL con parámetros
      const params = new URLSearchParams()
      params.append('date_from', dateFrom)
      params.append('date_to', dateTo)
      if (fieldIds.length > 0) {
        params.append('field_ids', fieldIds.join(','))
      }

      // Si es admin de cancha, filtrar por admin_id
      if (
        user &&
        user.role === 'admin' &&
        ['field', 'field_owner', 'field_admin'].includes(user.adminType)
      ) {
        params.append('admin_id', user.id)
      }

      // Llamar a la API
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/reservations/metrics?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Error al obtener métricas')
      }

      const result = await response.json()
      const data = result.data

      // Calcular tasa de ocupación (estimación basada en horas reservadas)
      const daysDiff = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)) || 1
      const hoursPerDay = 12 // Promedio de horas disponibles por día
      const fieldsCount = fieldIds.length || 1
      const totalAvailableHours = daysDiff * hoursPerDay * fieldsCount
      const occupancyRate = Math.min(100, Math.round((data.totalHours / totalAvailableHours) * 100))

      setMetrics({
        occupancyRate: occupancyRate,
        monthlyIncome: data.totalIncome,
        totalReservations: data.totalReservations,
        activeClients: data.uniqueClients,
        averageBookingDuration: data.avgDuration?.toFixed(1) || '0',
        peakHours: data.peakHours || [],
        fieldPerformance: data.fieldPerformance || [],
        incomeGrowth: 0, // TODO: Calcular comparando con período anterior
        occupancyTrend: 'stable',
      })
    } catch (error) {
      console.error('Error al cargar métricas:', error)
      // Fallback a valores vacíos
      setMetrics({
        occupancyRate: 0,
        monthlyIncome: 0,
        totalReservations: 0,
        activeClients: 0,
        averageBookingDuration: '0',
        peakHours: [],
        fieldPerformance: [],
        incomeGrowth: 0,
        occupancyTrend: 'stable',
      })
    } finally {
      setIsLoading(false)
    }
  }, [
    selectedPeriod,
    selectedField,
    selectedDepartment,
    selectedDistrict,
    visibleFields,
    token,
    user,
  ])

  const exportMetrics = () => {
    const summaryData = [
      ['REPORTE DE MÉTRICAS'],
      ['Generado:', new Date().toLocaleString('es-PE')],
      ['Período:', selectedPeriod === 'day' ? 'Día' : selectedPeriod === 'week' ? 'Semana' : 'Mes'],
      ['Departamento:', selectedDepartment === 'all' ? 'Todos' : selectedDepartment],
      ['Distrito:', selectedDistrict === 'all' ? 'Todos' : selectedDistrict],
      [
        'Cancha:',
        selectedField !== 'all' ? visibleFields.find((f) => f.id === selectedField)?.name : 'Todas',
      ],
      [],
      ['Métrica', 'Valor'],
      ['Total Reservas', metrics.totalReservations || 0],
      ['Ingresos Totales', `S/ ${(metrics.totalRevenue || 0).toLocaleString()}`],
      ['Tasa de Ocupación', `${(metrics.occupancyRate || 0).toFixed(1)}%`],
      ['Reservas Canceladas', metrics.cancelledReservations || 0],
      ['Tasa de No-Shows', `${(metrics.noShowRate || 0).toFixed(1)}%`],
    ]

    const performanceData = [
      ['RENDIMIENTO POR CANCHA'],
      [],
      ['Cancha', 'Reservas', 'Ingresos', 'Utilización (%)'],
    ]

    if (metrics.fieldPerformance && Array.isArray(metrics.fieldPerformance)) {
      metrics.fieldPerformance.forEach((field) => {
        performanceData.push([
          field.name || 'N/A',
          field.reservations || 0,
          field.revenue || 0,
          (field.utilization || 0).toFixed(1),
        ])
      })
    }

    const peakHoursData = [['HORARIOS PICO'], [], ['Horario', 'Reservas']]

    if (metrics.peakHours && Array.isArray(metrics.peakHours)) {
      metrics.peakHours.forEach((hour) => {
        peakHoursData.push([hour.hour || 'N/A', hour.count || 0])
      })
    }

    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
    const ws2 = XLSX.utils.aoa_to_sheet(performanceData)
    const ws3 = XLSX.utils.aoa_to_sheet(peakHoursData)

    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen')
    XLSX.utils.book_append_sheet(wb, ws2, 'Rendimiento')
    XLSX.utils.book_append_sheet(wb, ws3, 'Horarios Pico')

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    let fileName = 'metricas'
    if (selectedDepartment !== 'all') fileName += `-${selectedDepartment}`
    if (selectedDistrict !== 'all') fileName += `-${selectedDistrict}`
    fileName += `-${new Date().toISOString().split('T')[0]}.xlsx`
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(url)
  }

  useEffect(() => {
    // Solo calcular métricas si hay campos visibles (> 0, no >= 0 que siempre es true)
    if (token && visibleFields.length > 0) {
      calculateMetrics()
    }
  }, [calculateMetrics, token, visibleFields.length])

  return {
    metrics,
    isLoading,
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
  }
}
