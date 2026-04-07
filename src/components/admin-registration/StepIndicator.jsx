import React from 'react'
import { User, Lock, Building2, FileText } from 'lucide-react'

/**
 * Indicador de pasos del wizard
 */
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Información Personal', icon: User },
    { number: 2, title: 'Credenciales', icon: Lock },
    { number: 3, title: 'Información del Negocio', icon: Building2 },
    { number: 4, title: 'Detalles y Confirmación', icon: FileText },
  ]

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <div key={step.number} className="relative flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`
                  w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all
                  ${
                    currentStep >= step.number
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-200 text-secondary-500'
                  }
                `}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span
                  className={`
                  text-xs mt-1 sm:mt-2 hidden sm:block text-center
                  ${currentStep >= step.number ? 'text-primary-600 font-medium' : 'text-secondary-500'}
                `}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`
                  absolute top-6 left-1/2 w-full h-0.5 -z-10
                  ${currentStep > step.number ? 'bg-primary-600' : 'bg-secondary-200'}
                `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StepIndicator
