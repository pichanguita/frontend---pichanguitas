import React, { useState, useMemo, useEffect } from 'react'
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  Filter,
  MessageSquare,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useReviewStore, useFieldStore } from '../store/modules'
import useAuthStore from '../store/authStore'
import { fetchUsers } from '../services/users/usersService'
import Swal from 'sweetalert2'

const ReviewsManagementModule = () => {
  // ✅ CORREGIDO: Usar reviewStore para reviews (después de refactorización)
  const { reviews, toggleReviewVisibility, deleteReview, loadReviews } = useReviewStore()
  // ✅ CORREGIDO: Usar fieldStore para fields
  const { fields } = useFieldStore()
  const { user, token } = useAuthStore()
  const [selectedField, setSelectedField] = useState('all')
  const [filterVisibility, setFilterVisibility] = useState('all') // 'all', 'visible', 'hidden'
  const [selectedAdmin, setSelectedAdmin] = useState('all')
  const [fieldAdmins, setFieldAdmins] = useState([])

  // Cargar reseñas desde el backend al montar el componente
  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  // Cargar admins de cancha para el filtro (solo si es superadmin).
  // No filtramos por admin_type en la query: en BD conviven valores legacy
  // 'field' y 'field_owner' para administradores de cancha; pedir uno solo
  // dejaba fuera a los del otro. Traemos todos los admins y filtramos en
  // frontend aceptando ambos valores.
  useEffect(() => {
    const loadFieldAdmins = async () => {
      if (user?.role === 'super_admin' && token) {
        try {
          const admins = await fetchUsers({ role: 'admin' }, token)
          const fieldAdminsOnly = (admins || []).filter(
            (a) => a.adminType === 'field' || a.adminType === 'field_owner'
          )
          setFieldAdmins(fieldAdminsOnly)
        } catch (error) {
          console.error('Error cargando admins:', error)
        }
      }
    }
    loadFieldAdmins()
  }, [user, token])

  // Verificar si es superadmin
  const isSuperAdmin = user?.role === 'super_admin'

  // Obtener las canchas del administrador
  const userFields = useMemo(() => {
    // Si es superadmin
    if (isSuperAdmin) {
      // Si hay un admin seleccionado, filtrar por sus canchas
      if (selectedAdmin !== 'all') {
        return fields.filter((field) => String(field.adminId) === String(selectedAdmin))
      }
      // Si no hay filtro, mostrar todas
      return fields
    }

    // Si es admin de campo, solo sus canchas
    // Aceptar tanto 'field' como 'field_owner' como tipos válidos
    if (
      user?.role === 'admin' &&
      (user?.adminType === 'field' || user?.adminType === 'field_owner')
    ) {
      return fields.filter((field) => field.adminId === user.id)
    }

    return []
  }, [fields, user, isSuperAdmin, selectedAdmin])

  // IDs de las canchas que puede administrar
  const userFieldIds = useMemo(() => {
    return userFields.map((f) => f.id)
  }, [userFields])

  // Reseñas dentro del alcance del administrador actual: SOLO las de sus canchas.
  // Las "Estadísticas Generales" se calculan sobre este subconjunto, no sobre
  // todas las reseñas del sistema. El superadmin sin admin seleccionado ve la
  // vista global; al seleccionar un admin se acota a sus canchas (userFieldIds).
  const scopedReviews = useMemo(() => {
    if (isSuperAdmin && selectedAdmin === 'all') return reviews
    return reviews.filter((review) => userFieldIds.includes(review.fieldId))
  }, [reviews, userFieldIds, isSuperAdmin, selectedAdmin])

  // Filtrar reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((review) => {
        // Filtro por canchas del administrador (si no es superadmin)
        if (!isSuperAdmin && !userFieldIds.includes(review.fieldId)) {
          return false
        }

        // Filtro por cancha seleccionada.
        // `selectedField` viene como string desde el <select>; `review.fieldId`
        // llega como number (FK integer transformado en reviewsService).
        // Sin la coerción a String la comparación siempre era distinta y el
        // filtro escondía TODAS las reseñas al elegir una cancha.
        if (selectedField !== 'all' && String(review.fieldId) !== String(selectedField)) {
          return false
        }

        // Filtro por visibilidad
        if (filterVisibility === 'visible' && !review.isVisible) {
          return false
        }
        if (filterVisibility === 'hidden' && review.isVisible) {
          return false
        }

        return true
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [reviews, selectedField, filterVisibility, isSuperAdmin, userFieldIds])

  // Estadísticas (solo de las canchas del administrador)
  const stats = useMemo(() => {
    const fieldStats = {}

    // Usar userFields en lugar de fields para filtrar por canchas del admin
    userFields.forEach((field) => {
      const fieldReviews = reviews.filter((r) => r.fieldId === field.id && r.isVisible)

      if (fieldReviews.length > 0) {
        const avgRating =
          fieldReviews.reduce((sum, r) => sum + parseFloat(r.overallRating), 0) /
          fieldReviews.length
        const avgCleanliness =
          fieldReviews.reduce((sum, r) => sum + r.cleanliness, 0) / fieldReviews.length
        const avgService = fieldReviews.reduce((sum, r) => sum + r.service, 0) / fieldReviews.length
        const avgFacilities =
          fieldReviews.reduce((sum, r) => sum + r.facilities, 0) / fieldReviews.length

        fieldStats[field.id] = {
          fieldName: field.name,
          totalReviews: fieldReviews.length,
          avgRating: avgRating.toFixed(1),
          avgCleanliness: avgCleanliness.toFixed(1),
          avgService: avgService.toFixed(1),
          avgFacilities: avgFacilities.toFixed(1),
        }
      }
    })

    return fieldStats
  }, [reviews, userFields])

  const handleToggleVisibility = (reviewId) => {
    toggleReviewVisibility(reviewId)
  }

  const handleDeleteReview = async (reviewId) => {
    const result = await Swal.fire({
      title: '¿Eliminar Reseña?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#22c55e',
    })

    if (result.isConfirmed) {
      deleteReview(reviewId)
      Swal.fire({
        icon: 'success',
        title: 'Reseña Eliminada',
        text: 'La reseña ha sido eliminada exitosamente',
        confirmButtonColor: '#22c55e',
        timer: 2000,
      })
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : i < rating
                  ? 'fill-yellow-200 text-yellow-400'
                  : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Reseñas</h2>
        <p className="text-gray-600">Administra las calificaciones y comentarios de los clientes</p>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reseñas</p>
              <p className="text-2xl font-bold text-gray-900">{scopedReviews.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Reseñas Visibles</p>
              <p className="text-2xl font-bold text-gray-900">
                {scopedReviews.filter((r) => r.isVisible).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Promedio General</p>
              <p className="text-2xl font-bold text-gray-900">
                {scopedReviews.length > 0
                  ? (
                      scopedReviews.reduce((sum, r) => sum + parseFloat(r.overallRating), 0) /
                      scopedReviews.length
                    ).toFixed(1)
                  : '0.0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas por Cancha */}
      {Object.keys(stats).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Estadísticas por Cancha
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-gray-600 font-medium">Cancha</th>
                  <th className="text-center py-3 text-gray-600 font-medium">Reseñas</th>
                  <th className="text-center py-3 text-gray-600 font-medium">Promedio</th>
                  <th className="text-center py-3 text-gray-600 font-medium">Limpieza</th>
                  <th className="text-center py-3 text-gray-600 font-medium">Atención</th>
                  <th className="text-center py-3 text-gray-600 font-medium">Servicios</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats).map(([fieldId, stat]) => (
                  <tr key={fieldId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-gray-900 font-medium">{stat.fieldName}</td>
                    <td className="py-3 text-center text-gray-700">{stat.totalReviews}</td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-semibold">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {stat.avgRating}
                      </span>
                    </td>
                    <td className="py-3 text-center text-gray-700">{stat.avgCleanliness}</td>
                    <td className="py-3 text-center text-gray-700">{stat.avgService}</td>
                    <td className="py-3 text-center text-gray-700">{stat.avgFacilities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h4 className="font-medium text-gray-900">Filtros</h4>
        </div>

        <div
          className={`grid grid-cols-1 gap-4 ${isSuperAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}
        >
          {/* Filtro por admin de cancha (solo para superadmin) */}
          {isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin de Cancha
              </label>
              <select
                value={selectedAdmin}
                onChange={(e) => {
                  setSelectedAdmin(e.target.value)
                  setSelectedField('all') // Reset cancha al cambiar admin
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Todos los admins</option>
                {fieldAdmins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name || admin.fullName || admin.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por cancha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Cancha
            </label>
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todas las canchas</option>
              {userFields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por visibilidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de Visibilidad
            </label>
            <select
              value={filterVisibility}
              onChange={(e) => setFilterVisibility(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Todas</option>
              <option value="visible">Visibles</option>
              <option value="hidden">Ocultas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Reseñas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Reseñas ({filteredReviews.length})</h3>

        {filteredReviews.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No hay reseñas</h3>
            <p className="text-gray-400">
              {selectedField !== 'all'
                ? 'Esta cancha no tiene reseñas aún'
                : 'No se han recibido reseñas todavía'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReviews.map((review, index) => {
              const field = fields.find((f) => f.id === review.fieldId)

              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl border-2 p-6 ${
                    review.isVisible ? 'border-gray-200' : 'border-red-200 bg-red-50'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-bold text-gray-900">{field?.name}</h4>
                        {!review.isVisible && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Oculta
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Por {review.customerName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('es-PE', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleVisibility(review.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          review.isVisible
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                        title={review.isVisible ? 'Ocultar' : 'Mostrar'}
                      >
                        {review.isVisible ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                      {!isSuperAdmin && (
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Calificaciones */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    {/* Calificación General */}
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <p className="text-xs text-yellow-700 font-medium mb-1">General</p>
                      <div className="flex items-center gap-2">
                        {renderStars(parseFloat(review.overallRating))}
                        <span className="text-sm font-bold text-yellow-700">
                          {review.overallRating}
                        </span>
                      </div>
                    </div>

                    {/* Limpieza */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-blue-700 font-medium mb-1">Limpieza</p>
                      <div className="flex items-center gap-2">
                        {renderStars(review.cleanliness)}
                        <span className="text-sm font-bold text-blue-700">
                          {review.cleanliness}
                        </span>
                      </div>
                    </div>

                    {/* Atención */}
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-green-700 font-medium mb-1">Atención</p>
                      <div className="flex items-center gap-2">
                        {renderStars(review.service)}
                        <span className="text-sm font-bold text-green-700">{review.service}</span>
                      </div>
                    </div>

                    {/* Servicios */}
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <p className="text-xs text-purple-700 font-medium mb-1">Servicios</p>
                      <div className="flex items-center gap-2">
                        {renderStars(review.facilities)}
                        <span className="text-sm font-bold text-purple-700">
                          {review.facilities}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Comentario */}
                  {review.comment && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                    </div>
                  )}

                  {!review.comment && (
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 text-center">Sin comentario</p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewsManagementModule
