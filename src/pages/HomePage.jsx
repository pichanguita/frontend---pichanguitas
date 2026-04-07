import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Hero from '../components/Hero'
import BookingFlow from '../components/BookingFlow'
import PaymentFlow from '../components/PaymentFlow'
import VideoTutorials from '../components/VideoTutorials'
import FieldsShowcase from '../components/FieldsShowcase'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useFieldStore from '../store/modules/fieldStore'
import useConfigStore from '../store/configStore'

const HomePage = () => {
  const [currentView, setCurrentView] = useState('booking') // 'booking' | 'payment'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingFields, setIsLoadingFields] = useState(true)
  const { getContactInfo, fetchContactInfo } = useConfigStore()
  const contactInfo = getContactInfo()

  const handlePaymentStep = () => {
    setCurrentView('payment')
  }

  const handleBackToBooking = () => {
    setCurrentView('booking')
  }

  const handlePaymentComplete = () => {
    setCurrentView('booking')
    setIsModalOpen(false)
  }

  const openBookingModal = () => {
    setIsModalOpen(true)
    setCurrentView('booking')
  }

  const closeBookingModal = () => {
    setIsModalOpen(false)
    setCurrentView('booking')
  }

  // Cargar canchas, tipos de deportes e información de contacto al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoadingFields(true)
        const fieldStore = useFieldStore.getState()

        // Cargar canchas, tipos de deportes e información de contacto en paralelo
        await Promise.all([
          fieldStore.loadFields(),
          fieldStore.loadSportTypes(),
          fetchContactInfo(),
        ])

      } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error)
      } finally {
        setIsLoadingFields(false)
      }
    }

    loadInitialData()
  }, [])

  return (
    <Layout onOpenBooking={openBookingModal}>
      <Hero onOpenBooking={openBookingModal} />
      <VideoTutorials />
      <FieldsShowcase />

      {/* Modal flotante para reservas */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6"
            onClick={closeBookingModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl w-full h-full sm:h-auto sm:max-h-[95vh] md:max-h-[90vh] flex flex-col relative"
              style={{
                maxWidth: 'min(1400px, 95vw)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header con botón cerrar - sticky */}
              <div className="sticky top-0 z-20 bg-white rounded-t-lg sm:rounded-t-xl md:rounded-t-2xl border-b border-gray-200 px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 flex justify-between items-center shadow-sm">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
                  {currentView === 'booking' ? 'Reserva tu Cancha' : 'Confirmar Pago'}
                </h2>
                <button
                  onClick={closeBookingModal}
                  className="bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-2 rounded-full shadow-lg transition-all hover:scale-110 flex-shrink-0"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Contenido del modal - scrollable */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">
                {isLoadingFields ? (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                    <p className="text-gray-600">Cargando canchas disponibles...</p>
                  </div>
                ) : (
                  <>
                    {currentView === 'booking' && (
                      <BookingFlow onPaymentStep={handlePaymentStep} isAuthenticated={false} />
                    )}
                    {currentView === 'payment' && (
                      <PaymentFlow
                        onBack={handleBackToBooking}
                        onComplete={handlePaymentComplete}
                      />
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Section */}
      <section id="contacto" className="py-8 bg-white sm:py-12 md:py-16">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-3 text-2xl font-bold sm:text-3xl md:text-4xl text-secondary-900">
            ¿Necesitas ayuda?
          </h2>
          <p className="mb-6 text-base sm:text-lg md:text-xl text-secondary-600">
            Contáctanos y te ayudamos con tu reserva
          </p>

          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 md:space-x-8">
            {contactInfo.phone && (
              <div className="flex items-center justify-center w-full space-x-3 sm:w-auto sm:justify-start">
                <div className="flex items-center justify-center w-10 h-10 rounded-full sm:w-12 sm:h-12 bg-primary-100">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold sm:text-base text-secondary-900">Teléfono</p>
                  <p className="text-sm sm:text-base text-secondary-600">{contactInfo.phone}</p>
                </div>
              </div>
            )}

            {contactInfo.email && (
              <div className="flex items-center justify-center w-full space-x-3 sm:w-auto sm:justify-start">
                <div className="flex items-center justify-center w-10 h-10 rounded-full sm:w-12 sm:h-12 bg-primary-100">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold sm:text-base text-secondary-900">Email</p>
                  <p className="text-sm sm:text-base text-secondary-600">{contactInfo.email}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center w-full space-x-3 sm:w-auto sm:justify-start">
              <div className="flex items-center justify-center w-10 h-10 rounded-full sm:w-12 sm:h-12 bg-primary-100">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold sm:text-base text-secondary-900">Ubicación</p>
                <p className="text-sm sm:text-base text-secondary-600">
                  {contactInfo.location || 'Perú'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default HomePage
