import React from 'react'

const ModalRules = ({ rules }) => {
  return (
    <div>
      <h4 className="font-bold text-secondary-900 mb-3">Reglas y políticas:</h4>
      <ul className="space-y-1">
        {rules.map((rule, index) => (
          <li key={index} className="flex items-start space-x-2">
            <span className="text-orange-500 mt-1">•</span>
            <span className="text-gray-700">{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ModalRules
