/**
 * FIELD CONFIG SERVICE
 *
 * Servicio centralizado para la configuración completa de canchas.
 * Maneja la sincronización entre el frontend y todas las tablas relacionadas:
 * - fields (tabla principal)
 * - field_schedules
 * - field_amenities
 * - field_rules
 * - field_maintenance_schedules
 * - field_special_pricing
 * - field_equipment
 *
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== DATA TRANSFORMERS ====================

/**
 * Transforma los datos de configuración del frontend al formato del backend
 * @param {string} fieldId - ID de la cancha
 * @param {Object} config - Configuración desde useFieldConfig
 * @returns {Object} Datos transformados para el backend
 */
export const transformConfigToBackend = (fieldId, config) => {
  return {
    // Información general de la cancha.
    // field_type, capacity, is_active y las comodidades (amenities) se gestionan
    // EXCLUSIVAMENTE desde "Editar Cancha" (fuente única). Esta config solo
    // administra la confirmación manual. El modelo usa COALESCE en estas columnas
    // y omite las amenidades cuando no llega el array, por lo que NO enviarlas
    // preserva sus valores en la BD y evita pisar lo configurado en "Editar".
    field: {
      requires_manual_confirmation: config.requiresManualConfirmation ?? false,
    },

    // Horarios de la cancha
    schedules: transformSchedulesToBackend(config.schedule || []),

    // Reglas y políticas
    rules: transformRulesToBackend(config.rules || []),

    // Cronograma de mantenimiento
    maintenanceSchedules: transformMaintenanceToBackend(config.maintenanceSchedule || []),

    // Precios especiales
    specialPricing: transformSpecialPricingToBackend(config.specialPricing || []),

    // Equipamiento
    equipment: transformEquipmentToBackend(fieldId, config.equipment || {}),

    // Política de cancelación
    cancellationPolicy: transformCancellationPolicyToBackend(config.cancellationPolicy || {}),
  }
}

/**
 * Transforma política de cancelación del frontend al backend
 * @param {Object} cancellationPolicy - Objeto de política de cancelación
 * @returns {Object} Política de cancelación en formato backend
 */
const transformCancellationPolicyToBackend = (cancellationPolicy) => {
  if (!cancellationPolicy || typeof cancellationPolicy !== 'object') {
    return {
      allowCancellation: true,
      hoursBeforeEvent: 24,
      refundPercentage: 0,
    }
  }

  return {
    allowCancellation: cancellationPolicy.allowCancellation ?? true,
    hoursBeforeEvent: parseInt(cancellationPolicy.hoursBeforeEvent) || 24,
    refundPercentage: parseFloat(cancellationPolicy.refundPercentage) || 0,
  }
}

/**
 * Transforma horarios del frontend al backend
 * @param {Object|Array} schedules - Objeto de horarios por día o array de horarios
 * @returns {Array} Horarios en formato backend
 */
const transformSchedulesToBackend = (schedules) => {
  // Si schedules es un objeto (formato frontend desde useFieldConfig)
  // Estructura: { monday: { isOpen: true, openTime: '17:00', closeTime: '23:00' }, ... }
  if (schedules && typeof schedules === 'object' && !Array.isArray(schedules)) {
    const daysMap = {
      monday: 'monday',
      tuesday: 'tuesday',
      wednesday: 'wednesday',
      thursday: 'thursday',
      friday: 'friday',
      saturday: 'saturday',
      sunday: 'sunday',
    }

    const schedulesArray = []

    Object.entries(schedules).forEach(([dayKey, dayData]) => {
      const mappedDay = daysMap[dayKey]
      if (mappedDay && dayData) {
        schedulesArray.push({
          day_of_week: mappedDay,
          is_open: dayData.isOpen ?? true,
          start_time: dayData.isOpen ? dayData.openTime : null,
          end_time: dayData.isOpen ? dayData.closeTime : null,
        })
      }
    })

    return schedulesArray
  }

  // Si schedules no es un array válido, retornar array vacío
  if (!Array.isArray(schedules)) return []

  // Si ya es un array, transformar cada elemento
  return schedules.map((schedule) => ({
    day_of_week: schedule.dayOfWeek || schedule.day,
    start_time: schedule.startTime || schedule.start,
    end_time: schedule.endTime || schedule.end,
    is_available: schedule.isAvailable ?? true,
  }))
}

/**
 * Transforma reglas del frontend al backend.
 * La tabla field_rules solo persiste el texto de la regla (columna `rule`),
 * por lo que únicamente se envía rule_text.
 * @param {Array} rules - Array de reglas (strings u objetos)
 * @returns {Array} Reglas en formato backend
 */
