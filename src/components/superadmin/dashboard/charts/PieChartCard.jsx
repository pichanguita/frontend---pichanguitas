import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { FIELD_CATEGORY_HEX } from '@/constants'

// Color de fallback para cualquier segmento que no tenga categoría mapeada
const FALLBACK_SLICE_COLOR = '#8b5cf6'

const getSliceColor = (entry) =>
  (entry.category && FIELD_CATEGORY_HEX[entry.category]) || FALLBACK_SLICE_COLOR

const PieChartCard = ({ data }) => {
  // Filtrar solo datos con valor > 0 para no saturar el gráfico
  const filteredData = data.filter((item) => item.value > 0)

  const renderLabel = ({ _name, percent }) => {
    if (percent < 0.05) return null
    return `${(percent * 100).toFixed(0)}%`
  }

  const renderCells = () =>
    filteredData.map((entry) => (
      <Cell key={`cell-${entry.category ?? entry.name}`} fill={getSliceColor(entry)} />
    ))

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
            {renderCells()}
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
            {renderCells()}
          </Pie>
          <RechartsTooltip formatter={(value, name) => [`${value} canchas`, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PieChartCard
