import React from 'react'
import { motion } from 'framer-motion'
import { DAY_NAMES } from '../../utils/calendar/constants'
import { isToday } from '../../utils/calendar/formatters'

const MonthView = ({ monthData, handleDateClick }) => {
  return (
    <div>
      {/* Days Header */}
      <div className="grid grid-cols-7 bg-secondary-50 border-b border-secondary-200">
        {DAY_NAMES.map((day) => (
          <div key={day} className="p-4 text-center">
            <span className="text-sm font-semibold text-secondary-600">{day}</span>
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7">
        {monthData.map((dayData, index) => (
          <motion.button
            key={index}
            onClick={() => handleDateClick(dayData)}
            className={`p-2 min-h-[100px] border-r border-b border-secondary-100 hover:bg-secondary-50 transition-colors duration-200 ${
              !dayData.isCurrentMonth ? 'bg-secondary-25 text-secondary-400' : ''
            } ${isToday(dayData.date) ? 'bg-primary-50 border-primary-200' : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="h-full flex flex-col">
              {/* Day Number */}
              <div
                className={`text-sm font-medium mb-2 ${
                  isToday(dayData.date) ? 'text-primary-700' : 'text-secondary-700'
                }`}
              >
                {dayData.date.getDate()}
              </div>

              {/* Reservations Indicators */}
              <div className="flex-1 space-y-1">
                {dayData.reservations.slice(0, 3).map((reservation, idx) => {
                  const isCancelled = reservation.status === 'cancelled' || reservation.status === 'cancelada'
                  return (
                    <div
                      key={idx}
                      className={`px-2 py-1 rounded text-xs truncate border ${
                        isCancelled
                          ? 'bg-red-100 text-red-700 border-red-200 line-through'
                          : 'bg-primary-100 text-primary-700 border-primary-200'
                      }`}
                    >
                      {reservation.time}
                    </div>
                  )
                })}
                {dayData.reservations.length > 3 && (
                  <div className="text-xs text-secondary-500 text-center">
                    +{dayData.reservations.length - 3} más
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default MonthView
