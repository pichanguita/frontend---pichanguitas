import {
  Calendar,
  Users,
  UserCheck,
  DollarSign,
  Settings,
  BarChart3,
  MapPin,
  Clock,
  Bell,
  AlertTriangle,
  MessageCircle,
  Gift,
  UserPlus,
  Trophy,
  Award,
  Star,
  RefreshCw,
  User,
  Receipt,
} from 'lucide-react'

/**
 * Configuración de tabs del Admin Panel
 * Centraliza la configuración de navegación según roles
 *
 * Extraído de AdminPanel.jsx para mejor mantenibilidad
 */

/**
 * Genera la configuración de tabs según el rol del usuario y los contadores
 */
export const getAdminTabs = ({
  isSuperAdmin,
  isRegularAdmin,
  pendingFieldsCount,
  pendingRegistrations,
  pendingReservationsCount,
  pendingRefundsCount,
  unreadAlerts,
  actionRequiredPaymentsCount = 0,
}) => {
  const tabs = []

  // Dashboard o Resumen según el rol
  if (isSuperAdmin) {
    tabs.push(
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: BarChart3,
        permission: 'administrator.dashboard',
      },
      { id: 'sports', label: 'Deportes', icon: Trophy, permission: 'administrator.sports.manage' },
      {
        id: 'pending-fields',
        label: 'Aprobaciones',
        icon: AlertTriangle,
        permission: 'administrator.fields.approve',
        badge: pendingFieldsCount,
      },
      {
        id: 'registrations',
        label: 'Solicitudes',
        icon: UserPlus,
        permission: 'administrator.settings.manage',
        badge: pendingRegistrations,
      },
      {
        id: 'payment-config',
        label: 'Config. Mensualidad',
        icon: Settings,
        permission: 'administrator.settings.manage',
      },
      {
        id: 'payment-control',
        label: 'Mensualidades',
        icon: DollarSign,
        permission: 'administrator.payments.view',
      }
    )
  } else {
    tabs.push(
      { id: 'resumen', label: 'Resumen', icon: BarChart3, permission: 'admin.dashboard' },
      {
        id: 'my-monthly-payments',
        label: 'Mi Mensualidad',
        icon: Receipt,
        permission: 'admin.dashboard',
      }
    )
  }

  // Tabs comunes para todos los administradores
  tabs.push(
    {
      id: 'reservations',
      label: 'Reservas',
      icon: Calendar,
      permission: 'admin.reservations.view',
    },
    {
      id: 'pending-reservations',
      label: 'Pendientes',
      icon: Clock,
      permission: 'admin.reservations.manage',
      badge: pendingReservationsCount,
    },
    {
      id: 'payments',
      label: 'Pagos',
      icon: DollarSign,
      permission: 'admin.reservations.manage',
      badge: actionRequiredPaymentsCount,
    },
    {
      id: 'refunds',
      label: 'Reembolsos',
      icon: RefreshCw,
      permission: 'admin.reservations.manage',
      badge: pendingRefundsCount,
    }
  )

  // Gamificación solo para Super Admin
  if (isSuperAdmin) {
    tabs.push({
      id: 'gamification',
      label: 'Gamificación',
      icon: Award,
      permission: 'administrator.badges.manage',
    })
  }

  // Más tabs comunes
  tabs.push(
    { id: 'reviews', label: 'Reseñas', icon: Star, permission: 'admin.reviews.view' },
    { id: 'fields', label: 'Canchas', icon: MapPin, permission: 'admin.fields.view' }
  )

  // Tabs específicos de admin regular (no super admin)
  if (isRegularAdmin) {
    tabs.push(
      { id: 'clients', label: 'Mis Clientes', icon: UserPlus, permission: 'admin.customers.view' },
      {
        id: 'field-payment-methods',
        label: 'Métodos de Pago',
        icon: DollarSign,
        permission: 'admin.reservations.manage',
      },
      {
        id: 'promotions',
        label: 'Promociones',
        icon: Gift,
        permission: 'admin.reservations.manage',
      },
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        icon: MessageCircle,
        permission: 'admin.reservations.manage',
      }
    )
  }

  // Tabs finales
  tabs.push(
    {
      id: 'alerts',
      label: 'Alertas',
      icon: Bell,
      permission: 'admin.analytics.view',
      badge: unreadAlerts,
    },
    { id: 'users', label: 'Usuarios', icon: Users, permission: 'administrator.users.view' }
  )

  // Clientes Registrados - Solo Super Admin
  if (isSuperAdmin) {
    tabs.push({
      id: 'registered-clients',
      label: 'Clientes',
      icon: UserCheck,
      permission: 'administrator.users.view',
    })
  }

  // Config. Sitio solo para Super Admin (último tab)
  if (isSuperAdmin) {
    tabs.push({
      id: 'site-config',
      label: 'Config. Sitio',
      icon: Settings,
      permission: 'administrator.settings.manage',
    })
  }

  // Mi Perfil - disponible para todos los usuarios (último tab)
  tabs.push({ id: 'my-profile', label: 'Mi Perfil', icon: User })

  return tabs
}
