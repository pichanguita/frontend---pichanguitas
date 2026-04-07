import React from 'react'
import { AlertCircle } from 'lucide-react'

const FormInput = ({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  hint,
  labelHint,
  min,
  max,
  step,
  maxLength,
  customClassName = '',
}) => {
  const handleKeyDown = (e) => {
    if (type === 'number') {
      const allowedKeys = [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'Enter',
        '.',
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
      ]
      if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return
      if (allowedKeys.includes(e.key)) return
      if (!/^\d$/.test(e.key)) e.preventDefault()
    }
  }

  const handlePaste = (e) => {
    if (type === 'number') {
      const pastedData = e.clipboardData.getData('text')
      if (!/^\d*\.?\d*$/.test(pastedData)) e.preventDefault()
    }
  }

  const inputClassName = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
    error
      ? 'border-red-500 focus:ring-red-200'
      : 'border-secondary-300 focus:ring-primary-200 focus:border-primary-500'
  } ${disabled ? 'bg-secondary-100 cursor-not-allowed' : 'bg-white'} ${customClassName}`

  return (
    <div>
      <label className="block text-sm font-medium text-secondary-700 mb-2">
        {label} {required && '*'}
        {labelHint && <span className="text-xs text-green-600 ml-2">{labelHint}</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        inputMode={type === 'number' ? 'numeric' : undefined}
        pattern={type === 'number' ? '[0-9]*' : undefined}
        className={inputClassName}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        maxLength={maxLength}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
      {hint && !error && <p className="mt-1 text-sm text-secondary-600">{hint}</p>}
    </div>
  )
}

export default FormInput
