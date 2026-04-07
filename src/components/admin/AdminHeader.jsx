import { User, LogOut } from 'lucide-react'
import PropTypes from 'prop-types'

/**
 * Header del Panel de Administración
 * Muestra el título, información del usuario y botón de logout
 *
 * Extraído de AdminPanel.jsx para mejorar separación de responsabilidades
 */
export const AdminHeader = ({ user, onLogout }) => {
  return (
    <div className="bg-white shadow-custom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-secondary-900">
              Panel de Administración
            </h1>
            <p className="text-xs sm:text-sm text-secondary-600 mt-1">
              Bienvenido, {user?.name} (
              {user?.role === 'super_admin' ? 'Super Administrador' : 'Administrador'})
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="hidden md:flex items-center gap-2 text-xs sm:text-sm text-secondary-600">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="truncate max-w-[150px] sm:max-w-none">{user?.email}</span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200 transition-colors duration-200 w-full sm:w-auto justify-center"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

AdminHeader.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
}
