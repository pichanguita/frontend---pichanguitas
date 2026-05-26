import { create } from 'zustand'
import { generateHourlyTimeRanges } from '../utils/timeSlots'

// Importar módulos de acciones
import {
  createGeographyFacade,
  createFieldFacade,
  createPricingFacade,
  createCouponFacade,
  createStateSetters,
  createAvailabilityActions,
  createReservationActions,
  createAdminClientActions,
  createUtilityActions,
} from './booking'

/**
 * Booking Store (Facade Pattern + Modular Architecture)
 *
 * ⚠️ IMPORTANTE: Este store actúa como ORQUESTADOR CENTRAL
 *
 * Combina múltiples módulos de acciones usando spread operators:
 *
 * Módulos incluidos:
 * - geographyFacade: Ubicaciones geográficas (departamentos, provincias, distritos)
 * - fieldFacade: Canchas y deportes
 * - pricingFacade: Cálculo de precios
 * - couponFacade: Cupones y descuentos
 * - stateSetters: Setters simples de estado
 * - availabilityActions: Disponibilidad de campos y horarios
 * - reservationActions: CRUD de reservas (crear, aprobar, rechazar, completar, cancelar)
 * - adminClientActions: Clientes registrados por admins
 * - utilityActions: Utilidades (reset, queries, payment methods)
 *
 * Los componentes existentes NO necesitan cambios - la API pública es idéntica.
 */
const useBookingStore = create((set, get) => ({
  // ========================================
  // ESTADO INICIAL
  // ========================================

  // Estado de la reserva en progreso
  selectedField: null,
  selectedDate: '',
  selectedTimeSlots: [],
  selectedTimeRanges: [],
  phoneNumber: '',
  paymentMethod: '',
  reservationSummary: null,
  availableFreeHours: 0, // Horas gratis acumuladas por el cliente (cargadas del backend)
  freeHoursToUse: 0, // Horas gratis a aplicar en la reserva actual (selección del cliente)

  // Estado UI
  isLoading: false,
  availableFields: [],
  availableTimes: [],

  // Datos (se cargarán desde el backend)
  existingReservations: [],
  pendingRefunds: [], // Reembolsos pendientes del backend
  timeRanges: generateHourlyTimeRanges(), // Dominio día completo; cada cancha se acota con su schedule
  paymentMethods: [], // Se cargan de la config de cada cancha
  adminClients: [],

  // ========================================
  // MÓDULOS DE ACCIONES (Spread Operators)
  // ========================================

  // Geografía: Departamentos, provincias, distritos
  ...createGeographyFacade(set, get),

  // Campos: CRUD de canchas y tipos de deporte
  ...createFieldFacade(set, get),

  // Precios: Cálculo de precios con descuentos
  ...createPricingFacade(set, get),

  // Cupones: Validación y aplicación de cupones
  ...createCouponFacade(set, get),

  // Setters: Setters simples de estado
  ...createStateSetters(set, get),

  // Disponibilidad: Campos y horarios disponibles
  ...createAvailabilityActions(set, get),

  // Reservas: CRUD completo de reservas
  ...createReservationActions(set, get),

  // Clientes Admin: Clientes registrados por administradores
  ...createAdminClientActions(set, get),

  // Utilidades: Reset, queries, payment methods
  ...createUtilityActions(set, get),
}))

export default useBookingStore
