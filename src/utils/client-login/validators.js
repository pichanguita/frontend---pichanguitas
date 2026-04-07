/**
 * Validaciones para el formulario de login y registro de clientes
 */

export const validateLogin = (loginData) => {
  const errors = {}

  if (!loginData.phone.trim()) {
    errors.phone = 'El teléfono es obligatorio'
  }
  if (!loginData.password) {
    errors.password = 'La contraseña es obligatoria'
  }

  return errors
}

export const validateRegister = (registerData) => {
  const errors = {}

  if (!registerData.name.trim() || registerData.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres'
  }

  if (!registerData.lastName.trim() || registerData.lastName.trim().length < 2) {
    errors.lastName = 'El apellido debe tener al menos 2 caracteres'
  }

  if (!registerData.dni.trim()) {
    errors.dni = 'El DNI es obligatorio'
  } else if (!/^\d{8}$/.test(registerData.dni)) {
    errors.dni = 'El DNI debe tener 8 dígitos'
  }

  if (!registerData.phone.trim()) {
    errors.phone = 'El teléfono es obligatorio'
  } else if (!/^9\d{8}$/.test(registerData.phone)) {
    errors.phone = 'El teléfono debe tener 9 dígitos y comenzar con 9'
  }

  if (!registerData.email || !registerData.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
    errors.email = 'El correo electrónico no es válido'
  }

  // La contraseña se asigna automáticamente desde el DNI (no requiere validación de usuario)

  return errors
}
