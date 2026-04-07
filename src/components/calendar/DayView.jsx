import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, Phone, MapPin, ChevronLeft } from 'lucide-react'
import { formatDate, formatTime } from '../../utils/calendar/formatters'
import { VIEW_MODES } from '../../utils/calendar/constants'

const DayView = ({ selectedDate, getFieldName, getFieldLocation, setViewMode }) => {
  return (
    <AnimatePresence mode="wait">
      {selectedDate && (
        <motion.div
          key={selectedDate.date.toISOString()}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="p-6"
        >
          {/* Day Header */}
          <div className="border-b border-secondary-200 pb-4 mb-6">
            <h4 className="text-xl font-bold text-secondary-900 mb-2">
              {formatDate(selectedDate.date)}
            </h4>
            <p className="text-secondary-600">
              {selectedDate.reservations.length} reserva
              {selectedDate.reservations.length !== 1 ? 's' : ''} programada
              {selectedDate.reservations.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Reservations List */}
          {selectedDate.reservations.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 mx-auto text-secondary-400 mb-4" />
              <p className="text-secondary-500">No hay reservas para este día</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDate.reservations.map((reservation, index) => {
                const isPendingCash = reservation.isPendingCashPayment === true
                const cardClass = isPendingCash
                  ? 'bg-amber-50 border border-amber-300 rounded-xl p-4'
                  : 'bg-secondary-50 border border-secondary-200 rounded-xl p-4'

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cardClass}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-primary-600" />
                            <span className="font-semibold text-primary-700">
                              {formatTime(reservation.time)}
                            </span>
                          </div>
                          <div className="h-4 w-px bg-secondary-300"></div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-secondary-600" />
                            <span className="text-secondary-700 text-sm">
                              {getFieldLocation(reservation.fieldId)}
                            </span>
                          </div>
                          {isPendingCash && (
                            <>
                              <div className="h-4 w-px bg-secondary-300"></div>
                              <div className="flex items-center space-x-1">
                                <span className="text-amber-700 font-semibold text-sm">
                                  💵 Efectivo
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        <h5 className="font-semibold text-secondary-900 mb-1">
                          {getFieldName(reservation.fieldId)}
                        </h5>

                        <div className="flex items-center space-x-4">
                          {reservation.phoneNumber && (
                            <div className="flex items-center space-x-2 text-sm text-secondary-600">
                              <Phone className="w-4 h-4" />
                              <span>{reservation.phoneNumber}</span>
                            </div>
                          )}
                          {reservation.customerName && (
                            <div className="text-sm text-secondary-700 font-medium">
                              {reservation.customerName}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm">
                          <div className="text-secondary-500">ID: {reservation.id}</div>
                          <div className="text-secondary-400">
                            {new Date(reservation.createdAt).toLocaleTimeString('es-PE', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          {isPendingCash && (
                            <div className="mt-1">
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                Pago Pendiente
                              </span>
                            </div>
                          )}
                        </div>
                        <div
                          className={`w-3 h-3 ${isPendingCash ? 'bg-amber-500' : 'bg-primary-500'} rounded-full`}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Back to Month Button */}
          <div className="mt-6 pt-4 border-t border-secondary-200">
            <button
              onClick={() => setViewMode(VIEW_MODES.MONTH)}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2 transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Volver al mes</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DayView
