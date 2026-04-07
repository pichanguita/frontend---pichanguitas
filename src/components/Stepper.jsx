import React from 'react'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'

const Stepper = ({ currentStep, steps }) => {
  return (
    <div className="w-full py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div
            className="absolute top-6 left-0 right-0 h-1 -z-10"
            style={{ backgroundColor: '#4a5568' }}
          >
            <motion.div
              className="h-full"
              style={{ backgroundColor: '#22c55e' }}
              initial={{ width: '0%' }}
              animate={{
                width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
              }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>

          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isActive = currentStep === stepNumber
            const isCompleted = currentStep > stepNumber

            return (
              <div key={stepNumber} className="flex flex-col items-center flex-1">
                {/* Circle */}
                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-3 transition-all duration-300 border-4"
                  style={{
                    backgroundColor: isCompleted ? '#22c55e' : isActive ? '#ffd500' : '#4a5568',
                    borderColor: isCompleted ? '#22c55e' : isActive ? '#ffd500' : '#6b7280',
                    color: isCompleted ? '#ffffff' : isActive ? '#0a2424' : '#9ca3af',
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: isActive ? 1.1 : 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? <Check className="w-6 h-6" /> : <span>{stepNumber}</span>}
                </motion.div>

                {/* Label */}
                <div className="text-center">
                  <p
                    className="text-sm sm:text-base font-semibold transition-colors duration-300"
                    style={{
                      color: isActive ? '#ffd500' : isCompleted ? '#4ade80' : '#9ca3af',
                    }}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs mt-1 hidden sm:block" style={{ color: '#9ca3af' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Stepper