const transformRulesToBackend = (rules) => {
  if (!Array.isArray(rules)) return []

  return rules.map((rule) => ({
    rule_text:
      typeof rule === 'string'
        ? rule
        : rule.text || rule.ruleText || rule.rule_text || rule.content,
  }))
}

/**
 * Transforma cronogramas de mantenimiento del frontend al backend
 * @param {Array} maintenanceSchedules - Array de mantenimientos
 * @returns {Array} Mantenimientos en formato backend
 */
const transformMaintenanceToBackend = (maintenanceSchedules) => {
  if (!Array.isArray(maintenanceSchedules)) return []

  // El default debe coincidir con el primer <option> del select de tipo en
  // MaintenanceTab ('scheduled'). Antes era 'general', valor que no existe en
  // las opciones, lo que causaba que el select cayera al primer item al recargar.
  return (
    maintenanceSchedules
      .map((maintenance) => ({
        start_date: maintenance.startDate || maintenance.start_date || null,
        end_date: maintenance.endDate || maintenance.end_date || null,
        reason: maintenance.reason || maintenance.description || '',
        maintenance_type:
          maintenance.type ||
          maintenance.maintenanceType ||
          maintenance.maintenance_type ||
          'scheduled',
      }))
      // Descartar filas incompletas: la BD exige start_date y end_date NOT NULL.
      // Una fila sin ambas fechas (agregada por error y dejada vacía) no debe
      // viajar al backend, donde rompería la transacción de toda la config.
      // Las filas a medias ya las bloquea validateFieldConfig antes de llegar aquí.
      .filter((maintenance) => maintenance.start_date && maintenance.end_date)
  )
}

/**
 * Transforma precios especiales del frontend al backend
 * @param {Array} specialPricing - Array de precios especiales
 * @returns {Array} Precios especiales en formato backend
 *
 * Frontend envia: { name, discountType, discountValue, daysOfWeek, timeSlots }
 * Backend espera: { name, discountType, discountValue, timeSlots, daysOfWeek }
 * (El backend ahora usa tablas normalizadas en lugar de JSON)
 */
const transformSpecialPricingToBackend = (specialPricing) => {
  if (!Array.isArray(specialPricing)) return []

  return specialPricing.map((pricing) => {
    // El valor del descuento puede venir como discountValue (nuevo) o price (legacy)
    const priceValue =
      pricing.discountValue ?? pricing.price ?? pricing.specialPrice ?? pricing.special_price ?? 0

    return {
      // Campos para el nuevo formato normalizado
      name: pricing.name || 'Precio especial',
      discountType: pricing.discountType || 'percentage',
      discountValue: parseFloat(priceValue) || 0,
      timeSlots: pricing.timeSlots || [],
      daysOfWeek: pricing.daysOfWeek || [],
      // description es opcional, solo si el usuario quiere agregar una nota
      description: pricing.description || null,
    }
  })
}

/**
 * Transforma equipamiento del frontend al backend
 * @param {string} fieldId - ID de la cancha
 * @param {Object} equipment - Objeto de equipamiento
 * @returns {Array} Array de equipamiento en formato backend
 */
const transformEquipmentToBackend = (fieldId, equipment) => {
  if (!equipment || typeof equipment !== 'object') return []

  const equipmentArray = []

  // Convertir objeto de equipamiento a array
  Object.entries(equipment).forEach(([key, value]) => {
    if (value && typeof value === 'object') {
      equipmentArray.push({
        equipment_type: value.type || key,
        quantity: value.quantity || 0,
        condition: value.condition || 'good',
        description: value.description || '',
      })
    } else if (value === true) {
      // Si es solo un booleano, crear entrada básica
      equipmentArray.push({
        equipment_type: key,
        quantity: 1,
        condition: 'good',
        description: '',
      })
    }
  })

  return equipmentArray
}

/**
 * Transforma datos del backend al formato del frontend
 * @param {Object} backendData - Datos desde el backend
 * @returns {Object} Configuración en formato frontend
 */
export const transformConfigToFrontend = (backendData) => {
  return {
    // Información general
    fieldType: backendData.field?.field_type || backendData.fieldType,
    capacity: backendData.field?.capacity || backendData.capacity,
    isActive: backendData.field?.is_active ?? backendData.isActive ?? true,
    requiresManualConfirmation:
      backendData.field?.requires_manual_confirmation ??
      backendData.requiresManualConfirmation ??
      false,
    // Status de la cancha (importante para actualización en tiempo real del badge)
    status: backendData.field?.status || backendData.status,

    // Horarios
    schedule: transformSchedulesToFrontend(backendData.schedules || []),

    // Amenidades
    amenities: transformAmenitiesToFrontend(backendData.amenities || []),

    // Reglas
    rules: transformRulesToFrontend(backendData.rules || []),

    // Mantenimiento
    maintenanceSchedule: transformMaintenanceToFrontend(backendData.maintenanceSchedules || []),

    // Precios especiales
    specialPricing: transformSpecialPricingToFrontend(backendData.specialPricing || []),

    // Equipamiento
    equipment: transformEquipmentToFrontend(backendData.equipment || []),

    // Política de cancelación
    cancellationPolicy: transformCancellationPolicyToFrontend(backendData.cancellationPolicy),
  }
}

