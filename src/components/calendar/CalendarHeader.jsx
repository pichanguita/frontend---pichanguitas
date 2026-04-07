import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { MONTH_NAMES, VIEW_MODES } from '../../utils/calendar/constants'

const CalendarHeader = ({
  currentDate,
  viewMode,
  weekData,
  navigateMonth,
  goToToday,
  setViewMode,
}) => {
  const getHeaderTitle = () => {
    if (viewMode === VIEW_MODES.WEEK) {
      const startOfWeek = weekData[0]?.date
      const endOfWeek = weekData[6]?.date
      if (startOfWeek && endOfWeek) {
        const startMonth = MONTH_NAMES[startOfWeek.getMonth()]
        const endMonth = MONTH_NAMES[endOfWeek.getMonth()]

        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startMonth} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`
        } else {
          return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`
        }
      }
    }
    return `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-custom p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 md:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Navigation and Title */}
        <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="btn-icon p-2 rounded-lg hover:bg-primary-50 transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-700" />
          </button>

          <motion.h2
            key={getHeaderTitle()}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg sm:text-xl md:text-2xl font-bold text-secondary-900 min-w-[180px] sm:min-w-[240px] text-center"
          >
            {getHeaderTitle()}
          </motion.h2>

          <button
            onClick={() => navigateMonth(1)}
            className="btn-icon p-2 rounded-lg hover:bg-primary-50 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-700" />
          </button>
        </div>

        {/* View Mode Selector and Today Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Mode Buttons */}
          <div className="flex rounded-lg bg-secondary-100 p-1">
            <button
              onClick={() => setViewMode(VIEW_MODES.MONTH)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                viewMode === VIEW_MODES.MONTH
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode(VIEW_MODES.WEEK)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                viewMode === VIEW_MODES.WEEK
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode(VIEW_MODES.DAY)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                viewMode === VIEW_MODES.DAY
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-secondary-600 hover:text-secondary-900'
              }`}
            >
              Día
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={goToToday}
            className="btn-secondary flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm whitespace-nowrap"
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Hoy</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CalendarHeader
