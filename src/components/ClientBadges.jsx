import { useState, useEffect } from 'react'
import { Trophy, Lock, Award, Loader2, Star, Target, Zap, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import useGamificationStore from '../store/gamificationStore'
import useAuthStore from '../store/authStore'
import { API_CONFIG, getAuthHeaders } from '@/config/api.config'
import { BADGE_TIER_ORDER } from '@/constants'

const ClientBadges = () => {
  const { isAuthenticated } = useAuthStore()
  const { badges, loadBadges, enqueueUnlockedBadges, primeNotifiedFromExisting } =
    useGamificationStore()

  const [userBadges, setUserBadges] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [nextBadgeProgress, setNextBadgeProgress] = useState([])
  const [customerId, setCustomerId] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  // Cargar catálogo de insignias disponibles al montar
  useEffect(() => {
    if (isAuthenticated) {
      loadBadges()
    }
  }, [isAuthenticated, loadBadges])

  // Cargar customerId y badges del cliente desde el backend
  useEffect(() => {
    const loadMyData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        let resolvedCustomerId = null

        // Cargar mis badges (este endpoint también dispara la asignación
        // automática en el backend si se cumplió alguna meta).
        const badgesResponse = await fetch(API_CONFIG.BADGES.GET_MY_BADGES, {
          method: 'GET',
          headers: getAuthHeaders(),
        })
        const badgesData = await badgesResponse.json()

        if (badgesData.success) {
          const list = badgesData.data || []
          // En primera carga marcamos las existentes como ya notificadas
          // (sólo lo nuevo del response 'newly_assigned' debe mostrar popup).
          if (reloadKey === 0) {
            primeNotifiedFromExisting(list)
          }
          setUserBadges(list)
          if (list.length > 0) {
            resolvedCustomerId = list[0].customer_id
          }
          // Disparar notificación con las insignias recién desbloqueadas
          enqueueUnlockedBadges(badgesData.newly_assigned || [])
        }

        // Si no tenemos customerId de los badges, obtenerlo de my-free-hours
        if (!resolvedCustomerId) {
          const freeHoursResponse = await fetch(API_CONFIG.CUSTOMERS.GET_MY_FREE_HOURS, {
            method: 'GET',
            headers: getAuthHeaders(),
          })
          const freeHoursData = await freeHoursResponse.json()
          if (freeHoursData.success && freeHoursData.data?.customerId) {
            resolvedCustomerId = freeHoursData.data.customerId
          }
        }

        if (resolvedCustomerId) {
          setCustomerId(resolvedCustomerId)
        }
      } catch (error) {
        console.error('Error cargando mis datos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMyData()
    // reloadKey permite forzar recarga después de un desbloqueo nuevo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, reloadKey])

  // Cargar progreso de insignias (también recalcula en el backend)
  useEffect(() => {
    const loadBadgeProgress = async () => {
      if (!isAuthenticated || !customerId) return

      try {
        const response = await fetch(API_CONFIG.BADGES.GET_PROGRESS(customerId), {
          method: 'GET',
          headers: getAuthHeaders(),
        })
        const data = await response.json()

        if (data.success && data.data) {
          enqueueUnlockedBadges(data.newly_assigned || [])

          // Si el endpoint asignó nuevas insignias, recargar la lista
          // de userBadges para que aparezcan en el contador.
          if ((data.newly_assigned || []).length > 0) {
            setReloadKey((k) => k + 1)
          }

          const progressData = data.data
            .map((badge) => {
              const nextTier = badge.tiers.find((t) => !t.is_unlocked)
              if (!nextTier) return null

              return {
                badge: {
                  id: badge.badge_id,
                  name: badge.badge_name,
                  icon: badge.badge_icon,
                  description: badge.description,
                },
                nextTier: {
                  tier: nextTier.tier,
                  label: nextTier.tier_label,
                  icon: nextTier.tier_icon,
                  color: nextTier.tier_color,
                },
                currentValue: badge.current_value,
                requiredValue: nextTier.required_value,
                percentage: nextTier.percentage,
                remaining: nextTier.remaining,
              }
            })
            .filter(Boolean)
            .sort((a, b) => b.percentage - a.percentage)

          setNextBadgeProgress(progressData)
        }
      } catch (error) {
        console.error('Error cargando progreso de insignias:', error)
      }
    }

    loadBadgeProgress()
  }, [isAuthenticated, customerId, reloadKey, enqueueUnlockedBadges])

  // Mapeo de tiers a labels y colores
  const tierConfig = {
    bronze: {
      label: 'Bronce',
      color: '#CD7F32',
      bgColor: 'from-amber-600 to-amber-700',
      lightBg: 'bg-amber-50',
      icon: '🥉',
    },
    silver: {
      label: 'Plata',
      color: '#9CA3AF',
      bgColor: 'from-gray-400 to-gray-500',
      lightBg: 'bg-gray-100',
      icon: '🥈',
    },
    gold: {
      label: 'Oro',
      color: '#F59E0B',
      bgColor: 'from-yellow-400 to-yellow-500',
      lightBg: 'bg-yellow-50',
      icon: '🥇',
    },
    platinum: {
      label: 'Platino',
      color: '#E5E4E2',
      bgColor: 'from-slate-300 to-slate-400',
      lightBg: 'bg-slate-50',
      icon: '💎',
    },
  }

  // Agrupar badges del usuario por badge ID y mantener solo el tier más alto
  const userBadgesByType = {}
  userBadges.forEach((ub) => {
    const badgeId = ub.badge_id
    if (
      !userBadgesByType[badgeId] ||
      BADGE_TIER_ORDER[ub.tier] > BADGE_TIER_ORDER[userBadgesByType[badgeId].tier]
    ) {
      userBadgesByType[badgeId] = ub
    }
  })

  // Calcular estadísticas
  const stats = {
    total: Object.keys(userBadgesByType).length,
    bronze: userBadges.filter((b) => b.tier === 'bronze').length,
    silver: userBadges.filter((b) => b.tier === 'silver').length,
    gold: userBadges.filter((b) => b.tier === 'gold').length,
    platinum: userBadges.filter((b) => b.tier === 'platinum').length,
  }

  // Obtener el último badge desbloqueado
  const latestBadge =
    userBadges.length > 0
      ? [...userBadges].sort((a, b) => new Date(b.unlocked_at) - new Date(a.unlocked_at))[0]
      : null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con Gradiente */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Mis Logros</h2>
            <p className="text-green-100">
              {stats.total}{' '}
              {stats.total === 1 ? 'insignia desbloqueada' : 'insignias desbloqueadas'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/15 backdrop-blur rounded-xl p-2 sm:p-3 text-center"
          >
            <div className="text-2xl sm:text-3xl font-bold">{stats.total}</div>
            <div className="text-[10px] sm:text-xs text-green-100 font-medium">Total</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/15 backdrop-blur rounded-xl p-2 sm:p-3 text-center"
          >
            <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-0.5 sm:gap-1">
              <span className="text-sm sm:text-lg">🥉</span> {stats.bronze}
            </div>
            <div className="text-[10px] sm:text-xs text-green-100 font-medium">Bronce</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/15 backdrop-blur rounded-xl p-2 sm:p-3 text-center"
          >
            <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-0.5 sm:gap-1">
              <span className="text-sm sm:text-lg">🥈</span> {stats.silver}
            </div>
            <div className="text-[10px] sm:text-xs text-green-100 font-medium">Plata</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/15 backdrop-blur rounded-xl p-2 sm:p-3 text-center"
          >
            <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-0.5 sm:gap-1">
              <span className="text-sm sm:text-lg">🥇</span> {stats.gold}
            </div>
            <div className="text-[10px] sm:text-xs text-green-100 font-medium">Oro</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/15 backdrop-blur rounded-xl p-2 sm:p-3 text-center"
          >
            <div className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-0.5 sm:gap-1">
              <span className="text-sm sm:text-lg">💎</span> {stats.platinum}
            </div>
            <div className="text-[10px] sm:text-xs text-green-100 font-medium">Platino</div>
          </motion.div>
        </div>
      </div>

      {/* Último Logro Desbloqueado */}
      {latestBadge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-amber-800">Último Logro Desbloqueado</h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-inner">
                <span className="text-4xl">{latestBadge.badge_icon || '🏆'}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 text-2xl">
                {tierConfig[latestBadge.tier]?.icon || '🥉'}
              </div>
            </div>

            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900">{latestBadge.badge_name}</h4>
              <p
                className="text-sm font-semibold"
                style={{ color: tierConfig[latestBadge.tier]?.color }}
              >
                {tierConfig[latestBadge.tier]?.label}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(latestBadge.unlocked_at).toLocaleDateString('es-PE', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="hidden sm:block">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center"
              >
                <Star className="w-6 h-6 text-amber-600" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progreso hacia próximos logros */}
      {nextBadgeProgress.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-gray-900">Progreso hacia Próximos Logros</h3>
          </div>

          <div className="space-y-4">
            {nextBadgeProgress.slice(0, 3).map((progress, index) => (
              <motion.div
                key={`${progress.badge.id}-${progress.nextTier.tier}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                    <div className="relative opacity-40">
                      <div className="text-2xl">{progress.badge.icon}</div>
                    </div>
                  </div>
                  <Lock className="absolute -top-1 -right-1 w-4 h-4 text-gray-400" />
                </div>

                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{progress.badge.name}</p>
                    <p className="text-xs" style={{ color: progress.nextTier.color }}>
                      {progress.nextTier.label}
                    </p>
                  </div>

                  <div className="relative">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>
                        {progress.currentValue} / {progress.requiredValue}
                      </span>
                      <span>{Math.round(progress.percentage)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: progress.nextTier.color }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Mis Insignias */}
      {Object.keys(userBadgesByType).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-gray-900">Mis Insignias</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.values(userBadgesByType).map((userBadge, index) => {
              const tier = tierConfig[userBadge.tier] || tierConfig.bronze

              return (
                <motion.div
                  key={`${userBadge.badge_id}-${userBadge.tier}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className={`${tier.lightBg} rounded-xl p-4 border-2 border-transparent hover:border-green-400 transition-all cursor-pointer group shadow-sm hover:shadow-md`}
                >
                  {/* Icono */}
                  <div className="relative mb-3">
                    <div className="w-16 h-16 mx-auto rounded-xl bg-white flex items-center justify-center shadow-inner group-hover:shadow transition-shadow">
                      <div className="relative">
                        <div className="text-3xl">{userBadge.badge_icon || '🏆'}</div>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 right-1/4 text-xl">{tier.icon}</div>
                    {!userBadge.auto_assigned && (
                      <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                        Especial
                      </div>
                    )}
                  </div>

                  {/* Nombre */}
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-sm mb-0.5 line-clamp-1">
                      {userBadge.badge_name}
                    </p>
                    <p className="text-xs font-semibold" style={{ color: tier.color }}>
                      {tier.label}
                    </p>
                  </div>

                  {/* Fecha */}
                  <p className="text-[10px] text-gray-500 text-center mt-2">
                    {new Date(userBadge.unlocked_at).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {userBadges.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">¡Empieza a coleccionar logros!</h3>
          <p className="text-gray-600 mb-4 max-w-sm mx-auto">
            Juega partidos y completa reservas para desbloquear insignias y recompensas
          </p>
          <div className="flex justify-center gap-2">
            <span className="text-2xl opacity-30">🥉</span>
            <span className="text-2xl opacity-30">🥈</span>
            <span className="text-2xl opacity-30">🥇</span>
            <span className="text-2xl opacity-30">💎</span>
          </div>
        </motion.div>
      )}

      {/* Todas las insignias disponibles */}
      {badges && badges.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-gray-900">Todas las Insignias</h3>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {Object.keys(userBadgesByType).length} /{' '}
              {badges.filter((b) => b.isActive !== false).length}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {badges
              .filter((b) => b.isActive !== false)
              .map((badge, index) => {
                const hasThisBadge = userBadgesByType[badge.id]

                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`rounded-xl p-3 border transition-all ${
                      hasThisBadge
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="relative mb-2">
                      <div
                        className={`w-12 h-12 mx-auto rounded-lg bg-white flex items-center justify-center ${!hasThisBadge && 'opacity-40'}`}
                      >
                        <div className="text-2xl">{badge.icon || '🏆'}</div>
                      </div>
                      {hasThisBadge ? (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      ) : (
                        <Lock className="absolute -top-1 -right-1 w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    <p
                      className={`text-xs font-semibold text-center line-clamp-1 ${hasThisBadge ? 'text-gray-900' : 'text-gray-500'}`}
                    >
                      {badge.name}
                    </p>
                  </motion.div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientBadges
