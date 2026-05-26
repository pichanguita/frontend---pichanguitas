import React, { useState, useEffect, useRef } from 'react'
import {
  Calendar,
  User,
  LogOut,
  MapPin,
  Gift,
  Trophy,
  X,
  TrendingUp,
  CheckCircle,
  Star,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useBookingStore from '../store/bookingStore'
import useFieldStore from '../store/modules/fieldStore'
import useConfigStore from '../store/configStore'
import BookingFlow from './BookingFlow'
import PaymentFlow from './PaymentFlow'
import MyReservationsView from './MyReservationsView'
import MyProfileView from './MyProfileView'
import PromotionsView from './PromotionsView'
import ClientBadges from './ClientBadges'
import { fetchMyPromotions } from '../services/promotions'

const ClientPanel = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('canchas')
  const [bookingView, setBookingView] = useState('booking') // 'booking' | 'payment'
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false) // Modal de reserva
  const [promotionsBadge, setPromotionsBadge] = useState(0) // Badge de promociones

  const { isAuthenticated, user, logout, checkSession, isCustomer } = useAuthStore()

  const {
    existingReservations,
    loadReservations,
    freeHoursToUse,
    setFreeHoursToUse,
    loadMyFreeHours,
  } = useBookingStore()
  const { fields, loadFields } = useFieldStore()
  const { images } = useConfigStore()

  // Cargar reservas, campos y horas gratis al montar el componente
  useEffect(() => {
    if (isAuthenticated && user) {
      loadReservations()
      loadFields()
      loadMyFreeHours()
    }
  }, [isAuthenticated, user, loadReservations, loadFields, loadMyFreeHours])

  // Cargar promociones para el badge
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchMyPromotions()
        .then((data) => {
          // Mostrar número de promociones activas
          const activePromos = data?.promotions?.length || 0
          setPromotionsBadge(activePromos)
        })
        .catch((err) => {
          console.error('Error cargando promociones para badge:', err)
        })
    }
  }, [isAuthenticated, user])
  // Calcular estadísticas del usuario
  const getUserStats = () => {
    // Validar que existan existingReservations y fields
    if (!existingReservations || !Array.isArray(existingReservations) || !user) {
      return {
        totalReservations: 0,
        nextReservation: null,
        favoriteField: null,
      }
    }

    // Filtrar por customerId (de tabla customers) O por teléfono
    const userReservations = existingReservations.filter((r) => {
      // Comparar por customerId (ID de la tabla customers)
      const matchByCustomerId =
        user.customerId && (r.customerId === user.customerId || r.customer_id === user.customerId)
      // También comparar user.customer_id si existe
      const matchByCustomerId2 =
        user.customer_id &&
        (r.customerId === user.customer_id || r.customer_id === user.customer_id)
      // Comparar por teléfono como fallback
      const matchByPhone =
        r.customerPhone === user.phone ||
        r.phoneNumber === user.phone ||
        r.customer_phone === user.phone
      return matchByCustomerId || matchByCustomerId2 || matchByPhone
    })

    // Total de reservas
    const totalReservations = userReservations.length

    // Próxima reserva - usar fecha actual sin hora para comparación
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const upcomingReservations = userReservations
      .filter((r) => r.status === 'confirmed' || r.status === 'pending')
      .filter((r) => {
        const resDate = new Date(r.date)
        resDate.setHours(0, 0, 0, 0)
        return resDate >= now
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    const nextReservation = upcomingReservations[0] || null

    // Cancha favorita (la más reservada)
    const fieldCounts = {}
    userReservations.forEach((r) => {
      const fId = r.fieldId || r.field_id
      if (fId) {
        fieldCounts[fId] = (fieldCounts[fId] || 0) + 1
      }
    })

    const favoriteFieldEntry = Object.entries(fieldCounts).sort((a, b) => b[1] - a[1])[0]
    const favoriteFieldId = favoriteFieldEntry ? parseInt(favoriteFieldEntry[0]) : null
    const favoriteField = (favoriteFieldId && fields?.find((f) => f.id === favoriteFieldId)) || null

    return {
      totalReservations,
      nextReservation,
      favoriteField,
    }
  }

  const stats = getUserStats()

  // Validación periódica del JWT + al volver a la pestaña.
  const checkSessionRef = useRef(checkSession)
  checkSessionRef.current = checkSession
  const SESSION_CHECK_INTERVAL_MS = 60000

  useEffect(() => {
    if (!isAuthenticated) return

    if (!checkSessionRef.current()) return

    const intervalId = setInterval(() => {
      checkSessionRef.current()
    }, SESSION_CHECK_INTERVAL_MS)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSessionRef.current()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
  }

  // Redirigir a login si no está autenticado o no es cliente
  useEffect(() => {
    if (!isAuthenticated || !isCustomer()) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, isCustomer, navigate])

  if (!isAuthenticated || !isCustomer()) {
    return null // Mostrar nada mientras redirige
  }

  const tabs = [
    { id: 'canchas', label: 'Reservar', shortLabel: 'Reservar', icon: MapPin },
    { id: 'reservas', label: 'Historial', shortLabel: 'Historial', icon: Calendar },
    {
      id: 'promociones',
      label: 'Promociones',
      shortLabel: 'Promos',
      icon: Gift,
      badge: promotionsBadge,
    },
    { id: 'logros', label: 'Mis Logros', shortLabel: 'Logros', icon: Trophy },
    { id: 'perfil', label: 'Mi Perfil', shortLabel: 'Perfil', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bloque Header + Navegación (sticky, sin solapar contenido) */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 border-b border-gray-100 sm:border-b-0">
          <div className="flex flex-row justify-between items-center py-2.5 sm:py-4 gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Logo */}
              {images?.logo?.url ? (
                <img
                  src={images.logo.url}
                  alt={images.logo.alt || 'Logo'}
                  className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain rounded-lg flex-shrink-0"
                />
              ) : (
                <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-xl sm:text-3xl md:text-4xl">⚽</span>
                </div>
              )}

              {/* Título y Subtítulo */}
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                  Canchas Apurímac
                </h1>
                <p className="text-[11px] sm:text-sm text-gray-600 truncate">
                  Bienvenido, {user?.name}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              aria-label="Cerrar Sesión"
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex-shrink-0"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Navegación */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 sm:border-b sm:border-gray-200">
          <nav className="flex justify-start sm:justify-center overflow-x-auto no-scrollbar gap-1 sm:gap-4 md:gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-4 px-2.5 sm:px-3 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  {/* Badge de notificación */}
                  {tab.badge > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] px-1 sm:px-1.5 text-[10px] sm:text-xs font-bold text-white bg-red-500 rounded-full shadow-sm flex-shrink-0">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {activeTab === 'canchas' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                <div className="text-left">
                  <h2 className="text-lg sm:text-3xl font-bold mb-1 sm:mb-2 leading-tight">
                    Hola {user?.name?.split(' ')[0]}, ¿jugamos hoy?
                  </h2>
                  <p className="text-green-100 text-xs sm:text-base">
                    Reserva tu cancha favorita en segundos
                  </p>
                </div>
                <div className="flex">
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full sm:w-auto bg-white text-green-600 font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 inline-flex items-center justify-center gap-2 hover:shadow-xl hover:scale-105 text-sm sm:text-base"
                  >
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Reservar</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cards de Estadísticas */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Tus Estadisticas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Card: Total Reservas */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Total Reservas</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Card: Próxima Reserva */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-500 text-sm">Proxima Reserva</p>
                      {stats.nextReservation ? (
                        <p className="text-base font-bold text-gray-900 truncate">
                          {stats.nextReservation.fieldName}
                        </p>
                      ) : (
                        <p className="text-base font-medium text-gray-400">Sin reservas</p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Card: Cancha Favorita */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-500 text-sm">Cancha Favorita</p>
                      {stats.favoriteField ? (
                        <p className="text-base font-bold text-gray-900 truncate">
                          {stats.favoriteField.name}
                        </p>
                      ) : (
                        <p className="text-base font-medium text-gray-400">Sin favorita</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reservas' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MyReservationsView />
          </motion.div>
        )}

        {activeTab === 'promociones' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <PromotionsView
              onNavigateToFields={(options) => {
                // El botón "Usar mis horas gratis ahora" envía useFreeHours=true y
                // PromotionsView ya validó el saldo antes de pintar el botón.
                // BookingFlow se encarga de sincronizar freeHoursToUse al entrar
                // al paso de confirmación. Aquí solo abrimos el modal.
                // El resto de CTAs ("Reservar" en cards de precios especiales)
                // navega al tab Canchas.
                if (options?.useFreeHours) {
                  setIsBookingModalOpen(true)
                } else {
                  setActiveTab('canchas')
                }
              }}
            />
          </motion.div>
        )}

        {activeTab === 'logros' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ClientBadges />
          </motion.div>
        )}

        {activeTab === 'perfil' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <MyProfileView />
          </motion.div>
        )}
      </div>

      {/* Modal de Reserva */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-6xl h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto"
            >
              {/* Header del Modal */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-start gap-2 rounded-t-2xl z-10">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                    {bookingView === 'booking' ? 'Reservar Cancha' : 'Completar Pago'}
                  </h2>
                  {freeHoursToUse > 0 && bookingView === 'booking' && (
                    <p className="text-xs sm:text-sm text-amber-600 font-medium flex items-center gap-1 mt-0.5">
                      <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">
                        Usando {freeHoursToUse} hora{freeHoursToUse > 1 ? 's' : ''} gratis
                      </span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsBookingModalOpen(false)
                    setBookingView('booking')
                    setFreeHoursToUse(0)
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Contenido del Modal */}
              <div className="p-3 sm:p-6">
                {bookingView === 'booking' ? (
                  <BookingFlow
                    onPaymentStep={() => setBookingView('payment')}
                    isAuthenticated={true}
                  />
                ) : (
                  <PaymentFlow
                    onBack={() => setBookingView('booking')}
                    onComplete={() => {
                      setBookingView('booking')
                      setIsBookingModalOpen(false)
                      setFreeHoursToUse(0)
                      // Refrescar saldo de horas gratis tras consumirlas en la reserva
                      loadMyFreeHours()
                      setActiveTab('reservas')
                    }}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ClientPanel
