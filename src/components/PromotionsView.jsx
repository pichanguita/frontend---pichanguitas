import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Calendar,
  Gift,
  AlertCircle,
  ArrowRight,
  Award,
  Loader2,
  CheckCircle,
  History,
  Sparkles,
  MapPin,
  Building2,
} from 'lucide-react'
import useBookingStore from '../store/bookingStore'
import { fetchMyPromotions, redeemPromotion, fetchMyPromotionHistory } from '../services/promotions'
import { fetchMyFreeHours } from '../services/customers/customersService'
import Swal from 'sweetalert2'

const PromotionsView = ({ onNavigateToFields }) => {
  const { fields, loadMyFreeHours } = useBookingStore()
  const [promotionsData, setPromotionsData] = useState(null)
  const [freeHoursData, setFreeHoursData] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState(null)
  const [isClaiming, setIsClaiming] = useState(false)

  // Cargar promociones, horas gratis y historial del cliente
  const loadData = async () => {
    try {
      setIsLoading(true)
      const [promoData, historyData, freeHours] = await Promise.all([
        fetchMyPromotions(),
        fetchMyPromotionHistory(),
        fetchMyFreeHours(),
      ])
      setPromotionsData(promoData)
      setHistory(historyData || [])
      setFreeHoursData(freeHours)
      console.log('📊 Datos cargados:', { promoData, freeHours, historyData })
    } catch (err) {
      console.error('Error cargando promociones:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Manejar canje de promoción.
  // Bloquea la UI hasta que termine la recarga, evitando race conditions
  // (doble canje del mismo botón antes de que se reflejen los cambios).
  const handleRedeemPromotion = async () => {
    if (!selectedPromotion || isClaiming) return

    setIsClaiming(true)
    try {
      const result = await redeemPromotion(selectedPromotion.id)

      // Recargar datos locales y store global ANTES de cerrar el modal
      // y mostrar éxito. Así el progreso/canRedeem ya están actualizados
      // cuando el cliente pueda interactuar de nuevo.
      await Promise.all([loadData(), loadMyFreeHours()])

      setShowClaimModal(false)
      setSelectedPromotion(null)

      Swal.fire({
        icon: 'success',
        title: '¡Promoción canjeada!',
        text: result.message || `Has ganado ${result.hoursEarned} hora(s) gratis`,
        confirmButtonColor: '#22c55e',
      })
    } catch (err) {
      console.error('Error al canjear promoción:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'No se pudo canjear la promoción',
        confirmButtonColor: '#22c55e',
      })
    } finally {
      setIsClaiming(false)
    }
  }

  // Abrir modal para canjear
  const openRedeemModal = (promo) => {
    setSelectedPromotion(promo)
    setShowClaimModal(true)
  }

  // Obtener precios especiales de las canchas
  const getSpecialPricings = () => {
    const specialPricings = []

    fields.forEach((field) => {
      if (field.specialPricing && field.specialPricing.length > 0) {
        field.specialPricing.forEach((sp) => {
          if (sp.isActive) {
            specialPricings.push({
              ...sp,
              fieldId: field.id,
              fieldName: field.name,
              regularPrice: field.pricePerHour,
            })
          }
        })
      }
    })

    return specialPricings
  }

  const specialPricings = getSpecialPricings()

  // Formatear días
  const formatDays = (days) => {
    const dayNames = {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mié',
      thursday: 'Jue',
      friday: 'Vie',
      saturday: 'Sáb',
      sunday: 'Dom',
    }

    return days.map((d) => dayNames[d] || d).join(', ')
  }

  // Formatear horarios
  const formatTimeRanges = (timeRanges) => {
    if (!timeRanges || timeRanges.length === 0) return ''

    const first = timeRanges[0].split('-')[0]
    const last = timeRanges[timeRanges.length - 1].split('-')[1]

    return `${first} - ${last}`
  }

  // Obtener las horas disponibles (del endpoint directo o de promotionsData)
  const availableFreeHours =
    freeHoursData?.availableFreeHours || promotionsData?.customer?.availableFreeHours || 0
  const earnedFreeHours =
    freeHoursData?.earnedFreeHours || promotionsData?.customer?.earnedFreeHours || 0
  const usedFreeHours = freeHoursData?.usedFreeHours || promotionsData?.customer?.usedFreeHours || 0
  const totalHours = promotionsData?.customer?.totalHours || 0

  // Contar cuántas veces se ha canjeado cada promoción (para mostrar en historial)
  const getRedemptionCount = (promoId) =>
    history.filter((h) => h.promotion_rule_id === promoId).length

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-3">
          <Gift className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mis Recompensas</h2>
        <p className="text-gray-600">Acumula horas y gana beneficios exclusivos</p>
      </div>

      {/* SECCIÓN DESTACADA: MIS HORAS GRATIS */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Info de horas gratis */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-medium opacity-90">Tus Horas Gratis Disponibles</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{availableFreeHours}</span>
                  <span className="text-xl opacity-80">horas</span>
                </div>
              </div>
            </div>

            {/* Info de uso */}
            <div className="text-center md:text-right bg-white/10 rounded-xl p-4 flex flex-col gap-3">
              {availableFreeHours > 0 ? (
                <>
                  <div>
                    <div className="flex items-center gap-2 justify-center md:justify-end mb-1">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Listas para usar</span>
                    </div>
                    <p className="text-sm opacity-90">
                      Aplícalas en tu próxima reserva al confirmar el precio
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateToFields?.({ useFreeHours: true })}
                    className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-semibold rounded-lg px-4 py-2 hover:bg-emerald-50 transition-colors shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Usar mis horas gratis ahora</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <p className="font-medium mb-1">Aún no tienes horas gratis</p>
                  <p className="text-sm opacity-80">Canjea promociones para obtener horas gratis</p>
                </>
              )}
            </div>
          </div>

          {/* Stats pequeños */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalHours}</p>
              <p className="text-xs opacity-70">Horas jugadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{earnedFreeHours}</p>
              <p className="text-xs opacity-70">Horas ganadas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{usedFreeHours}</p>
              <p className="text-xs opacity-70">Horas usadas</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sección de Promociones para Canjear */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Promociones para Canjear</h3>
            <p className="text-sm text-gray-500">Canjea promociones y gana horas gratis</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
            <p className="text-gray-500">Error al cargar promociones</p>
          </div>
        ) : (
          <>
            {/* Promociones disponibles para canjear */}
            {promotionsData?.promotions && promotionsData.promotions.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Promociones disponibles:</h4>
                {promotionsData.promotions.map((promo, index) => (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-lg p-4 border ${promo.canRedeem ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${promo.canRedeem ? 'bg-green-500' : 'bg-gray-400'}`}
                        >
                          <Gift className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">
                            {promo.name}
                            {getRedemptionCount(promo.id) > 0 && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                Canjeada {getRedemptionCount(promo.id)}x
                              </span>
                            )}
                          </h5>
                          <p
                            className={`text-sm ${promo.canRedeem ? 'text-green-600' : 'text-gray-500'}`}
                          >
                            {promo.hoursRequired}h jugadas = {promo.freeHours}h gratis
                          </p>
                        </div>
                      </div>
                      {promo.canRedeem ? (
                        <button
                          onClick={() => openRedeemModal(promo)}
                          disabled={isClaiming}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors"
                        >
                          Canjear
                        </button>
                      ) : getRedemptionCount(promo.id) > 0 ? (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Progreso para próximo canje</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {promo.progressPercent}%
                          </p>
                          <p className="text-xs text-gray-400">Faltan {promo.hoursUntilNext}h</p>
                        </div>
                      ) : (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Progreso</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {promo.progressPercent}%
                          </p>
                          <p className="text-xs text-gray-400">Faltan {promo.hoursUntilNext}h</p>
                        </div>
                      )}
                    </div>

                    {/* Información de canchas */}
                    {promo.fields && promo.fields.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-start gap-2">
                          <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-600 mb-1">Válido en:</p>
                            <div className="flex flex-wrap gap-2">
                              {promo.fields.map((field, idx) => (
                                <div
                                  key={field.id || idx}
                                  className="bg-white border border-gray-200 rounded-md px-2 py-1"
                                >
                                  <p className="text-xs font-medium text-gray-800">{field.name}</p>
                                  {field.location && (
                                    <p className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                      <MapPin className="w-2.5 h-2.5" />
                                      {field.location}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Aplica a todas las canchas */}
                    {promo.appliesTo === 'all' && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Building2 className="w-4 h-4" />
                          <span>Válido en todas las canchas</span>
                        </div>
                      </div>
                    )}

                    {/* Barra de progreso */}
                    {!promo.canRedeem && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${promo.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Gift className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  {history.length > 0
                    ? 'Ya canjeaste todas las promociones disponibles'
                    : 'No hay promociones activas en este momento'}
                </p>
              </div>
            )}

            {/* Historial de promociones canjeadas */}
            {history.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-gray-500" />
                  <h4 className="font-medium text-gray-700">Historial de promociones canjeadas</h4>
                </div>
                <div className="space-y-3">
                  {history.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{item.promotion_name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(item.redeemed_at).toLocaleDateString('es-PE', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">+{item.hours_earned}h</p>
                        <p className="text-xs text-gray-400">ganadas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200" />

      {/* Sección de Precios Especiales */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Precios Especiales por Horario</h3>
            <p className="text-sm text-gray-500">Se aplican automáticamente al reservar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialPricings.map((sp, index) => {
            const discount = Math.round(((sp.regularPrice - sp.price) / sp.regularPrice) * 100)
            const isSaving = sp.price < sp.regularPrice

            return (
              <motion.div
                key={sp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-lg">{sp.name}</h4>
                    {isSaving && (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{sp.fieldName}</p>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">{sp.description}</p>

                {/* Details */}
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDays(sp.days)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{formatTimeRanges(sp.timeRanges)}</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    {isSaving && (
                      <span className="text-sm text-gray-400 line-through">
                        S/ {sp.regularPrice}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-gray-900">S/ {sp.price}</span>
                    <span className="text-sm text-gray-500">/hora</span>
                  </div>
                  {isSaving && (
                    <p className="text-xs text-green-600 font-medium">
                      Ahorras S/ {sp.regularPrice - sp.price} por hora
                    </p>
                  )}
                </div>

                {/* Action */}
                <button
                  onClick={onNavigateToFields}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span>Reservar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )
          })}
        </div>

        {specialPricings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Sin Promociones Activas</h4>
            <p className="text-gray-500 text-sm">
              Los administradores aún no han configurado promociones especiales.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Canjear Promoción */}
      <AnimatePresence>
        {showClaimModal && selectedPromotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              if (isClaiming) return
              setShowClaimModal(false)
              setSelectedPromotion(null)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header verde */}
              <div className="bg-[#22c55e] p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Canjear Promoción</h3>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="bg-green-50 rounded-xl p-4 mb-4 text-center">
                  <p className="font-semibold text-gray-900 mb-1">{selectedPromotion.name}</p>
                  <p className="text-sm text-gray-600 mb-3">{selectedPromotion.description}</p>
                  <p className="text-3xl font-bold text-green-600">
                    +{selectedPromotion.freeHours}h
                  </p>
                  <p className="text-green-500 font-medium">gratis</p>
                </div>

                <p className="text-sm text-gray-500 text-center mb-4">
                  Al canjear esta promoción, recibirás {selectedPromotion.freeHours} hora(s) gratis
                  para usar en tus próximas reservas.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowClaimModal(false)
                      setSelectedPromotion(null)
                    }}
                    disabled={isClaiming}
                    className="flex-1 px-4 py-3 border-2 border-green-500 text-green-600 rounded-lg font-semibold hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRedeemPromotion}
                    disabled={isClaiming}
                    className="flex-1 px-4 py-3 bg-[#22c55e] text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isClaiming ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Canjear'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PromotionsView
