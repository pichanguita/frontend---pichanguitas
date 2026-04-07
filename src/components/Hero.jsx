import { useEffect } from 'react'
import { UserPlus, Building } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useConfigStore from '../store/configStore'
import useThemeStore from '../store/themeStore'

const Hero = ({ onOpenBooking }) => {
  const navigate = useNavigate()
  // Obtener configuración desde el store
  const { images, fetchImagesFromBackend } = useConfigStore()
  const { isDarkMode } = useThemeStore()

  // 🆕 Cargar imágenes del backend al montar el componente
  useEffect(() => {
    fetchImagesFromBackend()
  }, [fetchImagesFromBackend])

  // Obtener imagen de fondo Hero desde configStore
  const heroBackground = images?.heroBackground?.url || '/maquetacion/CampoFutbol.png'
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  }

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBackground}
          alt="Fondo Hero - Canchas Apurímac"
          className="w-full h-full object-cover"
          style={{ opacity: isDarkMode ? 1 : 0.85 }}
          onError={(e) => {
            // Fallback si la imagen no carga
            e.target.src = '/maquetacion/CampoFutbol.png'
          }}
        />
        {/* Overlay dinámico según tema */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            background: isDarkMode
              ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5))'
              : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.3))',
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="flex items-center justify-center min-h-[70vh]">
          {/* Content - Centrado */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            {/* Logo Pin Icon */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="flex items-center justify-center mb-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32">
                  <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                    {/* Pin exterior - verde oscuro */}
                    <path
                      d="M100 10c-35 0-60 25-60 55 0 45 60 115 60 115s60-70 60-115c0-30-25-55-60-55z"
                      fill="#1a3a3a"
                      stroke="#ffffff"
                      strokeWidth="6"
                    />
                    {/* Círculo interior blanco */}
                    <circle cx="100" cy="63" r="30" fill="#ffffff" />
                    {/* Balón de fútbol */}
                    <circle cx="100" cy="63" r="22" fill="#1a3a3a" />
                    <path d="M100 45 L108 55 L103 65 L97 65 L92 55 Z" fill="#ffffff" />
                    <path d="M92 55 L85 60 L87 68" stroke="#ffffff" strokeWidth="2" fill="none" />
                    <path
                      d="M108 55 L115 60 L113 68"
                      stroke="#ffffff"
                      strokeWidth="2"
                      fill="none"
                    />
                    <path d="M97 65 L95 75" stroke="#ffffff" strokeWidth="2" fill="none" />
                    <path d="M103 65 L105 75" stroke="#ffffff" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.div variants={itemVariants} className="mb-8">
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white leading-none mb-3 uppercase tracking-tight">
                PICHANGUITA
              </h1>
              <p className="text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-[0.3em] font-medium">
                RESERVA DE CANCHA
              </p>
            </motion.div>

            {/* Main Message */}
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              ¡Reserva tu cancha en segundos!
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl md:text-2xl text-white mb-10 max-w-3xl mx-auto"
            >
              Encuentra canchas libres en Abancay y todo Apurímac
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col justify-center items-center gap-4 sm:gap-6"
            >
              {/* Fila superior: Regístrate pelotero y Buscar canchas */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
                {/* Botón Regístrate pelotero */}
                <button
                  onClick={() => navigate('/login', { state: { activeTab: 'register-client' } })}
                  className="group text-white px-8 py-4 sm:px-10 sm:py-5 rounded-full font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center space-x-3 uppercase"
                  style={{ backgroundColor: '#3b82f6' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Regístrate pelotero</span>
                </button>

                {/* Botón Buscar canchas */}
                <button
                  onClick={onOpenBooking}
                  className="group text-white px-8 py-4 sm:px-10 sm:py-5 rounded-full font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-green-500/50 flex items-center justify-center space-x-3 uppercase"
                  style={{ backgroundColor: '#22c55e' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#16a34a')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#22c55e')}
                >
                  <span>Buscar canchas disponibles</span>
                </button>
              </div>

              {/* Fila inferior: Botón Registra tu cancha (amarillo) */}
              <button
                onClick={() => navigate('/login', { state: { activeTab: 'register-field' } })}
                className="group text-white px-8 py-4 sm:px-10 sm:py-5 rounded-full font-bold text-base sm:text-lg transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50 flex items-center justify-center space-x-3 uppercase"
                style={{ backgroundColor: '#ffd500' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eab308')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffd500')}
              >
                <Building className="w-5 h-5" />
                <span>Registra tu cancha</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
