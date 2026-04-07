import React from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'

const EmptyState = ({ phoneNumber }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl shadow-lg p-12 text-center"
    >
      <Calendar className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-secondary-600 mb-2">No tienes reservas activas</h3>
      <p className="text-secondary-500">No encontramos reservas con el número {phoneNumber}</p>
    </motion.div>
  )
}

export default EmptyState
