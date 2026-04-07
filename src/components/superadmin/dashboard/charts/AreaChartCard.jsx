import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/utils/superadmin/dashboardHelpers'

const AreaChartCard = ({ data }) => {
  const chartData = data.map((s) => ({
    distrito: s.name,
    ingresos: s.revenue,
  }))

  const formatTooltip = (value) => [`S/${formatCurrency(value)}`, 'Ingresos']
  const formatYAxis = (value) => `S/${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Distribución de Ingresos por Distrito
      </h3>
      <ResponsiveContainer width="100%" height={250} className="sm:hidden">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="distrito" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={formatYAxis} />
          <RechartsTooltip formatter={formatTooltip} />
          <Area type="monotone" dataKey="ingresos" stroke="#f59e0b" fill="#fbbf24" />
        </AreaChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={380} className="hidden sm:block">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="distrito" />
          <YAxis tickFormatter={formatYAxis} />
          <RechartsTooltip formatter={formatTooltip} />
          <Area type="monotone" dataKey="ingresos" stroke="#f59e0b" fill="#fbbf24" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AreaChartCard
