import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Swal from 'sweetalert2'
import useBookingStore from '../store/bookingStore'
import useThemeStore from '../store/themeStore'
import useCustomerStore from '../store/customerStore'
import useAuthStore from '../store/authStore'
import useFieldStore from '../store/modules/fieldStore'
import FieldDetailsModal from './FieldDetailsModal'
import { getSportImages } from '../data/fieldImages'
import Stepper from './Stepper'
import FilterPanel from './booking/FilterPanel'
import FieldSelectionPanel from './booking/FieldSelectionPanel'
import ConfirmationPanel from './booking/ConfirmationPanel'
import useBookingCalendar from '../hooks/useBookingCalendar'
import useFieldAvailability from '../hooks/useFieldAvailability'
import { getFieldAmenities } from '../utils/bookingHelpers'

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const BookingFlow = ({ onPaymentStep, isAuthenticated = false }) => {
  // Estados locales
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [phoneInitialized, setPhoneInitialized] = useState(false)

  const handleStartTimeChange = (value) => {
    setStartTime(value)
  }

  const handleEndTimeChange = (value) => {
    setEndTime(value)
  }
  const [selectedFieldForReservation, setSelectedFieldForReservation] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState({})
  const [confirmationImageIndex, setConfirmationImageIndex] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [showCancellationPolicies, setShowCancellationPolicies] = useState(false)
  const [fieldDetailsModalOpen, setFieldDetailsModalOpen] = useState(false)
  const [selectedFieldForDetails, setSelectedFieldForDetails] = useState(null)

  // Stores
  const { isDarkMode } = useThemeStore()
  const { user, isAuthenticated: userIsAuthenticated, isCustomer } = useAuthStore()
  const { getCustomersByAdmin, getAllCustomers } = useCustomerStore()

  // Determinar si es un cliente autenticado (no admin)
  const isClientAuthenticated = userIsAuthenticated && isCustomer && isCustomer() && user?.phone

  const adminCustomers =
    user && user.role === 'admin' ? getCustomersByAdmin(user.id) : getAllCustomers()

  const {
    selectedDepartment,
    selectedProvince,
    selectedDistrict,
    selectedDate,
    selectedTimeRanges,
    selectedSportTypes,
    phoneNumber,
    availableFields,
    // Getters de ubicaciones con canchas
    departments,
    provinces,
    districts,
    // Loaders de ubicaciones
    loadDepartments,
    timeRanges,
    existingReservations,
    setSelectedDepartment,
    setSelectedProvince,
    setSelectedDistrict,
    setSelectedField,
    setSelectedDate,
    toggleTimeRange,
    setSelectedSportType,
    setPhoneNumber,
    updateAvailableFields,
    calculatePriceWithDiscount,
    loadReservations,
    freeHoursToUse,
    setFreeHoursToUse,
    availableFreeHours,
    selectedReservationSport,
    setSelectedReservationSport,
  } = useBookingStore()

  // Obtener sportTypes directamente del fieldStore
  const sportTypes = useFieldStore((state) => state.sportTypes)

  // Cargar canchas, deportes, reservas y departamentos al montar el componente (solo una vez)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const fieldStore = useFieldStore.getState()
        const tasks = [
          // Solo cargar canchas activas y aprobadas para la landing page
          fieldStore.loadFields({
            is_active: true,
            approval_status: 'approved',
          }),
          fieldStore.loadSportTypes(),
          loadDepartments(), // Cargar departamentos que tienen canchas registradas
        ]
        // GET /api/reservations exige autenticación. Para usuarios públicos
        // (landing page sin login), useFieldAvailability ya consulta los slots
        // ocupados por cancha vía fetchPublicFieldAvailability, así que NO
        // debemos disparar loadReservations() — disparaba 401 "Token no
        // proporcionado" y el authInterceptor redirigía al /login.
        if (userIsAuthenticated) {
          tasks.push(loadReservations())
        }
        await Promise.all(tasks)
        console.log('✅ Canchas, deportes y departamentos cargados para reservas')
      } catch (error) {
        console.error('❌ Error cargando datos iniciales:', error)
      }
    }
    loadInitialData()
  }, [loadReservations, loadDepartments, userIsAuthenticated]) // Solo ejecutar una vez al montar

  // Custom hooks
  const calendar = useBookingCalendar(selectedDate)

  const fieldAvailability = useFieldAvailability({
    availableFields,
    selectedDate,
    startTime,
    endTime,
    timeRanges,
    existingReservations,
    selectedDistrict,
    selectedSportTypes,
  })

  // Handlers de filtros
  const handleDepartmentSelect = (departmentName) => {
    setSelectedDepartment(departmentName)
    setSelectedProvince('')
    setSelectedDistrict('')
    setSelectedFieldForReservation(null)
  }

  const handleProvinceSelect = (provinceName) => {
    setSelectedProvince(provinceName)
    setSelectedDistrict('')
    setSelectedFieldForReservation(null)
  }

  const handleDistrictSelect = (districtName) => {
    setSelectedDistrict(districtName)
    if (selectedDistrict !== districtName) {
      setSelectedFieldForReservation(null)
    }
    if (selectedSportTypes.length > 0 && selectedDate && startTime && endTime) {
      updateAvailableFields()
    }
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    if (selectedDate !== date) {
      setSelectedFieldForReservation(null)
    }
    if (selectedDistrict && selectedSportTypes.length > 0 && startTime && endTime) {
      updateAvailableFields()
    }
  }

  const handleSportTypeSelect = (sportTypeId) => {
    // setSelectedSportType ahora hace toggle (agrega/quita del array)
    setSelectedSportType(sportTypeId)
    // Limpiar campo seleccionado cuando cambian los deportes
    setSelectedFieldForReservation(null)
    if (selectedDistrict && selectedDate && startTime && endTime) {
      updateAvailableFields()
    }
  }

  // Handlers de campos
  const handleFieldSelect = (field) => {
    setSelectedFieldForReservation(field)
    setSelectedField(field)
    selectedTimeRanges.forEach((id) => toggleTimeRange(id))
    setConfirmationImageIndex(0)
    // Reset del deporte específico al cambiar de cancha; se reinicializa al
    // entrar al paso 3 con el primer deporte que ofrece la cancha elegida.
    setSelectedReservationSport(null)
  }

  const handleFieldClick = (field) => {
    setSelectedFieldForDetails(field)
    setFieldDetailsModalOpen(true)
  }

  // Handlers de imágenes
  const changeFieldImage = (fieldId, direction, totalImages) => {
    setCurrentImageIndex((prev) => {
      const current = prev[fieldId] || 0
      const next =
        direction === 'next'
          ? (current + 1) % totalImages
          : (current - 1 + totalImages) % totalImages
      return { ...prev, [fieldId]: next }
    })
  }

  const changeConfirmationImage = (direction, totalImages) => {
    setConfirmationImageIndex((prev) => {
      return direction === 'next'
        ? (prev + 1) % totalImages
        : (prev - 1 + totalImages) % totalImages
    })
  }

  // Handlers de horarios
  const handleTimeRangeToggle = (timeRangeId, field) => {
    if (!fieldAvailability.checkTimeSlotAvailability(field, timeRangeId)) {
      return
    }
    toggleTimeRange(timeRangeId)
  }

  // Handlers de clientes
  const handleCustomerSelect = (customerId) => {
    setSelectedCustomer(customerId)
    if (customerId === '') {
      setPhoneNumber('')
    } else {
      const customer = adminCustomers.find((c) => c.id === customerId)
      if (customer) {
        setPhoneNumber(customer.phoneNumber)
      }
    }
  }

  const handlePhoneSubmit = () => {
    if (!/^9\d{8}$/.test(phoneNumber)) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono inválido',
        text: 'El teléfono debe tener 9 dígitos y comenzar con 9',
        confirmButtonColor: '#22c55e',
      })
      return
    }
    if (phoneNumber.length === 9 && selectedFieldForReservation && selectedTimeRanges.length > 0) {
      onPaymentStep && onPaymentStep()
    }
  }

  // Validación de navegación
  const canGoToStep2 = () => fieldAvailability.canSearchFields
  const canGoToStep3 = () => selectedFieldForReservation && selectedTimeRanges.length > 0
  const canConfirmReservation = () =>
    phoneNumber.length >= 9 && selectedTimeRanges.length > 0 && selectedFieldForReservation

  const goToNextStep = () => {
    if (currentStep === 1 && canGoToStep2()) {
      // Filtrar canchas ANTES de avanzar al paso 2
      console.log('🔍 Buscando canchas disponibles...')
      updateAvailableFields()
      setCurrentStep(2)
    } else if (currentStep === 2 && canGoToStep3()) {
      setCurrentStep(3)
      setConfirmationImageIndex(0)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Inicialización
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date().toISOString().split('T')[0]
      setSelectedDate(today)
    }
  }, [])

  // Auto-completar teléfono para clientes autenticados (solo una vez)
  useEffect(() => {
    if (isClientAuthenticated && user?.phone && !phoneInitialized) {
      setPhoneNumber(user.phone)
      setPhoneInitialized(true)
    }
  }, [isClientAuthenticated, user?.phone, phoneInitialized, setPhoneNumber])

  // Actualizar campos disponibles
  useEffect(() => {
    if (selectedDistrict && selectedSportTypes.length > 0 && selectedDate && startTime && endTime) {
      updateAvailableFields()
    }
  }, [startTime, endTime, selectedDistrict, selectedSportTypes, selectedDate])

  // Inicializar el deporte específico de la reserva al entrar al paso 3.
  // - Canchas mono-deporte: se asigna automáticamente el único deporte (no se
  //   muestra UI extra).
  // - Canchas multi-deporte: pre-selecciona el primero (primera opción del
  //   selector). El usuario puede cambiarlo en el ConfirmationPanel.
  useEffect(() => {
    if (currentStep !== 3 || !selectedFieldForReservation) return
    if (selectedReservationSport != null) return

    const fieldSports = Array.isArray(selectedFieldForReservation.sportTypes)
      ? selectedFieldForReservation.sportTypes
      : []
    const firstSport =
      fieldSports[0] ?? selectedFieldForReservation.sportType ?? null
    if (firstSport != null) {
      setSelectedReservationSport(firstSport)
    }
  }, [
    currentStep,
    selectedFieldForReservation,
    selectedReservationSport,
    setSelectedReservationSport,
  ])

  // Auto-aplicar horas gratis cuando el cliente llega a la confirmación.
  // Si el cliente desactiva el toggle, su decisión persiste hasta que cambie de paso.
  // Una vez en el step 3, la auto-aplicación se ejecuta una sola vez por entrada.
  const freeHoursAutoAppliedRef = useRef(false)
  useEffect(() => {
    if (currentStep !== 3) {
      freeHoursAutoAppliedRef.current = false
      return
    }
    if (
      !freeHoursAutoAppliedRef.current &&
      availableFreeHours > 0 &&
      freeHoursToUse === 0
    ) {
      setFreeHoursToUse(availableFreeHours)
      freeHoursAutoAppliedRef.current = true
    }
  }, [currentStep, availableFreeHours, freeHoursToUse, setFreeHoursToUse])

  // Configuración de pasos
  const steps = [
    {
      label: currentStep === 1 ? 'Paso 1' : 'Filtros de Búsqueda',
      description: 'Ubicación, deporte, fecha',
    },
    { label: currentStep === 2 ? 'Paso 2' : 'Elegir Cancha', description: 'Selecciona y reserva' },
    { label: currentStep === 3 ? 'Paso 3' : 'Confirmar Reserva', description: 'Datos y pago' },
  ]

  return (
    <section
      id="reservar"
      className="py-8 sm:py-12 md:py-16 transition-colors duration-300"
      style={{ backgroundColor: isDarkMode ? '#0a2424' : '#f8fafc' }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <Stepper currentStep={currentStep} steps={steps} />

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Encabezado del paso actual */}
          <div className="border-b border-secondary-200 p-3 sm:p-4 bg-secondary-50">
            <div className="flex justify-between items-center gap-2">
              {currentStep > 1 && (
                <button
                  onClick={goToPreviousStep}
                  className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all bg-secondary-600 text-white hover:bg-secondary-700 text-sm sm:text-base"
                >
                  ← Anterior
                </button>
              )}

              <div className="text-center flex-1">
                <h4 className="text-sm sm:text-base md:text-lg font-bold text-secondary-900">
                  {currentStep === 1 && '🔍 Paso 1: Filtros'}
                  {currentStep === 2 && '🏟️ Paso 2: Elegir Cancha'}
                  {currentStep === 3 && '✅ Paso 3: Confirmar Reserva'}
                </h4>
              </div>

              {currentStep > 1 && <div className="w-[72px] sm:w-[88px]"></div>}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-0">
            {/* PASO 1: FILTROS */}
            {currentStep === 1 && (
              <FilterPanel
                selectedDepartment={selectedDepartment}
                selectedProvince={selectedProvince}
                selectedDistrict={selectedDistrict}
                selectedSportTypes={selectedSportTypes}
                selectedDate={selectedDate}
                startTime={startTime}
                endTime={endTime}
                departments={departments}
                provinces={provinces}
                districts={districts}
                sportTypes={sportTypes}
                timeRanges={timeRanges}
                currentMonth={calendar.currentMonth}
                currentYear={calendar.currentYear}
                onDepartmentSelect={handleDepartmentSelect}
                onProvinceSelect={handleProvinceSelect}
                onDistrictSelect={handleDistrictSelect}
                onSportTypeSelect={handleSportTypeSelect}
                onDateSelect={handleDateSelect}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={handleEndTimeChange}
                onMonthChange={calendar.setCurrentMonth}
                onYearChange={calendar.setCurrentYear}
                generateCalendar={calendar.generateCalendar}
                monthNames={calendar.monthNames}
                weekDays={calendar.weekDays}
                canSearch={canGoToStep2()}
                onSearch={goToNextStep}
                visibleFieldsCount={fieldAvailability.visibleFields.length}
              />
            )}

            {/* PASO 2: CANCHAS Y HORARIOS */}
            {currentStep === 2 && (
              <FieldSelectionPanel
                visibleFields={fieldAvailability.visibleFields}
                selectedFieldForReservation={selectedFieldForReservation}
                showCancellationPolicies={showCancellationPolicies}
                currentImageIndex={currentImageIndex}
                selectedTimeRanges={selectedTimeRanges}
                isAuthenticated={isAuthenticated}
                timeRanges={timeRanges}
                getSportImages={getSportImages}
                calculateSelectedTimeRanges={fieldAvailability.calculateSelectedTimeRanges}
                isTimeSlotAvailable={fieldAvailability.checkTimeSlotAvailability}
                onFieldSelect={handleFieldSelect}
                onFieldClick={handleFieldClick}
                onToggleCancellationPolicies={() =>
                  setShowCancellationPolicies(!showCancellationPolicies)
                }
                onChangeFieldImage={changeFieldImage}
                onImageIndexChange={(fieldId, idx) =>
                  setCurrentImageIndex((prev) => ({ ...prev, [fieldId]: idx }))
                }
                onTimeRangeToggle={handleTimeRangeToggle}
                onNextStep={goToNextStep}
              />
            )}

            {/* PASO 3: CONFIRMACIÓN */}
            {currentStep === 3 && (
              <ConfirmationPanel
                selectedFieldForReservation={selectedFieldForReservation}
                selectedTimeRanges={selectedTimeRanges}
                timeRanges={timeRanges}
                selectedDate={selectedDate}
                confirmationImageIndex={confirmationImageIndex}
                phoneNumber={phoneNumber}
                user={user}
                adminCustomers={adminCustomers}
                selectedCustomer={selectedCustomer}
                isClientAuthenticated={isClientAuthenticated}
                getSportImages={getSportImages}
                getFieldAmenities={getFieldAmenities}
                calculatePriceWithDiscount={calculatePriceWithDiscount}
                canConfirmReservation={canConfirmReservation()}
                onChangeConfirmationImage={changeConfirmationImage}
                onConfirmationImageIndexChange={setConfirmationImageIndex}
                onPhoneNumberChange={setPhoneNumber}
                onCustomerSelect={handleCustomerSelect}
                onConfirmReservation={handlePhoneSubmit}
                availableFreeHours={availableFreeHours}
                freeHoursToUse={freeHoursToUse}
                onToggleFreeHours={(use) => setFreeHoursToUse(use ? availableFreeHours : 0)}
                allSportTypes={sportTypes}
                selectedReservationSport={selectedReservationSport}
                onReservationSportChange={setSelectedReservationSport}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalles de Cancha */}
      <FieldDetailsModal
        isOpen={fieldDetailsModalOpen}
        onClose={() => {
          setFieldDetailsModalOpen(false)
          setSelectedFieldForDetails(null)
        }}
        field={selectedFieldForDetails}
        onSelect={(field) => {
          handleFieldSelect(field)
          setFieldDetailsModalOpen(false)
          setSelectedFieldForDetails(null)
        }}
      />
    </section>
  )
}

export default BookingFlow
