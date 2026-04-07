import React from 'react'
import { motion } from 'framer-motion'
import FieldCard from './FieldCard'
import { containerVariants, cardVariants } from '../../utils/fields-showcase/constants'

const FieldsGrid = ({ fields, onFieldClick }) => {
  if (!fields || fields.length === 0) {
    return (
      <div className="text-center py-8 sm:py-10 md:py-12">
        <p className="text-gray-600 text-lg">No hay canchas disponibles en este momento.</p>
        <p className="text-gray-500 text-sm mt-2">
          Próximamente tendremos más canchas disponibles.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
    >
      {fields.map((field) => (
        <FieldCard
          key={field.id}
          field={field}
          onFieldClick={onFieldClick}
          variants={cardVariants}
        />
      ))}
    </motion.div>
  )
}

export default FieldsGrid
