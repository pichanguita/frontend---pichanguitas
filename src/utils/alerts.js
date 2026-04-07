/**
 * Utilidades centralizadas para SweetAlert2
 * Elimina ~100 líneas de código duplicado en AdminPanel
 */
import Swal from 'sweetalert2'

/**
 * Muestra una alerta de éxito
 */
export const showSuccessAlert = ({
  title = 'Éxito',
  text,
  timer = 2000,
  showConfirmButton = false,
}) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    timer,
    showConfirmButton,
    showCloseButton: true,
    allowEscapeKey: true,
  })
}

/**
 * Muestra una alerta de error
 */
export const showErrorAlert = ({ title = 'Error', text, confirmButtonColor = '#22c55e' }) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor,
    showCloseButton: true,
    allowEscapeKey: true,
  })
}

/**
 * Muestra una alerta de confirmación
 */
export const showConfirmAlert = ({
  title,
  text,
  confirmButtonText = 'Sí',
  cancelButtonText = 'No',
  confirmButtonColor = '#22c55e',
  cancelButtonColor = '#ef4444',
}) => {
  return Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor,
    cancelButtonColor,
  })
}

/**
 * Muestra una alerta de advertencia
 */
export const showWarningAlert = ({ title = 'Advertencia', text, showConfirmButton = true }) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    showConfirmButton,
    showCloseButton: true,
    allowEscapeKey: true,
  })
}

/**
 * Muestra una alerta de información
 */
export const showInfoAlert = ({
  title = 'Información',
  text,
  timer = 3000,
  showConfirmButton = false,
}) => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    timer,
    showConfirmButton,
    showCloseButton: true,
    allowEscapeKey: true,
  })
}
