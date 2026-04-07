import React from 'react'
import useBookingStore from '../store/bookingStore'
import { useFieldsShowcase } from '../hooks/useFieldsShowcase'
import { FieldsGrid, InfoSection, FieldDetailModal } from './fields-showcase'

const FieldsShowcase = () => {
  const { getVisibleFields } = useBookingStore()
  const { selectedField, handleFieldClick, closeModal } = useFieldsShowcase()

  // Obtener canchas visibles (aprobadas y activas)
  const visibleFields = getVisibleFields()

  return (
    <section id="canchas" className="py-8 sm:py-12 md:py-16 bg-secondary-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-secondary-900 mb-3 sm:mb-4">
            Nuestras <span className="text-gradient">Canchas Deportivas</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-secondary-600 max-w-2xl mx-auto px-4">
            Canchas sintéticas de alta calidad en las mejores ubicaciones del Perú
          </p>
        </div>

        {/* Fields Grid */}
        <FieldsGrid fields={visibleFields} onFieldClick={handleFieldClick} />

        {/* Info Section */}
        <InfoSection />
      </div>

      {/* Modal de información de cancha */}
      {selectedField && <FieldDetailModal field={selectedField} onClose={closeModal} />}
    </section>
  )
}

export default FieldsShowcase
