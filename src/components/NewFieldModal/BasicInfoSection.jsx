import React from 'react'
import { Camera, MapPin } from 'lucide-react'
import FormInput from './FormInput'
import SearchableSelect from './SearchableSelect'

const BasicInfoSection = ({
  formData,
  errors,
  isLoading,
  onChange,
  departamentos,
  provincias,
  distritos,
  selectedLocation,
}) => {
  return (
    <>
      {/* Información Básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-800 flex items-center">
          <Camera className="w-5 h-5 mr-2 text-primary-600" />
          Información Básica
        </h3>

        <FormInput
          label="Nombre de la Cancha"
          name="name"
          value={formData.name}
          onChange={onChange}
          error={errors.name}
          placeholder="Ej: Cancha Sintética Los Campeones"
          required
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SearchableSelect
            label="Departamento"
            name="departamento"
            value={formData.departamentoId || formData.departamento}
            onChange={onChange}
            options={departamentos}
            error={errors.departamento}
            hint={selectedLocation && formData.departamento ? '(Detectado del mapa)' : null}
            customClassName={
              selectedLocation && formData.departamento ? 'bg-green-50 border-green-200' : ''
            }
            required
            disabled={isLoading}
          />

          <SearchableSelect
            label="Provincia"
            name="provincia"
            value={formData.provinciaId || formData.provincia}
            onChange={onChange}
            options={provincias}
            error={errors.provincia}
            hint={selectedLocation && formData.provincia ? '(Detectado del mapa)' : null}
            customClassName={
              selectedLocation && formData.provincia ? 'bg-green-50 border-green-200' : ''
            }
            required
            disabled={isLoading || !formData.departamento}
          />
        </div>

        <SearchableSelect
          label="Distrito"
          name="distrito"
          value={formData.distritoId || formData.distrito}
          onChange={onChange}
          options={distritos}
          error={errors.distrito}
          hint={selectedLocation && formData.distrito ? '(Detectado del mapa)' : null}
          customClassName={
            selectedLocation && formData.distrito ? 'bg-green-50 border-green-200' : ''
          }
          required
          disabled={isLoading || !formData.provincia}
        />

        {selectedLocation && formData.departamento && formData.provincia && formData.distrito && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              <strong>✅ Ubicación detectada automáticamente</strong>
              <br />
              Los campos se han autocompletado basándose en las coordenadas del mapa. Puedes
              modificarlos si es necesario.
            </p>
          </div>
        )}
      </div>

      {/* Ubicación y Contacto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-secondary-800 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-primary-600" />
          Ubicacion y Contacto
        </h3>

        <FormInput
          label="Direccion Completa"
          name="address"
          value={formData.address}
          onChange={onChange}
          error={!selectedLocation ? errors.address : null}
          labelHint={selectedLocation ? '(Obtenida del mapa)' : null}
          customClassName={
            selectedLocation ? 'bg-green-50 border-green-200 text-green-800 cursor-not-allowed' : ''
          }
          placeholder="Ej: Jr. Lima 234, Abancay"
          required
          disabled={isLoading || selectedLocation}
          readOnly={selectedLocation}
        />

        <FormInput
          label="Telefono de Contacto"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          error={errors.phone}
          placeholder="999 888 777"
          maxLength="11"
          hint="Solo numeros, 9 digitos. Formato: XXX XXX XXX"
          required
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Latitud"
            name="latitude"
            type="number"
            value={formData.latitude}
            onChange={onChange}
            error={!selectedLocation ? errors.latitude : null}
            labelHint={selectedLocation ? '(Del mapa)' : null}
            customClassName={
              selectedLocation
                ? 'bg-green-50 border-green-200 text-green-800 cursor-not-allowed'
                : ''
            }
            placeholder="-13.6333"
            step="any"
            required
            disabled={isLoading || selectedLocation}
            readOnly={selectedLocation}
          />
          <FormInput
            label="Longitud"
            name="longitude"
            type="number"
            value={formData.longitude}
            onChange={onChange}
            error={!selectedLocation ? errors.longitude : null}
            labelHint={selectedLocation ? '(Del mapa)' : null}
            customClassName={
              selectedLocation
                ? 'bg-green-50 border-green-200 text-green-800 cursor-not-allowed'
                : ''
            }
            placeholder="-72.8814"
            step="any"
            required
            disabled={isLoading || selectedLocation}
            readOnly={selectedLocation}
          />
        </div>
      </div>
    </>
  )
}

export default BasicInfoSection
