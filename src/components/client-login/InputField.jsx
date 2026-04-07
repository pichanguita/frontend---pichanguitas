import React from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

const InputField = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  Icon,
  error,
  maxLength,
  helpText,
  showPasswordToggle,
  showPassword,
  onTogglePassword,
  isResponsive = true,
}) => {
  const inputClasses = isResponsive
    ? 'w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base'
    : 'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent'

  const iconSizeClasses = isResponsive ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5'

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${iconSizeClasses} text-gray-400`}
          />
        )}
        <input
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          className={`${inputClasses} ${error ? 'border-red-500' : 'border-gray-300'}`}
          placeholder={placeholder}
          maxLength={maxLength}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className={iconSizeClasses} />
            ) : (
              <Eye className={iconSizeClasses} />
            )}
          </button>
        )}
      </div>
      {error && (
        <p
          className={`text-red-500 ${isResponsive ? 'text-xs sm:text-sm' : 'text-sm'} mt-1 flex items-center gap-1`}
        >
          <AlertCircle className={isResponsive ? 'w-3 h-3 sm:w-4 sm:h-4' : 'w-4 h-4'} />
          {error}
        </p>
      )}
      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  )
}

export default InputField
