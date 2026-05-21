import React, { useState, useEffect } from 'react'
import { X, Camera, AlertCircle, Map } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MapSelector from './MapSelector'
import useAuthStore from '../store/authStore'
import useFieldStore from '../store/modules/fieldStore'
import useNewFieldForm from '../hooks/useNewFieldForm'
import { fetchDepartments } from '../services/locations/locationsService'
import { getToken } from '../config/api.config'
import BasicInfoSection from './NewFieldModal/BasicInfoSection'
import PricingSection from './NewFieldModal/PricingSection'
import DimensionsSection from './NewFieldModal/DimensionsSection'
import SportsSection from './NewFieldModal/SportsSection'
import ServicesSection from './NewFieldModal/ServicesSection'
import MediaSection from './NewFieldModal/MediaSection'
import Swal from 'sweetalert2'

const NewFieldModal = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuthStore()
  const { sportTypes: sportTypesFromFieldStore, loadSportTypes } = useFieldStore()
  const [departments, setDepartments] = useState([])
  const [loadingSportTypes, setLoadingSportTypes] = useState(true)

  // Definir availableSports ANTES de usarlo en el hook
  const availableSports = sportTypesFromFieldStore || []

  // Hook personalizado con toda la lógica del formulario
  const {
    formData,
    errors,
    isLoading,
    selectedLocation,
    activeTab,
    images,
    videos,
    availableProvinces,
    availableDistricts,
    setActiveTab,
    handleSportToggle,
    handleMultiSportToggle,
    handleInputChange,
    handleLocationSelect,
    handleAmenityToggle,
    handleImageUpload,
    removeImage,
    updateImageCategory,
    handleVideoUpload,
    removeVideo,
    handleClose,
    handleSubmit,
  } = useNewFieldForm(onSave, onClose, user, availableSports)

  // Cargar departamentos al montar el componente
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const token = getToken()
        const data = await fetchDepartments(token)
        setDepartments(data)
      } catch (_error) {
        console.error('Error al cargar departamentos:', _error)
        setDepartments([])
      }
    }
    if (isOpen) {
      loadDepartments()
    }
  }, [isOpen])

  // Cargar tipos de deportes desde la base de datos al montar el componente
  useEffect(() => {
    const loadSports = async () => {
      try {
        setLoadingSportTypes(true)
        await loadSportTypes()
      } catch (error) {
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

  // Obtener datos de ubicaciones
  const departamentos = departments
  const provincias = availableProvinces
  const distritos = availableDistricts

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Fixed */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-secondary-200">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">Registrar Nueva Cancha</h2>
              <p className="text-secondary-600 mt-1">
                Agrega una nueva cancha al sistema de reservas
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-secondary-100 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6 text-secondary-600" />
            </button>
          </div>

          {/* Tabs - Fixed */}
          <div className="flex-shrink-0 flex border-b border-secondary-200">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors duration-200 ${
                activeTab === 'form'
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                  : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-50'
              }`}
            >
              <Camera className="w-5 h-5" />
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
              <span>Ubicar en Mapa</span>
              {selectedLocation && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'map' ? (
              /* Selector de Mapa */
              <MapSelector
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
              />
            ) : (
              /* Formulario */
              <form id="newFieldForm" onSubmit={handleSubmit} className="space-y-6">
                {/* Información Básica y Ubicación */}
                <BasicInfoSection
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  onChange={handleInputChange}
                  departamentos={departamentos}
                  provincias={provincias}
                  distritos={distritos}
                  selectedLocation={selectedLocation}
                />

                {/* Configuración de Precios */}
                <PricingSection
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  onChange={handleInputChange}
                />

                {/* Medidas y Superficie */}
                <DimensionsSection
                  formData={formData}
                  errors={errors}
                  isLoading={isLoading}
                  onChange={handleInputChange}
                />

                {/* Deportes Disponibles */}
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
                    availableSports={availableSports}
                    onSportToggle={handleSportToggle}
                    onMultiSportToggle={handleMultiSportToggle}
                  />
                )}

                {/* Servicios y Comodidades */}
                <ServicesSection
                  selectedAmenityKeys={formData.amenityKeys}
                  onToggleAmenity={handleAmenityToggle}
                  equipment={formData.equipment}
                  onEquipmentChange={handleInputChange}
                  isLoading={isLoading}
                />

                {/* Medios (Imágenes y Videos) */}
                {errors.images && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.images}
                    </p>
                  </div>
                )}
                <MediaSection
                  images={images}
                  videos={videos}
                  isLoading={isLoading}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={removeImage}
                  onUpdateImageCategory={updateImageCategory}
                  onVideoUpload={handleVideoUpload}
                  onRemoveVideo={removeVideo}
                />
              </form>
            )}
          </div>

          {/* Footer - Fixed */}
          <div className="flex-shrink-0 p-6 border-t border-secondary-200 bg-white rounded-b-2xl">
            {activeTab === 'form' ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 bg-secondary-200 hover:bg-secondary-300 text-secondary-700 py-3 px-6 rounded-xl font-semibold transition-colors duration-200"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="newFieldForm"
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
                      <Camera className="w-5 h-5" />
                      <span>Registrar Cancha</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleClose()
                  }}
                  className="flex-1 bg-secondary-200 hover:bg-secondary-300 text-secondary-700 py-3 px-6 rounded-xl font-semibold transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    // Evitar race condition: cuando React reemplaza este botón
                    // por "Registrar Cancha" (type="submit", form="newFieldForm")
                    // durante el ciclo del click, el navegador puede disparar
                    // submit sobre el nuevo botón. Diferimos el cambio de tab al
                    // siguiente tick para que el evento click termine ANTES de
                    // que el botón submit aparezca en el DOM.
                    e.preventDefault()
                    e.stopPropagation()
                    setTimeout(() => setActiveTab('form'), 0)
                  }}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                  disabled={!selectedLocation}
                >
                  <Camera className="w-5 h-5" />
                  <span>Continuar con Datos</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default NewFieldModal
