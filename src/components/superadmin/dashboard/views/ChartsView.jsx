import React from 'react'
import BarChartCard from '../charts/BarChartCard'
import PieChartCard from '../charts/PieChartCard'
import LineChartCard from '../charts/LineChartCard'
import AreaChartCard from '../charts/AreaChartCard'

const ChartsView = ({ barChartData, pieChartData, trendData, districtStats }) => {
  return (
    <div className="space-y-6">
      {/* Gráficos a ancho completo para mejor visualización */}
      <BarChartCard data={barChartData} />
      <PieChartCard data={pieChartData} />
      <LineChartCard data={trendData} />
      <AreaChartCard data={districtStats} />
    </div>
  )
}

export default ChartsView
