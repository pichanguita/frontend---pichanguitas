import React, { useState, useEffect } from 'react'
import { UserPlus, ArrowLeft, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import useAdminRegistrationForm from '../hooks/useAdminRegistrationForm'
import useFieldStore from '../store/modules/fieldStore'
import StepIndicator from './admin-registration/StepIndicator'
import PersonalInfoStep from './admin-registration/PersonalInfoStep'
import CredentialsStep from './admin-registration/CredentialsStep'
import BusinessInfoStep from './admin-registration/BusinessInfoStep'
import DetailsStep from './admin-registration/DetailsStep'
import Swal from 'sweetalert2'

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const AdminRegistration = () => {
  const navigate = useNavigate()

  // Estados para gestión de deportes
  const { sportTypes, loadSportTypes } = useFieldStore()
  const [loadingSportTypes, setLoadingSportTypes] = useState(true)

  // Hook para manejo del formulario
  const {
    formData,
    errors,
    currentStep,
    isLoading,
    availableProvincias,
    availableDistritos,
    showPassword,
    showConfirmPassword,
    setShowPassword,
    setShowConfirmPassword,
    handleInputChange,
    handleNext,
    handlePrevious,
    handleSubmit,
    handleFileChange,
    removeFile,
    addFile,
    updateBusinessLocation,
  } = useAdminRegistrationForm()

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
    loadSports()
  }, [loadSportTypes])

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 rounded-full bg-primary-100"
        >
          <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary-900">Inscripción de Cancha</h1>
        <p className="mt-2 text-sm sm:text-base text-secondary-600">
          Completa el formulario para inscribir tu cancha en nuestra plataforma
        </p>
      </div>

      {/* Progress Steps */}
      <StepIndicator currentStep={currentStep} />

      {/* Form */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-3 sm:p-4 md:p-6 bg-white shadow-lg rounded-xl"
      >
        <form onSubmit={handleSubmit}>
          {/* Step 1: Información Personal */}
          {currentStep === 1 && (
            <PersonalInfoStep
              formData={formData}
              errors={errors}
              availableProvincias={availableProvincias}
              availableDistritos={availableDistritos}
              onInputChange={handleInputChange}
            />
          )}

          {/* Step 2: Credenciales */}
          {currentStep === 2 && (
            <CredentialsStep
              formData={formData}
              errors={errors}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              onInputChange={handleInputChange}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          )}

          {/* Step 3: Información del Negocio */}
          {currentStep === 3 && (
            <BusinessInfoStep
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              onLocationUpdate={updateBusinessLocation}
              availableSportTypes={sportTypes}
              loadingSportTypes={loadingSportTypes}
            />
          )}

          {/* Step 4: Detalles y Confirmación */}
          {currentStep === 4 && (
            <DetailsStep
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
              onFileChange={handleFileChange}
              onRemoveFile={removeFile}
              onAddFile={addFile}
            />
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6 sm:mt-8 gap-2">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center px-3 py-2 sm:px-4 sm:py-2 transition-colors rounded-lg text-secondary-700 bg-secondary-100 hover:bg-secondary-200 text-sm sm:text-base"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Anterior
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex items-center px-3 py-2 sm:px-4 sm:py-2 transition-colors rounded-lg text-secondary-700 bg-secondary-100 hover:bg-secondary-200 text-sm sm:text-base"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Volver al Login</span>
                <span className="sm:hidden">Volver</span>
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center px-4 py-2 sm:px-6 sm:py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700 text-sm sm:text-base"
              >
                Siguiente
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 rotate-180" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center px-4 py-2 sm:px-6 sm:py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 border-b-2 border-white rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Enviar Solicitud</span>
                    <span className="sm:hidden">Enviar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AdminRegistration