/**
 * Transforma política de cancelación del backend al frontend
 * @param {Object} cancellationPolicy - Política de cancelación desde backend
 * @returns {Object} Política de cancelación en formato frontend
 */
const transformCancellationPolicyToFrontend = (cancellationPolicy) => {
  // Si no hay política, retornar valores por defecto
  if (!cancellationPolicy || typeof cancellationPolicy !== 'object') {
    return {
      allowCancellation: true,
      hoursBeforeEvent: 24,
      refundPercentage: 0,
    }
  }

  return {
    allowCancellation: cancellationPolicy.allowCancellation ?? true,
    hoursBeforeEvent: parseInt(cancellationPolicy.hoursBeforeEvent) || 24,
    refundPercentage: parseFloat(cancellationPolicy.refundPercentage) || 0,
  }
}

/**
 * Transforma horarios del backend al frontend
 * Convierte array de horarios a objeto indexado por día
 */
const transformSchedulesToFrontend = (schedules) => {
  if (!Array.isArray(schedules)) return {}

  // Inicializar objeto de horarios con valores por defecto
  const scheduleObject = {
    monday: { isOpen: false, openTime: '17:00', closeTime: '23:00' },
    tuesday: { isOpen: false, openTime: '17:00', closeTime: '23:00' },
    wednesday: { isOpen: false, openTime: '17:00', closeTime: '23:00' },
    thursday: { isOpen: false, openTime: '17:00', closeTime: '23:00' },
    friday: { isOpen: false, openTime: '17:00', closeTime: '00:00' },
    saturday: { isOpen: false, openTime: '08:00', closeTime: '00:00' },
    sunday: { isOpen: false, openTime: '08:00', closeTime: '23:00' },
  }

  // Poblar con datos del backend
  schedules.forEach((schedule) => {
    const dayKey = schedule.day_of_week
    if (dayKey && Object.hasOwn(scheduleObject, dayKey)) {
      scheduleObject[dayKey] = {
        isOpen: schedule.is_open ?? true,
        openTime: schedule.open_time || '17:00',
        closeTime: schedule.close_time || '23:00',
      }
    }
  })

  return scheduleObject
}

/**
 * Pasa-through del catálogo: el backend ya devuelve {key,label,icon_name,color_class}.
 * Se conserva la función para mantener el contrato de transformación.
 */
const transformAmenitiesToFrontend = (amenities) => {
  if (!Array.isArray(amenities)) return []
  return amenities
}

/**
 * Transforma reglas del backend al frontend.
 * Solo existe el texto de la regla; no hay categoría ni prioridad en la tabla.
 */
const transformRulesToFrontend = (rules) => {
  if (!Array.isArray(rules)) return []

  return rules.map((rule) => ({
    id: rule.id,
    text: rule.rule_text,
  }))
}

/**
 * Transforma mantenimiento del backend al frontend
 */
const transformMaintenanceToFrontend = (maintenanceSchedules) => {
  if (!Array.isArray(maintenanceSchedules)) return []

  return maintenanceSchedules.map((maintenance) => {
    // Convertir fechas ISO a formato YYYY-MM-DD para inputs tipo date
    const formatDateForInput = (dateString) => {
      if (!dateString) return ''
      // Si ya está en formato YYYY-MM-DD, devolverlo tal cual
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString
      // Si es formato ISO, extraer solo la parte de fecha
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return '' // Fecha inválida
      return date.toISOString().split('T')[0]
    }

    return {
      id: maintenance.id,
      startDate: formatDateForInput(maintenance.start_date),
      endDate: formatDateForInput(maintenance.end_date),
      reason: maintenance.reason || maintenance.description || '',
      // Default 'scheduled' coincide con la primera opción del select de tipo;
      // un default 'general' no existía entre las opciones y provocaba que el
      // navegador cayera al primer <option> ("Programado") tras recargar.
      type: maintenance.maintenance_type || 'scheduled',
    }
  })
}

/**
 * Transforma precios especiales del backend al frontend
 *
 * Backend devuelve desde getFieldConfig (con tablas normalizadas):
 *   { id, name, discountValue, discountType, timeSlots, daysOfWeek }
 * Frontend espera:
 *   { id, name, discountType, discountValue, timeSlots, daysOfWeek }
 */
