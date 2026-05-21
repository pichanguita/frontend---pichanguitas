// Constantes para el formulario de Nueva Cancha

// Valores iniciales del formulario
export const INITIAL_FORM_DATA = {
  name: '',
  departamento: '',
  departamentoId: '',
  provincia: '',
  provinciaId: '',
  distrito: '',
  distritoId: '',
  districtId: '',
  address: '',
  phone: '',
  pricePerHour: '',
  advancePaymentAmount: '',
  latitude: '',
  longitude: '',
  requiresAdvancePayment: false,
  status: 'available',
  dimensions: {
    length: '',
    width: '',
    area: '',
    surfaceType: 'cesped_sintetico',
  },
  // Keys del catálogo amenities_catalog (slugs como 'showers', 'bar', etc.)
  amenityKeys: [],
  equipment: {
    hasJerseyRental: false,
    jerseyPrice: '',
    hasBallRental: false,
    ballPrice: '',
    hasConeRental: false,
    conePrice: '',
  },
  sportTypes: [],
  isMultiSport: false,
}

// Horarios por defecto para las canchas
export const DEFAULT_SCHEDULE = {
  monday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
  tuesday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
  wednesday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
  thursday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
  friday: { isOpen: true, openTime: '08:00', closeTime: '23:00' },
  saturday: { isOpen: true, openTime: '08:00', closeTime: '23:00' },
  sunday: { isOpen: true, openTime: '08:00', closeTime: '22:00' },
}

// Tipos de superficie disponibles
export const SURFACE_TYPES = [
  { value: 'cesped_sintetico', label: 'Césped Sintético' },
  { value: 'cesped_natural', label: 'Césped Natural' },
  { value: 'tierra', label: 'Tierra' },
  { value: 'concreto', label: 'Concreto' },
]

// Estados disponibles para la cancha
export const FIELD_STATUS = [
  { value: 'available', label: 'Disponible' },
  { value: 'maintenance', label: 'En Mantenimiento' },
]

// Categorías de imágenes
export const IMAGE_CATEGORIES = [
  { value: 'general', label: '📸 General' },
  { value: 'day', label: '☀️ Vista de día' },
  { value: 'night', label: '🌙 Vista de noche' },
  { value: 'stands', label: '🪑 Gradas/Tribunas' },
  { value: 'lighting', label: '💡 Iluminación' },
  { value: 'locker_room', label: '👕 Vestuarios' },
]

// Límites de validación
export const VALIDATION_LIMITS = {
  phone: {
    length: 9,
    pattern: /^\d{9}$/,
  },
  price: {
    min: 10,
    max: 500,
  },
  advancePayment: {
    min: 1,
  },
  dimensions: {
    length: { min: 1 },
    width: { min: 1 },
  },
  files: {
    image: {
      maxSize: 10 * 1024 * 1024, // 10MB
      acceptedTypes: ['image/'],
    },
    video: {
      maxSize: 20 * 1024 * 1024, // 20MB
      acceptedTypes: ['video/'],
    },
  },
}

// Reglas por defecto
export const DEFAULT_RULES = ['Respetar horarios', 'Mantener limpia la cancha']
