import React from 'react'
import { User, CreditCard, Phone, Mail, Info } from 'lucide-react'
import InputField from './InputField'

const RegisterForm = ({ registerData, setRegisterData, errors, isLoading, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
      <InputField
        label="Nombre"
        value={registerData.name}
        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
        placeholder="Juan"
        Icon={User}
        error={errors.name}
      />

      <InputField
        label="Apellido"
        value={registerData.lastName}
        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
        placeholder="Pérez"
        Icon={User}
        error={errors.lastName}
        isResponsive={false}
      />

      <InputField
        label="DNI"
        type="text"
        value={registerData.dni}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '')
          if (value.length <= 8) {
            setRegisterData({ ...registerData, dni: value })
          }
        }}
        placeholder="12345678"
        Icon={CreditCard}
        error={errors.dni}
        maxLength={8}
        helpText="Debe tener 8 dígitos"
        isResponsive={false}
      />

      <InputField
        label="Teléfono"
        type="tel"
        value={registerData.phone}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '')
          if (value.length <= 9) {
            setRegisterData({ ...registerData, phone: value })
          }
        }}
        placeholder="999888777"
        Icon={Phone}
        error={errors.phone}
        maxLength={9}
        helpText="Debe comenzar con 9 y tener 9 dígitos"
        isResponsive={false}
      />

      <InputField
        label="Correo Electrónico"
        type="email"
        value={registerData.email}
        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
        placeholder="juan@ejemplo.com"
        Icon={Mail}
        error={errors.email}
        isResponsive={false}
      />

      {/* Aviso sobre la contraseña */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Tu contraseña será tu DNI</p>
          <p className="text-blue-600">
            Podrás iniciar sesión usando tu número de teléfono y tu DNI como contraseña.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 sm:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
      >
        {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </button>
    </form>
  )
}

export default RegisterForm
