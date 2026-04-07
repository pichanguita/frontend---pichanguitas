import { useState } from 'react'
import Swal from 'sweetalert2'
import { validateLogin, validateRegister } from '../utils/client-login/validators'

export const useClientLogin = (authStore, defaultMode = 'login') => {
  const { login, registerCustomer } = authStore

  const [isLoginMode, setIsLoginMode] = useState(defaultMode === 'login')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Estado para login
  const [loginData, setLoginData] = useState({
    phone: '',
    password: '',
  })

  // Estado para registro (contraseña se asigna automáticamente desde el DNI)
  const [registerData, setRegisterData] = useState({
    name: '',
    lastName: '',
    dni: '',
    phone: '',
    email: '',
  })

  const [errors, setErrors] = useState({})

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const newErrors = validateLogin(loginData)

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      await login({
        username: loginData.phone,
        password: loginData.password,
      })

      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión correctamente',
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Credenciales incorrectas',
        confirmButtonColor: '#22c55e',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    const newErrors = validateRegister(registerData)

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      // La contraseña es SIEMPRE el DNI del cliente
      await registerCustomer({
        name: registerData.name,
        lastName: registerData.lastName,
        dni: registerData.dni,
        phone: registerData.phone,
        email: registerData.email || null,
        password: registerData.dni, // DNI como contraseña
      })

      Swal.fire({
        icon: 'success',
        title: '¡Cuenta creada!',
        html: `Tu cuenta ha sido creada exitosamente.<br><br><strong>Tu contraseña es tu DNI:</strong> ${registerData.dni}`,
        confirmButtonColor: '#22c55e',
      }).then(() => {
        setIsLoginMode(true)
        setLoginData({
          phone: registerData.phone,
          password: registerData.dni, // Pre-llenar con DNI
        })
        setRegisterData({
          name: '',
          lastName: '',
          dni: '',
          phone: '',
          email: '',
        })
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo crear la cuenta',
        confirmButtonColor: '#22c55e',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = (phone, password) => {
    setLoginData({ phone, password })
    setTimeout(() => handleLoginSubmit({ preventDefault: () => {} }), 300)
  }

  return {
    // State
    isLoginMode,
    setIsLoginMode,
    showPassword,
    setShowPassword,
    isLoading,
    loginData,
    setLoginData,
    registerData,
    setRegisterData,
    errors,

    // Handlers
    handleLoginSubmit,
    handleRegisterSubmit,
    handleQuickLogin,
  }
}
