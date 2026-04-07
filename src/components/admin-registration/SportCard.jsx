import React, { memo } from 'react'
import { getSportName, getSportIcon } from '../../services/sportsService'

/**
 * SportCard - Componente optimizado para mostrar una opción de deporte
 * Memoizado con React.memo para evitar re-renders innecesarios
 */
const SportCard = memo(
  ({ sport, isSelected, onToggle, disabled = false }) => {
    const sportName = getSportName(sport)
    const sportIcon = getSportIcon(sport, '⚽')

    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        if (!disabled) {
          onToggle(sportName)
        }
      }
    }

    return (
      <label
        className={`
        relative flex items-center gap-3 p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 min-h-[64px] min-w-[200px]
        ${
          isSelected
            ? 'border-primary-500 bg-primary-50 shadow-sm ring-2 ring-primary-100'
            : 'border-secondary-200 bg-white hover:border-primary-300 hover:bg-secondary-50 hover:shadow-sm'
        }
        focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2
        active:scale-[0.98]
        ${disabled ? 'opacity-50 cursor-not-allowed hover:border-secondary-200' : ''}
      `}
        style={{ minWidth: '200px' }}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="checkbox"
        aria-checked={isSelected}
        aria-label={`Seleccionar ${sportName}`}
        aria-disabled={disabled}
      >
        {/* Hidden native checkbox - accesible pero no visible */}
        <input
          type="checkbox"
          name="sportTypes"
          value={sportName}
          checked={isSelected}
          onChange={() => {
            if (!disabled) {
              onToggle(sportName)
            }
          }}
          disabled={disabled}
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
          aria-label={`Seleccionar ${sportName}`}
        />

        {/* Checkbox visual grande personalizado (28x28px) */}
        <div
          className={`
        w-7 h-7 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
        ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-secondary-300 bg-white'}
      `}
        >
          {isSelected && (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="3"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Ícono del deporte */}
        <span className="text-2xl sm:text-3xl flex-shrink-0" aria-hidden="true">
          {sportIcon}
        </span>

        {/* Nombre del deporte */}
        <span
          className={`
        text-sm sm:text-base font-medium flex-1 text-left break-words leading-tight
        ${isSelected ? 'text-primary-700' : 'text-secondary-700'}
      `}
        >
          {sportName}
        </span>
      </label>
    )
  },
  (prevProps, nextProps) => {
    // Custom comparison - solo re-renderizar si cambian estas props específicas
    return (
      prevProps.sport === nextProps.sport &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.disabled === nextProps.disabled
      // No comparar onToggle si está estabilizado con useCallback
    )
  }
)

SportCard.displayName = 'SportCard'

export default SportCard
