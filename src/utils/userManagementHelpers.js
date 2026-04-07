import * as XLSX from 'xlsx'
import { parseLocalDate } from './dateFormatters'

/**
 * Verifica si el usuario cumple exactamente 1 mes hoy
 * @param {Date|string} createdAt - Fecha de creación del usuario
 * @returns {boolean} True si cumple exactamente 1 mes hoy
 */
export const checkUserAnniversary = (createdAt) => {
  if (!createdAt) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const createdDate = new Date(createdAt)
  createdDate.setHours(0, 0, 0, 0)

  // Calcular un mes después
  const oneMonthLater = new Date(createdDate)
  oneMonthLater.setMonth(oneMonthLater.getMonth() + 1)
  oneMonthLater.setHours(0, 0, 0, 0)

  // Verificar si hoy es exactamente 1 mes después
  return today.getTime() === oneMonthLater.getTime()
}

/**
 * Calcula días desde el registro
 * @param {Date|string} createdAt - Fecha de creación del usuario
 * @returns {number} Número de días desde el registro
 */
export const getDaysSinceRegistration = (createdAt) => {
  if (!createdAt) return 0

  const today = new Date()
  const createdDate = new Date(createdAt)
  const diffTime = Math.abs(today - createdDate)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Calcula meses cumplidos desde el registro
 * @param {Date|string} createdAt - Fecha de creación del usuario
 * @returns {number} Número de meses completos desde el registro
 */
export const getMonthsCompleted = (createdAt) => {
  if (!createdAt) return 0

  const today = new Date()
  const createdDate = new Date(createdAt)

  const yearsDiff = today.getFullYear() - createdDate.getFullYear()
  const monthsDiff = today.getMonth() - createdDate.getMonth()

  return yearsDiff * 12 + monthsDiff
}

/**
 * Calcula meses y días desde el registro
 * @param {Date|string} createdAt - Fecha de creación del usuario
 * @returns {Object} Objeto con months, days y text
 */
export const getMonthsAndDays = (createdAt) => {
  if (!createdAt) return { months: 0, days: 0, text: '0 meses, 0 días' }

  const today = new Date()
  const createdDate = new Date(createdAt)

  // Calcular años y meses
  let years = today.getFullYear() - createdDate.getFullYear()
  let months = today.getMonth() - createdDate.getMonth()
  let days = today.getDate() - createdDate.getDate()

  // Ajustar si los días son negativos
  if (days < 0) {
    months--
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0)
    days += previousMonth.getDate()
  }

  // Ajustar si los meses son negativos
  if (months < 0) {
    years--
    months += 12
  }

  const totalMonths = years * 12 + months

  // Generar texto descriptivo
  let text = ''
  if (totalMonths === 0 && days === 0) {
    text = 'Hoy'
  } else if (totalMonths === 0) {
    text = `${days} ${days === 1 ? 'día' : 'días'}`
  } else if (days === 0) {
    text = `${totalMonths} ${totalMonths === 1 ? 'mes' : 'meses'}`
  } else {
    text = `${totalMonths} ${totalMonths === 1 ? 'mes' : 'meses'}, ${days} ${days === 1 ? 'día' : 'días'}`
  }

  return { months: totalMonths, days, text }
}

/**
 * Formatea una fecha para mostrar
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
  if (!date) return 'No registrada'
  return parseLocalDate(date).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Obtiene el color según la antigüedad del registro
 * @param {Date|string} createdAt - Fecha de creación
 * @returns {Object} Objeto con clases de colores
 */
export const getRegistrationColor = (createdAt) => {
  if (!createdAt) return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' }

  const now = new Date()
  const created = new Date(createdAt)
  const monthsDiff =
    (now.getFullYear() - created.getFullYear()) * 12 + (now.getMonth() - created.getMonth())

  if (monthsDiff < 1) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      badge: 'bg-green-500 text-white',
      badgeText: 'Nuevo',
    }
  } else if (monthsDiff < 3) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      badge: 'bg-yellow-500 text-white',
      badgeText: `${monthsDiff}m`,
    }
  } else if (monthsDiff < 6) {
    return {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-300',
      badge: 'bg-orange-500 text-white',
      badgeText: `${monthsDiff}m`,
    }
  } else {
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      badge: 'bg-red-500 text-white',
      badgeText: `${monthsDiff}m`,
    }
  }
}

/**
 * Exporta los registros de actividad de un usuario a Excel
 * @param {Object} user - Usuario
 * @param {Array} activities - Array de actividades del usuario
 */
