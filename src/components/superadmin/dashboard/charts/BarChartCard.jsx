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
import { FIELD_CATEGORY, FIELD_CATEGORY_HEX, FIELD_CATEGORY_LABELS } from '@/constants'

// Color de "Total Canchas" (identidad de marca, no de estado) y "Reservas".
const TOTAL_FIELDS_COLOR = '#3b82f6'
const RESERVATIONS_COLOR = '#f59e0b'

// Series del BarChart — un objeto por barra, coherente con las keys de barChartData.
const BAR_SERIES = [
  { dataKey: 'canchas', name: 'Total', fill: TOTAL_FIELDS_COLOR },
  {
    dataKey: 'activas',
    name: FIELD_CATEGORY_LABELS[FIELD_CATEGORY.ACTIVE],
    fill: FIELD_CATEGORY_HEX[FIELD_CATEGORY.ACTIVE],
  },
  {
    dataKey: 'rechazadas',
    name: FIELD_CATEGORY_LABELS[FIELD_CATEGORY.REJECTED],
    fill: FIELD_CATEGORY_HEX[FIELD_CATEGORY.REJECTED],
  },
  { dataKey: 'reservas', name: 'Reservas', fill: RESERVATIONS_COLOR },
]

const renderBars = () =>
  BAR_SERIES.map((serie) => (
    <Bar key={serie.dataKey} dataKey={serie.dataKey} fill={serie.fill} name={serie.name} />
  ))

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
          {renderBars()}
        </BarChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={380} className="hidden sm:block">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="distrito" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          {renderBars()}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChartCard
