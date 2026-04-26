import React, { useState } from 'react'
import { Menu, X, Phone, LogIn, Sun, Moon, Building } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import useThemeStore from '../store/themeStore'
import { APP_CONFIG } from '../config/app.config'

const Header = ({ onOpenBooking }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isDarkMode, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b-2 shadow-lg"
      style={{
        backgroundColor: isDarkMode ? '#1a3a3a' : '#ffffff',
        borderColor: isDarkMode ? '#22c55e' : '#e5e7eb',
      }}
    >
      <div className="px-3 mx-auto max-w-7xl sm:px-4 lg:px-8">
        <div className="flex items-center justify-between py-2.5 sm:py-4 gap-2">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <img
              src="/LOGO.png"
              alt="Pichanguitas Logo"
              className="object-contain w-10 h-10 sm:w-16 sm:h-16 flex-shrink-0"
            />
            <div className="hidden sm:block">
              <h1
                className="text-xl font-bold tracking-tight uppercase transition-colors duration-300 sm:text-2xl"
                style={{ color: isDarkMode ? '#ffffff' : '#1a3a3a' }}
              >
                PICHANGUITAS
              </h1>
              <p className="text-xs tracking-wide uppercase text-primary-400">Reserva de Cancha</p>
            </div>
            <div className="block sm:hidden min-w-0">
              <h1
                className="text-sm xs:text-base font-bold tracking-tight uppercase transition-colors duration-300 truncate"
                style={{ color: isDarkMode ? '#ffffff' : '#1a3a3a' }}
              >
                PICHANGUITAS
              </h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="items-center hidden space-x-8 lg:flex">
            <a
              href="#inicio"
              className="font-medium transition-colors duration-200 hover:text-primary-400"
              style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}
            >
              Inicio
            </a>
            <button
              onClick={onOpenBooking}
              className="font-medium transition-colors duration-200 hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}
              disabled={!onOpenBooking}
            >
              Reservar
            </button>
            <a
              href="#canchas"
              className="font-medium transition-colors duration-200 hover:text-primary-400"
              style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}
            >
              Canchas
            </a>
            <a
              href="#contacto"
              className="font-medium transition-colors duration-200 hover:text-primary-400"
              style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}
            >
              Contacto
            </a>
          </nav>

          {/* Contact Info, Theme Toggle, Admin Link & Mobile Menu Button */}
          <div className="flex items-center space-x-1.5 sm:space-x-4 flex-shrink-0">
            <div
              className="items-center hidden space-x-2 transition-colors duration-300 md:flex"
              style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">{APP_CONFIG.CONTACT_PHONE}</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 transition-all duration-300 rounded-lg hover:scale-110"
              style={{
                backgroundColor: isDarkMode ? 'rgba(255, 213, 0, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                color: isDarkMode ? '#ffd500' : '#22c55e',
              }}
              aria-label="Toggle theme"
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Login Link */}
            <Link
              to="/login"
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-bold transition-colors duration-200"
              style={{ backgroundColor: '#ffd500', color: '#0a2424' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eab308')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffd500')}
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">Iniciar sesión</span>
              <span className="md:hidden">Login</span>
            </Link>

            {/* Register Field Button */}
            <button
              onClick={() => navigate('/login', { state: { activeTab: 'register-field' } })}
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm sm:text-base font-bold transition-colors duration-200"
              style={{ backgroundColor: '#f97316', color: '#ffffff' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ea580c')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f97316')}
            >
              <Building className="w-4 h-4" />
              <span className="hidden lg:inline">Registra tu cancha</span>
              <span className="lg:hidden">Registrar</span>
            </button>

            <button
              onClick={toggleMenu}
              className="lg:hidden p-1.5 sm:p-2 rounded-md hover:text-primary-400 transition-colors duration-200"
              style={{
                backgroundColor: isMenuOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isDarkMode ? '#d1d5db' : '#475569',
              }}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.nav
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="overflow-hidden transition-colors duration-300 border-t lg:hidden"
              style={{ borderColor: isDarkMode ? '#22c55e' : '#e5e7eb' }}
            >
              <div className="py-4 space-y-4">
                <a
                  href="#inicio"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 font-medium transition-colors duration-200 hover:text-primary-400"
                  style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}
                >
                  Inicio
                </a>
                <button
                  onClick={() => {
                    if (onOpenBooking) {
                      onOpenBooking()
                      setIsMenuOpen(false)
                    }
                  }}
                  className="block w-full text-left py-2 font-medium transition-colors duration-200 hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}
                  disabled={!onOpenBooking}
                >
                  Reservar Ahora
                </button>
                <a
                  href="#canchas"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 font-medium transition-colors duration-200 hover:text-primary-400"
                  style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}
                >
                  Canchas
                </a>
                <a
                  href="#contacto"
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-2 font-medium transition-colors duration-200 hover:text-primary-400"
                  style={{ color: isDarkMode ? '#d1d5db' : '#475569' }}
                >
                  Contacto
                </a>

                {/* Theme Toggle Button Mobile */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center p-2 space-x-2 transition-all duration-300 rounded-lg hover:scale-105 w-fit"
                  style={{
                    backgroundColor: isDarkMode
                      ? 'rgba(255, 213, 0, 0.2)'
                      : 'rgba(34, 197, 94, 0.2)',
                    color: isDarkMode ? '#ffd500' : '#22c55e',
                  }}
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-5 h-5" />
                      <span className="text-sm font-medium">Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5" />
                      <span className="text-sm font-medium">Modo Oscuro</span>
                    </>
                  )}
                </button>

                {/* Login Link Mobile */}
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center px-4 py-2 space-x-2 font-bold transition-colors duration-200 rounded-lg sm:hidden w-fit"
                  style={{ backgroundColor: '#ffd500', color: '#0a2424' }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar sesión</span>
                </Link>

                {/* Register Field Button Mobile */}
                <button
                  onClick={() => {
                    navigate('/login', { state: { activeTab: 'register-field' } })
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center px-4 py-2 space-x-2 font-bold transition-colors duration-200 rounded-lg sm:hidden w-fit"
                  style={{ backgroundColor: '#f97316', color: '#ffffff' }}
                >
                  <Building className="w-4 h-4" />
                  <span>Registra tu cancha</span>
                </button>

                <div
                  className="flex items-center py-2 pt-4 mt-4 space-x-2 transition-colors duration-300 border-t md:hidden"
                  style={{
                    color: isDarkMode ? '#d1d5db' : '#475569',
                    borderColor: isDarkMode ? '#374151' : '#e5e7eb',
                  }}
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">{APP_CONFIG.CONTACT_PHONE}</span>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header
