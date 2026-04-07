/**
 * Constantes de Tabs del Panel de Administración
 *
 * Todos los tabs disponibles en AdminPanel.jsx
 */

export const ADMIN_TABS = {
  // Tab general (deshabilitado actualmente)
  OVERVIEW: 'overview',

  // Tabs comunes
  RESERVATIONS: 'reservations',
  PAYMENTS: 'payments',
  REFUNDS: 'refunds',
  FIELDS: 'fields',
  ALERTS: 'alerts',

  // Tabs de gamificación y social
  GAMIFICATION: 'gamification',
  REVIEWS: 'reviews',

  // Tabs de gestión
  PENDING_RESERVATIONS: 'pending-reservations',
  PENDING_FIELDS: 'pending-fields',

  // Tabs específicos de admin
  CLIENTS: 'clients',
  PROMOTIONS: 'promotions',
  WHATSAPP: 'whatsapp',
  RESUMEN: 'resumen',
  FIELD_PAYMENT_METHODS: 'field-payment-methods',
  MY_MONTHLY_PAYMENTS: 'my-monthly-payments',

  // Tabs de super admin
  USERS: 'users',
  REGISTERED_CLIENTS: 'registered-clients',
  DASHBOARD: 'dashboard',
  SPORTS: 'sports',
  SITE_CONFIG: 'site-config',
  PAYMENT_CONFIG: 'payment-config',
  PAYMENT_CONTROL: 'payment-control',
  REGISTRATIONS: 'registrations',

  // Tab de perfil (todos los usuarios)
  MY_PROFILE: 'my-profile',
}

// Labels para mostrar en la UI
export const ADMIN_TAB_LABELS = {
  [ADMIN_TABS.OVERVIEW]: 'Resumen General',
  [ADMIN_TABS.RESERVATIONS]: 'Reservas',
  [ADMIN_TABS.PAYMENTS]: 'Pagos',
  [ADMIN_TABS.REFUNDS]: 'Reembolsos',
  [ADMIN_TABS.FIELDS]: 'Canchas',
  [ADMIN_TABS.ALERTS]: 'Alertas',
  [ADMIN_TABS.GAMIFICATION]: 'Gamificación',
  [ADMIN_TABS.REVIEWS]: 'Reseñas',
  [ADMIN_TABS.PENDING_RESERVATIONS]: 'Reservas Pendientes',
  [ADMIN_TABS.PENDING_FIELDS]: 'Canchas Pendientes',
  [ADMIN_TABS.CLIENTS]: 'Mis Clientes',
  [ADMIN_TABS.PROMOTIONS]: 'Promociones',
  [ADMIN_TABS.WHATSAPP]: 'WhatsApp',
  [ADMIN_TABS.RESUMEN]: 'Resumen',
  [ADMIN_TABS.FIELD_PAYMENT_METHODS]: 'Métodos de Pago',
  [ADMIN_TABS.MY_MONTHLY_PAYMENTS]: 'Mi Mensualidad',
  [ADMIN_TABS.USERS]: 'Usuarios',
  [ADMIN_TABS.REGISTERED_CLIENTS]: 'Clientes Registrados',
  [ADMIN_TABS.DASHBOARD]: 'Dashboard',
  [ADMIN_TABS.SPORTS]: 'Deportes',
  [ADMIN_TABS.SITE_CONFIG]: 'Configuración del Sitio',
  [ADMIN_TABS.PAYMENT_CONFIG]: 'Configuración de Pagos',
  [ADMIN_TABS.PAYMENT_CONTROL]: 'Control de Pagos',
  [ADMIN_TABS.REGISTRATIONS]: 'Solicitudes de Registro',
  [ADMIN_TABS.MY_PROFILE]: 'Mi Perfil',
}

// Array de todos los tabs válidos
export const VALID_ADMIN_TABS = Object.values(ADMIN_TABS)
