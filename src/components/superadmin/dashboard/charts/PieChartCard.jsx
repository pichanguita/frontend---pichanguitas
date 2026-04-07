import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { COLORS } from '@/utils/superadmin/dashboardHelpers'

const PieChartCard = ({ data }) => {
  // Filtrar solo datos con valor > 0
  const filteredData = data.filter((item) => item.value > 0)

  // Custom label que solo muestra si hay espacio
  const renderLabel = ({ _name, percent }) => {
    if (percent < 0.05) return null // No mostrar si es menos del 5%
    return `${(percent * 100).toFixed(0)}%`
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Estado de Canchas
      </h3>
      <ResponsiveContainer width="100%" height={250} className="sm:hidden">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
            style={{ fontSize: '10px' }}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip formatter={(value, name) => [`${value} canchas`, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={380} className="hidden sm:block">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip formatter={(value, name) => [`${value} canchas`, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PieChartCard
