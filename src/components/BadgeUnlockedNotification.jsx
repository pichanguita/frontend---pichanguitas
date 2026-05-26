import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import useGamificationStore from '../store/gamificationStore'
import confetti from 'canvas-confetti'

const BadgeUnlockedNotification = () => {
  const { unlockedBadge, showNotification, closeNotification } = useGamificationStore()

  React.useEffect(() => {
    if (showNotification && unlockedBadge) {
      // Lanzar confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [unlockedBadge.tierColor || '#ffd700', '#22c55e', '#3b82f6'],
      })
    }
  }, [showNotification, unlockedBadge])

  if (!unlockedBadge) return null

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl"
          >
            {/* Cierre */}
            <button
              onClick={closeNotification}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Fondo decorativo */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-green-50 opacity-50" />

            {/* Contenido */}
            <div className="relative z-10">
              {/* Animación de estrellas */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-2 -right-2 text-yellow-400"
              >
                <Sparkles className="w-8 h-8" />
              </motion.div>

              <motion.div
                animate={{
                  rotate: [360, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute -top-2 -left-2 text-yellow-400"
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>

              {/* Título */}
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                🎉 ¡FELICIDADES! 🎉
              </motion.h2>

              {/* Icono de la insignia */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.4,
                  type: 'spring',
                  stiffness: 200,
                }}
                className="my-6"
              >
                <div className="inline-block relative">
                  <motion.div
                    animate={{
                      boxShadow: [
                        `0 0 0 0 ${unlockedBadge.tierColor}40`,
                        `0 0 0 20px ${unlockedBadge.tierColor}00`,
                        `0 0 0 0 ${unlockedBadge.tierColor}40`,
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center"
                  >
                    <div className="relative">
                      <div className="text-7xl">{unlockedBadge.badgeIcon}</div>
                      <div
                        className="absolute -bottom-2 -right-2 text-3xl"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                      >
                        {unlockedBadge.tierIcon}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Nombre de la insignia */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{unlockedBadge.badgeName}</h3>
                <p
                  className="text-xl font-semibold mb-4"
                  style={{ color: unlockedBadge.tierColor }}
                >
                  {unlockedBadge.tierLabel}
                </p>
              </motion.div>

              {/* Mensaje */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gray-600 mb-6"
              >
                {unlockedBadge.autoAssigned
                  ? '¡Has desbloqueado una nueva insignia!'
                  : 'Te han otorgado esta insignia especial'}
              </motion.p>

              {/* Botón */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1 }}
                onClick={closeNotification}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                ¡Genial! 🎊
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default BadgeUnlockedNotification
