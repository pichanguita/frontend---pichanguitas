import React from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useCustomerStore from '../store/customerStore'
import useClientRegistration from '../hooks/useClientRegistration'
import ClientModeSelector from './client-registration/ClientModeSelector'
import ExistingClientSelector from './client-registration/ExistingClientSelector'
import ClientDataForm from './client-registration/ClientDataForm'
import ReservationDataForm from './client-registration/ReservationDataForm'
import PaymentInfo from './client-registration/PaymentInfo'
import AvailabilityInfo from './client-registration/AvailabilityInfo'

const ClientRegistrationModal = ({ isOpen, onClose, onSave, selectedDate }) => {
  const { customers } = useCustomerStore()

  const {
    formData,
    errors,
    isLoading,
    occupiedSlots,
    clientSelectionMode,
    selectedCustomerId,
    visibleFields,
    handleInputChange,
    handleClientModeChange,
    handleSelectCustomer,
    handleSubmit,
    handleClose,
  } = useClientRegistration(selectedDate, isOpen, onSave, onClose)

  if (!isOpen) return null

  const isClientFieldsDisabled =
    isLoading || (clientSelectionMode === 'existing' && selectedCustomerId)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between p-4 sm:p-6">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  Registrar Cliente
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Registro manual de cliente y asignación de cancha
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 disabled:opacity-50"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>
            </div>

            {formData.date && (
              <div className="px-6 pb-4">
                <AvailabilityInfo
                  date={formData.date}
                  fieldId={formData.fieldId}
                  occupiedSlots={occupiedSlots}
                />
              </div>
            )}

            {!formData.date && (
              <div className="px-6 pb-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      Selecciona una fecha haciendo click en el calendario o usando el campo de
                      fecha
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <div>
                <div className="space-y-3 sm:space-y-4">
                  <ClientModeSelector
                    mode={clientSelectionMode}
                    onModeChange={handleClientModeChange}
                    isLoading={isLoading}
                  />

                  {clientSelectionMode === 'existing' && (
                    <ExistingClientSelector
                      customers={customers}
                      selectedCustomerId={selectedCustomerId}
                      onSelectCustomer={handleSelectCustomer}
                      isLoading={isLoading}
                    />
                  )}
                </div>

                <div className="mt-3 sm:mt-4">
                  <ClientDataForm
                    formData={formData}
                    errors={errors}
                    onChange={handleInputChange}
                    disabled={isClientFieldsDisabled}
                  />
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <ReservationDataForm
                  formData={formData}
                  errors={errors}
                  fields={visibleFields}
                  onChange={handleInputChange}
                  isLoading={isLoading}
                  occupiedSlots={occupiedSlots}
                />

                {formData.totalAmount > 0 && (
                  <PaymentInfo
                    totalAmount={formData.totalAmount}
                    advanceAmount={formData.advanceAmount}
                    remainingAmount={formData.remainingAmount}
                    paymentStatus={formData.paymentStatus}
                    originalAmount={formData.originalAmount}
                    discountAmount={formData.discountAmount}
                    appliedDiscounts={formData.appliedDiscounts}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200 disabled:opacity-50 text-sm sm:text-base order-2 sm:order-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center text-sm sm:text-base order-1 sm:order-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Registrar Cliente
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ClientRegistrationModal