export const exportToExcel = (user, activities) => {
  // Preparar datos para Excel
  const excelData = activities.map((activity) => ({
    'Fecha y Hora': formatDate(activity.timestamp),
    'Tipo de Actividad':
      activity.type === 'login'
        ? 'Acceso'
        : activity.type === 'field'
          ? 'Gestión de Cancha'
          : activity.type === 'reservation'
            ? 'Reserva'
            : activity.type === 'settings'
              ? 'Configuración'
              : 'Otro',
    Acción: activity.action,
    Detalles: activity.details || '',
  }))

  // Crear workbook y worksheet
  const ws = XLSX.utils.json_to_sheet(excelData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Registros')

  // Ajustar anchos de columna
  const colWidths = [
    { wch: 20 }, // Fecha y Hora
    { wch: 20 }, // Tipo de Actividad
    { wch: 30 }, // Acción
    { wch: 40 }, // Detalles
  ]
  ws['!cols'] = colWidths

  // Descargar archivo
  const fileName = `registros_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
}

/**
 * Obtiene las canchas administradas por un usuario
 * @param {string|number} userId - ID del usuario
 * @param {Array} fields - Array de todas las canchas
 * @returns {Array} Array de canchas administradas por el usuario
 */
export const getUserFields = (userId, fields) => {
  if (!fields || !Array.isArray(fields)) return []

  // Normalizar userId a número para comparación consistente
  const normalizedUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId

  return fields.filter((field) => {
    // Verificar tanto adminId (camelCase) como admin_id (snake_case del backend)
    const fieldAdminId = field.adminId ?? field.admin_id
    const normalizedFieldAdminId =
      typeof fieldAdminId === 'string' ? parseInt(fieldAdminId, 10) : fieldAdminId

    return normalizedFieldAdminId === normalizedUserId
  })
}

/**
 * Calcula estadísticas de usuarios
 * @param {Array} users - Array de usuarios
 * @param {Array} fields - Array de canchas
 * @returns {Object} Objeto con estadísticas
 */
export const calculateUserStats = (users, fields) => {
  return {
    total: users.length,
    allowed: users.filter((u) => u.isBlocked !== true).length,
    blocked: users.filter((u) => u.isBlocked === true).length,
    withFields: users.filter((u) => getUserFields(u.id, fields).length > 0).length,
  }
}

/**
 * Filtra usuarios según criterios de búsqueda
 * @param {Array} users - Array de usuarios
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} filterStatus - Estado del filtro de acceso (all, allowed, blocked)
 * @param {string} filterMonths - Meses del filtro
 * @returns {Array} Usuarios filtrados
 */
export const filterUsers = (users, searchTerm, filterStatus, filterMonths) => {
  return users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.includes(searchTerm) ||
      user.fieldAssignment?.fieldName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'allowed' && user.isBlocked !== true) ||
      (filterStatus === 'blocked' && user.isBlocked === true)

    // Filtro por meses cumplidos
    const monthsCompleted = getMonthsCompleted(user.createdAt)

    const matchesMonths =
      filterMonths === 'all' ||
      (filterMonths === '0' && monthsCompleted === 0) ||
      (filterMonths === '1' && monthsCompleted === 1) ||
      (filterMonths === '2' && monthsCompleted === 2) ||
      (filterMonths === '3' && monthsCompleted === 3) ||
      (filterMonths === '4' && monthsCompleted === 4) ||
      (filterMonths === '5' && monthsCompleted === 5) ||
      (filterMonths === '6' && monthsCompleted === 6) ||
      (filterMonths === '7' && monthsCompleted === 7) ||
      (filterMonths === '8' && monthsCompleted === 8) ||
      (filterMonths === '9' && monthsCompleted === 9) ||
      (filterMonths === '10' && monthsCompleted === 10) ||
      (filterMonths === '11' && monthsCompleted === 11) ||
      (filterMonths === '12+' && monthsCompleted >= 12)

    return matchesSearch && matchesStatus && matchesMonths
  })
}

/**
 * Genera una contraseña temporal simple
 * Formato: números + letras minúsculas + letras mayúsculas
 * Sin caracteres especiales
 * Ejemplo: "abc123De", "xyz456Gp"
 * @returns {string} Contraseña generada de 8 caracteres
 */
export const generateSimplePassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'

  // Generar componentes garantizados
  const getRandomChar = (str) => str[Math.floor(Math.random() * str.length)]

  // 1 mayúscula garantizada
  const upper1 = getRandomChar(uppercase)

  // 1 minúscula garantizada
  const lower1 = getRandomChar(lowercase)

  // 2 números garantizados
  const num1 = getRandomChar(numbers)
  const num2 = getRandomChar(numbers)

  // 4 caracteres adicionales aleatorios (letras minúsculas y números)
  const remaining = []
  const remainingChars = lowercase + numbers
  for (let i = 0; i < 4; i++) {
    remaining.push(getRandomChar(remainingChars))
  }

  // Combinar todos los caracteres y mezclar
  const allChars = [upper1, lower1, num1, num2, ...remaining]

  // Mezclar usando algoritmo Fisher-Yates
  for (let i = allChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[allChars[i], allChars[j]] = [allChars[j], allChars[i]]
  }

  return allChars.join('')
}
