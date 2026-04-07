import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Users,
  DollarSign,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import useBookingStore from '../../../store/bookingStore'
import useFieldStore from '../../../store/modules/fieldStore'
import {
  getReservationTotalPrice,
  getReservationRevenue,
  getReservationPending,
} from '../../../utils/reports/calculators/revenueCalculator'

/**
 * Vista de Ingresos por Cancha
 * Muestra ingresos por cancha con filtro por administrador
 */
const FieldIncomeView = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAdmin, setSelectedAdmin] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('month')

  const { existingReservations, loadReservations } = useBookingStore()
  const { fields, loadFields } = useFieldStore()

  // Cargar datos al montar
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([loadReservations(), loadFields()])
      } catch (error) {
        console.error('Error cargando datos:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [loadReservations, loadFields])

  // Extraer lista única de administradores desde los campos (usando adminName que ya viene del backend)
  const uniqueAdmins = useMemo(() => {
    const adminsMap = new Map()
    fields.forEach((field) => {
      const adminId = field.adminId || field.admin_id
      const adminName = field.adminName || field.admin_name
      if (adminId && adminName && !adminsMap.has(adminId)) {
        adminsMap.set(adminId, { id: adminId, name: adminName })
      }
    })
    return Array.from(adminsMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [fields])

  // Filtrar reservas por rango de fecha
  const filteredReservations = useMemo(() => {
    const now = new Date()
    let startDate

    switch (selectedDateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = null
    }

    if (!startDate) return existingReservations

    return existingReservations.filter((r) => {
      const resDate = new Date(r.date)
      return resDate >= startDate && resDate <= now
    })
  }, [existingReservations, selectedDateRange])

  // Calcular estadísticas por cancha usando el calculador centralizado
  const statsByField = useMemo(() => {
    const stats = {}

    fields.forEach((field) => {
      const adminId = field.adminId || field.admin_id
      const adminName = field.adminName || field.admin_name

      stats[field.id] = {
        field,
        adminId,
        adminName,
        totalReservations: 0,
        totalIncome: 0,
        paidAmount: 0,
        pendingAmount: 0,
      }
    })

    filteredReservations.forEach((res) => {
      const fieldId = res.fieldId || res.field_id
      if (!stats[fieldId]) return

      const field = stats[fieldId].field

      // Usar calculador centralizado para consistencia
      const totalAmount = getReservationTotalPrice(res, field)
      const paidAmount = getReservationRevenue(res, field)
      const pendingAmount = getReservationPending(res, field)

      stats[fieldId].totalReservations++
      stats[fieldId].totalIncome += totalAmount
      stats[fieldId].paidAmount += paidAmount
      stats[fieldId].pendingAmount += pendingAmount
    })

    // Filtrar por admin si está seleccionado
    let result = Object.values(stats)

    if (selectedAdmin !== 'all') {
      result = result.filter((s) => s.adminId === parseInt(selectedAdmin))
    }

    return result.sort((a, b) => b.totalIncome - a.totalIncome)
  }, [fields, filteredReservations, selectedAdmin])

  // Calcular totales generales (filtrados)
  const totals = useMemo(() => {
    return statsByField.reduce(
      (acc, stat) => ({
        totalReservations: acc.totalReservations + stat.totalReservations,
        totalIncome: acc.totalIncome + stat.totalIncome,
        paidAmount: acc.paidAmount + stat.paidAmount,
        pendingAmount: acc.pendingAmount + stat.pendingAmount,
      }),
      { totalReservations: 0, totalIncome: 0, paidAmount: 0, pendingAmount: 0 }
    )
  }, [statsByField])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Cargando datos de ingresos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-5 shadow-custom"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-secondary-900">
                S/ {totals.totalIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-5 shadow-custom"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Cobrado</p>
              <p className="text-2xl font-bold text-green-600">
                S/ {totals.paidAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-5 shadow-custom"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Por Cobrar</p>
              <p className="text-2xl font-bold text-amber-600">
                S/ {totals.pendingAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-5 shadow-custom"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-600">Total Reservas</p>
              <p className="text-2xl font-bold text-secondary-900">{totals.totalReservations}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-custom p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Filtro por Administrador */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-secondary-400" />
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="border border-secondary-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todos los administradores</option>
              {uniqueAdmins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de fecha */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-secondary-400" />
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="border border-secondary-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="week">Última semana</option>
              <option value="month">Este mes</option>
              <option value="year">Este año</option>
              <option value="all">Todo el tiempo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de canchas */}
      <div className="bg-white rounded-xl shadow-custom overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-secondary-700">Cancha</th>
                <th className="text-left py-4 px-6 font-medium text-secondary-700">
                  Administrador
                </th>
                <th className="text-left py-4 px-6 font-medium text-secondary-700">Ubicación</th>
                <th className="text-center py-4 px-6 font-medium text-secondary-700">Reservas</th>
                <th className="text-right py-4 px-6 font-medium text-secondary-700">Ingresos</th>
                <th className="text-right py-4 px-6 font-medium text-secondary-700">Cobrado</th>
                <th className="text-right py-4 px-6 font-medium text-secondary-700">Pendiente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {statsByField.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <Building2 className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
                    <p className="text-secondary-500">No hay datos de ingresos para mostrar</p>
                  </td>
                </tr>
              ) : (
                statsByField.map((stat, index) => (
                  <motion.tr
                    key={stat.field.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-secondary-50 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary-900">{stat.field.name}</p>
                          <p className="text-xs text-secondary-500">
                            S/ {stat.field.pricePerHour || stat.field.price_per_hour}/hora
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {stat.adminName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-bold text-sm">
                              {stat.adminName[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-secondary-900">
                              {stat.adminName}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-secondary-400 text-sm">Sin asignar</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-secondary-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">
                          {stat.field.distrito || stat.field.district || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {stat.totalReservations}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-secondary-900">
                      S/ {stat.totalIncome.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-green-600">
                      S/ {stat.paidAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-amber-600">
                      S/ {stat.pendingAmount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FieldIncomeView
