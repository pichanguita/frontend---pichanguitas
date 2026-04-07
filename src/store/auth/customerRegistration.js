import { registerUser } from '../../services/auth/authService'

// Acciones de registro de clientes
export const createCustomerRegistration = (_set, _get) => ({
  // Registro de clientes (auto-registro) - Conectado con API
  registerCustomer: async (customerData) => {
    // Validaciones básicas del frontend
    if (!customerData.name || customerData.name.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres')
    }

    if (!customerData.lastName || customerData.lastName.trim().length < 2) {
      throw new Error('El apellido debe tener al menos 2 caracteres')
    }

    if (!customerData.dni || !/^\d{8}$/.test(customerData.dni)) {
      throw new Error('El DNI debe tener exactamente 8 dígitos')
    }

    if (!customerData.phone || !/^9\d{8}$/.test(customerData.phone)) {
      throw new Error('El teléfono debe comenzar con 9 y tener 9 dígitos')
    }

    if (!customerData.password || customerData.password.length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres')
    }

    if (
      customerData.email &&
      customerData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)
    ) {
      throw new Error('El correo electrónico no es válido')
    }

    try {
      // Llamar al servicio de registro que conecta con la API
      const response = await registerUser({
        name: customerData.name,
        lastName: customerData.lastName,
        dni: customerData.dni,
        phone: customerData.phone,
        email: customerData.email || null,
        password: customerData.password,
      })

      // Devolver la respuesta del servidor
      return response
    } catch (error) {
      console.error('❌ Error al registrar cliente:', error)
      // Re-lanzar el error para que lo maneje el componente
      throw new Error(error.message || 'No se pudo crear la cuenta')
    }
  },
})
