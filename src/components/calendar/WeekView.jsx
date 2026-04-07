import React from 'react'
import { motion } from 'framer-motion'
import { DAY_NAMES } from '../../utils/calendar/constants'

const WeekView = ({ weekData, handleDateClick, getFieldName }) => {
  return (
    <div>
      {/* Week Header */}
      <div className="grid grid-cols-7 bg-secondary-50 border-b border-secondary-200">
        {DAY_NAMES.map((day, index) => (
          <div key={day} className="p-4 text-center">
            <span className="text-sm font-semibold text-secondary-600">{day}</span>
            <div className="text-xs text-secondary-500 mt-1">{weekData[index]?.date.getDate()}</div>
          </div>
        ))}
      </div>

      {/* Week Content */}
      <div className="grid grid-cols-7 min-h-[400px]">
        {weekData.map((dayData, index) => (
          <motion.button
            key={index}
            onClick={() => handleDateClick(dayData)}
            className={`p-3 border-r border-b border-secondary-100 hover:bg-secondary-50 transition-colors duration-200 ${
              dayData.isToday ? 'bg-primary-50 border-primary-200' : ''
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="h-full flex flex-col">
              {/* Day Number */}
              <div
                className={`text-lg font-bold mb-3 ${
                  dayData.isToday ? 'text-primary-700' : 'text-secondary-700'
                }`}
              >
                {dayData.date.getDate()}
              </div>

              {/* Reservations */}
              <div className="flex-1 space-y-2">
                {dayData.reservations.slice(0, 6).map((reservation, idx) => {
                  const isCancelled = reservation.status === 'cancelled' || reservation.status === 'cancelada'
                  return (
                    <div
                      key={idx}
                      className={`px-2 py-1 rounded text-xs border ${
                        isCancelled
                          ? 'bg-red-100 text-red-700 border-red-200 line-through'
                          : 'bg-primary-100 text-primary-700 border-primary-200'
                      }`}
                      title={`${getFieldName(reservation.fieldId)} - ${reservation.time}`}
                    >
                      <div className="font-medium truncate">{reservation.time}</div>
                      <div className="text-xs truncate opacity-75">
                        {getFieldName(reservation.fieldId)}
                      </div>
                    </div>
                  )
                })}
                {dayData.reservations.length > 6 && (
                  <div className="text-xs text-secondary-500 text-center font-medium">
                    +{dayData.reservations.length - 6} más
                  </div>
                )}
              </div>

              {/* Today indicator */}
              {dayData.isToday && (
                <div className="mt-2 w-2 h-2 bg-primary-500 rounded-full mx-auto"></div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

export default WeekView
