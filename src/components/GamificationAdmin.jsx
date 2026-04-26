import React, { useState, useEffect } from 'react'
import { Trophy, Plus, Edit, Trash2, Users, TrendingUp, Award, Shield } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useGamificationStore from '../store/gamificationStore'
import useAuthStore from '../store/authStore'
import BadgeEditor from './BadgeEditor'
import Swal from 'sweetalert2'
import { API_CONFIG } from '../config/api.config'

const GamificationAdmin = () => {
  const [showEditor, setShowEditor] = useState(false)
  const [editingBadge, setEditingBadge] = useState(null)
  const [activeTab, setActiveTab] = useState('badges') // 'badges', 'config', 'leaderboard'
  const [topUsers, setTopUsers] = useState([])
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false)

  const { badges, isActive, deleteBadge, updateConfig, loadCriteria, loadBadges, loadConfig } =
    useGamificationStore()

  const { token } = useAuthStore()

  // Cargar criterios, badges y configuración al montar el componente
  useEffect(() => {
    loadCriteria()
    loadBadges()
    loadConfig()
  }, [loadCriteria, loadBadges, loadConfig])

  // Cargar leaderboard cuando se activa el tab
  useEffect(() => {
    if (activeTab === 'leaderboard' && topUsers.length === 0) {
      loadLeaderboard()
    }
  }, [activeTab, topUsers.length])

  const loadLeaderboard = async () => {
    setIsLoadingLeaderboard(true)
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/badges/leaderboard?limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        setTopUsers(data.data || [])
      }
    } catch (error) {
      console.error('Error cargando leaderboard:', error)
    } finally {
      setIsLoadingLeaderboard(false)
    }
  }

  const handleDeleteBadge = async (badgeId) => {
    const result = await Swal.fire({
      title: '¿Eliminar Insignia?',
      text: 'Esta acción no se puede deshacer. Los usuarios que ya tienen esta insignia la conservarán.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#22c55e',
    })

    if (result.isConfirmed) {
      deleteBadge(badgeId)
      Swal.fire({
        icon: 'success',
        title: 'Insignia Eliminada',
        text: 'La insignia ha sido eliminada del sistema',
        confirmButtonColor: '#22c55e',
      })
    }
  }

  const handleEditBadge = (badge) => {
    setEditingBadge(badge)
    setShowEditor(true)
  }

  const handleCreateNew = () => {
    setEditingBadge(null)
    setShowEditor(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Sistema de Gamificación
          </h2>
          <p className="text-gray-600 mt-1">Gestiona insignias, criterios y recompensas</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Sistema */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border-2 border-gray-200">
            <span className="text-sm font-medium text-gray-700">Sistema:</span>
            <button
              onClick={() => updateConfig({ isActive: !isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isActive ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-bold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
              {isActive ? 'Activo' : 'Pausado'}
            </span>
          </div>

          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Crear Insignia
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('badges')}
            className={`pb-3 px-4 font-medium transition-colors border-b-2 ${
              activeTab === 'badges'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Award className="w-5 h-5 inline mr-2" />
            Insignias ({badges.length})
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`pb-3 px-4 font-medium transition-colors border-b-2 ${
              activeTab === 'leaderboard'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Top Clientes
          </button>
        </nav>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'badges' && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{badge.icon}</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{badge.name}</h3>
                      <p className="text-xs text-gray-500">{badge.criteriaName || ''}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      badge.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {badge.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </div>

                {/* Descripción */}
                <p className="text-sm text-gray-600 mb-4">{badge.description}</p>

                {/* Tiers */}
                <div className="space-y-2 mb-4">
                  {(badge.tiers || []).map((tier) => (
                    <div
                      key={tier.tier}
                      className="flex items-center justify-between text-sm"
                      style={{ color: tier.color }}
                    >
                      <span className="flex items-center gap-1">
                        {tier.icon} {tier.label}
                      </span>
                      <span className="font-bold">
                        {tier.requiredValue} {badge.criteriaUnit || ''}
                      </span>
                    </div>
                  ))}
                  {(!badge.tiers || badge.tiers.length === 0) && (
                    <p className="text-xs text-gray-400 italic">Sin niveles definidos</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditBadge(badge)}
                    className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteBadge(badge.id)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {badges.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay insignias creadas</p>
                <button
                  onClick={handleCreateNew}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Crear Primera Insignia
                </button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl border-2 border-gray-200 p-6"
          >
            <h3 className="text-xl font-bold mb-6">Top 10 Clientes con Más Logros</h3>

            {isLoadingLeaderboard ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando ranking...</p>
              </div>
            ) : topUsers.length > 0 ? (
              <div className="space-y-4">
                {topUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0
                          ? 'bg-yellow-500 text-white'
                          : index === 1
                            ? 'bg-gray-400 text-white'
                            : index === 2
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{user.name || 'Cliente'}</p>
                      <p className="text-sm text-gray-600">{user.phone || user.email || ''}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        {user.badge_count} insignia{user.badge_count !== 1 ? 's' : ''}
                      </span>
                      <div className="flex gap-1">
                        {(user.badges || []).slice(0, 5).map((badge, i) => (
                          <div key={i} className="text-2xl" title={badge.badge_name}>
                            {badge.badge_icon}
                          </div>
                        ))}
                        {(user.badges || []).length > 5 && (
                          <span className="text-sm text-gray-500 self-center ml-1">
                            +{user.badges.length - 5}
                          </span>
                        )}
                      </div>
                    </div>

                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Ningún cliente tiene insignias aún</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <BadgeEditor
            badge={editingBadge}
            onClose={() => {
              setShowEditor(false)
              setEditingBadge(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default GamificationAdmin
