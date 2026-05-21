import React, { useState, useEffect } from 'react'
import { X, Settings, Map, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MapSelector from './MapSelector'
import useFieldStore from '../store/modules/fieldStore'
import { useEditFieldForm } from '../hooks/useEditFieldForm'
import BasicInfoSection from './edit-field/BasicInfoSection'
import LocationSection from './edit-field/LocationSection'
import SportsSection from './edit-field/SportsSection'
import PricingSection from './edit-field/PricingSection'
import DimensionsSection from './edit-field/DimensionsSection'
import ServicesSection from './edit-field/ServicesSection'
import Swal from 'sweetalert2'

const EditFieldModal = ({ isOpen, onClose, onSave, field }) => {
  const { sportTypes: sportTypesFromFieldStore, loadSportTypes } = useFieldStore()
  const [loadingSportTypes, setLoadingSportTypes] = useState(true)

  const {
    formData,
    errors,
    isLoading,
    selectedLocation,
    activeTab,
    availableProvinces,
    availableDistricts,
    setActiveTab,
    handleInputChange,
    handleLocationSelect,
    handleSubmit,
    handleSportToggle,
    handleMultiSportToggle,
    handleAmenityToggle,
  } = useEditFieldForm(isOpen, field, onSave, onClose)

  // Cargar tipos de deportes desde la base de datos al montar el componente
  useEffect(() => {
    const loadSports = async () => {
      try {
        setLoadingSportTypes(true)
        await loadSportTypes()
      } catch (_error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar deportes',
          text: 'No se pudieron cargar los deportes disponibles. Por favor, recarga la página.',
          confirmButtonColor: '#ef4444',
          showCloseButton: true,
          allowEscapeKey: true,
        })
      } finally {
        setLoadingSportTypes(false)
      }
    }
    if (isOpen) {
      loadSports()
    }
  }, [isOpen, loadSportTypes])

  if (!isOpen || !field) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Fijo */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-secondary-200 bg-white">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">Editar Cancha</h2>
              <p className="text-secondary-600 mt-1">
                Modifica la información de <strong>{field.name}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-secondary-100 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-secondary-600" />
            </button>
          </div>

          {/* Tabs Fijo */}
          <div className="flex-shrink-0 flex border-b border-secondary-200 bg-white">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors duration-200 ${
                activeTab === 'form'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Datos de la Cancha</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors duration-200 ${
                activeTab === 'map'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
              }`}
            >
              <Map className="w-5 h-5" />
              <span>Reubicar en Mapa</span>
              {selectedLocation && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
            </button>
          </div>

          {/* Content con Scroll */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
            {activeTab === 'map' ? (
              /* Map Selector */
              <MapSelector
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
              />
            ) : (
              /* Form */
              <form id="edit-field-form" onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <BasicInfoSection
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  availableProvinces={availableProvinces}
                  availableDistricts={availableDistricts}
                  handleInputChange={handleInputChange}
                />

                {/* Location and Contact */}
                <LocationSection
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  selectedLocation={selectedLocation}
                  handleInputChange={handleInputChange}
                />

                {/* Sports */}
                {loadingSportTypes ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-secondary-800">
                      Deportes Disponibles en la Cancha *
                    </h3>
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-3 text-secondary-600">
                        Cargando deportes disponibles...
                      </span>
                    </div>
                  </div>
                ) : (
                  <SportsSection
                    formData={formData}
                    errors={errors}
                    isLoading={isLoading}
                    availableSports={sportTypesFromFieldStore}
                    handleSportToggle={handleSportToggle}
                    handleMultiSportToggle={handleMultiSportToggle}
                  />
                )}

                {/* Pricing and Configuration */}
                <PricingSection
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  handleInputChange={handleInputChange}
                />

                {/* Dimensions */}
                <DimensionsSection
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  handleInputChange={handleInputChange}
                />

                {/* Services and Amenities */}
                <ServicesSection
                  selectedAmenityKeys={formData.amenityKeys}
                  onToggleAmenity={handleAmenityToggle}
                  equipment={formData.equipment}
                  onEquipmentChange={handleInputChange}
                  isLoading={isLoading}
                />
              </form>
            )}
          </div>

          {/* Footer Fijo */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 p-6 border-t border-secondary-200 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-secondary-200 hover:bg-secondary-300 text-secondary-700 py-3 px-6 rounded-xl font-semibold transition-colors duration-200"
              disabled={isLoading}
            >
              Cancelar
            </button>
            {activeTab === 'form' ? (
              <button
                type="submit"
                form="edit-field-form"
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  // Evitar race condition: cuando React reemplaza este botón
                  // por "Guardar Cambios" (type="submit", form="edit-field-form")
                  // durante el ciclo del click, el navegador puede disparar
                  // submit sobre el nuevo botón. Diferimos el cambio de tab al
                  // siguiente tick para que el evento click termine ANTES de
                  // que el botón submit aparezca en el DOM.
                  e.preventDefault()
                  e.stopPropagation()
                  setTimeout(() => setActiveTab('form'), 0)
                }}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Settings className="w-5 h-5" />
                <span>Continuar Editando</span>
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default EditFieldModal
