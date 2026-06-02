/**
 * Helpers de filtrado de canchas para el panel de administración.
 *
 * Fuente única del criterio de "cancha aprobada": cualquier módulo donde un
 * admin opera o configura sus canchas debe listar SOLO las aprobadas. El store
 * global (useFieldStore) carga todas las canchas sin filtrar por aprobación, y
 * `status` está desacoplado de `approval_status` (una cancha rechazada conserva
 * status='available'), por lo que filtrar por estado operativo NO excluye
 * rechazadas ni pendientes: hay que filtrar explícitamente por aprobación.
 */

import { isApprovalApproved } from '../../constants/fieldStatus'

/**
 * Devuelve solo las canchas con aprobación APROBADA.
 * Soporta camelCase (approvalStatus) y snake_case (approval_status).
 * @param {Array} fields
 * @returns {Array}
 */
export const onlyApprovedFields = (fields) =>
  (Array.isArray(fields) ? fields : []).filter((f) =>
    isApprovalApproved(f.approvalStatus ?? f.approval_status)
  )
