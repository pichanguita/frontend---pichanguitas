import React from 'react'

/**
 * Componente reutilizable para checkboxes en formularios
 * @param {string} label - Etiqueta del checkbox
 * @param {string} name - Nombre del campo
 * @param {boolean} checked - Si está marcado
 * @param {function} onChange - Función onChange
 * @param {boolean} disabled - Si está deshabilitado
 * @param {string} description - Descripción adicional
 * @param {string} icon - Ícono a mostrar (componente de lucide-react)
 */
const FormCheckbox = ({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  description,
  icon: Icon,
}) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="w-5 h-5 text-primary-600 border-secondary-300 rounded focus:ring-primary-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        />
      </div>
      <div className="ml-3">
        <label
          className={`text-sm font-medium text-secondary-700 flex items-center ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {Icon && <Icon className="w-4 h-4 mr-2 text-primary-600" />}
          {label}
        </label>
        {description && <p className="text-xs text-secondary-500 mt-1">{description}</p>}
      </div>
    </div>
  )
}

export default FormCheckbox
