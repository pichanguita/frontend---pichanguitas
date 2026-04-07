import React, { useState, useEffect } from 'react'
import { fetchDepartments } from '../../services/locations/locationsService'
import { getToken } from '../../config/api.config'

/**
 * Paso 1: Información Personal
 */
const PersonalInfoStep = ({
  formData,
  errors,
  availableProvincias,
  availableDistritos,
  onInputChange,
}) => {
  const [departments, setDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)

  /**
   * Cargar departamentos al montar el componente
   */
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true)
        const token = getToken()
        const data = await fetchDepartments(token)
        setDepartments(data)
      } catch (error) {
        console.error('Error al cargar departamentos:', error)
        setDepartments([])
      } finally {
        setLoadingDepartments(false)
      }
    }
    loadDepartments()
  }, [])
  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-secondary-900">
        Información Personal
      </h2>

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-secondary-700">Nombre</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.firstName ? 'border-red-500' : 'border-secondary-300'
            }`}
            placeholder="Juan"
          />
          {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-secondary-700">Apellido</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.lastName ? 'border-red-500' : 'border-secondary-300'
            }`}
            placeholder="Pérez García"
          />
          {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block mb-2 text-sm font-medium text-secondary-700">
          Correo Electrónico
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.email ? 'border-red-500' : 'border-secondary-300'
          }`}
          placeholder="juan@ejemplo.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Teléfono y DNI */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 text-sm font-medium text-secondary-700">Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={(e) => {
              // Solo permitir números
              const value = e.target.value.replace(/\D/g, '')
              onInputChange({ target: { name: 'phone', value } })
            }}
            maxLength="9"
            pattern="[0-9]{9}"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.phone ? 'border-red-500' : 'border-secondary-300'
            }`}
            placeholder="999888777"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-secondary-700">DNI</label>
          <input
            type="text"
            name="dni"
            value={formData.dni}
            onChange={(e) => {
              // Solo permitir números
              const value = e.target.value.replace(/\D/g, '')
              onInputChange({ target: { name: 'dni', value } })
            }}
            maxLength="8"
            pattern="[0-9]{8}"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
              errors.dni ? 'border-red-500' : 'border-secondary-300'
            }`}
            placeholder="12345678"
          />
          {errors.dni && <p className="mt-1 text-sm text-red-600">{errors.dni}</p>}
        </div>
      </div>

      {/* Dirección del Propietario */}
      <div className="mt-6">
        <h3 className="pb-2 mb-4 text-lg font-medium border-b text-secondary-800 border-secondary-200">
          Dirección del Propietario
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-secondary-700">Dirección</label>
            <input
              type="text"
              name="ownerAddress"
              value={formData.ownerAddress}
              onChange={onInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                errors.ownerAddress ? 'border-red-500' : 'border-secondary-300'
              }`}
              placeholder="Jr. Los Libertadores 123"
            />
            {errors.ownerAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.ownerAddress}</p>
            )}
          </div>

          {/* Cascada de ubicación */}
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <label className="block mb-2 text-sm font-medium text-secondary-700">
                Departamento *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={onInputChange}
                disabled={loadingDepartments}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-sm ${
                  errors.department ? 'border-red-500' : 'border-secondary-300'
                } ${loadingDepartments ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">{loadingDepartments ? 'Cargando...' : 'Selecciona...'}</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-600">{errors.department}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-secondary-700">
                Provincia *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={onInputChange}
                disabled={!formData.department || availableProvincias.length === 0}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-sm ${
                  errors.city ? 'border-red-500' : 'border-secondary-300'
                } ${!formData.department || availableProvincias.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Selecciona...</option>
                {availableProvincias.map((prov) => (
                  <option key={prov.id} value={prov.name}>
                    {prov.name}
                  </option>
                ))}
              </select>
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-secondary-700">
                Distrito *
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={onInputChange}
                disabled={!formData.city || availableDistritos.length === 0}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white text-sm ${
                  errors.district ? 'border-red-500' : 'border-secondary-300'
                } ${!formData.city || availableDistritos.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">Selecciona...</option>
                {availableDistritos.map((dist) => (
                  <option key={dist.id} value={dist.name}>
                    {dist.name}
                  </option>
                ))}
              </select>
              {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
            </div>
          </div>

          {/* Referencias */}
          <div>
            <label className="block mb-2 text-sm font-medium text-secondary-700">
              Referencias (Opcional)
            </label>
            <textarea
              name="addressReferences"
              value={formData.addressReferences}
              onChange={onInputChange}
              rows="2"
              className="w-full px-4 py-2 border rounded-lg border-secondary-300 focus:ring-2 focus:ring-primary-500"
              placeholder="Frente al parque central, al lado de la farmacia..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonalInfoStep
