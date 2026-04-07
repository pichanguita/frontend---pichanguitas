import React, { useState, useEffect } from 'react'
import { Settings, AlertCircle, Loader } from 'lucide-react'
import { fetchDepartments } from '../../services/locations/locationsService'
import { getToken } from '../../config/api.config'

const BasicInfoSection = ({
  formData,
  errors,
  isLoading,
  availableProvinces,
  availableDistricts,
  handleInputChange,
}) => {
  const [departments, setDepartments] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)

  // Cargar departamentos al montar el componente
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-800 flex items-center">
        <Settings className="w-5 h-5 mr-2 text-primary-600" />
        Información Básica
      </h3>

      {/* Nombre de la Cancha */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          Nombre de la Cancha <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            errors.name
              ? 'border-red-500 bg-red-50'
              : formData.name
                ? 'border-secondary-300'
                : 'border-red-300 bg-red-50'
          }`}
          placeholder="Ej: Cancha Sintética Los Campeones"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-xs text-red-600 mt-1 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            {errors.name}
          </p>
        )}
        {!errors.name && !formData.name && (
          <p className="text-xs text-red-600 mt-1 flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            Este campo es obligatorio
          </p>
        )}
      </div>

      {/* Ubicación: Departamento, Provincia, Distrito */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Departamento */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Departamento <span className="text-red-500">*</span>
          </label>
          {loadingDepartments ? (
            <div className="w-full px-3 py-2 border-2 border-secondary-300 rounded-lg flex items-center justify-center">
              <Loader className="w-4 h-4 animate-spin text-primary-600" />
              <span className="ml-2 text-sm text-secondary-600">Cargando...</span>
            </div>
          ) : (
            <select
              name="departamento"
              value={formData.departamento}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.departamento
                  ? 'border-red-500 bg-red-50'
                  : formData.departamento
                    ? 'border-secondary-300'
                    : 'border-red-300 bg-red-50'
              }`}
            >
              <option value="">Seleccione...</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          )}
          {errors.departamento && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.departamento}
            </p>
          )}
          {!errors.departamento && !formData.departamento && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Este campo es obligatorio
            </p>
          )}
        </div>

        {/* Provincia */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Provincia <span className="text-red-500">*</span>
          </label>
          <select
            name="provincia"
            value={formData.provincia}
            onChange={handleInputChange}
            disabled={isLoading || !formData.departamento || availableProvinces.length === 0}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.provincia
                ? 'border-red-500 bg-red-50'
                : formData.provincia
                  ? 'border-secondary-300'
                  : formData.departamento
                    ? 'border-red-300 bg-red-50'
                    : 'border-secondary-200'
            } ${!formData.departamento ? 'bg-secondary-50' : ''}`}
          >
            <option value="">
              {!formData.departamento ? 'Primero seleccione departamento' : 'Seleccione...'}
            </option>
            {availableProvinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name}
              </option>
            ))}
          </select>
          {errors.provincia && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.provincia}
            </p>
          )}
          {!errors.provincia && !formData.provincia && formData.departamento && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Este campo es obligatorio
            </p>
          )}
        </div>

        {/* Distrito */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Distrito <span className="text-red-500">*</span>
          </label>
          <select
            name="distrito"
            value={formData.distrito}
            onChange={handleInputChange}
            disabled={isLoading || !formData.provincia || availableDistricts.length === 0}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.distrito
                ? 'border-red-500 bg-red-50'
                : formData.distrito
                  ? 'border-secondary-300'
                  : formData.provincia
                    ? 'border-red-300 bg-red-50'
                    : 'border-secondary-200'
            } ${!formData.provincia ? 'bg-secondary-50' : ''}`}
          >
            <option value="">
              {!formData.provincia ? 'Primero seleccione provincia' : 'Seleccione...'}
            </option>
            {availableDistricts.map((dist) => (
              <option key={dist.id} value={dist.id}>
                {dist.name}
              </option>
            ))}
          </select>
          {errors.distrito && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.distrito}
            </p>
          )}
          {!errors.distrito && !formData.distrito && formData.provincia && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Este campo es obligatorio
            </p>
          )}
        </div>
      </div>

      {/* Información de ubicación */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <strong>Nota:</strong> La ubicación geográfica (latitud y longitud) se puede actualizar
          desde la pestaña <strong>"Reubicar en Mapa"</strong>.
        </p>
      </div>
    </div>
  )
}

export default BasicInfoSection
