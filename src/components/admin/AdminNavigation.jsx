import { useRef, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Navegación por tabs del Panel de Administración
 * Muestra los tabs disponibles con badges de notificaciones
 * Incluye botones de navegación cuando hay overflow
 */
export const AdminNavigation = ({ tabs, activeTab, onTabChange }) => {
  const navRef = useRef(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const checkScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [tabs])

  const scroll = (direction) => {
    if (navRef.current) {
      const scrollAmount = 200
      navRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="bg-white border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Botón izquierdo */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-gray-50 border border-gray-200 rounded-full p-1.5 shadow-md transition-all"
            aria-label="Scroll izquierda"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Navegación */}
        <nav
          ref={navRef}
          onScroll={checkScroll}
          className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="bg-primary-600 text-white text-xs rounded-full px-1.5 sm:px-2 py-0.5 min-w-[18px] sm:min-w-[20px] text-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Botón derecho */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-gray-50 border border-gray-200 rounded-full p-1.5 shadow-md transition-all"
            aria-label="Scroll derecha"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  )
}

AdminNavigation.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.elementType.isRequired,
      badge: PropTypes.number,
      permission: PropTypes.string,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
}
