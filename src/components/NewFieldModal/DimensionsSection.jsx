import React from 'react'
import FormInput from './FormInput'
import FormSelect from './FormSelect'
import { SURFACE_TYPES } from './utils/fieldConstants'

const DimensionsSection = ({ formData, errors, isLoading, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-800">
        Medidas y Superficie de la Cancha
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormInput
          label="Largo (metros)"
          name="dimensions.length"
          type="number"
          value={formData.dimensions.length}
          onChange={onChange}
          error={errors['dimensions.length']}
          placeholder="Ej: 100"
          min="1"
          required
          disabled={isLoading}
        />

        <FormInput
          label="Ancho (metros)"
          name="dimensions.width"
          type="number"
          value={formData.dimensions.width}
          onChange={onChange}
          error={errors['dimensions.width']}
          placeholder="Ej: 64"
          min="1"
          required
          disabled={isLoading}
        />

        <FormInput
          label="Area total (m²)"
          name="dimensions.area"
          value={formData.dimensions.area ? `${formData.dimensions.area} m²` : ''}
          placeholder="Auto-calculado"
          disabled
          readOnly
          hint={formData.dimensions.area ? 'Area calculada automaticamente' : null}
        />
      </div>

      <FormSelect
        label="Tipo de Superficie"
        name="dimensions.surfaceType"
        value={formData.dimensions.surfaceType}
        onChange={onChange}
        options={SURFACE_TYPES.map((st) => ({ value: st.value, label: st.label }))}
        disabled={isLoading}
      />
    </div>
  )
}

export default DimensionsSection