const transformSpecialPricingToFrontend = (specialPricing) => {
  if (!Array.isArray(specialPricing)) return []

  return specialPricing.map((pricing) => {
    // El backend ahora envía discountType directamente desde la columna normalizada
    const discountType = pricing.discountType || 'percentage'

    // El valor viene como discountValue desde el backend normalizado
    const discountValue = pricing.discountValue ?? pricing.price ?? 0

    return {
      id: pricing.id,
      name: pricing.name || '',
      discountType: discountType,
      discountValue: parseFloat(discountValue) || 0,
      // timeSlots y daysOfWeek vienen como arrays desde las tablas normalizadas
      timeSlots: pricing.timeSlots || [],
      daysOfWeek: pricing.daysOfWeek || [],
      // description opcional
      description: pricing.description || '',
    }
  })
}

/**
 * Transforma equipamiento del backend al frontend
 */
const transformEquipmentToFrontend = (equipment) => {
  if (!Array.isArray(equipment)) return {}

  const equipmentObj = {}

  equipment.forEach((item) => {
    const key = item.equipment_type
    equipmentObj[key] = {
      id: item.id,
      type: item.equipment_type,
      quantity: item.quantity || 0,
      condition: item.condition || 'good',
      description: item.description || '',
    }
  })

  return equipmentObj
}

// ==================== API CALLS ====================

/**
 * Obtener configuración completa de una cancha desde el backend
 * @param {string} fieldId - ID de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Configuración completa
 */
export const fetchFieldConfig = async (fieldId, token) => {
  try {
    const response = await fetch(API_CONFIG.FIELDS.GET_CONFIG(fieldId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener configuración')
    }

    // Transformar datos del backend al frontend
    return transformConfigToFrontend(data.data)
  } catch (error) {
    console.error('❌ Error al obtener configuración:', error)
    throw new Error(error.message || 'Error al obtener configuración')
  }
}

/**
 * Actualizar configuración completa de una cancha en el backend
 * @param {string} fieldId - ID de la cancha
 * @param {Object} config - Configuración completa desde useFieldConfig
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Configuración actualizada
 */
export const updateFieldConfig = async (fieldId, config, token) => {
  try {
    // Transformar datos del frontend al backend
    const backendData = transformConfigToBackend(fieldId, config)

    const response = await fetch(API_CONFIG.FIELDS.UPDATE_CONFIG(fieldId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(backendData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar configuración')
    }

    console.log('✅ Configuración actualizada')

    // Retornar datos transformados
    return transformConfigToFrontend(data.data)
  } catch (error) {
    console.error('❌ Error al actualizar configuración:', error)
    throw new Error(error.message || 'Error al actualizar configuración')
  }
}

/**
 * Validar configuración antes de guardar
 * @param {Object} config - Configuración a validar
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateFieldConfig = (config) => {
  const errors = []

  // Validar horarios
  if (config.schedule && Array.isArray(config.schedule)) {
    config.schedule.forEach((schedule, index) => {
      if (!schedule.dayOfWeek && !schedule.day) {
        errors.push(`Horario ${index + 1}: Día de la semana es requerido`)
      }
      if (!schedule.startTime && !schedule.start) {
        errors.push(`Horario ${index + 1}: Hora de inicio es requerida`)
      }
      if (!schedule.endTime && !schedule.end) {
        errors.push(`Horario ${index + 1}: Hora de fin es requerida`)
      }
    })
  }

  // Validar precios especiales
  if (config.specialPricing && Array.isArray(config.specialPricing)) {
    config.specialPricing.forEach((pricing, index) => {
      // Buscar el valor del descuento en todos los campos posibles
      const discountValue =
        pricing.discountValue ?? pricing.price ?? pricing.specialPrice ?? pricing.special_price
      // El valor puede ser 0 (descuento de 0%), solo validamos que no sea negativo
      if (
        discountValue === undefined ||
        discountValue === null ||
        isNaN(discountValue) ||
        discountValue < 0
      ) {
        errors.push(`Precio especial ${index + 1}: Valor de descuento invalido`)
      }
      // Validar nombre
      if (!pricing.name || pricing.name.trim() === '') {
        errors.push(`Precio especial ${index + 1}: Nombre es requerido`)
      }
    })
  }

  // Validar mantenimiento
  if (config.maintenanceSchedule && Array.isArray(config.maintenanceSchedule)) {
    config.maintenanceSchedule.forEach((maintenance, index) => {
      const startDate = maintenance.startDate || maintenance.start_date
      const endDate = maintenance.endDate || maintenance.end_date

      if (!startDate) {
        errors.push(`Mantenimiento ${index + 1}: Fecha de inicio es requerida`)
      }
      if (!endDate) {
        errors.push(`Mantenimiento ${index + 1}: Fecha de fin es requerida`)
      }
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        errors.push(`Mantenimiento ${index + 1}: Fecha de inicio debe ser anterior a fecha de fin`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
