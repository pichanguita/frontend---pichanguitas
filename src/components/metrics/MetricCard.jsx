import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * Tarjeta individual de métrica
 */
const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor,
  trend,
  showProgress,
  progressValue,
  delay = 0,
}) => {
  const getTrendIcon = (trendType) => {
    if (trendType === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />
    if (trendType === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-gray-600" />
  }

  const getProgressColor = (value) => {
    if (value >= 80) return 'bg-green-600'
    if (value >= 60) return 'bg-blue-600'
    if (value >= 40) return 'bg-amber-600'
    return 'bg-red-600'
  }

  const getIconBgColor = (value) => {
    if (value >= 80) return 'text-green-600 bg-green-100'
    if (value >= 60) return 'text-blue-600 bg-blue-100'
    if (value >= 40) return 'text-amber-600 bg-amber-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-secondary-200 p-4 sm:p-5 md:p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-secondary-600 text-xs sm:text-sm font-medium">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-secondary-900 truncate">{value}</h3>
            {trend && getTrendIcon(trend)}
          </div>

          {/* Subtitle */}
          {subtitle && <p className="text-xs sm:text-sm text-secondary-500 mt-2">{subtitle}</p>}

          {/* Progress bar */}
          {showProgress && progressValue !== undefined && (
            <div className="mt-3">
              <div className="w-full bg-secondary-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressValue}%` }}
                  transition={{ duration: 1 }}
                  className={`h-2 rounded-full ${getProgressColor(progressValue)}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2 ${
            iconBgColor ||
            (showProgress ? getIconBgColor(progressValue) : 'bg-primary-100 text-primary-600')
          }`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </motion.div>
  )
}

export default MetricCard
