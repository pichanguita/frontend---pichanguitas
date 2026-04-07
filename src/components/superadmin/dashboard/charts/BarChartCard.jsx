import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const BarChartCard = ({ data }) => {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Canchas por Distrito
      </h3>
      <ResponsiveContainer width="100%" height={250} className="sm:hidden">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="distrito" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <RechartsTooltip />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="canchas" fill="#3b82f6" name="Total" />
          <Bar dataKey="activas" fill="#22c55e" name="Activas" />
          <Bar dataKey="reservas" fill="#f59e0b" name="Reservas" />
        </BarChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={380} className="hidden sm:block">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="distrito" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="canchas" fill="#3b82f6" name="Total" />
          <Bar dataKey="activas" fill="#22c55e" name="Activas" />
          <Bar dataKey="reservas" fill="#f59e0b" name="Reservas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChartCard
