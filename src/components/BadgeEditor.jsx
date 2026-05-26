import React, { useState, useEffect } from 'react'
import { X, Save, Plus, Trash } from 'lucide-react'
import { motion } from 'framer-motion'
import useGamificationStore from '../store/gamificationStore'
import Swal from 'sweetalert2'
import EmojiPicker from 'emoji-picker-react'

const MAX_TIERS = 4
const TIER_PRESETS = [
  { tier: 'bronze', icon: '🥉', label: 'Bronce', color: '#cd7f32' },
  { tier: 'silver', icon: '🥈', label: 'Plata', color: '#c0c0c0' },
  { tier: 'gold', icon: '🥇', label: 'Oro', color: '#ffd700' },
  { tier: 'platinum', icon: '💎', label: 'Platino', color: '#e5e4e2' },
]

/**
 * Genera tiers iniciales (4 niveles) con valores escalonados.
 * Los valores son sugerencias incrementales; el admin debe ajustarlos según el criterio.
 */
const buildInitialTiers = () =>
  TIER_PRESETS.map((preset, idx) => ({
    ...preset,
    requiredValue: (idx + 1) * 5,
  }))

const BadgeEditor = ({ badge, onClose }) => {
  const { createBadge, updateBadge, criteria } = useGamificationStore()

  const defaultCriteriaId = criteria?.[0]?.id ?? null

  const findCriteria = (criteriaId) => (criteria || []).find((c) => c.id === criteriaId) || null

  const [formData, setFormData] = useState({
    name: '',
    icon: '🏆',
    description: '',
    criteriaId: defaultCriteriaId,
    isActive: true,
    tiers: buildInitialTiers(),
  })

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [errors, setErrors] = useState({})

  // Inicializar el formulario sólo cuando cambia la insignia en edición.
  useEffect(() => {
    if (badge) {
      const resolvedCriteriaId = badge.criteriaId ?? badge.criteria_id ?? defaultCriteriaId
      setFormData({
        name: badge.name || '',
        icon: badge.icon || '🏆',
        description: badge.description || '',
        criteriaId: resolvedCriteriaId,
        isActive:
          badge.isActive !== undefined
            ? badge.isActive
            : badge.is_active !== undefined
              ? badge.is_active
              : true,
        tiers:
          badge.tiers && badge.tiers.length > 0
            ? badge.tiers.map((t) => ({
                tier: t.tier,
                icon: t.icon,
                label: t.label,
                requiredValue: t.requiredValue ?? t.required_value ?? 0,
                color: t.color,
              }))
            : buildInitialTiers(),
      })
    } else if (!formData.criteriaId && defaultCriteriaId) {
      setFormData((prev) => ({ ...prev, criteriaId: defaultCriteriaId }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badge?.id, defaultCriteriaId])

  const selectedCriteria = findCriteria(formData.criteriaId)
  const criteriaUnit = selectedCriteria?.unit || ''

  const handleCriteriaChange = (newId) => {
    setFormData((prev) => ({ ...prev, criteriaId: newId }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name?.trim()) newErrors.name = 'El nombre es obligatorio'
    if (!formData.description?.trim()) newErrors.description = 'La descripción es obligatoria'
    if (!formData.criteriaId) newErrors.criteriaId = 'Selecciona un criterio de asignación'

    const tiers = formData.tiers || []
    if (tiers.length === 0) newErrors.tiers = 'Debe tener al menos un nivel'
    if (tiers.length > MAX_TIERS) newErrors.tiers = `Máximo ${MAX_TIERS} niveles permitidos`

    tiers.forEach((tier, index) => {
      if (!tier.requiredValue || tier.requiredValue <= 0) {
        newErrors[`tier_${index}`] = 'Valor requerido debe ser mayor a 0'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      Swal.fire({
        icon: 'error',
        title: 'Errores en el formulario',
        text: 'Por favor corrige los errores antes de guardar',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    try {
      if (badge) {
        await updateBadge(badge.id, formData)
        Swal.fire({
          icon: 'success',
          title: 'Insignia Actualizada',
          text: `La insignia "${formData.name}" ha sido actualizada`,
          confirmButtonColor: '#22c55e',
        })
      } else {
        await createBadge(formData)
        Swal.fire({
          icon: 'success',
          title: 'Insignia Creada',
          text: `La insignia "${formData.name}" ha sido creada exitosamente`,
          confirmButtonColor: '#22c55e',
        })
      }
      onClose()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al guardar la insignia',
        confirmButtonColor: '#22c55e',
      })
    }
  }

  const handleAddTier = () => {
    const currentTiers = formData.tiers || []
    if (currentTiers.length >= MAX_TIERS) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite alcanzado',
        text: `Solo puedes crear hasta ${MAX_TIERS} niveles por insignia (Bronce, Plata, Oro, Platino)`,
        confirmButtonColor: '#22c55e',
      })
      return
    }

    const lastValue = currentTiers[currentTiers.length - 1]?.requiredValue || 0
    const nextIndex = currentTiers.length
    const preset = TIER_PRESETS[nextIndex] || {
      tier: `tier_${nextIndex + 1}`,
      icon: '⭐',
      label: `Nivel ${nextIndex + 1}`,
      color: '#3b82f6',
    }

    setFormData({
      ...formData,
      tiers: [
        ...currentTiers,
        { ...preset, requiredValue: Math.max(lastValue + 1, lastValue * 2) },
      ],
    })
  }

  const handleRemoveTier = (index) => {
    const currentTiers = formData.tiers || []
    setFormData({
      ...formData,
      tiers: currentTiers.filter((_, i) => i !== index),
    })
  }

  const handleTierChange = (index, field, value) => {
    const newTiers = [...(formData.tiers || [])]
    newTiers[index] = { ...newTiers[index], [field]: value }
    setFormData({ ...formData, tiers: newTiers })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            {badge ? 'Editar Insignia' : 'Crear Nueva Insignia'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Insignia *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Jugador Frecuente"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icono *</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-green-500 transition-colors flex items-center justify-center text-3xl"
                >
                  {formData.icon}
                </button>
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-2 z-10">
                    <EmojiPicker
                      onEmojiClick={(emoji) => {
                        setFormData({ ...formData, icon: emoji.emoji })
                        setShowEmojiPicker(false)
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="2"
              placeholder="Describe cómo se obtiene esta insignia..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Criterio de asignación *
            </label>
            <select
              value={formData.criteriaId ?? ''}
              onChange={(e) => handleCriteriaChange(parseInt(e.target.value, 10) || null)}
              className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white ${
                errors.criteriaId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="" disabled>
                Selecciona un criterio…
              </option>
              {(criteria || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {selectedCriteria?.description ||
                'El sistema usa este criterio para decidir cuándo desbloquear la insignia automáticamente.'}
            </p>
            {errors.criteriaId && <p className="text-red-500 text-sm mt-1">{errors.criteriaId}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Niveles de la Insignia *
                </label>
                <span className="text-xs text-gray-500">
                  {criteriaUnit && (
                    <>
                      Unidad: <strong>{criteriaUnit}</strong>
                      {' • '}
                    </>
                  )}
                  <span
                    className={
                      (formData.tiers?.length || 0) >= MAX_TIERS ? 'text-amber-600 font-medium' : ''
                    }
                  >
                    {formData.tiers?.length || 0}/{MAX_TIERS} niveles
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddTier}
                disabled={(formData.tiers?.length || 0) >= MAX_TIERS}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 text-sm ${
                  (formData.tiers?.length || 0) >= MAX_TIERS
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-50 hover:bg-green-100 text-green-600'
                }`}
              >
                <Plus className="w-4 h-4" />
                Agregar Nivel
              </button>
            </div>

            <div className="space-y-3">
              {(formData.tiers || []).map((tier, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={tier.icon}
                        onChange={(e) => handleTierChange(index, 'icon', e.target.value)}
                        className="w-full px-2 py-1 text-center text-2xl border-2 border-gray-300 rounded-lg"
                        maxLength={2}
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="text"
                        value={tier.label}
                        onChange={(e) => handleTierChange(index, 'label', e.target.value)}
                        className="w-full px-3 py-1 border-2 border-gray-300 rounded-lg"
                        placeholder="Ej: Bronce"
                      />
                    </div>

                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={tier.requiredValue}
                          onChange={(e) =>
                            handleTierChange(
                              index,
                              'requiredValue',
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className={`w-20 px-3 py-1 border-2 rounded-lg ${
                            errors[`tier_${index}`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Valor"
                        />
                        {criteriaUnit && (
                          <span className="text-sm text-gray-600 whitespace-nowrap">
                            {criteriaUnit}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="color"
                        value={tier.color}
                        onChange={(e) => handleTierChange(index, 'color', e.target.value)}
                        className="w-full h-8 border-2 border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>

                    {(formData.tiers || []).length > 1 && (
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.tiers && <p className="text-red-500 text-sm mt-1">{errors.tiers}</p>}
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Insignia Activa</p>
              <p className="text-sm text-gray-600">
                Solo las insignias activas se asignan a los clientes
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isActive ? 'bg-green-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {badge ? 'Actualizar' : 'Crear'} Insignia
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default BadgeEditor
