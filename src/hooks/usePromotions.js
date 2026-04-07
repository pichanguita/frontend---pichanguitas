import { useState, useEffect, useMemo } from 'react'
import useFieldStore from '../store/modules/fieldStore'
import useCustomerStore from '../store/customerStore'
import useAuthStore from '../store/authStore'
import {
  fetchPromotions,
  createPromotionAPI,
  updatePromotionAPI,
  deletePromotionAPI,
  fetchFieldsWithActiveRules,
  checkRuleConflicts,
} from '../services/promotions'
import Swal from 'sweetalert2'

/**
 * Hook personalizado para manejar la lógica del módulo de promociones
 */
export const usePromotions = () => {
  const { fields, loadFields } = useFieldStore()
  const { user, token } = useAuthStore()
  const { loadCustomers, customers } = useCustomerStore()

  const [appliesTo, setAppliesTo] = useState('all')
  const [selectedFields, setSelectedFields] = useState([])
  const [selectedSports, setSelectedSports] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [showNewRuleModal, setShowNewRuleModal] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [clientStats, setClientStats] = useState([])
  const [promotionRules, setPromotionRules] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [fieldsWithRules, setFieldsWithRules] = useState([])
  const [ruleConflicts, setRuleConflicts] = useState({
    hasGlobalRule: false,
    globalRule: null,
    hasSpecificRules: false,
    specificRules: [],
    totalActiveRules: 0,
  })

  // Verificar si es superadmin
  const isSuperAdmin = user?.role === 'super_admin'

  // Obtener las canchas del administrador
  const userFields = useMemo(() => {
    if (!user || !fields) return []

    // Super admin y admin general ven todas las canchas
    if (user.role === 'super_admin' || (user.role === 'admin' && user.adminType === 'general')) {
      return fields
    }

    // Admin de cancha específica solo ve sus canchas asignadas
    if (user.role === 'admin' && (user.adminType === 'field' || user.adminType === 'field_owner')) {
      const managedFieldIds = user.managedFields || []
      return fields.filter(
        (field) => managedFieldIds.includes(field.id) || field.adminId === user.id
      )
    }

    return []
  }, [fields, user])

  // Cargar promociones desde el backend
  const loadPromotionRules = async () => {
    try {
      setIsLoading(true)
      const data = await fetchPromotions()
      // Transformar de snake_case a camelCase
      const transformed = data.map((rule) => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        hoursRequired: parseFloat(rule.hours_required),
        freeHours: parseFloat(rule.free_hours),
        appliesTo: rule.applies_to,
        isActive: rule.is_active,
        createdBy: rule.created_by,
        status: rule.status,
        specificFields: rule.specific_fields || [],
        specificSports: rule.specific_sports || [],
      }))
      setPromotionRules(transformed)
    } catch (error) {
      console.error('Error cargando promociones:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar canchas que ya tienen reglas activas y verificar conflictos
  const loadFieldsWithRules = async (excludeRuleId = null) => {
    try {
      const [fieldsData, conflictsData] = await Promise.all([
        fetchFieldsWithActiveRules(excludeRuleId),
        checkRuleConflicts(excludeRuleId),
      ])
      setFieldsWithRules(fieldsData)
      setRuleConflicts(conflictsData)
    } catch (error) {
      console.error('Error cargando canchas con reglas:', error)
      setFieldsWithRules([])
      setRuleConflicts({
        hasGlobalRule: false,
        globalRule: null,
        hasSpecificRules: false,
        specificRules: [],
        totalActiveRules: 0,
      })
    }
  }

  // Cargar promociones, clientes y canchas al montar
  useEffect(() => {
    loadPromotionRules()
    loadCustomers()
    loadFields() // Cargar canchas para el selector de "Canchas específicas"
  }, [])

  // Calcular horas gratis basado en reglas de promoción
  const calculateFreeHoursForCustomer = (customer) => {
    let totalEarnedHours = 0
    const totalHours = customer.accumulatedHours || 0

    promotionRules
      .filter((rule) => rule.isActive)
      .forEach((rule) => {
        const completeSets = Math.floor(totalHours / rule.hoursRequired)
        totalEarnedHours += completeSets * rule.freeHours
      })

    const usedFreeHours = customer.usedFreeHours || 0
    return {
      earnedFreeHours: totalEarnedHours,
      availableFreeHours: Math.max(0, totalEarnedHours - usedFreeHours),
    }
  }

  // Actualizar clientStats cuando cambien los clientes o las reglas
  useEffect(() => {
    if (customers && customers.length > 0) {
      const statsWithFreeHours = customers.map((customer) => ({
        ...customer,
        ...calculateFreeHoursForCustomer(customer),
      }))
      setClientStats(statsWithFreeHours.sort((a, b) => (b.totalHours || 0) - (a.totalHours || 0)))
    } else {
      setClientStats([])
    }
  }, [customers, promotionRules])

  const handleSaveRule = async (ruleData) => {
    try {
      setIsLoading(true)

      // Preparar datos para el backend (snake_case)
      const backendData = {
        name: ruleData.name,
        description: ruleData.description,
        hours_required: ruleData.hoursRequired,
        free_hours: ruleData.freeHours,
        applies_to: ruleData.appliesTo || 'all',
        is_active: ruleData.isActive !== false,
        status: 'active',
        specific_fields: ruleData.specificFields || [],
        specific_sports: ruleData.specificSports || [],
      }

      if (editingRule) {
        await updatePromotionAPI(editingRule.id, backendData, token)
        Swal.fire({
          icon: 'success',
          title: 'Regla Actualizada',
          text: 'La regla de promoción ha sido actualizada',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        await createPromotionAPI(backendData, token)
        Swal.fire({
          icon: 'success',
          title: 'Regla Creada',
          text: 'Nueva regla de promoción agregada',
          timer: 2000,
          showConfirmButton: false,
        })
      }

      // Recargar promociones
      await loadPromotionRules()
      setShowNewRuleModal(false)
      setEditingRule(null)
    } catch (error) {
      console.error('Error guardando promoción:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo guardar la promoción',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRule = async (ruleId) => {
    const result = await Swal.fire({
      title: '¿Eliminar regla?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      try {
        setIsLoading(true)
        await deletePromotionAPI(ruleId, token)
        await loadPromotionRules()
        Swal.fire({
          title: 'Eliminada',
          text: 'La regla ha sido eliminada',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error('Error eliminando promoción:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo eliminar la promoción',
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const toggleRuleStatus = async (ruleId) => {
    try {
      const rule = promotionRules.find((r) => r.id === ruleId)
      if (rule) {
        await updatePromotionAPI(ruleId, { is_active: !rule.isActive }, token)
        await loadPromotionRules()
      }
    } catch (error) {
      console.error('Error actualizando estado:', error)
    }
  }

  const handleEditRule = async (rule) => {
    setEditingRule(rule)
    setAppliesTo(rule.appliesTo || 'all')
    setSelectedFields(rule.specificFields || [])
    setSelectedSports(rule.specificSports || [])
    // Cargar canchas con reglas activas, excluyendo la regla actual
    await loadFieldsWithRules(rule.id)
    setShowNewRuleModal(true)
  }

  const handleOpenNewRuleModal = async () => {
    // Cargar canchas con reglas activas (sin excluir ninguna)
    await loadFieldsWithRules(null)
    setShowNewRuleModal(true)
  }

  const handleCloseModal = () => {
    setShowNewRuleModal(false)
    setEditingRule(null)
    setAppliesTo('all')
    setSelectedFields([])
    setSelectedSports([])
  }

  return {
    // Estado
    promotionRules,
    clientStats,
    activeTab,
    showNewRuleModal,
    editingRule,
    appliesTo,
    selectedFields,
    selectedSports,
    userFields,
    isSuperAdmin,
    isLoading,
    fieldsWithRules,
    ruleConflicts,

    // Setters
    setActiveTab,
    setShowNewRuleModal,
    setAppliesTo,
    setSelectedFields,
    setSelectedSports,

    // Acciones
    handleSaveRule,
    handleDeleteRule,
    toggleRuleStatus,
    handleEditRule,
    handleCloseModal,
    loadPromotionRules,
    handleOpenNewRuleModal,
  }
}
