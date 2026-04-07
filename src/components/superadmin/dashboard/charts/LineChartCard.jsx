import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const LineChartCard = ({ data }) => {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Tendencia de Reservas (Últimos 7 días)
      </h3>
      <ResponsiveContainer width="100%" height={250} className="sm:hidden">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="día" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
          <RechartsTooltip />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="reservas"
            stroke="#3b82f6"
            name="Reservas"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="ingresos"
            stroke="#22c55e"
            name="Ingresos (S/)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={380} className="hidden sm:block">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="día" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <RechartsTooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="reservas"
            stroke="#3b82f6"
            name="Reservas"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="ingresos"
            stroke="#22c55e"
            name="Ingresos (S/)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LineChartCard
